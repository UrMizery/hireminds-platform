import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

type ReferralCodeConfig = {
  active: boolean;
  label: string;
};

/*
  ==================================================
  HIREMINDS ACTIVE REFERRAL CODES
  ==================================================

  THESE ARE THE ONLY CODES THAT CAN BE USED
  FOR NEW REGISTRATIONS.

  Referral access:
  - One-time access
  - 30 days
  - No payment required
*/

const REFERRAL_CODES: Record<
  string,
  ReferralCodeConfig
> = {
  "12.2026": {
    active: true,
    label: "HireMinds Referral Access",
  },

  RDS1: {
    active: true,
    label: "RDS Referral Access",
  },

  COHORT2Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
  },

  COHORT3Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
  },

  COHORT4Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
  },

  COHORT5Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
  },

  DEMO1: {
    active: true,
    label: "HireMinds Demo Referral Access",
  },
};

/*
  ==================================================
  OLD / BLOCKED CODES
  ==================================================

  These are recognized as old HireMinds codes,
  but they CANNOT be used for a new registration.
*/

const BLOCKED_REFERRAL_CODES = new Set([
  "YWCA",
  "COHORT1Y",
  "RDS",
  "YWORK4C3",
]);

function normalizeReferralCode(
  value: unknown
) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function getReferralExpiration() {
  const expiresAt = new Date();

  expiresAt.setDate(
    expiresAt.getDate() + 30
  );

  return expiresAt.toISOString();
}

export async function POST(
  request: NextRequest
) {
  try {
    const body =
      await request.json();

    const code =
      normalizeReferralCode(
        body?.code
      );

    /*
      =========================================
      NO CODE ENTERED
      =========================================
    */

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "Enter a referral code.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =========================================
      BLOCK OLD CODES
      =========================================
    */

    if (
      BLOCKED_REFERRAL_CODES.has(
        code
      )
    ) {
      return NextResponse.json(
        {
          valid: false,
          code,
          message:
            "That referral code is no longer active for new registrations.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =========================================
      LOOK UP ACTIVE CODE
      =========================================
    */

    const referral =
      REFERRAL_CODES[code];

    if (
      !referral ||
      !referral.active
    ) {
      return NextResponse.json(
        {
          valid: false,
          code,
          message:
            "That referral code is not currently active. Check the code and try again.",
        },
        {
          status: 400,
        }
      );
    }

    /*
      =========================================
      VALID REFERRAL CODE
      =========================================
    */

    const expiresAt =
      getReferralExpiration();

    return NextResponse.json(
      {
        valid: true,

        code,

        label:
          referral.label,

        accessType:
          "referral",

        accessDays:
          30,

        expiresAt,

        message:
          "Referral code verified.",
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error(
      "Referral validation error:",
      error
    );

    return NextResponse.json(
      {
        valid: false,
        message:
          "We could not verify the referral code. Please try again.",
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
        "/api/access/validate-referral",

      message:
        "HireMinds referral validation endpoint is running.",

      activeReferralCodes: [
        "12.2026",
        "RDS1",
        "COHORT2Y",
        "COHORT3Y",
        "COHORT4Y",
        "COHORT5Y",
        "DEMO1",
      ],

      referralAccessDays:
        30,
    },
    {
      status: 200,
    }
  );
}
