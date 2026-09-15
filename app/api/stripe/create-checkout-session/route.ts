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
    const stripeSecretKey =
      process.env.STRIPE_SECRET_KEY;

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

    const fullName = clean(
      body?.fullName ||
        `${firstName} ${lastName}`,
      160
    );

    const email = clean(
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

    const params =
      new URLSearchParams();

    /*
      ========================================
      $2.99 INTRODUCTORY PAYMENT
      ========================================

      This Checkout Session charges ONLY $2.99.

      There is NO Stripe free trial here.

      The card is saved securely so the
      $24.99/month subscription can begin
      automatically 5 days later.
    */

    params.set(
      "mode",
      "payment"
    );

    params.set(
      "customer_creation",
      "always"
    );

    params.set(
      "customer_email",
      email
    );

    /*
      Restrict Checkout to a reusable card
      payment method.
    */

    params.set(
      "payment_method_types[0]",
      "card"
    );

    /*
      Save the payment method for the
      $24.99 recurring subscription.
    */

    params.set(
      "payment_intent_data[setup_future_usage]",
      "off_session"
    );

    /*
      $2.99 introductory access price.
    */

    params.set(
      "line_items[0][price]",
      introPriceId
    );

    params.set(
      "line_items[0][quantity]",
      "1"
    );

    /*
      ========================================
      REDIRECTS
      ========================================
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
      ========================================
      SESSION METADATA
      ========================================
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
      Also place identifying signup metadata
      on the PaymentIntent.
    */

    params.set(
      "payment_intent_data[metadata][signup_flow]",
      "post_payment_account_creation"
    );

    params.set(
      "payment_intent_data[metadata][intro_offer]",
      "5_day_2_99"
    );

    params.set(
      "payment_intent_data[metadata][email]",
      email
    );

    /*
      ========================================
      CREATE CHECKOUT
      ========================================
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

          cache:
            "no-store",
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

    return NextResponse.json({
      ok: true,
      url:
        stripeData.url,
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
  ========================================
  STRIPE DIAGNOSTIC
  ========================================
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

    const accountResponse =
      await fetch(
        "https://api.stripe.com/v1/account",
        {
          headers: {
            Authorization:
              `Bearer ${secret}`,
          },

          cache:
            "no-store",
        }
      );

    const account =
      await accountResponse.json();

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

            cache:
              "no-store",
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
