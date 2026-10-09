"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [resetMode, setResetMode] = useState(false);
  const [checkingLink, setCheckingLink] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkRecoveryLink() {
      const params = new URLSearchParams(
        window.location.search
      );

      const isResetReturn =
        params.get("mode") === "update";

      const code =
        params.get("code");

      if (!isResetReturn && !code) {
        return;
      }

      if (mounted) {
        setCheckingLink(true);
      }

      try {
        /*
          PKCE recovery links may return a code.
          Exchange it for the temporary recovery session.
        */
        if (code) {
          const { error } =
            await supabase.auth.exchangeCodeForSession(
              code
            );

          if (error) {
            throw error;
          }
        }

        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (data.session) {
          if (mounted) {
            setResetMode(true);
            setMessage("");
          }

          window.history.replaceState(
            {},
            "",
            "/reset-password?mode=update"
          );
        }
      } catch (error: any) {
        if (mounted) {
          setMessage(
            error?.message ||
              "This password reset link is invalid or has expired."
          );
        }
      } finally {
        if (mounted) {
          setCheckingLink(false);
        }
      }
    }

    void checkRecoveryLink();

    /*
      Supabase fires PASSWORD_RECOVERY when the
      customer opens a valid recovery email link.
    */
    const {
      data: listener,
    } =
      supabase.auth.onAuthStateChange(
        (event) => {
          if (
            event === "PASSWORD_RECOVERY"
          ) {
            setResetMode(true);
            setCheckingLink(false);
            setMessage("");
          }
        }
      );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function handleSendReset(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanEmail) {
      setMessage(
        "Please enter your email address."
      );
      return;
    }

    if (!cleanEmail.includes("@")) {
      setMessage(
        "Please enter a valid email address."
      );
      return;
    }

    try {
      setLoading(true);

      /*
        IMPORTANT:
        The recovery email comes back to THIS page.

        We no longer use /update-password.
      */
      const redirectTo =
        `${window.location.origin}/reset-password?mode=update`;

      const {
        error,
      } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo,
          }
        );

      if (error) {
        throw error;
      }

      setSuccess(true);

      setMessage(
        "Password reset email sent. Check your inbox and click the secure link to create a new password."
      );
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Unable to send password reset email."
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!newPassword) {
      setMessage(
        "Please enter a new password."
      );
      return;
    }

    if (newPassword.length < 6) {
      setMessage(
        "Your password must contain at least 6 characters."
      );
      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setMessage(
        "The passwords do not match."
      );
      return;
    }

    try {
      setLoading(true);

      const {
        data,
        error: sessionError,
      } =
        await supabase.auth.getSession();

      if (
        sessionError ||
        !data.session
      ) {
        throw new Error(
          "Your password reset link is invalid or has expired. Please request a new reset link."
        );
      }

      const {
        error: updateError,
      } =
        await supabase.auth.updateUser({
          password: newPassword,
        });

      if (updateError) {
        throw updateError;
      }

      setSuccess(true);

      setMessage(
        "Your password has been changed successfully. Returning you to Sign In..."
      );

      /*
        Supabase temporarily authenticates the user
        through the recovery link.

        Sign them OUT after the password is changed
        so the reset email cannot simply leave them
        inside HireMinds.
      */
      await supabase.auth.signOut();

      setTimeout(() => {
        window.location.href =
          "/sign-in";
      }, 1500);
    } catch (error: any) {
      setMessage(
        error?.message ||
          "Unable to update your password."
      );
    } finally {
      setLoading(false);
    }
  }

  if (checkingLink) {
    return (
      <main style={styles.page}>
        <div style={styles.card}>
          <p style={styles.kicker}>
            HireMinds
          </p>

          <h1 style={styles.title}>
            Verifying Reset Link
          </h1>

          <p style={styles.subtitle}>
            Please wait while we verify
            your secure password reset
            link.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <p style={styles.kicker}>
          HireMinds
        </p>

        {!resetMode ? (
          <>
            <h1 style={styles.title}>
              Reset Password
            </h1>

            <p style={styles.subtitle}>
              Enter your email and
              we&apos;ll send you a
              secure link to create a
              new password.
            </p>

            <form
              onSubmit={
                handleSendReset
              }
              style={styles.form}
            >
              <label
                style={styles.label}
              >
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(
                    e.target.value
                  );
                  setMessage("");
                  setSuccess(false);
                }}
                placeholder="you@email.com"
                style={styles.input}
                autoComplete="email"
              />

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading
                    ? styles.disabledButton
                    : {}),
                }}
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </button>
            </form>

            {message ? (
              <p
                style={{
                  ...styles.message,
                  ...(success
                    ? styles.successMessage
                    : {}),
                }}
              >
                {message}
              </p>
            ) : null}

            <a
              href="/sign-in"
              style={styles.link}
            >
              Back to Sign In
            </a>
          </>
        ) : (
          <>
            <h1 style={styles.title}>
              Create New Password
            </h1>

            <p style={styles.subtitle}>
              Enter and confirm your new
              HireMinds password.
            </p>

            <form
              onSubmit={
                handleUpdatePassword
              }
              style={styles.form}
            >
              <label
                style={styles.label}
              >
                New Password
              </label>

              <div
                style={
                  styles.passwordWrap
                }
              >
                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(
                      e.target.value
                    );
                    setMessage("");
                    setSuccess(false);
                  }}
                  placeholder="Enter new password"
                  style={
                    styles.passwordInput
                  }
                  autoComplete="new-password"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (prev) =>
                        !prev
                    )
                  }
                  style={
                    styles.passwordToggle
                  }
                >
                  {showPassword
                    ? "Hide"
                    : "Show"}
                </button>
              </div>

              <label
                style={styles.label}
              >
                Confirm New Password
              </label>

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={
                  confirmPassword
                }
                onChange={(e) => {
                  setConfirmPassword(
                    e.target.value
                  );
                  setMessage("");
                  setSuccess(false);
                }}
                placeholder="Confirm new password"
                style={styles.input}
                autoComplete="new-password"
              />

              <span
                style={
                  styles.passwordHelp
                }
              >
                Password must contain at
                least 6 characters.
              </span>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  ...(loading
                    ? styles.disabledButton
                    : {}),
                }}
              >
                {loading
                  ? "Updating..."
                  : "Update Password"}
              </button>
            </form>

            {message ? (
              <p
                style={{
                  ...styles.message,
                  ...(success
                    ? styles.successMessage
                    : {}),
                }}
              >
                {message}
              </p>
            ) : null}

            {!success ? (
              <a
                href="/reset-password"
                style={styles.link}
              >
                Request a New Reset Link
              </a>
            ) : null}
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    padding: "24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    background:
      "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "28px",
    color: "#f5f5f5",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 10px",
    fontSize: "34px",
    fontWeight: 600,
  },

  subtitle: {
    margin: "0 0 20px",
    color: "#c8c8c8",
    fontSize: "15px",
    lineHeight: 1.7,
  },

  form: {
    display: "grid",
    gap: "12px",
  },

  label: {
    fontSize: "14px",
    color: "#d4d4d8",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border:
      "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  passwordWrap: {
    position: "relative",
    width: "100%",
  },

  passwordInput: {
    width: "100%",
    padding:
      "14px 72px 14px 16px",
    borderRadius: "16px",
    border:
      "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  passwordToggle: {
    position: "absolute",
    right: "14px",
    top: "50%",
    transform:
      "translateY(-50%)",
    border: "none",
    background: "transparent",
    color: "#d4d4d8",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
  },

  passwordHelp: {
    color: "#9a9a9a",
    fontSize: "12px",
    marginTop: "-3px",
  },

  button: {
    marginTop: "8px",
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border:
      "1px solid #d1d5db",
    background:
      "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: 0.6,
    cursor: "not-allowed",
  },

  message: {
    marginTop: "16px",
    color: "#e5e5e5",
    lineHeight: 1.7,
    fontSize: "14px",
  },

  successMessage: {
    color: "#b7efcb",
  },

  link: {
    display: "inline-block",
    marginTop: "18px",
    color: "#f5f5f5",
    textDecoration: "underline",
    fontSize: "14px",
  },
};
