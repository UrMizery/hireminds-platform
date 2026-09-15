import {
  createHmac,
  timingSafeEqual,
} from "crypto";

import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

/*
  ==================================================
  VERIFY STRIPE WEBHOOK SIGNATURE
  ==================================================
*/

function verifyStripeSignature(
  payload: string,
  header: string,
  secret: string
) {
  const parts = header
    .split(",")
    .map((part) => part.trim());

  const timestamp = parts
    .find((part) =>
      part.startsWith("t=")
    )
    ?.slice(2);

  const signatures = parts
    .filter((part) =>
      part.startsWith("v1=")
    )
    .map((part) => part.slice(3));

  if (
    !timestamp ||
    !signatures.length
  ) {
    return false;
  }

  const age = Math.abs(
    Math.floor(Date.now() / 1000) -
      Number(timestamp)
  );

  if (
    !Number.isFinite(age) ||
    age > 300
  ) {
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

  return signatures.some(
    (signature) => {
      try {
        const expectedBuffer =
          Buffer.from(
            expected,
            "hex"
          );

        const signatureBuffer =
          Buffer.from(
            signature,
            "hex"
          );

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
    }
  );
}

/*
  ==================================================
  STRIPE GET
  ==================================================
*/

async function stripeGet(
  path: string,
  secret: string
) {
  const response = await fetch(
    `https://api.stripe.com/v1${path}`,
    {
      headers: {
        Authorization:
          `Bearer ${secret}`,
      },
      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Stripe lookup failed."
    );
  }

  return data;
}

/*
  ==================================================
  UPDATE HIREMINDS PROFILE
  ==================================================
*/

async function updateProfile(
  userId: string,
  patch: Record<
    string,
    unknown
  >
) {
  const supabaseUrl =
    process.env
      .NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env
      .SUPABASE_SERVICE_ROLE_KEY;

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
        apikey:
          serviceRoleKey,

        Authorization:
          `Bearer ${serviceRoleKey}`,

        "Content-Type":
          "application/json",

        Prefer:
          "return=minimal",
      },

      body:
        JSON.stringify(patch),

      cache:
        "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Supabase profile update failed: ${await response.text()}`
    );
  }
}

/*
  ==================================================
  FIND USER ID
  ==================================================

  Stripe events store subscription metadata
  in slightly different places depending
  on the event type.
*/

function getUserId(
  object: any
) {
  return (
    object?.metadata?.user_id ||
    object?.client_reference_id ||
    object?.subscription_details
      ?.metadata?.user_id ||
    object?.parent
      ?.subscription_details
      ?.metadata?.user_id ||
    null
  );
}

/*
  ==================================================
  FIND PLAN
  ==================================================
*/

function getPlan(
  object: any
) {
  return (
    object?.metadata?.plan ||
    object?.subscription_details
      ?.metadata?.plan ||
    object?.parent
      ?.subscription_details
      ?.metadata?.plan ||
    "monthly"
  );
}

/*
  ==================================================
  FIND SUBSCRIPTION ID FROM INVOICE
  ==================================================
*/

function getInvoiceSubscriptionId(
  object: any
) {
  return (
    object?.subscription ||
    object?.parent
      ?.subscription_details
      ?.subscription ||
    null
  );
}

/*
  ==================================================
  MAIN WEBHOOK
  ==================================================
*/

export async function POST(
  request: NextRequest
) {
  try {
    const webhookSecret =
      process.env
        .STRIPE_WEBHOOK_SECRET;

    const stripeSecret =
      process.env
        .STRIPE_SECRET_KEY;

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
      Stripe signature verification MUST
      use the original raw request body.
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

    /*
      ==================================================
      CHECKOUT COMPLETED
      ==================================================

      NEW USER:

      At this point a brand-new customer does
      NOT have a Supabase user_id yet.

      They return to the HireMinds success page,
      create their password, and complete-signup
      creates the account.

      EXISTING USER:

      If Stripe already has a user_id,
      we can update their HireMinds access here.
    */

    if (
      event.type ===
      "checkout.session.completed"
    ) {
      const userId =
        getUserId(object);

      const plan =
        getPlan(object);

      if (
        userId &&
        [
          "paid",
          "no_payment_required",
        ].includes(
          object?.payment_status
        )
      ) {
        let subscriptionStatus =
          "trialing";

        /*
          Retrieve the real Stripe
          subscription status when possible.
        */

        if (
          object?.subscription &&
          stripeSecret
        ) {
          try {
            const subscription =
              await stripeGet(
                `/subscriptions/${encodeURIComponent(
                  object.subscription
                )}`,
                stripeSecret
              );

            subscriptionStatus =
              subscription?.status ||
              "trialing";
          } catch (error) {
            console.error(
              "Could not retrieve subscription during checkout webhook:",
              error
            );
          }
        }

        /*
          $2.99 was successfully paid.

          The recurring subscription will normally
          be "trialing" during the first 5 days.

          That STILL means the user gets access.
        */

        if (
          [
            "trialing",
            "active",
          ].includes(
            subscriptionStatus
          )
        ) {
          await updateProfile(
            userId,
            {
              has_paid_access:
                true,

              has_referral_access:
                false,

              access_tier:
                "paid",

              subscription_status:
                subscriptionStatus,

              subscription_plan:
                plan,

              subscription_provider:
                "stripe",
            }
          );
        }
      }
    }

    /*
      ==================================================
      SUBSCRIPTION CREATED / UPDATED / RESUMED
      ==================================================

      Stripe statuses we allow access for:

      trialing
      active

      Everything else does NOT receive
      paid access.
    */

    else if (
      [
        "customer.subscription.created",
        "customer.subscription.updated",
        "customer.subscription.resumed",
      ].includes(
        event.type
      )
    ) {
      const userId =
        getUserId(object);

      const plan =
        getPlan(object);

      const status =
        String(
          object?.status || ""
        );

      if (userId) {
        const hasAccess =
          [
            "trialing",
            "active",
          ].includes(
            status
          );

        await updateProfile(
          userId,
          {
            has_paid_access:
              hasAccess,

            has_referral_access:
              false,

            access_tier:
              hasAccess
                ? "paid"
                : "pending_payment",

            subscription_status:
              status ||
              "unknown",

            subscription_plan:
              plan,

            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      ==================================================
      SUCCESSFUL INVOICE PAYMENT
      ==================================================

      This is especially important on Day 5.

      Stripe charges $24.99.

      If successful:
      subscription becomes active
      HireMinds keeps paid access enabled.
    */

    else if (
      event.type ===
        "invoice.paid" ||
      event.type ===
        "invoice.payment_succeeded"
    ) {
      let userId =
        getUserId(object);

      const subscriptionId =
        getInvoiceSubscriptionId(
          object
        );

      let subscriptionStatus =
        "active";

      let plan =
        getPlan(object);

      /*
        If invoice metadata does not contain
        user_id, retrieve the subscription.
      */

      if (
        subscriptionId &&
        stripeSecret
      ) {
        try {
          const subscription =
            await stripeGet(
              `/subscriptions/${encodeURIComponent(
                subscriptionId
              )}`,
              stripeSecret
            );

          userId =
            userId ||
            subscription?.metadata
              ?.user_id;

          plan =
            subscription?.metadata
              ?.plan ||
            plan;

          subscriptionStatus =
            subscription?.status ||
            "active";
        } catch (error) {
          console.error(
            "Could not retrieve subscription for paid invoice:",
            error
          );
        }
      }

      if (userId) {
        await updateProfile(
          userId,
          {
            has_paid_access:
              true,

            has_referral_access:
              false,

            access_tier:
              "paid",

            subscription_status:
              subscriptionStatus,

            subscription_plan:
              plan,

            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      ==================================================
      PAYMENT FAILED
      ==================================================

      If Stripe cannot collect the recurring
      $24.99 payment, paid access is disabled.
    */

    else if (
      event.type ===
      "invoice.payment_failed"
    ) {
      let userId =
        getUserId(object);

      const subscriptionId =
        getInvoiceSubscriptionId(
          object
        );

      let status =
        "past_due";

      if (
        subscriptionId &&
        stripeSecret
      ) {
        try {
          const subscription =
            await stripeGet(
              `/subscriptions/${encodeURIComponent(
                subscriptionId
              )}`,
              stripeSecret
            );

          userId =
            userId ||
            subscription?.metadata
              ?.user_id;

          status =
            subscription?.status ||
            "past_due";
        } catch (error) {
          console.error(
            "Could not retrieve subscription after failed invoice:",
            error
          );
        }
      }

      if (userId) {
        await updateProfile(
          userId,
          {
            has_paid_access:
              false,

            access_tier:
              "pending_payment",

            subscription_status:
              status,

            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      ==================================================
      SUBSCRIPTION CANCELED / DELETED
      ==================================================

      Access ends when Stripe actually ends
      the subscription.

      If someone selects "cancel at period end",
      Stripe may keep the subscription active
      until the current paid period expires.

      The customer.subscription.deleted event
      will then remove access.
    */

    else if (
      event.type ===
      "customer.subscription.deleted"
    ) {
      const userId =
        getUserId(object);

      if (userId) {
        await updateProfile(
          userId,
          {
            has_paid_access:
              false,

            access_tier:
              "pending_payment",

            subscription_status:
              "canceled",

            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      ==================================================
      SUBSCRIPTION PAUSED
      ==================================================
    */

    else if (
      event.type ===
      "customer.subscription.paused"
    ) {
      const userId =
        getUserId(object);

      if (userId) {
        await updateProfile(
          userId,
          {
            has_paid_access:
              false,

            access_tier:
              "pending_payment",

            subscription_status:
              "paused",

            subscription_provider:
              "stripe",
          }
        );
      }
    }

    /*
      Always acknowledge the webhook once
      processing is complete.
    */

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
