"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [passportSlug, setPassportSlug] = useState("");

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [resumeFile, setResumeFile] = useState<File | null>(null);

  const [photoUrl, setPhotoUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const [requestVerification, setRequestVerification] = useState(false);

  const publicPassportUrl = useMemo(() => {
    return passportSlug ? `/passport/${passportSlug}` : "";
  }, [passportSlug]);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();

      if (authError || !authData.user) {
        window.location.href = "/sign-in";
        return;
      }

      const currentUserId = authData.user.id;
      setUserId(currentUserId);

      const { data: profile, error: profileError } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", currentUserId)
        .maybeSingle();

      if (profileError) {
        setMessage(profileError.message);
        setLoading(false);
        return;
      }

      if (!profile) {
        setEmail(authData.user.email || "");
        setLoading(false);
        return;
      }

      setProfileId(profile.id || "");
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || authData.user.email || "");
      setCity(profile.city || "");
      setStateName(profile.state || "");
      setBio(profile.bio || "");
      setHeadline(profile.headline || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPassportSlug(profile.passport_slug || "");
      setResumeUrl(profile.resume_url || "");
      setVideoUrl(profile.intro_video_url || "");
      setPhotoUrl(profile.photo_url || "");
      setLoading(false);
    }

    loadProfile();
  }, []);

  async function uploadFile(bucket: string, file: File, folder: string) {
    const fileExt = file.name.split(".").pop() || "file";
    const filePath = `${folder}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSaveProfile() {
    setMessage("");

    if (!userId) {
      setMessage("You must be signed in.");
      return;
    }

    try {
      setSaving(true);

      const finalSlug = passportSlug || slugify(fullName || "career-passport");

      let nextPhotoUrl = photoUrl;
      let nextVideoUrl = videoUrl;
      let nextResumeUrl = resumeUrl;

      if (photoFile) {
        nextPhotoUrl = await uploadFile("profile-photos", photoFile, `${userId}/photo`);
      }

      if (videoFile) {
        nextVideoUrl = await uploadFile("profile-videos", videoFile, `${userId}/video`);
      }

      if (resumeFile) {
        nextResumeUrl = await uploadFile("resumes", resumeFile, `${userId}/resume`);
      }

      const payload = {
        user_id: userId,
        full_name: fullName,
        phone,
        email,
        city,
        state: stateName,
        bio,
        headline,
        linkedin_url: linkedinUrl,
        passport_slug: finalSlug,
        resume_url: nextResumeUrl || null,
        intro_video_url: nextVideoUrl || null,
        photo_url: nextPhotoUrl || null,
      };

      if (profileId) {
        const { error } = await supabase
          .from("candidate_profiles")
          .update(payload)
          .eq("id", profileId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("candidate_profiles")
          .insert(payload)
          .select()
          .single();

        if (error) throw error;
        setProfileId(data.id);
      }

      setPhotoUrl(nextPhotoUrl);
      setVideoUrl(nextVideoUrl);
      setResumeUrl(nextResumeUrl);
      setPassportSlug(finalSlug);

      setMessage("Profile saved successfully.");
    } catch (err: any) {
      setMessage(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.centerWrap}>Loading...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.shell}>
        <section style={styles.leftPanel}>
          <div style={styles.card}>
            <div style={styles.topBar}>
              <div>
                <p style={styles.kicker}>Career Passport</p>
                <h1 style={styles.title}>Your private profile editor</h1>
              </div>

              <button onClick={handleSignOut} style={styles.secondaryButton}>
                Sign Out
              </button>
            </div>

            <div style={styles.noticeBox}>
              <p style={styles.noticeTitle}>Privacy Notice</p>
              <p style={styles.noticeText}>
                Your information is stored securely and is not sold or shared for marketing purposes.
              </p>
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.profileHeaderRow}>
              <div style={styles.photoBlock}>
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" style={styles.avatar} />
                ) : (
                  <div style={styles.avatarPlaceholder}>No Photo</div>
                )}

                <label style={styles.label}>Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  style={styles.input}
                />
              </div>

              <div style={styles.profileTextBlock}>
                <p style={styles.kicker}>Profile Details</p>
                <h2 style={styles.sectionTitle}>Basic Information</h2>

                <div style={styles.twoCol}>
                  <Field label="Full Name" value={fullName} onChange={setFullName} />
                  <Field label="Phone" value={phone} onChange={setPhone} />
                </div>

                <div style={styles.twoCol}>
                  <Field label="Email" value={email} onChange={setEmail} type="email" />
                  <Field label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
                </div>

                <div style={styles.twoCol}>
                  <Field label="City" value={city} onChange={setCity} />
                  <Field label="State" value={stateName} onChange={setStateName} />
                </div>

                <Field label="Professional Headline" value={headline} onChange={setHeadline} />

                <TextAreaField
                  label="Short Bio"
                  value={bio}
                  onChange={setBio}
                  placeholder="Write a short professional bio."
                />
              </div>
            </div>
          </div>

          <div style={styles.card}>
            <p style={styles.kicker}>Uploads</p>
            <h2 style={styles.sectionTitle}>Media + Resume</h2>

            <label style={styles.label}>Intro Video</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              style={styles.input}
            />

            <label style={styles.label}>Resume Upload</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              style={styles.input}
            />

            <label style={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={requestVerification}
                onChange={(e) => setRequestVerification(e.target.checked)}
              />
              <span>Request employer verification</span>
            </label>

            <div style={styles.actionRow}>
              <button onClick={handleSaveProfile} disabled={saving} style={styles.primaryButton}>
                {saving ? "Saving..." : "Save Profile"}
              </button>

              <a href="/resume-builder" style={styles.linkButton}>
                Go to Resume Builder
              </a>
            </div>

            {message ? <p style={styles.message}>{message}</p> : null}
          </div>
        </section>

        <aside style={styles.rightPanel}>
          <div style={styles.previewCard}>
            <p style={styles.kicker}>Profile Preview</p>
            <h2 style={styles.sectionTitle}>Career Passport Snapshot</h2>

            <h3 style={styles.previewName}>{fullName || "Your Name"}</h3>
            <p style={styles.previewLine}>{headline || "Professional Headline"}</p>
            <p style={styles.previewLine}>{[city, stateName].filter(Boolean).join(", ") || "City, State"}</p>
            <p style={styles.previewLine}>{email || "email@example.com"}</p>

            {publicPassportUrl ? (
              <a href={publicPassportUrl} style={styles.publicLink}>
                View public passport
              </a>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  centerWrap: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  shell: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1.1fr 0.9fr",
    gap: "24px",
    alignItems: "start",
  },
  leftPanel: {
    display: "grid",
    gap: "20px",
  },
  rightPanel: {
    position: "sticky",
    top: "24px",
  },
  card: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  previewCard: {
    background: "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: "24px",
    padding: "24px",
  },
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "start",
  },
  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },
  title: {
    margin: 0,
    fontSize: "34px",
    fontWeight: 500,
    color: "#f5f5f5",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "28px",
    fontWeight: 500,
    color: "#f5f5f5",
  },
  noticeBox: {
    marginTop: "18px",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid #2c2c2c",
    background: "#101010",
  },
  noticeTitle: {
    margin: "0 0 8px",
    color: "#f3f4f6",
    fontWeight: 700,
    fontSize: "14px",
  },
  noticeText: {
    margin: 0,
    color: "#b8b8b8",
    fontSize: "14px",
    lineHeight: 1.7,
  },
  profileHeaderRow: {
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "20px",
    alignItems: "start",
  },
  photoBlock: {
    display: "flex",
    flexDirection: "column",
  },
  profileTextBlock: {},
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  fieldWrap: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    color: "#c9c9c9",
    fontSize: "13px",
    fontWeight: 500,
  },
  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
    marginBottom: "12px",
  },
  textarea: {
    width: "100%",
    minHeight: "120px",
    padding: "14px 16px",
    borderRadius: "16px",
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    color: "#e5e7eb",
    margin: "8px 0 16px",
  },
  actionRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "8px",
  },
  primaryButton: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",
    background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  secondaryButton: {
    padding: "12px 16px",
    borderRadius: "14px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },
  linkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #3a3a3a",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
  },
  message: {
    marginTop: "16px",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.6,
  },
  avatar: {
    width: "180px",
    height: "180px",
    borderRadius: "18px",
    objectFit: "cover",
    marginBottom: "18px",
    border: "1px solid #2e2e2e",
  },
  avatarPlaceholder: {
    width: "180px",
    height: "180px",
    borderRadius: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#111827",
    color: "#cbd5e1",
    marginBottom: "18px",
    border: "1px solid #2e2e2e",
  },
  previewName: {
    margin: "0 0 8px",
    fontSize: "26px",
    fontWeight: 600,
    color: "#f5f5f5",
  },
  previewLine: {
    margin: "0 0 8px",
    color: "#c8c8c8",
    lineHeight: 1.6,
  },
  publicLink: {
    display: "inline-block",
    marginTop: "20px",
    color: "#f5f5f5",
    textDecoration: "underline",
  },
};
