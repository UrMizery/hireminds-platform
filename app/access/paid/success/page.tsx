"use client";

import {
  FormEvent,
  Suspense,
  useMemo,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabase";

function PaidSuccessContent() {
  const searchParams = useSearchParams();

  const sessionId = useMemo(
    () => searchParams.get("session_id") || "",
    [searchParams]
  );

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [message, setMessage] = useState(
    "Stripe payment received. Create your HireMinds password to finish activating your account."
  );

  const [loading, setLoading] = useState(false);

  async function finish(e: FormEvent) {
    e.preventDefault();

    if (loading) return;

    if (!sessionId) {
      setMessage(
        "The Stripe payment session is missing. Please contact HireMinds support."
      );
      return;
    }

    if (password.length < 8) {
      setMessage(
        "Please use a password with at least 8 characters."
      );
      return;
    }

    if (password !== confirm) {
      setMessage("The passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      setMessage(
        "Verifying your payment and creating your account…"
      );

      const response = await fetch(
        "/api/stripe/complete-signup",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        throw new Error(
          data?.error || "Account activation failed."
        );
      }

      const { error } =
        await supabase.auth.signInWithPassword({
          email: data.email,
          password,
        });

      if (error) {
        throw new Error(
          "Your account was created, but automatic sign-in failed. Please use the Sign In page."
        );
      }

      window.location.replace("/profile");
    } catch (error: any) {
      setMessage(
        error?.message ||
          "We could not finish activating your account."
      );

      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "80vh",
        display: "grid",
        placeItems: "center",
        background: "#eef2f5",
        padding: 24,
        color: "#101820",
      }}
    >
      <form
        onSubmit={finish}
        style={{
          width: "100%",
          maxWidth: 560,
          padding: 36,
          border: "1px solid #c8d0d8",
          borderRadius: 24,
          background: "white",
          boxShadow:
            "0 20px 55px rgba(0,0,0,.10)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#1479b8",
            marginBottom: 10,
          }}
        >
          PAYMENT CONFIRMED
        </div>

        <h1
          style={{
            fontSize: 34,
            margin: "0 0 12px",
          }}
        >
          Create your HireMinds account
        </h1>

        <p
          style={{
            lineHeight: 1.65,
            color: "#53606d",
            marginBottom: 24,
          }}
        >
          {message}
        </p>

        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Create Password
        </label>

        <input
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          minLength={8}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 16px",
            border: "1px solid #aeb8c2",
            borderRadius: 10,
            fontSize: 16,
            marginBottom: 16,
          }}
        />

        <label
          style={{
            display: "block",
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Confirm Password
        </label>

        <input
          type="password"
          value={confirm}
          onChange={(e) =>
            setConfirm(e.target.value)
          }
          minLength={8}
          required
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "14px 16px",
            border: "1px solid #aeb8c2",
            borderRadius: 10,
            fontSize: 16,
            marginBottom: 20,
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "15px 18px",
            border: 0,
            borderRadius: 10,
            background: "#0d78b8",
            color: "white",
            fontWeight: 800,
            fontSize: 16,
            cursor: "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading
            ? "Activating…"
            : "Create Account & Enter HireMinds"}
        </button>

        <p
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "#6d7884",
            marginTop: 16,
          }}
        >
          Your HireMinds account is created only after this paid Stripe session is verified.
        </p>
      </form>
    </main>
  );
}

export default function PaidSuccessPage() {
  return (
    <Suspense
      fallback={
        <main
          style={{
            minHeight: "80vh",
            display: "grid",
            placeItems: "center",
            background: "#eef2f5",
          }}
        >
          <p>Loading payment confirmation…</p>
        </main>
      }
    >
      <PaidSuccessContent />
    </Suspense>
  );
}
