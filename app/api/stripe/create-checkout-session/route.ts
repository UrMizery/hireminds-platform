import { NextRequest, NextResponse } from "next/server";

type PlanKey = "monthly" | "four_month" | "annual";

const STRIPE_PRICE_ENV: Record<PlanKey, string> = {
  monthly: "STRIPE_PRICE_MONTHLY",
  four_month: "STRIPE_PRICE_FOUR_MONTH",
  annual: "STRIPE_PRICE_ANNUAL",
};

function isPlanKey(value: unknown): value is PlanKey {
  return value === "monthly" || value === "four_month" || value === "annual";
}

function getSiteUrl(request: NextRequest) {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "";

  if (configured) {
    return configured.replace(/\/+$/, "");
  }

  const host =
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  const protocol =
    request.headers.get("x-forwarded-proto") ||
    (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Could not determine the HireMinds site URL.");
  }

  return `${protocol}://${host}`;
}

function clean(value: unknown, max = 500) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export async function POST(request: NextRequest) {
  try {
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          ok: false,
          error: "Stripe is not configured.",
        },
        {
          status: 500,
        }
      );
    }

    const body = await request.json();

    const plan = body?.plan;

    if (!isPlanKey(plan)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid subscription plan.",
        },
        {
          status: 400,
        }
      );
    }

    const fullName = clean(body?.fullName, 120);
    const email = clean(body?.email, 254).toLowerCase();
    const phone = clean(body?.phone, 40);
    const city = clean(body?.city, 100);
    const state = clean(body?.state, 100);

    if (
      !fullName ||
      !email ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error: "Name and a valid email are required.",
        },
        {
          status: 400,
        }
      );
    }

    const priceEnvName =
      STRIPE_PRICE_ENV[plan];

    const stripePriceId =
      process.env[priceEnvName];

    if (!stripePriceId) {
      return NextResponse.json(
        {
          ok: false,
          error: `${priceEnvName} is missing in Vercel.`,
        },
        {
          status: 500,
        }
      );
    }

    const siteUrl = getSiteUrl(request);

    const params = new URLSearchParams();

    params.set("mode", "subscription");

    params.set(
      "customer_email",
      email
    );

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
      `${siteUrl}/sign-up?plan=${encodeURIComponent(
        plan
      )}&checkout=canceled`
    );

    params.set(
      "allow_promotion_codes",
      "true"
    );

    /*
      IMPORTANT:

      We are NOT creating a Supabase account here.

      The person is only entering signup information
      so Stripe can process payment first.

      After Stripe confirms payment, the account
      creation flow will happen.
    */

    params.set(
      "metadata[signup_flow]",
      "post_payment_account_creation"
    );

    params.set(
      "metadata[plan]",
      plan
    );

    params.set(
      "metadata[full_name]",
      fullName
    );

    params.set(
      "metadata[email]",
      email
    );

    if (phone) {
      params.set(
        "metadata[phone]",
        phone
      );
    }

    if (city) {
      params.set(
        "metadata[city]",
        city
      );
    }

    if (state) {
      params.set(
        "metadata[state]",
        state
      );
    }

    params.set(
      "subscription_data[metadata][plan]",
      plan
    );

    params.set(
      "subscription_data[metadata][signup_flow]",
      "post_payment_account_creation"
    );

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${stripeSecretKey}`,
          "Content-Type":
            "application/x-www-form-urlencoded",
        },
        body: params.toString(),
        cache: "no-store",
      }
    );

    const stripeData =
      await stripeResponse.json();

    if (
      !stripeResponse.ok ||
      !stripeData?.url
    ) {
      console.error(
        "Stripe checkout error:",
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
            stripeResponse.status || 500,
        }
      );
    }

    return NextResponse.json({
      ok: true,
      url: stripeData.url,
      sessionId: stripeData.id,
    });
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
          "Stripe checkout could not be started.",
      },
      {
        status: 500,
      }
    );
  }
}
