import { NextRequest, NextResponse } from "next/server";

type ReferralCodeConfig = {
  active: boolean;
  label: string;
  expiresAt: string;
};

const REFERRAL_CODES: Record<string, ReferralCodeConfig> = {
  /*
    CURRENT REPLACEMENT FOR THE OLD YWCA CODE.
    YWCA is intentionally NOT included as a valid code.
    Existing database records containing YWCA remain untouched.
  */
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
    RESERVED FUTURE REFERRAL CODES.
    Keep these placeholders in the system, but they are not active
    until you intentionally activate them.
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

    /*
      IMPORTANT:
      YWCA was replaced by 12.2026.
      YWCA must NOT validate for new or refreshed referral access.
      This does not alter historical YWCA records already stored
      in Supabase.
    */
    if (code === "YWCA") {
      return NextResponse.json(
        {
          valid: false,
          message:
            "That referral code is no longer active. Please use your current referral code.",
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
