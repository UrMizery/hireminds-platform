import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

function authHeaders(key: string) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
  };
}

async function stripeGet(
  path: string,
  secret: string
) {
  const response = await fetch(
    `https://api.stripe.com/v1${path}`,
    {
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Stripe verification failed."
    );
  }

  return data;
}

async function stripePost(
  path: string,
  secret: string,
  params: URLSearchParams,
  idempotencyKey?: string
) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${secret}`,
    "Content-Type":
      "application/x-www-form-urlencoded",
  };

  if (idempotencyKey) {
    headers["Idempotency-Key"] =
      idempotencyKey;
  }

  const response = await fetch(
    `https://api.stripe.com/v1${path}`,
    {
      method: "POST",
      headers,
      body: params.toString(),
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Stripe update failed."
    );
  }

  return data;
}

async function stripeDelete(
  path: string,
  secret: string
) {
  const response = await fetch(
    `https://api.stripe.com/v1${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${secret}`,
      },
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message ||
        "Stripe cancellation failed."
    );
  }

  return data;
}

async function deleteSupabaseUser(
  supabaseUrl: string,
  serviceKey: string,
  userId: string
) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(
      userId
    )}`,
    {
      method: "DELETE",
      headers: authHeaders(serviceKey),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    console.error(
      "Could not clean up Supabase user:",
      await response.text()
    );
  }
}

export async function POST(
  request: NextRequest
) {
  let createdUserId: string | null =
    null;

  let createdSubscriptionId:
    | string
    | null = null;

  try {
    /*
      =====================================
      SERVER CONFIGURATION
      =====================================
    */

    const stripeSecret =
      process.env.STRIPE_SECRET_KEY;

    const monthlyPriceId =
      process.env.STRIPE_PRICE_MONTHLY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !stripeSecret ||
      !monthlyPriceId ||
      !supabaseUrl ||
      !serviceKey
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Server payment/account configuration is incomplete.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      =====================================
      REQUEST
      =====================================
    */

    const body =
      await request.json();

    const sessionId =
      String(
        body?.sessionId || ""
      ).trim();

    const password =
      String(
        body?.password || ""
      );

    if (
      !sessionId.startsWith("cs_") ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "A valid payment session and password of at least 8 characters are required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      VERIFY $2.99 STRIPE PAYMENT
      =====================================
    */

    const session =
      await stripeGet(
        `/checkout/sessions/${encodeURIComponent(
          sessionId
        )}`,
        stripeSecret
      );

    if (
      session.status !== "complete" ||
      session.payment_status !== "paid"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe has not confirmed the $2.99 payment yet.",
        },
        {
          status: 402,
        }
      );
    }

    if (
      session?.metadata
        ?.signup_flow !==
      "post_payment_account_creation"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This checkout session is not a HireMinds signup session.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      This new checkout is PAYMENT mode.

      It should have:
      - a Stripe Customer
      - a PaymentIntent
      - a saved card/payment method
    */

    const customerId =
      typeof session.customer ===
      "string"
        ? session.customer
        : session.customer?.id;

    const paymentIntentId =
      typeof session.payment_intent ===
      "string"
        ? session.payment_intent
        : session.payment_intent?.id;

    if (
      !customerId ||
      !paymentIntentId
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe payment information is incomplete.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      GET SAVED PAYMENT METHOD
      =====================================
    */

    const paymentIntent =
      await stripeGet(
        `/payment_intents/${encodeURIComponent(
          paymentIntentId
        )}`,
        stripeSecret
      );

    const paymentMethodId =
      typeof paymentIntent
        ?.payment_method ===
      "string"
        ? paymentIntent
            .payment_method
        : paymentIntent
            ?.payment_method?.id;

    if (!paymentMethodId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe could not locate the saved payment method.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      DETERMINE WHEN $24.99 STARTS
      =====================================

      We use the original Stripe payment
      time as the starting point.

      First $24.99 charge:
      5 days after the $2.99 payment.
    */

    let paidAt =
      Number(
        paymentIntent?.created ||
          session?.created ||
          Math.floor(
            Date.now() / 1000
          )
      );

    if (
      paymentIntent?.latest_charge
    ) {
      try {
        const chargeId =
          typeof paymentIntent
            .latest_charge ===
          "string"
            ? paymentIntent
                .latest_charge
            : paymentIntent
                .latest_charge?.id;

        if (chargeId) {
          const charge =
            await stripeGet(
              `/charges/${encodeURIComponent(
                chargeId
              )}`,
              stripeSecret
            );

          if (
            charge?.paid &&
            charge?.created
          ) {
            paidAt =
              Number(
                charge.created
              );
          }
        }
      } catch (error) {
        console.error(
          "Could not retrieve charge time:",
          error
        );
      }
    }

    const fiveDaysInSeconds =
      5 * 24 * 60 * 60;

    const firstMonthlyChargeAt =
      paidAt +
      fiveDaysInSeconds;

    /*
      =====================================
      READ SIGNUP INFORMATION
      =====================================
    */

    const email =
      String(
        session?.metadata?.email ||
          session
            ?.customer_details
            ?.email ||
          session?.customer_email ||
          ""
      )
        .trim()
        .toLowerCase();

    const firstName =
      String(
        session?.metadata
          ?.first_name ||
          ""
      ).trim();

    const lastName =
      String(
        session?.metadata
          ?.last_name ||
          ""
      ).trim();

    const fullName =
      String(
        session?.metadata
          ?.full_name ||
          `${firstName} ${lastName}`
      ).trim();

    const phone =
      String(
        session?.metadata?.phone ||
          ""
      ).trim() || null;

    const city =
      String(
        session?.metadata?.city ||
          ""
      ).trim() || null;

    const state =
      String(
        session?.metadata?.state ||
          ""
      ).trim() || null;

    if (
      !email ||
      !fullName
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Paid signup information is incomplete.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      CREATE HIREMINDS LOGIN
      =====================================
    */

    const createUser =
      await fetch(
        `${supabaseUrl}/auth/v1/admin/users`,
        {
          method: "POST",

          headers:
            authHeaders(
              serviceKey
            ),

          body: JSON.stringify({
            email,
            password,
            email_confirm: true,

            user_metadata: {
              first_name:
                firstName ||
                null,

              last_name:
                lastName ||
                null,

              full_name:
                fullName,

              phone,

              city,

              state_name:
                state,
            },
          }),

          cache: "no-store",
        }
      );

    const userData =
      await createUser.json();

    if (
      !createUser.ok ||
      !userData?.id
    ) {
      const errorMessage =
        userData?.msg ||
        userData?.message ||
        userData
          ?.error_description ||
        "HireMinds account could not be created.";

      return NextResponse.json(
        {
          ok: false,

          error:
            errorMessage
              .toLowerCase()
              .includes(
                "already"
              )
              ? "An account with this email already exists. Please sign in or use a different paid signup email."
              : errorMessage,
        },
        {
          status:
            createUser.status ||
            400,
        }
      );
    }

    const userId =
      userData.id;

    createdUserId =
      userId;

    /*
      =====================================
      CREATE $24.99 MONTHLY SUBSCRIPTION
      =====================================

      IMPORTANT:

      There is NO Stripe trial.

      We create the $24.99/month subscription
      now but set the first billing date
      for exactly 5 days after the original
      $2.99 payment.

      proration_behavior = none

      This prevents Stripe from charging
      any portion of the $24.99 today.
    */

    const subscriptionParams =
      new URLSearchParams();

    subscriptionParams.set(
      "customer",
      customerId
    );

    subscriptionParams.set(
      "items[0][price]",
      monthlyPriceId
    );

    subscriptionParams.set(
      "default_payment_method",
      paymentMethodId
    );

    subscriptionParams.set(
      "collection_method",
      "charge_automatically"
    );

    subscriptionParams.set(
      "billing_cycle_anchor",
      String(
        firstMonthlyChargeAt
      )
    );

    subscriptionParams.set(
      "proration_behavior",
      "none"
    );

    subscriptionParams.set(
      "metadata[user_id]",
      userId
    );

    subscriptionParams.set(
      "metadata[plan]",
      "monthly"
    );

    subscriptionParams.set(
      "metadata[intro_offer]",
      "5_day_2_99"
    );

    subscriptionParams.set(
      "metadata[checkout_session_id]",
      sessionId
    );

    subscriptionParams.set(
      "metadata[email]",
      email
    );

    const subscription =
      await stripePost(
        "/subscriptions",
        stripeSecret,
        subscriptionParams,
        `hireminds-${sessionId}`
      );

    if (!subscription?.id) {
      throw new Error(
        "Stripe subscription could not be created."
      );
    }

    createdSubscriptionId =
      subscription.id;

    const subscriptionStatus =
      String(
        subscription?.status ||
          "active"
      );

    /*
      =====================================
      UPDATE STRIPE CUSTOMER
      =====================================
    */

    const customerParams =
      new URLSearchParams();

    customerParams.set(
      "metadata[user_id]",
      userId
    );

    customerParams.set(
      "metadata[plan]",
      "monthly"
    );

    customerParams.set(
      "metadata[intro_offer]",
      "5_day_2_99"
    );

    await stripePost(
      `/customers/${encodeURIComponent(
        customerId
      )}`,
      stripeSecret,
      customerParams
    );

    /*
      =====================================
      CREATE HIREMINDS PROFILE
      =====================================

      The person already paid $2.99,
      so HireMinds access begins immediately.
    */

    const profile = {
      user_id:
        userId,

      full_name:
        fullName,

      phone,

      email,

      city,

      state,

      referral_code:
        null,

      access_referral_code:
        null,

      referral_consent_accepted:
        false,

      has_referral_access:
        false,

      has_paid_access:
        true,

      access_tier:
        "paid",

      subscription_status:
        subscriptionStatus,

      subscription_plan:
        "monthly",

      subscription_provider:
        "stripe",

      paid_age_18_confirmed_at:
        new Date().toISOString(),
    };

    const profileResponse =
      await fetch(
        `${supabaseUrl}/rest/v1/candidate_profiles?on_conflict=user_id`,
        {
          method: "POST",

          headers: {
            ...authHeaders(
              serviceKey
            ),

            Prefer:
              "resolution=merge-duplicates,return=minimal",
          },

          body:
            JSON.stringify(
              profile
            ),

          cache: "no-store",
        }
      );

    if (
      !profileResponse.ok
    ) {
      const profileError =
        await profileResponse.text();

      console.error(
        "Profile create failed:",
        profileError
      );

      /*
        IMPORTANT SAFETY CLEANUP:

        If HireMinds cannot activate the
        account, cancel the future $24.99
        subscription so the customer is
        not charged later for an unusable
        account.
      */

      try {
        if (
          createdSubscriptionId
        ) {
          await stripeDelete(
            `/subscriptions/${encodeURIComponent(
              createdSubscriptionId
            )}`,
            stripeSecret
          );
        }
      } catch (
        cleanupError
      ) {
        console.error(
          "Stripe subscription cleanup failed:",
          cleanupError
        );
      }

      try {
        if (
          createdUserId
        ) {
          await deleteSupabaseUser(
            supabaseUrl,
            serviceKey,
            createdUserId
          );
        }
      } catch (
        cleanupError
      ) {
        console.error(
          "Supabase user cleanup failed:",
          cleanupError
        );
      }

      return NextResponse.json(
        {
          ok: false,
          error:
            "Your $2.99 payment succeeded, but HireMinds could not finish activating your account. The future monthly subscription was not kept. Please contact support.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      =====================================
      SUCCESS
      =====================================
    */

    return NextResponse.json({
      ok: true,

      email,

      accessGranted:
        true,

      subscriptionStatus,

      firstMonthlyChargeAt:
        new Date(
          firstMonthlyChargeAt *
            1000
        ).toISOString(),
    });
  } catch (error: any) {
    console.error(
      "Complete paid signup error:",
      error
    );

    /*
      If we created a HireMinds user
      but failed before completing the
      subscription/profile setup,
      remove that partial account.
    */

    try {
      const supabaseUrl =
        process.env
          .NEXT_PUBLIC_SUPABASE_URL;

      const serviceKey =
        process.env
          .SUPABASE_SERVICE_ROLE_KEY;

      if (
        createdUserId &&
        supabaseUrl &&
        serviceKey
      ) {
        await deleteSupabaseUser(
          supabaseUrl,
          serviceKey,
          createdUserId
        );
      }
    } catch (
      cleanupError
    ) {
      console.error(
        "User cleanup error:",
        cleanupError
      );
    }

    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Paid signup could not be completed.",
      },
      {
        status: 500,
      }
    );
  }
}
