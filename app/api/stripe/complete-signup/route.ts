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

async function getSupabaseUserById(
  supabaseUrl: string,
  serviceKey: string,
  userId: string
) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(
      userId
    )}`,
    {
      headers: authHeaders(serviceKey),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return await response.json();
}

async function findProfileByEmail(
  supabaseUrl: string,
  serviceKey: string,
  email: string
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/candidate_profiles?email=eq.${encodeURIComponent(
      email
    )}&select=user_id,email&limit=1`,
    {
      headers: authHeaders(serviceKey),
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  const rows = await response.json();

  if (
    !Array.isArray(rows) ||
    !rows.length
  ) {
    return null;
  }

  return rows[0];
}

async function upsertProfile(
  supabaseUrl: string,
  serviceKey: string,
  profile: Record<string, unknown>
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/candidate_profiles?on_conflict=user_id`,
    {
      method: "POST",

      headers: {
        ...authHeaders(serviceKey),

        Prefer:
          "resolution=merge-duplicates,return=minimal",
      },

      body: JSON.stringify(profile),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `HireMinds profile could not be saved: ${await response.text()}`
    );
  }
}

async function patchProfile(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  patch: Record<string, unknown>
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${encodeURIComponent(
      userId
    )}`,
    {
      method: "PATCH",

      headers: {
        ...authHeaders(serviceKey),
        Prefer: "return=minimal",
      },

      body: JSON.stringify(patch),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `HireMinds profile could not be activated: ${await response.text()}`
    );
  }
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
      =====================================
      CONFIGURATION
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
      VERIFY THE EXISTING $2.99 PAYMENT
      =====================================

      THIS DOES NOT CHARGE $2.99 AGAIN.
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
            "Stripe has not confirmed the $2.99 payment.",
        },
        {
          status: 402,
        }
      );
    }

    if (
      session?.metadata?.signup_flow !==
      "post_payment_account_creation"
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "This is not a valid HireMinds paid signup session.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      STRIPE CUSTOMER + PAYMENT
      =====================================
    */

    const customerId =
      typeof session.customer === "string"
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

    const customer =
      await stripeGet(
        `/customers/${encodeURIComponent(
          customerId
        )}`,
        stripeSecret
      );

    const paymentIntent =
      await stripeGet(
        `/payment_intents/${encodeURIComponent(
          paymentIntentId
        )}`,
        stripeSecret
      );

    const paymentMethodId =
      typeof paymentIntent
        ?.payment_method === "string"
        ? paymentIntent.payment_method
        : paymentIntent
            ?.payment_method?.id;

    if (!paymentMethodId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe could not locate your saved payment method.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =====================================
      SIGNUP INFORMATION
      =====================================
    */

    const email =
      String(
        session?.metadata?.email ||
          session?.customer_details
            ?.email ||
          session?.customer_email ||
          ""
      )
        .trim()
        .toLowerCase();

    const firstName =
      String(
        session?.metadata
          ?.first_name || ""
      ).trim();

    const lastName =
      String(
        session?.metadata
          ?.last_name || ""
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
      FIND OR CREATE HIREMINDS USER
      =====================================

      This makes retrying the SAME paid
      session safe.
    */

    let userId:
      | string
      | null = null;

    const stripeUserId =
      String(
        customer?.metadata
          ?.user_id || ""
      ).trim();

    if (stripeUserId) {
      const existingUser =
        await getSupabaseUserById(
          supabaseUrl,
          serviceKey,
          stripeUserId
        );

      if (
        existingUser?.id &&
        String(
          existingUser?.email || ""
        )
          .trim()
          .toLowerCase() === email
      ) {
        userId =
          existingUser.id;
      }
    }

    if (!userId) {
      const existingProfile =
        await findProfileByEmail(
          supabaseUrl,
          serviceKey,
          email
        );

      if (
        existingProfile?.user_id
      ) {
        const existingUser =
          await getSupabaseUserById(
            supabaseUrl,
            serviceKey,
            existingProfile.user_id
          );

        if (existingUser?.id) {
          userId =
            existingUser.id;
        }
      }
    }

    if (!userId) {
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
                  firstName || null,

                last_name:
                  lastName || null,

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
              errorMessage,
          },
          {
            status:
              createUser.status ||
              400,
          }
        );
      }

      userId =
        userData.id;
    }

    /*
      =====================================
      CREATE / UPDATE PROFILE FIRST
      =====================================
    */

    await upsertProfile(
      supabaseUrl,
      serviceKey,
      {
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
          false,

        access_tier:
          "pending_payment",

        subscription_status:
          "pending",

        subscription_plan:
          "monthly",

        subscription_provider:
          "stripe",

        paid_age_18_confirmed_at:
          new Date().toISOString(),
      }
    );

    /*
      =====================================
      FIND AN EXISTING GOOD SUBSCRIPTION
      =====================================

      If this same signup is retried, we
      don't want duplicate subscriptions.
    */

    const subscriptionList =
      await stripeGet(
        `/subscriptions?customer=${encodeURIComponent(
          customerId
        )}&status=all&limit=20`,
        stripeSecret
      );

    let subscription =
      Array.isArray(
        subscriptionList?.data
      )
        ? subscriptionList.data.find(
            (item: any) =>
              item?.metadata
                ?.checkout_session_id ===
                sessionId &&
              ![
                "canceled",
                "incomplete_expired",
              ].includes(
                String(
                  item?.status || ""
                )
              )
          )
        : null;

    /*
      =====================================
      FIRST $24.99 BILLING DATE
      =====================================
    */

    const paidAt =
      Number(
        paymentIntent?.created ||
          session?.created ||
          Math.floor(
            Date.now() / 1000
          )
      );

    const fiveDays =
      5 * 24 * 60 * 60;

    const firstChargeAt =
      paidAt + fiveDays;

    /*
      =====================================
      CREATE $24.99 SUBSCRIPTION
      =====================================

      Only if a good one does not
      already exist.

      New idempotency key version fixes
      the error you just received.
    */

    if (!subscription) {
      const params =
        new URLSearchParams();

      params.set(
        "customer",
        customerId
      );

      params.set(
        "items[0][price]",
        monthlyPriceId
      );

      params.set(
        "default_payment_method",
        paymentMethodId
      );

      params.set(
        "collection_method",
        "charge_automatically"
      );

      const now =
        Math.floor(
          Date.now() / 1000
        );

      /*
        If we're still inside the original
        5-day period, schedule $24.99 for
        the correct future date.
      */

      if (
        firstChargeAt >
        now + 60
      ) {
        params.set(
          "billing_cycle_anchor",
          String(
            firstChargeAt
          )
        );

        params.set(
          "proration_behavior",
          "none"
        );
      }

      /*
        If 5 days have already passed,
        Stripe will start the monthly
        subscription immediately.
      */

      params.set(
        "metadata[user_id]",
        userId
      );

      params.set(
        "metadata[plan]",
        "monthly"
      );

      params.set(
        "metadata[intro_offer]",
        "5_day_2_99"
      );

      params.set(
        "metadata[checkout_session_id]",
        sessionId
      );

      params.set(
        "metadata[email]",
        email
      );

      subscription =
        await stripePost(
          "/subscriptions",
          stripeSecret,
          params,

          /*
            IMPORTANT:
            New versioned key.
            This avoids the Stripe
            idempotency-key conflict
            you just encountered.
          */

          `hm-sub-v2-${sessionId}`
        );
    }

    if (
      !subscription?.id
    ) {
      throw new Error(
        "The $24.99 monthly subscription could not be created."
      );
    }

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
      ACTIVATE HIREMINDS
      =====================================
    */

    await patchProfile(
      supabaseUrl,
      serviceKey,
      userId,
      {
        has_paid_access:
          true,

        has_referral_access:
          false,

        access_tier:
          "paid",

        subscription_status:
          String(
            subscription?.status ||
              "active"
          ),

        subscription_plan:
          "monthly",

        subscription_provider:
          "stripe",
      }
    );

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

      subscriptionId:
        subscription.id,

      subscriptionStatus:
        subscription.status,

      firstMonthlyChargeAt:
        new Date(
          firstChargeAt *
            1000
        ).toISOString(),
    });
  } catch (error: any) {
    console.error(
      "Complete paid signup error:",
      error
    );

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
