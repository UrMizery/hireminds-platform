import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string
) {
  const parts = header
    .split(",")
    .map((part) => part.trim());

  const timestamp = parts
    .find((part) => part.startsWith("t="))
    ?.slice(2);

  const signatures = parts
    .filter((part) => part.startsWith("v1="))
    .map((part) => part.slice(3));

  if (!timestamp || !signatures.length) {
    return false;
  }

  const age =
    Math.abs(
      Math.floor(Date.now() / 1000) -
        Number(timestamp)
    );

  if (!Number.isFinite(age) || age > 300) {
    return false;
  }

  const expected = createHmac(
    "sha256",
    secret
  )
    .update(
      `${timestamp}.${payload}`,
      "utf8"
    )
    .digest("hex");

  return signatures.some((signature) => {
    try {
      const expectedBuffer =
        Buffer.from(expected, "hex");

      const signatureBuffer =
        Buffer.from(signature, "hex");

      return (
        expectedBuffer.length ===
          signatureBuffer.length &&
        timingSafeEqual(
          expectedBuffer,
          signatureBuffer
        )
      );
    } catch {
      return false;
    }
  });
}

async function updateProfile(
  userId: string,
  patch: Record<string, unknown>
) {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey
  ) {
    throw new Error(
      "Supabase server credentials are missing."
    );
  }

  const response = await fetch(
    `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${encodeURIComponent(
      userId
    )}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceRoleKey,
        Authorization:
          `Bearer ${serviceRoleKey}`,
        "Content-Type":
          "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Supabase profile update failed: ${await response.text()}`
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    const webhookSecret =
      process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      return NextResponse.json(
        {
          error:
            "Stripe webhook secret is missing.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      Stripe requires the ORIGINAL raw request body
      for webhook signature verification.
    */
    const payload =
      await request.text();

    const stripeSignature =
      request.headers.get(
        "stripe-signature"
      ) || "";

    const valid =
      verifyStripeSignature(
        payload,
        stripeSignature,
        webhookSecret
      );

    if (!valid) {
      return NextResponse.json(
        {
          error:
            "Invalid Stripe signature.",
        },
        {
          status: 400,
        }
      );
    }

    const event =
      JSON.parse(payload);

    const object =
      event?.data?.object || {};

    const userId =
      object?.metadata?.user_id ||
      object?.client_reference_id ||
      object?.subscription_details
        ?.metadata?.user_id;

    const plan =
      object?.metadata?.plan ||
      object?.subscription_details
        ?.metadata?.plan;

    /*
      NEW SUBSCRIPTION SIGNUP

      IMPORTANT:
      A brand-new paid signup intentionally has
      NO HireMinds/Supabase user yet.

      Stripe confirms that payment happened here.

      The customer is then returned to the
      success page where they create their
      password.

      Only after the paid Stripe session is
      verified will HireMinds create the account.
    */
    if (
      event.type ===
      "checkout.session.completed"
    ) {
      /*
        Existing users renewing/upgrading may
        already have a user_id.

        If so, activate their existing profile.
      */
      if (
        userId &&
        (
          object.payment_status === "paid" ||
          object.payment_status ===
            "no_payment_required"
        )
      ) {
        await updateProfile(
          userId,
          {
            has_paid_access: true,
            has_referral_access: false,
            access_tier: "paid",
            subscription_status:
              "active",
            subscription_provider:
              "stripe",
            ...(plan
              ? {
                  subscription_plan:
                    plan,
                }
              : {}),
          }
        );
      }
    }

    /*
      FUTURE RECURRING PAYMENTS
    */
    else if (
      event.type === "invoice.paid"
    ) {
      const invoiceUserId =
        object?.subscription_details
          ?.metadata?.user_id ||
        object?.parent
          ?.subscription_details
          ?.metadata?.user_id;

      if (invoiceUserId) {
        await updateProfile(
          invoiceUserId,
          {
            has_paid_access: true,
            access_tier: "paid",
            subscription_status:
              "active",
            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      CANCELED / PAUSED SUBSCRIPTIONS
    */
    else if (
      [
        "customer.subscription.deleted",
        "customer.subscription.paused",
      ].includes(event.type)
    ) {
      if (userId) {
        await updateProfile(
          userId,
          {
            has_paid_access: false,
            access_tier:
              "pending_payment",
            subscription_status:
              event.type.endsWith(
                "deleted"
              )
                ? "canceled"
                : "paused",
            subscription_provider:
              "stripe",
          }
        );
      }
    }

    return NextResponse.json({
      received: true,
    });
  } catch (error: any) {
    console.error(
      "Stripe webhook error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Webhook processing failed.",
      },
      {
        status: 500,
      }
    );
  }
}
