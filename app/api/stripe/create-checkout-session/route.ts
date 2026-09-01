import { NextRequest, NextResponse } from "next/server";

type PlanKey = "monthly" | "four_month" | "annual";

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

async function getSupabaseUser(accessToken: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase environment variables are missing."
    );
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          error:
            "Stripe is not configured yet. Add STRIPE_SECRET_KEY in Vercel.",
        },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json(
        {
          error:
            "Your HireMinds session could not be verified. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const accessToken = authHeader.slice("Bearer ".length).trim();

    if (!accessToken) {
      return NextResponse.json(
        {
          error:
            "Your HireMinds session could not be verified. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const user = await getSupabaseUser(accessToken);

    if (!user?.id || !user?.email) {
      return NextResponse.json(
        {
          error:
            "Your HireMinds session has expired. Please sign in again.",
        },
        { status: 401 }
      );
    }

    const body = await request.json();
    const plan = body?.plan;

    if (!isPlanKey(plan)) {
      return NextResponse.json(
        {
          error:
            "Invalid HireMinds subscription plan.",
        },
        { status: 400 }
      );
    }

    const priceEnvName = STRIPE_PRICE_ENV[plan];
    const stripePriceId = process.env[priceEnvName];

    if (!stripePriceId) {
      return NextResponse.json(
        {
          error:
            `Stripe price is not configured for ${plan}. Add ${priceEnvName} in Vercel.`,
        },
        { status: 500 }
      );
    }

    const siteUrl = getSiteUrl(request);

    /*
      Stripe Checkout is created server-side.

      IMPORTANT:
      This route DOES NOT activate HireMinds access.

      The Stripe webhook will be responsible for changing:
        has_paid_access = true
        access_tier = "paid"
        subscription_status = "active"

      only after Stripe confirms the subscription/payment.
    */
    const params = new URLSearchParams();

    params.set("mode", "subscription");
    params.set("customer_email", user.email);
    params.set("client_reference_id", user.id);

    params.set("line_items[0][price]", stripePriceId);
    params.set("line_items[0][quantity]", "1");

    params.set(
      "success_url",
      `${siteUrl}/access/paid/success?session_id={CHECKOUT_SESSION_ID}`
    );

    params.set(
      "cancel_url",
      `${siteUrl}/access/paid?plan=${encodeURIComponent(plan)}`
    );

    params.set("metadata[user_id]", user.id);
    params.set("metadata[plan]", plan);

    params.set(
      "subscription_data[metadata][user_id]",
      user.id
    );
    params.set(
      "subscription_data[metadata][plan]",
      plan
    );

    params.set("allow_promotion_codes", "true");

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${stripeSecretKey}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        cache: "no-store",
      }
    );

    const stripeData = await stripeResponse.json();

    if (!stripeResponse.ok) {
      console.error(
        "Stripe Checkout Session error:",
        stripeData
      );

      return NextResponse.json(
        {
          error:
            stripeData?.error?.message ||
            "Stripe checkout could not be started.",
        },
        { status: stripeResponse.status || 500 }
      );
    }

    if (!stripeData?.url) {
      return NextResponse.json(
        {
          error:
            "Stripe did not return a checkout URL.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        url: stripeData.url,
        sessionId: stripeData.id,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error(
      "Create Stripe Checkout Session error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Stripe checkout could not be started. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/stripe/create-checkout-session",
      message:
        "HireMinds Stripe checkout endpoint is running.",
    },
    { status: 200 }
  );
}
