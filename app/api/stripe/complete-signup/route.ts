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
  params: URLSearchParams
) {
  const response = await fetch(
    `https://api.stripe.com/v1${path}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
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

export async function POST(
  request: NextRequest
) {
  try {
    const stripeSecret =
      process.env.STRIPE_SECRET_KEY;

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (
      !stripeSecret ||
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

    const body =
      await request.json();

    const sessionId =
      String(body?.sessionId || "").trim();

    const password =
      String(body?.password || "");

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
      Verify the Stripe Checkout Session DIRECTLY.

      This is the important security check:
      no HireMinds account is created unless Stripe
      confirms checkout was completed and paid.
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
      ![
        "paid",
        "no_payment_required",
      ].includes(
        session.payment_status
      )
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe has not confirmed this payment yet.",
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
            "This checkout session is not a HireMinds signup session.",
        },
        {
          status: 400,
        }
      );
    }

    const email =
      String(
        session?.metadata?.email ||
          session?.customer_details?.email ||
          session?.customer_email ||
          ""
      )
        .trim()
        .toLowerCase();

    const fullName =
      String(
        session?.metadata?.full_name ||
          ""
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

    const plan =
      String(
        session?.metadata?.plan ||
          "monthly"
      );

    if (!email || !fullName) {
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
      CREATE SUPABASE AUTH USER ONLY NOW —
      AFTER PAYMENT HAS BEEN VERIFIED.
    */
    const createUser =
      await fetch(
        `${supabaseUrl}/auth/v1/admin/users`,
        {
          method: "POST",
          headers:
            authHeaders(serviceKey),
          body: JSON.stringify({
            email,
            password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              phone,
              city,
              state_name: state,
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
      const message =
        userData?.msg ||
        userData?.message ||
        userData?.error_description ||
        "HireMinds account could not be created.";

      return NextResponse.json(
        {
          ok: false,
          error:
            message
              .toLowerCase()
              .includes("already")
              ? "An account with this email already exists. Please sign in or use a different paid signup email."
              : message,
        },
        {
          status:
            createUser.status || 400,
        }
      );
    }

    const userId =
      userData.id;

    /*
      Create the HireMinds profile as ACTIVE
      because Stripe payment was already verified.
    */
    const profile = {
      user_id: userId,
      full_name: fullName,
      phone,
      email,
      city,
      state,

      referral_code: null,
      access_referral_code: null,

      referral_consent_accepted: false,

      has_referral_access: false,
      has_paid_access: true,

      access_tier: "paid",

      subscription_status: "active",
      subscription_plan: plan,
      subscription_provider: "stripe",

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

    if (!profileResponse.ok) {
      console.error(
        "Profile create failed:",
        await profileResponse.text()
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            "Payment succeeded and the login was created, but the HireMinds profile could not be activated. Please contact support.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      Add the Supabase user_id to Stripe AFTER
      the account is created.

      That lets future renewals/cancellations
      identify the correct HireMinds account.
    */
    if (session.subscription) {
      const params =
        new URLSearchParams();

      params.set(
        "metadata[user_id]",
        userId
      );

      params.set(
        "metadata[plan]",
        plan
      );

      await stripePost(
        `/subscriptions/${encodeURIComponent(
          session.subscription
        )}`,
        stripeSecret,
        params
      );
    }

    if (session.customer) {
      const params =
        new URLSearchParams();

      params.set(
        "metadata[user_id]",
        userId
      );

      await stripePost(
        `/customers/${encodeURIComponent(
          session.customer
        )}`,
        stripeSecret,
        params
      );
    }

    return NextResponse.json({
      ok: true,
      email,
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
