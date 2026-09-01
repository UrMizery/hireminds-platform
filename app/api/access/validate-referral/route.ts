import { NextRequest, NextResponse } from "next/server";

type ReferralCodeConfig = {
  active: boolean;
  label: string;
  expiresAt: string;
};

const REFERRAL_CODES: Record<string, ReferralCodeConfig> = {
  "12.2026": {
    active: true,
    label: "HireMinds Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  YWORK4C3: {
    active: true,
    label: "HireMinds Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  COHORT1Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  COHORT2Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  COHORT3Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  COHORT4Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  COHORT5Y: {
    active: true,
    label: "HireMinds Cohort Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  RDS: {
    active: true,
    label: "RDS Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  /*
    Legacy code.
    Keep this recognized so existing/history-based users are not broken.
    New users should use 12.2026 going forward.
  */
  YWCA: {
    active: true,
    label: "Legacy Referral Access",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },

  /*
    Reserved future codes.
    They are intentionally preserved here but remain inactive until
    you decide to activate them.
  */
  REFERRAL_06: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_07: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_08: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_09: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_10: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_11: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_12: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_13: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_14: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
  REFERRAL_15: {
    active: false,
    label: "Reserved Referral Code",
    expiresAt: "2026-12-31T23:59:59-05:00",
  },
};

function normalizeReferralCode(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = normalizeReferralCode(body?.code);

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message: "Enter a referral code.",
        },
        { status: 400 }
      );
    }

    const referral = REFERRAL_CODES[code];

    if (!referral || !referral.active) {
      return NextResponse.json(
        {
          valid: false,
          message:
            "That referral code is not currently active. Check the code and try again.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        valid: true,
        code,
        label: referral.label,
        expiresAt: referral.expiresAt,
        message: "Referral code verified.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Referral validation error:", error);

    return NextResponse.json(
      {
        valid: false,
        message: "We could not verify the referral code. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "/api/access/validate-referral",
      message: "HireMinds referral validation endpoint is running.",
    },
    { status: 200 }
  );
}
