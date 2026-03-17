"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Create Auth User
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const user = data.user;

    if (!user) {
      setMessage("User not created.");
      setLoading(false);
      return;
    }

    // 2. Save to candidate_profiles (THIS IS THE FIX)
    const { error: profileError } = await supabase
      .from("candidate_profiles")
      .upsert({
        user_id: user.id,
        full_name: fullName,
        phone: phone,
        email: email,
        city: city,
        state: stateName,
      });

    if (profileError) {
      setMessage(profileError.message);
      setLoading(false);
      return;
    }

    setMessage("Account created successfully!");
    setLoading(false);

    // Redirect to profile
    window.location.href = "/profile";
  }

  return (
    <main style={styles.page}>
      <form onSubmit={handleSignUp} style={styles.card}>
        <h1 style={styles.title}>Create Career Passport / Sign Up</h1>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="State"
          value={stateName}
          onChange={(e) => setStateName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Creating..." : "Create Account"}
        </button>

        {message && <p style={styles.message}>{message}</p>}
      </form>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#0a0a0a",
  },
  card: {
    background: "#111",
    padding: "30px",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  title: {
    color: "#fff",
    marginBottom: "10px",
  },
  input: {
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #333",
    background: "#000",
    color: "#fff",
  },
  button: {
    padding: "12px",
    borderRadius: "10px",
    border: "none",
    background: "#2563eb",
    color: "#fff",
    fontWeight: "bold",
    cursor: "pointer",
  },
  message: {
    color: "#ccc",
    marginTop: "10px",
  },
};
