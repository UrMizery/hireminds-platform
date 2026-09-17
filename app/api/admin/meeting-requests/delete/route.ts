import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const SYSTEM_ADMIN_EMAIL = "info@hireminds.app";

export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server admin configuration is incomplete. SUPABASE_SERVICE_ROLE_KEY is required.",
        },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization") || "";
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error: "Admin authentication is required.",
        },
        { status: 401 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const {
      data: userData,
      error: userError,
    } = await supabaseAdmin.auth.getUser(accessToken);

    const user = userData.user;

    if (userError || !user?.email) {
      return NextResponse.json(
        {
          ok: false,
          error: "Your admin session could not be verified.",
        },
        { status: 401 }
      );
    }

    const email = user.email.toLowerCase();

    const {
      data: partner,
      error: partnerError,
    } = await supabaseAdmin
      .from("partners")
      .select("account_type, contact_email")
      .eq("contact_email", user.email)
      .maybeSingle();

    if (partnerError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Could not verify admin access: ${partnerError.message}`,
        },
        { status: 500 }
      );
    }

    const accountType = String(partner?.account_type || "")
      .trim()
      .toLowerCase();

    const isSystemAdmin =
      email === SYSTEM_ADMIN_EMAIL.toLowerCase() ||
      accountType === "super_admin";

    if (!isSystemAdmin) {
      return NextResponse.json(
        {
          ok: false,
          error: "You are not authorized to permanently delete appointment activity.",
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const requestId = String(body?.requestId || "").trim();

    if (!requestId) {
      return NextResponse.json(
        {
          ok: false,
          error: "A meeting request ID is required.",
        },
        { status: 400 }
      );
    }

    const {
      data: meetingRequest,
      error: meetingRequestError,
    } = await supabaseAdmin
      .from("meeting_requests")
      .select("id, status")
      .eq("id", requestId)
      .maybeSingle();

    if (meetingRequestError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Could not load the appointment: ${meetingRequestError.message}`,
        },
        { status: 500 }
      );
    }

    if (!meetingRequest) {
      return NextResponse.json(
        {
          ok: true,
          alreadyDeleted: true,
        },
        { status: 200 }
      );
    }

    const allowedStatuses = new Set([
      "cancelled",
      "declined",
      "completed",
    ]);

    if (!allowedStatuses.has(String(meetingRequest.status || ""))) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Only cancelled, declined, or completed appointments can be permanently deleted.",
        },
        { status: 400 }
      );
    }

    const {
      data: attachmentRows,
      error: attachmentLoadError,
    } = await supabaseAdmin
      .from("meeting_request_attachments")
      .select("file_path")
      .eq("request_id", requestId);

    if (attachmentLoadError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Could not load appointment attachments: ${attachmentLoadError.message}`,
        },
        { status: 500 }
      );
    }

    const filePaths = (attachmentRows || [])
      .map((row) => row.file_path)
      .filter((value): value is string => Boolean(value));

    if (filePaths.length > 0) {
      const { error: storageError } = await supabaseAdmin.storage
        .from("meeting-request-files")
        .remove(filePaths);

      if (storageError) {
        return NextResponse.json(
          {
            ok: false,
            error: `Could not remove appointment files: ${storageError.message}`,
          },
          { status: 500 }
        );
      }
    }

    const { error: releaseSlotError } = await supabaseAdmin
      .from("availability_slots")
      .update({
        booked_request_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("booked_request_id", requestId);

    if (releaseSlotError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Could not release the appointment time: ${releaseSlotError.message}`,
        },
        { status: 500 }
      );
    }

    const deleteSteps = [
      {
        table: "meeting_request_choices",
        label: "preferred appointment times",
      },
      {
        table: "meeting_request_attachments",
        label: "appointment attachments",
      },
      {
        table: "meeting_cancellations",
        label: "cancellation history",
      },
    ];

    for (const step of deleteSteps) {
      const { error } = await supabaseAdmin
        .from(step.table)
        .delete()
        .eq("request_id", requestId);

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error: `Could not remove ${step.label}: ${error.message}`,
          },
          { status: 500 }
        );
      }
    }

    const {
      data: deletedRows,
      error: requestDeleteError,
    } = await supabaseAdmin
      .from("meeting_requests")
      .delete()
      .eq("id", requestId)
      .select("id");

    if (requestDeleteError) {
      return NextResponse.json(
        {
          ok: false,
          error: `Could not delete the appointment/activity: ${requestDeleteError.message}`,
        },
        { status: 500 }
      );
    }

    if (!deletedRows || deletedRows.length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "The delete request reached Supabase, but no appointment row was removed.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        deletedRequestId: requestId,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Meeting activity delete error:", error);

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "The appointment/activity could not be permanently deleted.",
      },
      { status: 500 }
    );
  }
}
