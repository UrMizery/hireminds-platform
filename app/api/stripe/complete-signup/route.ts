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

/*
  FIX:
  Look directly in Supabase Auth for an
  existing user with this email.

  This handles cases where Auth already
  created the login during an earlier
  attempt but candidate_profiles was not
  created yet.
*/

async function findSupabaseAuthUserByEmail(
  supabaseUrl: string,
  serviceKey: string,
  email: string
) {
  const normalizedEmail =
    email.trim().toLowerCase();

  /*
    Supabase Auth Admin users are paginated.
    1000 per page is supported.
  */

  for (
    let page = 1;
    page <= 10;
    page++
  ) {
    const response = await fetch(
      `${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=1000`,
      {
        headers:
          authHeaders(serviceKey),

        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Supabase user lookup failed: ${await response.text()}`
      );
    }

    const data =
      await response.json();

    const users =
      Array.isArray(data?.users)
        ? data.users
        : [];

    const found =
      users.find(
        (user: any) =>
          String(
            user?.email || ""
          )
            .trim()
            .toLowerCase() ===
          normalizedEmail
      );

    if (found) {
      return found;
    }

    if (users.length < 1000) {
      break;
    }
  }

  return null;
}

/*
  If the account already exists because
  of a previous failed signup attempt,
  update the password and metadata using
  the password currently entered by the
  customer.
*/

async function updateSupabaseAuthUser(
  supabaseUrl: string,
  serviceKey: string,
  userId: string,
  password: string,
  metadata: Record<string, unknown>
) {
  const response = await fetch(
    `${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(
      userId
    )}`,
    {
      method: "PUT",

      headers:
        authHeaders(serviceKey),

      body: JSON.stringify({
        password,
        email_confirm: true,
        user_metadata:
          metadata,
      }),

      cache: "no-store",
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    throw new Error(
      data?.msg ||
        data?.message ||
        data?.error_description ||
        "Existing HireMinds login could not be updated."
    );
  }

  return data;
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

/*
  We do NOT use on_conflict=user_id
  because candidate_profiles.user_id
  does not currently have the UNIQUE
  constraint Supabase requires for that.

  Instead:
  - check if profile exists
  - PATCH existing
  - POST new
*/

async function upsertProfile(
  supabaseUrl: string,
  serviceKey: string,
  profile: Record<string, unknown>
) {
  const userId =
    String(
      profile.user_id || ""
    ).trim();

  if (!userId) {
    throw new Error(
      "HireMinds profile is missing a user ID."
    );
  }

  const checkResponse =
    await fetch(
      `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${encodeURIComponent(
        userId
      )}&select=user_id&limit=1`,
      {
        headers:
          authHeaders(
            serviceKey
          ),

        cache:
          "no-store",
      }
    );

  if (!checkResponse.ok) {
    throw new Error(
      `HireMinds profile lookup failed: ${await checkResponse.text()}`
    );
  }

  const existingRows =
    await checkResponse.json();

  const profileExists =
    Array.isArray(existingRows) &&
    existingRows.length > 0;

  const response =
    await fetch(
      profileExists
        ? `${supabaseUrl}/rest/v1/candidate_profiles?user_id=eq.${encodeURIComponent(
            userId
          )}`
        : `${supabaseUrl}/rest/v1/candidate_profiles`,
      {
        method:
          profileExists
            ? "PATCH"
            : "POST",

        headers: {
          ...authHeaders(
            serviceKey
          ),

          Prefer:
            "return=minimal",
        },

        body:
          JSON.stringify(
            profile
          ),

        cache:
          "no-store",
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

/*
  Subscriber reporting is intentionally
  separate from candidate_profiles.

  This does NOT change billing, account
  creation, or access. It only records the
  paid subscription in the subscriptions
  table for Super Admin reporting.
*/

async function upsertSubscriptionRecord(
  supabaseUrl: string,
  serviceKey: string,
  record: Record<string, unknown>
) {
  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?on_conflict=stripe_subscription_id`,
    {
      method: "POST",

      headers: {
        ...authHeaders(serviceKey),
        Prefer:
          "resolution=merge-duplicates,return=minimal",
      },

      body: JSON.stringify(record),

      cache: "no-store",
    }
  );

  if (!response.ok) {
    throw new Error(
      `Subscriber record could not be saved: ${await response.text()}`
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
      VERIFY EXISTING $2.99 PAYMENT
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
      session?.metadata
        ?.signup_flow !==
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
      typeof session.customer ===
      "string"
        ? session.customer
        : session.customer?.id;

    const paymentIntentId =
      typeof session.payment_intent ===
      "string"
        ? session.payment_intent
        : session
            .payment_intent?.id;

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
        ?.payment_method ===
      "string"
        ? paymentIntent
            .payment_method
        : paymentIntent
            ?.payment_method
            ?.id;

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
      FIND OR CREATE HIREMINDS USER
      =====================================

      We now check:

      1. Stripe customer user_id
      2. Existing candidate profile
      3. Supabase Auth directly by email
      4. Only create a new user if none exists
    */

    let userId:
      | string
      | null = null;

    let existingAuthUser:
      | any
      | null = null;

    /*
      FIRST:
      Try Stripe metadata.
    */

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
          existingUser
            ?.email || ""
        )
          .trim()
          .toLowerCase() ===
        email
      ) {
        userId =
          existingUser.id;

        existingAuthUser =
          existingUser;
      }
    }

    /*
      SECOND:
      Try candidate_profiles.
    */

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
            existingProfile
              .user_id
          );

        if (
          existingUser?.id
        ) {
          userId =
            existingUser.id;

          existingAuthUser =
            existingUser;
        }
      }
    }

    /*
      THIRD:
      Look directly inside Supabase Auth.

      THIS FIXES:
      "A user with this email address has
      already been registered"
    */

    if (!userId) {
      const authUser =
        await findSupabaseAuthUserByEmail(
          supabaseUrl,
          serviceKey,
          email
        );

      if (authUser?.id) {
        userId =
          authUser.id;

        existingAuthUser =
          authUser;
      }
    }

    /*
      If an Auth user already exists,
      update their password to the password
      they just entered on this verified
      paid signup page.

      This safely recovers the account that
      was partially created during the
      earlier failed attempt.
    */

    if (
      userId &&
      existingAuthUser
    ) {
      await updateSupabaseAuthUser(
        supabaseUrl,
        serviceKey,
        userId,
        password,
        {
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
        }
      );
    }

    /*
      FOURTH:
      Only create a brand-new Auth user
      if one truly does not already exist.
    */

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

            body:
              JSON.stringify(
                {
                  email,

                  password,

                  email_confirm:
                    true,

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
                }
              ),

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
      CREATE / UPDATE PROFILE
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
      FIND EXISTING GOOD SUBSCRIPTION
      =====================================

      We do not create duplicate
      subscriptions if this same payment
      session is retried.
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
            Date.now() /
              1000
          )
      );

    const fiveDays =
      5 * 24 * 60 * 60;

    const firstChargeAt =
      paidAt +
      fiveDays;

    /*
      =====================================
      CREATE $24.99 SUBSCRIPTION
      =====================================
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
          Date.now() /
            1000
        );

      /*
        If still inside the original
        five days, schedule the first
        $24.99 charge for the correct
        future date.
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
      RECORD PAID SUBSCRIBER
      =====================================

      Tracking only.

      If subscriber reporting ever has a
      temporary database issue, the working
      Stripe/account flow is not interrupted.
    */

    const subscriptionPeriodEnd =
      Number(
        subscription?.current_period_end ||
          firstChargeAt ||
          0
      );

    const subscriptionCancelledAt =
      Number(
        subscription?.canceled_at ||
          0
      );

    try {
      await upsertSubscriptionRecord(
        supabaseUrl,
        serviceKey,
        {
          user_id:
            userId,

          email,

          full_name:
            fullName,

          state,

          stripe_customer_id:
            customerId,

          stripe_subscription_id:
            subscription.id,

          status:
            String(
              subscription?.status ||
                "active"
            ),

          plan_name:
            "monthly",

          stripe_price_id:
            monthlyPriceId,

          intro_amount:
            2.99,

          monthly_amount:
            24.99,

          intro_started_at:
            new Date(
              paidAt * 1000
            ).toISOString(),

          current_period_end:
            subscriptionPeriodEnd > 0
              ? new Date(
                  subscriptionPeriodEnd *
                    1000
                ).toISOString()
              : null,

          cancel_at_period_end:
            subscription
              ?.cancel_at_period_end ===
            true,

          cancelled_at:
            subscriptionCancelledAt > 0
              ? new Date(
                  subscriptionCancelledAt *
                    1000
                ).toISOString()
              : null,

          acquisition_source:
            "paid_signup",

          referral_code:
            null,

          updated_at:
            new Date().toISOString(),
        }
      );
    } catch (trackingError) {
      console.error(
        "Subscriber tracking error:",
        trackingError
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
