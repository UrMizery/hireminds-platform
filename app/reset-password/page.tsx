"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/update-password",
    });

    if (error) {
      setMessage("Error sending reset email");
    } else {
      setMessage("Check your email to reset password");
    }
  };

  return (
    <div style={{ padding: "40px", color: "white" }}>
      <h1>Reset Password</h1>

      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: "10px",
          marginTop: "10px",
          width: "300px",
          color: "black",
        }}
      />

      <br />

      <button
        onClick={handleReset}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
        }}
      >
        Send Reset Link
      </button>

      <p style={{ marginTop: "20px" }}>{message}</p>
    </div>
  );
}
