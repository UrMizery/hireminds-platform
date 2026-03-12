"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function SignUpPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bio, setBio] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const [requestVerification, setRequestVerification] = useState(false);

  async function handleSignUp() {
    setMessage("");

    if (!email || !password || !fullName) {
      setMessage("Full name, email, and password are required.");
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      const userId = data.user?.id;

      if (!userId) {
        setMessage("User created, please verify email.");
        return;
      }

      let resumeUrl = "";
      let videoUrl = "";

      if (resumeFile) {
        const path = `${userId}/resume-${Date.now()}-${resumeFile.name}`;

        await supabase.storage
          .from("resumes")
          .upload(path, resumeFile, { upsert: true });

        resumeUrl = supabase.storage.from("resumes").getPublicUrl(path).data.publicUrl;
      }

      if (videoFile) {
        const path = `${userId}/video-${Date.now()}-${videoFile.name}`;

        await supabase.storage
          .from("profile-videos")
          .upload(path, videoFile, { upsert: true });

        videoUrl = supabase.storage
          .from("profile-videos")
          .getPublicUrl(path).data.publicUrl;
      }

      await supabase.from("candidate_profiles").insert({
        user_id: userId,
        full_name: fullName,
        phone,
        email,
        bio,
        resume_url: resumeUrl,
        intro_video_url: videoUrl,
      });

      setMessage("Account created. You can now build your resume.");

    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Create Your Career Passport</h1>

        <input
          placeholder="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Email"
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

        <textarea
          placeholder="Short bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          style={styles.textarea}
        />

        <label>Resume upload</label>
        <input
          type="file"
          onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
          style={styles.input}
        />

        <label>Intro video upload</label>
        <input
          type="file"
          onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
          style={styles.input}
        />

        <label style={styles.checkbox}>
          <input
            type="checkbox"
            checked={requestVerification}
            onChange={(e) => setRequestVerification(e.target.checked)}
          />
          Request employer verification (paid feature)
        </label>

        <button onClick={handleSignUp} style={styles.button}>
          {loading ? "Creating..." : "Create Career Passport"}
        </button>

        {message && <p>{message}</p>}

        <div style={styles.premiumBox}>
          <h3>Premium Features</h3>
          <ul>
            <li>2 page resume / CV</li>
            <li>More than 4 bullets per role</li>
            <li>Employer verification</li>
            <li>AI mock interview</li>
            <li>Live mock interview</li>
            <li>Advanced resume AI</li>
          </ul>
        </div>
      </div>
    </main>
  );
}

const styles: any = {
  page: {
    background: "#0a0a0a",
    minHeight: "100vh",
    color: "#e5e5e5",
    padding: 40,
  },
  container: {
    maxWidth: 500,
    margin: "0 auto",
    background: "#1a1a1a",
    padding: 30,
    borderRadius: 12,
  },
  title: {
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#111",
    border: "1px solid #333",
    color: "white",
  },
  textarea: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    background: "#111",
    border: "1px solid #333",
    color: "white",
  },
  button: {
    width: "100%",
    padding: 12,
    background: "#c0c0c0",
    color: "black",
    border: "none",
    marginTop: 10,
  },
  premiumBox: {
    marginTop: 20,
    borderTop: "1px solid #333",
    paddingTop: 10,
  },
  checkbox: {
    display: "block",
    marginTop: 10,
  },
};
