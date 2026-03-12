"use client";

import { useMemo, useState } from "react";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CreateCareerPassportPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [summaryHeading, setSummaryHeading] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [education, setEducation] = useState("");
  const [volunteerWork, setVolunteerWork] = useState("");
  const [accomplishments, setAccomplishments] = useState("");

  const passportSlug = useMemo(() => slugify(fullName || "your-name"), [fullName]);

  const skills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 9);

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
              {linkedinUrl ? <p style={{ margin: "6px 0 0", fontSize: "14px" }}>{linkedinUrl}</p> : null}
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
