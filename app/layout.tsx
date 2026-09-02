"use client";

import type { ReactNode } from "react";
import SiteHeader from "./components/SiteHeader";
import ReferralConsentGate from "./components/ReferralConsentGate";
import Notes from "./components/Notes";

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body style={bodyStyle}>
        <SiteHeader />

        {/*
          GLOBAL REFERRAL CONSENT GATE

          If a referral user's account is still:
          access_tier = "pending_referral_consent"

          OR they have a verified access_referral_code but have not completed
          referral consent, this gate prevents them from continuing through
          HireMinds and redirects them back to /access.

          The gate does not interfere while the user is already on /access.
        */}
        <ReferralConsentGate />

        {children}

        <Notes />
      </body>
    </html>
  );
}

const bodyStyle: React.CSSProperties = {
  margin: 0,
  background: "#050505",
};
