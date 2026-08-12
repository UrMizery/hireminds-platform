"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import ConnectExplore from "../components/ConnectExplore";

type ResumeSlot = {
  id: string;
  label: string;
  resumeUrl: string | null;
  isVisible: boolean;
  createdAt: string | null;
  fileName?: string | null;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const EMPTY_SLOTS: ResumeSlot[] = [
  {
    id: "slot1",
    label: "Resume 1",
    resumeUrl: null,
    isVisible: false,
    createdAt: null,
    fileName: null,
  },
  {
    id: "slot2",
    label: "Resume 2",
    resumeUrl: null,
    isVisible: false,
    createdAt: null,
    fileName: null,
  },
];

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

  const [resumeSlots, setResumeSlots] =
    useState<ResumeSlot[]>(EMPTY_SLOTS);

  const [uploadingSlot, setUploadingSlot] =
    useState<string | null>(null);

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

      if (
        profile.resume_slots &&
        Array.isArray(profile.resume_slots) &&
        profile.resume_slots.length > 0
      ) {
        const cleanedSlots: ResumeSlot[] = [0, 1].map((index) => {
          const existingSlot = profile.resume_slots[index] || {};

          return {
            id: existingSlot.id || `slot${index + 1}`,
            label: `Resume ${index + 1}`,
            resumeUrl: existingSlot.resumeUrl || null,
            isVisible: Boolean(existingSlot.isVisible),
            createdAt: existingSlot.createdAt || null,
            fileName: existingSlot.fileName || null,
          };
        });

        setResumeSlots(cleanedSlots);
      } else {
        setResumeSlots(EMPTY_SLOTS);
      }

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

  async function handleSaveProfile(updatedSlots?: ResumeSlot[]) {
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

      const slots = updatedSlots || resumeSlots;

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
        resume_slots: slots,
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

  function setVisibleSlot(slotId: string) {
    const updated = resumeSlots.map((slot) => ({
      ...slot,
      isVisible: slot.id === slotId,
    }));

    setResumeSlots(updated);
    handleSaveProfile(updated);
  }

  async function handleResumeUpload(slotId: string, file: File) {
    if (!userId) {
      setMessage("You must be signed in.");
      return;
    }

    try {
      setUploadingSlot(slotId);
      setMessage("");

      const url = await uploadFile(
        "resumes",
        file,
        `${userId}/${slotId}`
      );

      const updated = resumeSlots.map((slot) =>
        slot.id === slotId
          ? {
              ...slot,
              resumeUrl: url,
              fileName: file.name,
              createdAt: new Date().toISOString(),
            }
          : slot
      );

      setResumeSlots(updated);

      await handleSaveProfile(updated);

      await supabase.from("user_activity").insert({
        user_id: userId,
        full_name: fullName || null,
        email: email || null,
        event_type: "resume_uploaded",
        tool_name: "resume_upload",
        page_name: "/profile",
      });

      setMessage("Resume uploaded successfully.");
    } catch (err: any) {
      setMessage(err.message || "Resume upload failed.");
    } finally {
      setUploadingSlot(null);
    }
  }

  async function handleRemoveResume(slotId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this resume?"
    );

    if (!confirmed) {
      return;
    }

    const updated = resumeSlots.map((slot) =>
      slot.id === slotId
        ? {
            ...slot,
            resumeUrl: null,
            fileName: null,
            isVisible: false,
            createdAt: null,
          }
        : slot
    );

    setResumeSlots(updated);

    await handleSaveProfile(updated);

    setMessage("Resume removed.");
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
        <section style={st.hero}>
          <div style={st.heroLeft}>
            <p style={st.kicker}>Career Passport</p>

            <h1 style={st.title}>Career Passport Editor</h1>

            <p style={st.subtitle}>
              Update your profile, manage your resumes, and share your
              Career Passport with employers.
            </p>
          </div>

          <button onClick={handleSignOut} style={st.secondaryButton}>
            Sign Out
          </button>
        </section>

        <section style={st.profileStrip}>
          <div style={st.profileStripLeft}>
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" style={st.avatar} />
            ) : (
              <div style={st.avatarPlaceholder}>No Photo</div>
            )}

            <div>
              <label style={st.label}>Profile Photo</label>

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
            <h2 style={st.namePreview}>{fullName || "Your Name"}</h2>

            <p style={st.headlinePreview}>
              {headline || "Professional Headline"}
            </p>

            <p style={st.metaPreview}>
              {[city, stateName].filter(Boolean).join(", ") || "City, State"}
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

        <section style={st.formFlow}>
          <div style={st.flowIntro}>
            <p style={st.sectionKicker}>Profile Details</p>
            <h2 style={st.sectionTitle}>Basic Information</h2>
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

        <section style={st.assetFlow}>
          <div style={st.flowIntro}>
            <p style={st.sectionKicker}>Resumes</p>

            <h2 style={st.sectionTitle}>My Resumes</h2>

            <p style={st.flowText}>
              Store up to two resumes and choose which resume is visible
              to employers on your public Career Passport.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "16px",
            }}
          >
            {resumeSlots.map((slot, index) => (
              <div
                key={slot.id}
                style={{
                  ...glass,
                  borderRadius: "20px",
                  padding: "24px",
                  display: "grid",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "12px",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      color: "#f5f5f5",
                      fontSize: "20px",
                      fontWeight: 700,
                    }}
                  >
                    Resume {index + 1}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {slot.isVisible ? (
                      <span style={st.visibleBadge}>
                        Visible to Employers
                      </span>
                    ) : null}

                    {!slot.isVisible && slot.resumeUrl ? (
                      <button
                        onClick={() => setVisibleSlot(slot.id)}
                        style={{
                          ...st.secondaryButton,
                          fontSize: "13px",
                          padding: "8px 14px",
                        }}
                      >
                        Set as Visible
                      </button>
                    ) : null}
                  </div>
                </div>

                <div>
                  <p style={st.resumeHelper}>
                    Upload a PDF, DOC, DOCX, TXT, or image file.
                  </p>

                  <div style={st.resumeActions}>
                    <label style={st.uploadButton}>
                      📄{" "}
                      {uploadingSlot === slot.id
                        ? "Uploading..."
                        : slot.resumeUrl
                          ? "Replace Resume"
                          : "Upload Resume"}

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                        style={{
                          display: "none",
                        }}
                        disabled={uploadingSlot === slot.id}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];

                          if (file) {
                            await handleResumeUpload(slot.id, file);
                          }
                        }}
                      />
                    </label>

                    {slot.resumeUrl ? (
                      <>
                        <a
                          href={slot.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={st.resumeLink}
                        >
                          View Resume
                        </a>

                        <button
                          onClick={() => handleRemoveResume(slot.id)}
                          style={st.removeButton}
                        >
                          ✕ Remove
                        </button>
                      </>
                    ) : null}
                  </div>

                  {slot.resumeUrl ? (
                    <div style={st.savedResumeInfo}>
                      <strong>Resume Uploaded</strong>

                      {slot.fileName ? (
                        <span>{slot.fileName}</span>
                      ) : null}

                      {slot.createdAt ? (
                        <span>
                          Uploaded{" "}
                          {new Date(slot.createdAt).toLocaleDateString()}
                        </span>
                      ) : null}
                    </div>
                  ) : (
                    <div style={st.emptyResume}>
                      No resume uploaded yet.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={st.noticeFloat}>
          <p style={st.noticeTitle}>Public Profile Note</p>

          <p style={st.noticeText}>
            Your photo, headline, location, LinkedIn, and selected resume
            appear on your Career Passport once completed.
          </p>
        </section>

        <ConnectExplore />

        <section style={st.bottomDock}>
          <button
            onClick={() => handleSaveProfile()}
            disabled={saving}
            style={st.primaryButton}
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </section>

        {message ? <p style={st.message}>{message}</p> : null}
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
      <label style={st.label}>{label}</label>

      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
      <label style={st.label}>{label}</label>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
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
    padding: "34px 24px 64px",
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
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

  assetFlow: {
    display: "grid",
    gap: "16px",
  },

  flowIntro: {
    display: "grid",
    gap: "6px",
  },

  flowText: {
    margin: 0,
    color: "#a1a1aa",
    fontSize: "15px",
    lineHeight: 1.75,
    maxWidth: "920px",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
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

  visibleBadge: {
    fontSize: "11px",
    background: "#1e3a2f",
    color: "#4ade80",
    border: "1px solid #2d5a3d",
    padding: "4px 10px",
    borderRadius: "999px",
    fontFamily: "monospace",
  },

  resumeHelper: {
    margin: "0 0 12px",
    color: "#9ca3af",
    fontSize: "13px",
  },

  resumeActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexWrap: "wrap",
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "10px",
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#f5f5f5",
    fontWeight: 700,
  },

  resumeLink: {
    color: "#a5b4fc",
    fontSize: "13px",
    textDecoration: "underline",
  },

  removeButton: {
    fontSize: "12px",
    color: "#f87171",
    background: "transparent",
    border: "1px solid #5a1f1f",
    borderRadius: "8px",
    padding: "7px 12px",
    cursor: "pointer",
  },

  savedResumeInfo: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(74,222,128,0.05)",
    border: "1px solid rgba(74,222,128,0.12)",
    color: "#b7c5bd",
    fontSize: "12px",
  },

  emptyResume: {
    marginTop: "14px",
    padding: "12px 14px",
    borderRadius: "12px",
    background: "rgba(255,255,255,0.025)",
    border: "1px solid rgba(255,255,255,0.05)",
    color: "#6b7280",
    fontSize: "12px",
  },

  message: {
    marginTop: "2px",
    color: "#e5e5e5",
    fontSize: "14px",
    lineHeight: 1.6,
  },
};
