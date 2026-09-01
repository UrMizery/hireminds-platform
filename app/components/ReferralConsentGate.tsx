"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "../lib/supabase";

const ACCESS_ROUTE = "/access";

function isAccessRoute(pathname: string | null) {
  if (!pathname) return false;
  return pathname === ACCESS_ROUTE || pathname.startsWith(`${ACCESS_ROUTE}/`);
}

export default function ReferralConsentGate() {
  const pathname = usePathname();
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function enforceConsentGate() {
      /*
        Never redirect while the user is already completing the access flow.
      */
      if (isAccessRoute(pathname)) {
        if (mounted) setBlocking(false);
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      const user = session?.user;

      if (!user || !mounted) {
        if (mounted) setBlocking(false);
        return;
      }

      /*
        candidate_profiles is authoritative.
        A validated referral code does NOT activate HireMinds.
        Consent must be completed first.
      */
      const { data: profile, error } = await supabase
        .from("candidate_profiles")
        .select(
          "access_tier, referral_consent_accepted, has_referral_access, access_referral_code"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (!mounted) return;

      if (error) {
        console.error("HireMinds consent gate check failed:", error);
        return;
      }

      const pendingReferralConsent =
        profile?.access_tier === "pending_referral_consent" ||
        (
          Boolean(profile?.access_referral_code) &&
          profile?.referral_consent_accepted !== true &&
          profile?.has_referral_access !== true
        );

      if (pendingReferralConsent) {
        /*
          Cover the entire page immediately so the user cannot continue using
          protected HireMinds content while redirecting.
        */
        setBlocking(true);

        try {
          if (profile?.access_referral_code) {
            localStorage.setItem(
              "hireminds_pending_referral_code",
              String(profile.access_referral_code)
            );
          }
        } catch {
          // localStorage is only a convenience for /access.
        }

        window.location.replace(ACCESS_ROUTE);
        return;
      }

      setBlocking(false);
    }

    enforceConsentGate();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      enforceConsentGate();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  if (!blocking) return null;

  return (
    <div style={styles.overlay} aria-live="polite" aria-busy="true">
      <div style={styles.card}>
        <div style={styles.badge}>HIREMINDS</div>
        <h2 style={styles.title}>Consent required to continue</h2>
        <p style={styles.text}>
          Your referral code was verified, but your HireMinds access is not
          active until you complete the required consent and acknowledgment.
        </p>
        <div style={styles.loadingBar}>
          <div style={styles.loadingFill} />
        </div>
        <p style={styles.small}>Taking you to Consent & Access…</p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 999999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    background:
      "linear-gradient(145deg, rgba(11,17,24,0.97) 0%, rgba(20,53,76,0.97) 100%)",
    backdropFilter: "blur(10px)",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    padding: "34px",
    borderRadius: "24px",
    background:
      "linear-gradient(145deg, #ffffff 0%, #eef4f8 100%)",
    border: "1px solid #b9cbd8",
    boxShadow: "0 24px 70px rgba(0,0,0,0.30)",
    textAlign: "center",
  },

  badge: {
    display: "inline-flex",
    padding: "7px 11px",
    borderRadius: "999px",
    backgroundColor: "#111820",
    color: "#7cc1eb",
    fontSize: "10px",
    fontWeight: 950,
    letterSpacing: "0.15em",
  },

  title: {
    margin: "18px 0 10px",
    color: "#111820",
    fontSize: "28px",
    lineHeight: 1.08,
    fontWeight: 950,
    letterSpacing: "-0.03em",
  },

  text: {
    margin: 0,
    color: "#53616c",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  loadingBar: {
    height: "6px",
    marginTop: "24px",
    overflow: "hidden",
    borderRadius: "999px",
    backgroundColor: "#d7e0e6",
  },

  loadingFill: {
    width: "70%",
    height: "100%",
    borderRadius: "999px",
    background:
      "linear-gradient(90deg, #176fae 0%, #57aee0 100%)",
  },

  small: {
    margin: "12px 0 0",
    color: "#71808b",
    fontSize: "11px",
    fontWeight: 750,
  },
};
