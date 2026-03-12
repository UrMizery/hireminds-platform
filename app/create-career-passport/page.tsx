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

export default function CreateCareerPassportPage() {
  const [userId, setUserId] = useState("");
  const [loadingUser, setLoadingUser] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [headline, setHeadline] = useState("");
  const [bio, setBio] = useState("");

  const [summaryHeading, setSummaryHeading] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [education, setEducation] = useState("");
  const [volunteerWork, setVolunteerWork] = useState("");
  const [accomplishments, setAccomplishments] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setMessage("You must be signed in before saving your Career Passport.");
        setLoadingUser(false);
        return;
      }

      setUserId(data.user.id);
      setLoadingUser(false);
    }

    loadUser();
  }, []);

  const passportSlug = useMemo(
    () => slugify(fullName || "your-name"),
    [fullName]
  );

  const skills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 9);

  async function uploadFile(
    bucket: "resumes" | "profile-videos",
    file: File,
    userIdValue: string
  ) {
    const filePath = `${userIdValue}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSave() {
    setMessage("");

    if (!userId) {
      setMessage("You must be signed in before saving.");
      return;
    }

    if (!fullName.trim()) {
      setMessage("Full name is required.");
      return;
    }

    try {
      setSaving(true);

      let resumeUrl = "";
      let introVideoUrl = "";

      if (resumeFile) {
        resumeUrl = await uploadFile("resumes", resumeFile, userId);
      }

      if (introVideoFile) {
        introVideoUrl = await uploadFile(
          "profile-videos",
          introVideoFile,
          userId
        );
      }

      const { data: profileData, error: profileError } = await supabase
        .from("candidate_profiles")
        .insert({
          user_id: userId,
          full_name: fullName,
          headline,
          bio,
          phone,
          city,
          state: stateName,
          email,
          linkedin_url: linkedinUrl,
          passport_slug: passportSlug,
          resume_url: resumeUrl || null,
          intro_video_url: introVideoUrl || null,
        })
        .select()
        .single();

      if (profileError) throw profileError;

      const profileId = profileData.id;

      const { error: resumeError } = await supabase.from("resumes").insert({
        profile_id: profileId,
        title: "Primary Resume",
        page_limit: 1,
        summary_heading: summaryHeading,
        summary_text: summaryText,
        skills,
        education,
        accomplishments,
        volunteer_work: volunteerWork,
        section_order: [
          "summary",
          "skills",
          "education",
          "volunteer",
          "accomplishments",
        ],
      });

      if (resumeError) throw resumeError;

      setMessage(`Saved successfully! Passport URL: /passport/${passportSlug}`);
    } catch (error: any) {
      setMessage(error.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingUser) {
    return (
      <main style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>Loading...</div>
      </main>
    );
  }

  return (
    <main style={{ padding: "30px", background: "#f8fafc", minHeight: "100vh" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 420px",
          gap: "24px",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        <div style={{ background: "#fff", padding: "24px", borderRadius: "16px" }}>
          <h1>Create Your Career Passport</h1>
          <p>Future profile URL: hireminds.app/passport/{passportSlug}</p>

          <h2>Profile</h2>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Full Name"
            style={inputStyle}
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone Number"
            style={inputStyle}
          />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            style={inputStyle}
          />
          <input
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="City (optional)"
            style={inputStyle}
          />
          <input
            value={stateName}
            onChange={(e) => setStateName(e.target.value)}
            placeholder="State (optional)"
            style={inputStyle}
          />
          <input
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            placeholder="LinkedIn (optional)"
            style={inputStyle}
          />
          <input
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Professional Headline"
            style={inputStyle}
          />
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Short bio for Career Passport"
            style={textareaStyle}
          />

          <h2>Uploads</h2>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            style={inputStyle}
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setIntroVideoFile(e.target.files?.[0] || null)}
            style={inputStyle}
          />

          <h2>Resume Builder</h2>
          <input
            value={summaryHeading}
            onChange={(e) => setSummaryHeading(e.target.value)}
            placeholder='Summary heading (optional, can be blank or "Summary")'
            style={inputStyle}
          />
          <textarea
            value={summaryText}
            onChange={(e) => setSummaryText(e.target.value)}
            placeholder="Summary text"
            style={textareaStyle}
          />
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            placeholder="Skills, comma separated, up to 9"
            style={inputStyle}
          />
          <textarea
            value={education}
            onChange={(e) => setEducation(e.target.value)}
            placeholder="Education"
            style={textareaStyle}
          />
          <textarea
            value={volunteerWork}
            onChange={(e) => setVolunteerWork(e.target.value)}
            placeholder="Volunteer work (optional)"
            style={textareaStyle}
          />
          <textarea
            value={accomplishments}
            onChange={(e) => setAccomplishments(e.target.value)}
            placeholder="Accomplishments (optional)"
            style={textareaStyle}
          />

          <button
            onClick={handleSave}
            disabled={saving}
            style={buttonStyle}
          >
            {saving ? "Saving..." : "Save Career Passport"}
          </button>

          {message ? (
            <p style={{ marginTop: "16px", color: "#0f172a", fontWeight: 600 }}>
              {message}
            </p>
          ) : null}
        </div>

        <aside style={{ background: "#e2e8f0", padding: "20px", borderRadius: "16px" }}>
          <h2>Live Resume Preview</h2>

          <div
            style={{
              background: "#fff",
              minHeight: "900px",
              padding: "36px",
              borderRadius: "8px",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <h1 style={{ margin: 0, fontSize: "28px" }}>{fullName || "Your Name"}</h1>
              <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                {phone || "Phone"}
                {email ? ` • ${email}` : ""}
                {city || stateName ? ` • ${[city, stateName].filter(Boolean).join(", ")}` : ""}
              </p>
              {linkedinUrl ? (
                <p style={{ margin: "6px 0 0", fontSize: "14px" }}>{linkedinUrl}</p>
              ) : null}
            </div>

            {summaryText ? (
              <section style={{ marginBottom: "18px" }}>
                {summaryHeading ? <h3 style={resumeHeaderStyle}>{summaryHeading}</h3> : null}
                <p style={resumeTextStyle}>{summaryText}</p>
              </section>
            ) : null}

            {skills.length > 0 ? (
              <section style={{ marginBottom: "18px" }}>
                <h3 style={resumeHeaderStyle}>Skills</h3>
                <p style={resumeTextStyle}>{skills.join(" • ")}</p>
              </section>
            ) : null}

            {education ? (
              <section style={{ marginBottom: "18px" }}>
                <h3 style={resumeHeaderStyle}>Education</h3>
                <p style={resumeTextStyle}>{education}</p>
              </section>
            ) : null}

            {volunteerWork ? (
              <section style={{ marginBottom: "18px" }}>
                <h3 style={resumeHeaderStyle}>Volunteer Work</h3>
                <p style={resumeTextStyle}>{volunteerWork}</p>
              </section>
            ) : null}

            {accomplishments ? (
              <section style={{ marginBottom: "18px" }}>
                <h3 style={resumeHeaderStyle}>Accomplishments</h3>
                <p style={resumeTextStyle}>{accomplishments}</p>
              </section>
            ) : null}
          </div>
        </aside>
      </div>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: "12px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
};

const textareaStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  marginBottom: "12px",
  padding: "12px",
  borderRadius: "10px",
  border: "1px solid #cbd5e1",
  minHeight: "100px",
};

const resumeHeaderStyle: React.CSSProperties = {
  textAlign: "center",
  fontSize: "15px",
  margin: "0 0 8px",
  textTransform: "uppercase",
};

const resumeTextStyle: React.CSSProperties = {
  fontSize: "14px",
  lineHeight: 1.5,
  margin: 0,
};

const buttonStyle: React.CSSProperties = {
  background: "#06b6d4",
  color: "#082f49",
  border: "none",
  borderRadius: "12px",
  padding: "14px 18px",
  fontWeight: 700,
  cursor: "pointer",
  marginTop: "8px",
};
