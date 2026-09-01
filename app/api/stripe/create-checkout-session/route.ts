import { NextRequest, NextResponse } from "next/server";

type PlanKey = "monthly" | "four_month" | "annual";

type SupabaseUser = {
  id?: string;
  email?: string;
};

const STRIPE_PRICE_ENV: Record<PlanKey, string> = {
  monthly: "STRIPE_PRICE_MONTHLY",
  four_month: "STRIPE_PRICE_FOUR_MONTH",
  annual: "STRIPE_PRICE_ANNUAL",
};

function isPlanKey(value: unknown): value is PlanKey {
  return (
    value === "monthly" ||
    value === "four_month" ||
    value === "annual"
  );
}

function getSiteUrl(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost || request.headers.get("host");

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error(
      "Could not determine the HireMinds site URL. Add NEXT_PUBLIC_SITE_URL in Vercel."
    );
  }

  return `${protocol}://${host}`;
}

async function getSupabaseUser(
  accessToken: string
): Promise<SupabaseUser | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing."
    );
  }

  const response = await fetch(
    `${supabaseUrl}/auth/v1/user`,
    {
      method: "GET",
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

async function createStripeCheckoutSession(options: {
  stripeSecretKey: string;
  stripePriceId: string;
  userId: string;
  email: string;
  plan: PlanKey;
  siteUrl: string;
}) {
  const {
    stripeSecretKey,
    stripePriceId,
    userId,
    email,
    plan,
    siteUrl,
  } = options;

  const params = new URLSearchParams();

  /*
    This is a recurring subscription checkout.

    IMPORTANT:
    This route ONLY creates the Stripe Checkout Session.
    It does NOT activate HireMinds paid access.

    Paid access must remain locked until the Stripe webhook
    confirms the subscription/payment.
  */
  params.set("mode", "subscription");

  params.set("customer_email", email);
  params.set("client_reference_id", userId);

  params.set(
    "line_items[0][price]",
    stripePriceId
  );

  params.set(
    "line_items[0][quantity]",
    "1"
  );

  params.set(
    "success_url",
    `${siteUrl}/access/paid/success?session_id={CHECKOUT_SESSION_ID}`
  );

  params.set(
    "cancel_url",
    `${siteUrl}/access/paid?plan=${encodeURIComponent(
      plan
    )}`
  );

  /*
    Session metadata.
  */
  params.set(
    "metadata[user_id]",
    userId
  );

  params.set(
    "metadata[plan]",
    plan
  );

  /*
    Subscription metadata.
    This lets the webhook identify which HireMinds user
    and plan belong to the Stripe subscription.
  */
  params.set(
    "subscription_data[metadata][user_id]",
    userId
  );

  params.set(
    "subscription_data[metadata][plan]",
    plan
  );

  /*
    Allow valid Stripe promotion codes if you create them later.
  */
  params.set(
    "allow_promotion_codes",
    "true"
  );

  const stripeResponse = await fetch(
    "https://api.stripe.com/v1/checkout/sessions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeSecretKey}`,
        "Content-Type":
          "application/x-www-form-urlencoded",
      },
      body: params.toString(),
      cache: "no-store",
    }
  );

  const stripeData =
    await stripeResponse.json();

  return {
    stripeResponse,
    stripeData,
  };
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
      REQUIRED VERCEL VARIABLES:

      STRIPE_SECRET_KEY

      STRIPE_PRICE_MONTHLY
      STRIPE_PRICE_FOUR_MONTH
      STRIPE_PRICE_ANNUAL

      NEXT_PUBLIC_SUPABASE_URL
      NEXT_PUBLIC_SUPABASE_ANON_KEY

      Recommended:
      NEXT_PUBLIC_SITE_URL=https://www.hireminds.app
    */

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY in Vercel.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      The paid page must send the signed-in user's
      Supabase access token in:

      Authorization: Bearer <access_token>
    */
    const authHeader =
      request.headers.get("authorization");

    if (
      !authHeader ||
      !authHeader.startsWith("Bearer ")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Your HireMinds session could not be verified. Please sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    const accessToken =
      authHeader
        .slice("Bearer ".length)
        .trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Your HireMinds session could not be verified. Please sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      Verify the token directly against Supabase Auth.
    */
    const user =
      await getSupabaseUser(
        accessToken
      );

    if (!user?.id || !user?.email) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Your HireMinds session has expired. Please sign in again.",
        },
        {
          status: 401,
        }
      );
    }

    /*
      Read the selected plan.
    */
    const body =
      await request.json();

    const plan =
      body?.plan;

    if (!isPlanKey(plan)) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Invalid HireMinds subscription plan.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      Get the correct Stripe Price ID from Vercel.
    */
    const priceEnvName =
      STRIPE_PRICE_ENV[plan];

    const stripePriceId =
      process.env[priceEnvName];

    if (!stripePriceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            `Stripe price is not configured for ${plan}. Add ${priceEnvName} in Vercel.`,
        },
        {
          status: 500,
        }
      );
    }

    const siteUrl =
      getSiteUrl(request);

    const {
      stripeResponse,
      stripeData,
    } =
      await createStripeCheckoutSession(
        {
          stripeSecretKey,
          stripePriceId,
          userId: user.id,
          email: user.email,
          plan,
          siteUrl,
        }
      );

    if (!stripeResponse.ok) {
      console.error(
        "Stripe Checkout Session error:",
        stripeData
      );

      return NextResponse.json(
        {
          ok: false,
          error:
            stripeData?.error?.message ||
            "Stripe checkout could not be started.",
        },
        {
          status:
            stripeResponse.status ||
            500,
        }
      );
    }

    if (
      !stripeData?.id ||
      !stripeData?.url
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Stripe did not return a valid checkout session.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        url: stripeData.url,
        sessionId:
          stripeData.id,
      },
      {
        status: 200,
      }
    );
  } catch (error: any) {
    console.error(
      "Create Stripe Checkout Session error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        error:
          error?.message ||
          "Stripe checkout could not be started. Please try again.",
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
        "/api/stripe/create-checkout-session",
      message:
        "HireMinds Stripe checkout endpoint is running.",
    },
    {
      status: 200,
    }
  );
}
