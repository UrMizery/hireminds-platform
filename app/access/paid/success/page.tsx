"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PaidSignupSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const sessionId =
    searchParams.get("session_id") || "";

  const [password, setPassword] =
    useState("");

  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (!sessionId) {
      setError(
        "Your Stripe payment session could not be found."
      );
    }
  }, [sessionId]);

  async function completeSignup(
    event: React.FormEvent
  ) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!sessionId) {
      setError(
        "Your Stripe payment session could not be found."
      );
      return;
    }

    if (password.length < 8) {
      setError(
        "Your password must be at least 8 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError(
        "Your passwords do not match."
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "/api/stripe/complete-signup",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            sessionId,
            password,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            "Your HireMinds account could not be created."
        );
      }

      setMessage(
        "Your HireMinds account is ready."
      );

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err: any) {
      setError(
        err?.message ||
          "Your HireMinds account could not be created."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background: "#f7f9fb",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "520px",
          background: "#ffffff",
          border: "1px solid #dfe6ec",
          borderRadius: "22px",
          padding: "32px",
          boxShadow:
            "0 20px 50px rgba(0,0,0,0.08)",
        }}
      >
        <p
          style={{
            margin: "0 0 10px",
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#1677b8",
          }}
        >
          Payment confirmed
        </p>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "38px",
            lineHeight: 1.05,
          }}
        >
          Create your HireMinds password
        </h1>

        <p
          style={{
            margin: "0 0 26px",
            color: "#52606d",
            lineHeight: 1.6,
          }}
        >
          Your payment was completed through Stripe.
          Create your password below to finish setting
          up your HireMinds account.
        </p>

        <form onSubmit={completeSignup}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 700,
            }}
          >
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="At least 8 characters"
            autoComplete="new-password"
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "18px",
              borderRadius: "12px",
              border: "1px solid #cbd5df",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: 700,
            }}
          >
            Confirm password
          </label>

          <input
            type="password"
            value={confirmPassword}
            onChange={(event) =>
              setConfirmPassword(
                event.target.value
              )
            }
            placeholder="Re-enter your password"
            autoComplete="new-password"
            style={{
              width: "100%",
              padding: "14px 16px",
              marginBottom: "18px",
              borderRadius: "12px",
              border: "1px solid #cbd5df",
              fontSize: "16px",
              boxSizing: "border-box",
            }}
          />

          {error && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#fff1f1",
                color: "#9d2b2b",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                marginBottom: "18px",
                padding: "12px 14px",
                borderRadius: "10px",
                background: "#edf9f1",
                color: "#20613b",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={
              loading || !sessionId
            }
            style={{
              width: "100%",
              padding: "15px 18px",
              borderRadius: "12px",
              border: "none",
              background: "#1677b8",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: 700,
              cursor:
                loading
                  ? "wait"
                  : "pointer",
              opacity:
                loading || !sessionId
                  ? 0.6
                  : 1,
            }}
          >
            {loading
              ? "Creating account..."
              : "Create HireMinds Account"}
          </button>
        </form>
      </section>
    </main>
  );
}
