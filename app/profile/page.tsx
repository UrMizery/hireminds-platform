"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import ConnectExplore from "../components/ConnectExplore";

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

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");

  const [publicProfileUrl, setPublicProfileUrl] = useState("");

  const trackedRef = useRef(false);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        window.location.href = "/sign-in";
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("candidate_profiles")
        .select("*")
        .eq("user_id", authData.user.id)
        .single();

      if (profileError || !profile) {
        setMessage(profileError?.message || "Profile not found.");
        setLoading(false);
        return;
      }

      setUserId(authData.user.id || "");
      setProfileId(profile.id || "");

      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || authData.user.email || "");
      setCity(profile.city || "");
      setStateName(profile.state || "");
      setBio(profile.bio || "");
      setHeadline(profile.headline || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPhotoUrl(profile.photo_url || "");
      setPublicProfileUrl(profile.public_profile_url || "");

      if (!trackedRef.current) {
        trackedRef.current = true;

        await supabase.from("user_activity").insert({
          user_id: authData.user.id,
          full_name: profile.full_name || null,
          email: profile.email || authData.user.email || null,
          referral_code: profile.referral_code || null,
          event_type: "profile_viewed",
          tool_name: "profile",
          page_name: "/profile",
        });
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function uploadFile(
    bucket: string,
    file: File,
    folder: string
  ) {
    const fileExt = file.name.split(".").pop() || "file";
    const filePath = `${folder}/${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        upsert: true,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

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

      let nextPhotoUrl = photoUrl;

      if (photoFile) {
        nextPhotoUrl = await uploadFile(
          "profile-photos",
          photoFile,
          `${userId}/photo`
        );
      }

      const slug = slugify(fullName || "career-passport");

      const publicUrl =
        `${window.location.origin}/passport/${slug}-${userId.slice(0, 8)}`;

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
        photo_url: nextPhotoUrl || null,
        public_profile_url: publicUrl,
      };

      if (profileId) {
        const { error } = await supabase
          .from("candidate_profiles")
          .update(payload)
          .eq("id", profileId);

        if (error) {
          throw error;
        }
      } else {
        const { data, error } = await supabase
          .from("candidate_profiles")
          .insert(payload)
          .select()
          .single();

        if (error) {
          throw error;
        }

        setProfileId(data.id);
      }

      setPhotoUrl(nextPhotoUrl);
      setPublicProfileUrl(publicUrl);

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
      <main style={st.page}>
        <div style={st.centerWrap}>Loading...</div>
      </main>
    );
  }

  return (
    <main style={st.page}>
      <div style={st.shell}>
        {/* HERO */}

        <section style={st.hero}>
          <div style={st.heroLeft}>
            <p style={st.kicker}>Career Passport</p>

            <h1 style={st.title}>Career Passport Editor</h1>

            <p style={st.subtitle}>
              Update your profile and manage the information connected
              to your HireMinds Career Passport.
            </p>
          </div>

          <button
            onClick={handleSignOut}
            style={st.secondaryButton}
          >
            Sign Out
          </button>
        </section>

        {/* PROFILE STRIP */}

        <section style={st.profileStrip}>
          <div style={st.profileStripLeft}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Profile"
                style={st.avatar}
              />
            ) : (
              <div style={st.avatarPlaceholder}>
                No Photo
              </div>
            )}

            <div>
              <label style={st.label}>
                Profile Photo
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setPhotoFile(e.target.files?.[0] || null)
                }
                style={st.input}
              />
            </div>
          </div>

          <div style={st.profileStripRight}>
            <h2 style={st.namePreview}>
              {fullName || "Your Name"}
            </h2>

            <p style={st.headlinePreview}>
              {headline || "Professional Headline"}
            </p>

            <p style={st.metaPreview}>
              {[city, stateName]
                .filter(Boolean)
                .join(", ") || "City, State"}
            </p>

            <p style={st.metaPreview}>
              {email || "email@example.com"}
            </p>

            {publicProfileUrl ? (
              <a
                href={publicProfileUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={st.publicLink}
              >
                🔗 View Public Profile
              </a>
            ) : null}
          </div>
        </section>

        {/* BASIC INFORMATION */}

        <section style={st.formFlow}>
          <div style={st.flowIntro}>
            <p style={st.sectionKicker}>
              Profile Details
            </p>

            <h2 style={st.sectionTitle}>
              Basic Information
            </h2>
          </div>

          <div style={st.formGrid}>
            <Field
              label="Full Name"
              value={fullName}
              onChange={setFullName}
            />

            <Field
              label="Phone"
              value={phone}
              onChange={setPhone}
            />

            <Field
              label="Email"
              value={email}
              onChange={setEmail}
              type="email"
            />

            <Field
              label="LinkedIn"
              value={linkedinUrl}
              onChange={setLinkedinUrl}
            />

            <Field
              label="City"
              value={city}
              onChange={setCity}
            />

            <Field
              label="State"
              value={stateName}
              onChange={setStateName}
            />
          </div>

          <div style={st.singleField}>
            <Field
              label="Professional Headline"
              value={headline}
              onChange={setHeadline}
              placeholder="Example: Recruiter | Workforce Development | Employer Relations"
            />
          </div>

          <div style={st.singleField}>
            <TextAreaField
              label="Short Bio"
              value={bio}
              onChange={setBio}
              placeholder="Write a short professional bio."
            />
          </div>
        </section>

        {/* PUBLIC PROFILE NOTE */}

        <section style={st.noticeFloat}>
          <p style={st.noticeTitle}>
            Public Profile Note
          </p>

          <p style={st.noticeText}>
            Your photo, headline, location, LinkedIn, and other
            completed profile information may appear on your
            Career Passport.
          </p>
        </section>

        {/* CAREER CONNECT / EXPLORE */}

        <ConnectExplore />

        {/* SAVE */}

        <section style={st.bottomDock}>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            style={st.primaryButton}
          >
            {saving
              ? "Saving..."
              : "Save Profile"}
          </button>
        </section>

        {message ? (
          <p style={st.message}>
            {message}
          </p>
        ) : null}
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
    <div style={st.fieldWrap}>
      <label style={st.label}>
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={st.input}
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
    <div style={st.fieldWrap}>
      <label style={st.label}>
        {label}
      </label>

      <textarea
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder={placeholder}
        style={st.textarea}
      />
    </div>
  );
}

const glass: CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
  backdropFilter: "blur(14px)",
};

const st: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",

    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.12) 0%, transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)",

    color: "#e7e7e7",

    padding:
      "34px 24px 64px",

    fontFamily:
      "Inter, ui-sans-serif, system-ui, sans-serif",
  },

  centerWrap: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "40px 24px",
  },

  shell: {
    maxWidth: "1320px",
    margin: "0 auto",
    display: "grid",
    gap: "24px",
  },

  hero: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },

  heroLeft: {
    maxWidth: "860px",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#9ca3af",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 12px",
    fontSize: "46px",
    fontWeight: 700,
    lineHeight: 1.02,
    letterSpacing: "-0.04em",
    color: "#f5f5f5",
  },

  subtitle: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: "16px",
    lineHeight: 1.85,
    maxWidth: "780px",
  },

  profileStrip: {
    ...glass,
    borderRadius: "34px",
    padding: "26px",
    display: "grid",
    gridTemplateColumns: "220px 1fr",
    gap: "26px",
    alignItems: "center",
  },

  profileStripLeft: {
    display: "grid",
    gap: "14px",
  },

  profileStripRight: {
    minWidth: 0,
  },

  avatar: {
    width: "200px",
    height: "200px",
    borderRadius: "26px",
    objectFit: "cover",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  avatarPlaceholder: {
    width: "200px",
    height: "200px",
    borderRadius: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(255,255,255,0.04)",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.08)",
  },

  namePreview: {
    margin: "0 0 10px",
    fontSize: "34px",
    lineHeight: 1.08,
    fontWeight: 700,
    color: "#f5f5f5",
  },

  headlinePreview: {
    margin: "0 0 8px",
    fontSize: "18px",
    lineHeight: 1.6,
    color: "#e5e7eb",
  },

  metaPreview: {
    margin: "0 0 6px",
    color: "#bdbdbd",
    lineHeight: 1.6,
    fontSize: "15px",
  },

  publicLink: {
    display: "inline-block",
    marginTop: "12px",
    color: "#a5b4fc",
    textDecoration: "underline",
    fontSize: "14px",
  },

  formFlow: {
    display: "grid",
    gap: "16px",
  },

  flowIntro: {
    display: "grid",
    gap: "6px",
  },

  sectionKicker: {
    margin: 0,
    color: "#9ca3af",
    fontSize: "12px",
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
    lineHeight: 1.08,
    color: "#f5f5f5",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "14px",
  },

  singleField: {
    maxWidth: "100%",
  },

  noticeFloat: {
    ...glass,
    borderRadius: "24px",
    padding: "18px 20px",
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

  bottomDock: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "12px",
    maxWidth: "260px",
    marginTop: "4px",
  },

  primaryButton: {
    width: "100%",
    padding: "15px 18px",
    borderRadius: "18px",
    border: "1px solid #d1d5db",

    background:
      "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",

    color: "#09090b",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "12px 16px",
    borderRadius: "16px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
    backdropFilter: "blur(10px)",
  },

  fieldWrap: {
    display: "grid",
    gap: "8px",
  },

  label: {
    color: "#d4d4d8",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.035)",
    color: "#f4f4f5",
    fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    backdropFilter: "blur(10px)",
  },

  textarea: {
    width: "100%",
    minHeight: "130px",
    padding: "14px 16px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.035)",
    color: "#f4f4f5",
    fontSize: "15px",
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
    backdropFilter: "blur(10px)",
  },

  message: {
    marginTop: "2px",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};
