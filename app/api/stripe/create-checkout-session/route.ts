import { NextRequest, NextResponse } from "next/server";

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
    (host?.includes("localhost")
      ? "http"
      : "https");

  if (!host) {
    throw new Error(
      "Could not determine the HireMinds site URL."
    );
  }

  return `${protocol}://${host}`;
}

function clean(
  value: unknown,
  max = 500
) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

export async function POST(
  request: NextRequest
) {
  try {
    /*
      ==========================
      STRIPE CONFIGURATION
      ==========================
    */

    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

    const monthlyPriceId =
      process.env.STRIPE_PRICE_MONTHLY;

    const introPriceId =
      process.env.STRIPE_PRICE_TRIAL_5DAY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "STRIPE_SECRET_KEY is missing in Vercel.",
        },
        {
          status: 500,
        }
      );
    }

    if (!monthlyPriceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "STRIPE_PRICE_MONTHLY is missing in Vercel.",
        },
        {
          status: 500,
        }
      );
    }

    if (!introPriceId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "STRIPE_PRICE_TRIAL_5DAY is missing in Vercel.",
        },
        {
          status: 500,
        }
      );
    }

    /*
      ==========================
      SIGNUP INFORMATION
      ==========================
    */

    const body =
      await request.json();

    const firstName = clean(
      body?.firstName,
      80
    );

    const lastName = clean(
      body?.lastName,
      80
    );

    const fullName =
      clean(
        body?.fullName ||
          `${firstName} ${lastName}`,
        160
      );

    const email =
      clean(
        body?.email,
        254
      ).toLowerCase();

    const phone = clean(
      body?.phone,
      40
    );

    const city = clean(
      body?.city,
      100
    );

    const state = clean(
      body?.state,
      100
    );

    if (!fullName) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "First and last name are required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !email ||
      !email.includes("@")
    ) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "A valid email address is required.",
        },
        {
          status: 400,
        }
      );
    }

    const siteUrl =
      getSiteUrl(request);

    /*
      ==========================
      CREATE STRIPE CHECKOUT
      ==========================

      LINE ITEM 0
      $24.99/month recurring subscription.

      Stripe does NOT charge this recurring
      amount for the first 5 days because
      the subscription has a 5-day trial.

      LINE ITEM 1
      $2.99 one-time introductory charge.

      This amount is charged immediately.

      RESULT:

      TODAY:
      $2.99

      DAYS 1-5:
      HireMinds access

      AFTER DAY 5:
      $24.99/month automatically
      unless canceled.
    */

    const params =
      new URLSearchParams();

    params.set(
      "mode",
      "subscription"
    );

    params.set(
      "customer_email",
      email
    );

    /*
      Recurring $24.99 monthly price
    */

    params.set(
      "line_items[0][price]",
      monthlyPriceId
    );

    params.set(
      "line_items[0][quantity]",
      "1"
    );

    /*
      One-time $2.99 introductory price
    */

    params.set(
      "line_items[1][price]",
      introPriceId
    );

    params.set(
      "line_items[1][quantity]",
      "1"
    );

    /*
      Delay the recurring $24.99
      subscription charge for 5 days.
    */

    params.set(
      "subscription_data[trial_period_days]",
      "5"
    );

    /*
      ==========================
      CHECKOUT REDIRECTS
      ==========================
    */

    params.set(
      "success_url",
      `${siteUrl}/access/paid/success?session_id={CHECKOUT_SESSION_ID}`
    );

    params.set(
      "cancel_url",
      `${siteUrl}/sign-up?checkout=canceled`
    );

    /*
      ==========================
      CHECKOUT METADATA
      ==========================
    */

    params.set(
      "metadata[signup_flow]",
      "post_payment_account_creation"
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
      "metadata[full_name]",
      fullName
    );

    params.set(
      "metadata[email]",
      email
    );

    if (firstName) {
      params.set(
        "metadata[first_name]",
        firstName
      );
    }

    if (lastName) {
      params.set(
        "metadata[last_name]",
        lastName
      );
    }

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

    /*
      ==========================
      SUBSCRIPTION METADATA
      ==========================
    */

    params.set(
      "subscription_data[metadata][plan]",
      "monthly"
    );

    params.set(
      "subscription_data[metadata][intro_offer]",
      "5_day_2_99"
    );

    params.set(
      "subscription_data[metadata][signup_flow]",
      "post_payment_account_creation"
    );

    params.set(
      "subscription_data[metadata][full_name]",
      fullName
    );

    params.set(
      "subscription_data[metadata][email]",
      email
    );

    if (firstName) {
      params.set(
        "subscription_data[metadata][first_name]",
        firstName
      );
    }

    if (lastName) {
      params.set(
        "subscription_data[metadata][last_name]",
        lastName
      );
    }

    /*
      ==========================
      SEND REQUEST TO STRIPE
      ==========================
    */

    const stripeResponse =
      await fetch(
        "https://api.stripe.com/v1/checkout/sessions",
        {
          method: "POST",

          headers: {
            Authorization:
              `Bearer ${stripeSecretKey}`,

            "Content-Type":
              "application/x-www-form-urlencoded",
          },

          body:
            params.toString(),

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
            stripeResponse.status ||
            500,
        }
      );
    }

    /*
      ==========================
      SUCCESS
      ==========================
    */

    return NextResponse.json({
      ok: true,
      url: stripeData.url,
      sessionId:
        stripeData.id,
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

/*
  ==================================================
  STRIPE DIAGNOSTIC
  ==================================================

  Visiting this API route with GET checks:

  - Stripe account connection
  - $24.99 monthly price
  - $2.99 introductory price

  The old 4-month and annual prices
  are intentionally no longer checked.
*/

export async function GET() {
  try {
    const secret =
      process.env.STRIPE_SECRET_KEY;

    if (!secret) {
      return NextResponse.json({
        ok: false,
        error:
          "STRIPE_SECRET_KEY missing",
      });
    }

    /*
      Check Stripe account
    */

    const accountResponse =
      await fetch(
        "https://api.stripe.com/v1/account",
        {
          headers: {
            Authorization:
              `Bearer ${secret}`,
          },

          cache: "no-store",
        }
      );

    const account =
      await accountResponse.json();

    /*
      Only the two prices
      HireMinds now uses.
    */

    const prices = {
      monthly:
        process.env
          .STRIPE_PRICE_MONTHLY,

      intro_5day:
        process.env
          .STRIPE_PRICE_TRIAL_5DAY,
    };

    const priceChecks: Record<
      string,
      any
    > = {};

    for (
      const [name, priceId]
      of Object.entries(prices)
    ) {
      if (!priceId) {
        priceChecks[name] = {
          configured: false,
          found: false,
        };

        continue;
      }

      const response =
        await fetch(
          `https://api.stripe.com/v1/prices/${encodeURIComponent(
            priceId.trim()
          )}`,
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

      priceChecks[name] = {
        configured: true,

        found:
          response.ok,

        status:
          response.status,

        error:
          response.ok
            ? null
            : data?.error?.message ||
              "Unknown Stripe error",
      };
    }

    return NextResponse.json({
      ok:
        accountResponse.ok,

      stripeAccountId:
        account?.id ||
        null,

      businessName:
        account?.settings
          ?.dashboard
          ?.display_name ||
        account
          ?.business_profile
          ?.name ||
        null,

      prices:
        priceChecks,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,

        error:
          error?.message ||
          "Stripe diagnostic failed",
      },
      {
        status: 500,
      }
    );
  }
}
