"use client";

import { useEffect, type ReactNode } from "react";
import SiteHeader from "./components/SiteHeader";
import ReferralConsentGate from "./components/ReferralConsentGate";
import Notes from "./components/Notes";
import { supabase } from "./lib/supabase";

const INACTIVITY_LIMIT = 60 * 60 * 1000;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  useEffect(() => {
    let inactivityTimer: ReturnType<typeof setTimeout>;

    async function logoutUser() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) return;

        await supabase.auth.signOut();

        window.location.href = "/sign-in?reason=inactive";
      } catch {
        window.location.href = "/sign-in?reason=inactive";
      }
    }

    function resetTimer() {
      clearTimeout(inactivityTimer);

      inactivityTimer = setTimeout(() => {
        logoutUser();
      }, INACTIVITY_LIMIT);
    }

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      clearTimeout(inactivityTimer);

      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, []);

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
