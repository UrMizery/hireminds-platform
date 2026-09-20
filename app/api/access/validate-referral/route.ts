import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

function normalizeReferralCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function normalizeStatus(value: unknown) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function getReferralExpiration(accessDays: number | null) {
  if (
    accessDays === null ||
    accessDays === undefined ||
    !Number.isFinite(accessDays) ||
    accessDays <= 0
  ) {
    return null;
  }

  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + accessDays
  );

  return expiresAt.toISOString();
}

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL."
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const code =
      normalizeReferralCode(
        body?.code
      );

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Enter a referral code.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase =
      getSupabaseAdmin();

    const {
      data: referral,
      error: referralError,
    } = await supabase
      .from("referral_codes")
      .select(
        `
          code,
          status,
          is_active,
          allow_new_signups,
          allow_existing_access,
          access_days
        `
      )
      .eq("code", code)
      .maybeSingle();

    if (referralError) {
      console.error(
        "Referral lookup error:",
        referralError
      );

      return NextResponse.json(
        {
          valid: false,
          message:
            "We could not verify the referral code. Please try again.",
        },
        {
          status: 500,
        }
      );
    }

    if (!referral) {
      return NextResponse.json(
        {
          valid: false,
          code,
          message:
            "That referral code is not currently active. Check the code and try again.",
        },
        {
          status: 400,
        }
      );
    }

    const status =
      normalizeStatus(
        referral.status
      );

    const isActive =
      referral.is_active === true;

    const allowNewSignups =
      referral.allow_new_signups === true;

    if (
      status !== "active" ||
      !isActive ||
      !allowNewSignups
    ) {
      return NextResponse.json(
        {
          valid: false,
          code,
          message:
            "That referral code is no longer active for new registrations.",
        },
        {
          status: 400,
        }
      );
    }

    let accessDays: number | null =
      null;

    if (
      referral.access_days !== null &&
      referral.access_days !== undefined
    ) {
      const parsed =
        Number(
          referral.access_days
        );

      if (
        Number.isFinite(parsed) &&
        parsed > 0
      ) {
        accessDays = parsed;
      }
    }

    const expiresAt =
      getReferralExpiration(
        accessDays
      );

    return NextResponse.json(
      {
        valid: true,

        code:
          normalizeReferralCode(
            referral.code
          ),

        accessType:
          "referral",

        accessDays,

        expiresAt,

        allowExistingAccess:
          referral.allow_existing_access ===
          true,

        message:
          "Referral code verified.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Referral validation error:",
      error
    );

    return NextResponse.json(
      {
        valid: false,
        message:
          "We could not verify the referral code. Please try again.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,

      route:
        "/api/access/validate-referral",

      message:
        "HireMinds referral validation endpoint is running.",
    },
    {
      status: 200,
    }
  );
}
