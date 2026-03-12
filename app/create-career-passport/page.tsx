"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ExperienceItem = {
  companyName: string;
  roleTitle: string;
  description: string;
};

type CertificateItem = {
  certificateName: string;
  organizationName: string;
};

type ResumeSectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "certifications"
  | "education"
  | "volunteer"
  | "accomplishments";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function moveItem<T>(arr: T[], index: number, direction: "up" | "down") {
  const updated = [...arr];
  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= arr.length) return arr;
  [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
  return updated;
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

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      companyName: "",
      roleTitle: "",
      description: "",
    },
  ]);

  const [certificates, setCertificates] = useState<CertificateItem[]>([
    {
      certificateName: "",
      organizationName: "",
    },
  ]);

  const [sectionOrder, setSectionOrder] = useState<ResumeSectionKey[]>([
    "summary",
    "skills",
    "experience",
    "certifications",
    "education",
    "volunteer",
    "accomplishments",
  ]);

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

  const activeExperiences = experiences.filter(
    (item) => item.companyName || item.roleTitle || item.description
  );

  const activeCertificates = certificates.filter(
    (item) => item.certificateName || item.organizationName
  );

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

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      { companyName: "", roleTitle: "", description: "" },
    ]);
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceItem,
    value: string
  ) {
    setExperiences((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function addCertificate() {
    setCertificates((prev) => [
      ...prev,
      { certificateName: "", organizationName: "" },
    ]);
  }

  function updateCertificate(
    index: number,
    field: keyof CertificateItem,
    value: string
  ) {
    setCertificates((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  }

  function moveSection(index: number, direction: "up" | "down") {
    setSectionOrder((prev) => moveItem(prev, index, direction));
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
        section_order: sectionOrder,
      });

      if (resumeError) throw resumeError;

      if (activeExperiences.length > 0) {
        const { error: expError } = await supabase
          .from("work_experiences")
          .insert(
            activeExperiences.map((item, index) => ({
              profile_id: profileId,
              sort_order: index,
              company_name: item.companyName,
              role_title: item.roleTitle,
              description: item.description,
            }))
          );

        if (expError) throw expError;
      }

      if (activeCertificates.length > 0) {
        const { error: certError } = await supabase
          .from("certificates")
          .insert(
            activeCertificates.map((item, index) => ({
              profile_id: profileId,
              sort_order: index,
              certificate_name: item.certificateName,
              organization_name: item.organizationName,
            }))
          );

        if (certError) throw certError;
      }

      setMessage(`Saved successfully! Passport URL: /passport/${passportSlug}`);
    } catch (error: any) {
      setMessage(error.message || "Something went wrong while saving.");
    } finally {
      setSaving(false);
    }
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.container}>Loading...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <div style={styles.containerWide}>
        <div style={styles.leftColumn}>
          <div style={styles.formCard}>
            <h1>Create Your Career Passport</h1>
            <p style={styles.topText}>
              Future profile URL: hireminds.app/passport/{passportSlug}
            </p>

            <h2>Career Passport Details</h2>

            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              style={styles.input}
            />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone Number"
              style={styles.input}
            />
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              style={styles.input}
            />
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="City (optional)"
              style={styles.input}
            />
            <input
              value={stateName}
              onChange={(e) => setStateName(e.target.value)}
              placeholder="State (optional)"
              style={styles.input}
            />
            <input
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              placeholder="LinkedIn (optional)"
              style={styles.input}
            />
            <input
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Professional Headline"
              style={styles.input}
            />
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Short bio for Career Passport"
              style={styles.textarea}
            />

            <h2>Uploads</h2>

            <label style={styles.label}>Resume Upload</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              style={styles.input}
            />

            <label style={styles.label}>Intro Video Upload</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setIntroVideoFile(e.target.files?.[0] || null)}
              style={styles.input}
            />

            <h2>Resume Builder</h2>

            <input
              value={summaryHeading}
              onChange={(e) => setSummaryHeading(e.target.value)}
              placeholder='Summary heading (optional, can be blank or "Summary")'
              style={styles.input}
            />
            <textarea
              value={summaryText}
              onChange={(e) => setSummaryText(e.target.value)}
              placeholder="Summary text"
              style={styles.textarea}
            />
            <input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="Skills, comma separated, up to 9"
              style={styles.input}
            />

            <h3>Work Experience</h3>
            {experiences.map((item, index) => (
              <div key={index} style={styles.subCard}>
                <input
                  value={item.companyName}
                  onChange={(e) =>
                    updateExperience(index, "companyName", e.target.value)
                  }
                  placeholder="Company Name"
                  style={styles.input}
                />
                <input
                  value={item.roleTitle}
                  onChange={(e) =>
                    updateExperience(index, "roleTitle", e.target.value)
                  }
                  placeholder="Role Title"
                  style={styles.input}
                />
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    updateExperience(index, "description", e.target.value)
                  }
                  placeholder="Role Description"
                  style={styles.textarea}
                />
              </div>
            ))}
            <button type="button" onClick={addExperience} style={styles.secondaryButton}>
              + Add Work Experience
            </button>

            <h3>Certifications (optional)</h3>
            {certificates.map((item, index) => (
              <div key={index} style={styles.subCard}>
                <input
                  value={item.certificateName}
                  onChange={(e) =>
                    updateCertificate(index, "certificateName", e.target.value)
                  }
                  placeholder="Certification Name"
                  style={styles.input}
                />
                <input
                  value={item.organizationName}
                  onChange={(e) =>
                    updateCertificate(index, "organizationName", e.target.value)
                  }
                  placeholder="Organization"
                  style={styles.input}
                />
              </div>
            ))}
            <button type="button" onClick={addCertificate} style={styles.secondaryButton}>
              + Add Certification
            </button>

            <h3>Education (optional)</h3>
            <textarea
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="Education"
              style={styles.textarea}
            />

            <h3>Volunteer Work (optional)</h3>
            <textarea
              value={volunteerWork}
              onChange={(e) => setVolunteerWork(e.target.value)}
              placeholder="Volunteer work"
              style={styles.textarea}
            />

            <h3>Accomplishments (optional)</h3>
            <textarea
              value={accomplishments}
              onChange={(e) => setAccomplishments(e.target.value)}
              placeholder="Accomplishments"
              style={styles.textarea}
            />

            <h2>Move Resume Sections</h2>
            {sectionOrder.map((section, index) => (
              <div key={section} style={styles.moveRow}>
                <span style={styles.moveLabel}>{section}</span>
                <div style={styles.moveButtons}>
                  <button
                    type="button"
                    onClick={() => moveSection(index, "up")}
                    style={styles.smallButton}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => moveSection(index, "down")}
                    style={styles.smallButton}
                  >
                    Down
                  </button>
                </div>
              </div>
            ))}

            <button
              onClick={handleSave}
              disabled={saving}
              style={styles.primaryButton}
            >
              {saving ? "Saving..." : "Save Career Passport"}
            </button>

            {message ? <p style={styles.message}>{message}</p> : null}
          </div>
        </div>

        <aside style={styles.rightColumn}>
          <div style={styles.previewWrapper}>
            <h2>Live Resume Preview</h2>

            <div style={styles.resumePaper}>
              <div style={styles.resumeHeader}>
                <h1 style={styles.resumeName}>{fullName || "Your Name"}</h1>
                <p style={styles.resumeContact}>
                  {phone || "Phone"}
                  {email ? ` • ${email}` : ""}
                  {city || stateName
                    ? ` • ${[city, stateName].filter(Boolean).join(", ")}`
                    : ""}
                </p>
                {linkedinUrl ? (
                  <p style={styles.resumeContact}>{linkedinUrl}</p>
                ) : null}
              </div>

              {sectionOrder.map((section) => {
                if (section === "summary" && summaryText) {
                  return (
                    <ResumeSection
                      key={section}
                      title={summaryHeading || ""}
                      hideTitle={!summaryHeading}
                    >
                      <p style={styles.resumeText}>{summaryText}</p>
                    </ResumeSection>
                  );
                }

                if (section === "skills" && skills.length > 0) {
                  return (
                    <ResumeSection key={section} title="Skills">
                      <p style={styles.resumeText}>{skills.join(" • ")}</p>
                    </ResumeSection>
                  );
                }

                if (section === "experience" && activeExperiences.length > 0) {
                  return (
                    <ResumeSection key={section} title="Work Experience">
                      {activeExperiences.map((item, index) => (
                        <div key={index} style={styles.resumeBlock}>
                          <p style={styles.resumeStrong}>
                            {item.roleTitle || "Role"}
                            {item.companyName ? ` — ${item.companyName}` : ""}
                          </p>
                          <p style={styles.resumeText}>{item.description}</p>
                        </div>
                      ))}
                    </ResumeSection>
                  );
                }

                if (section === "certifications" && activeCertificates.length > 0) {
                  return (
                    <ResumeSection key={section} title="Certifications">
                      {activeCertificates.map((item, index) => (
                        <p key={index} style={styles.resumeText}>
                          {item.certificateName}
                          {item.organizationName
                            ? ` — ${item.organizationName}`
                            : ""}
                        </p>
                      ))}
                    </ResumeSection>
                  );
                }

                if (section === "education" && education) {
                  return (
                    <ResumeSection key={section} title="Education">
                      <p style={styles.resumeText}>{education}</p>
                    </ResumeSection>
                  );
                }

                if (section === "volunteer" && volunteerWork) {
                  return (
                    <ResumeSection key={section} title="Volunteer Work">
                      <p style={styles.resumeText}>{volunteerWork}</p>
                    </ResumeSection>
                  );
                }

                if (section === "accomplishments" && accomplishments) {
                  return (
                    <ResumeSection key={section} title="Accomplishments">
                      <p style={styles.resumeText}>{accomplishments}</p>
                    </ResumeSection>
                  );
                }

                return null;
              })}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function ResumeSection({
  title,
  hideTitle,
  children,
}: {
  title: string;
  hideTitle?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section style={{ marginBottom: "18px" }}>
      {!hideTitle ? <h3 style={styles.resumeSectionTitle}>{title}</h3> : null}
      {children}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "30px",
    background: "#f8fafc",
    minHeight: "100vh",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  containerWide: {
    display: "grid",
    gridTemplateColumns: "1fr 420px",
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  leftColumn: {
    minWidth: 0,
  },
  rightColumn: {
    minWidth: 0,
  },
  formCard: {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
  },
  previewWrapper: {
    background: "#e2e8f0",
    padding: "20px",
    borderRadius: "16px",
    position: "sticky",
    top: "20px",
  },
  topText: {
    color: "#475569",
    marginBottom: "20px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
  },
  textarea: {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "12px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    minHeight: "100px",
  },
  subCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "12px",
    marginBottom: "12px",
  },
  secondaryButton: {
    background: "#e2e8f0",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
    marginBottom: "18px",
  },
  moveRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  moveLabel: {
    textTransform: "capitalize",
    fontWeight: 600,
  },
  moveButtons: {
    display: "flex",
    gap: "8px",
  },
  smallButton: {
    background: "#e2e8f0",
    border: "none",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
  },
  primaryButton: {
    background: "#06b6d4",
    color: "#082f49",
    border: "none",
    borderRadius: "12px",
    padding: "14px 18px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "12px",
  },
  message: {
    marginTop: "16px",
    color: "#0f172a",
    fontWeight: 600,
  },
  resumePaper: {
    background: "#fff",
    minHeight: "900px",
    padding: "36px",
    borderRadius: "8px",
  },
  resumeHeader: {
    textAlign: "center",
    marginBottom: "24px",
  },
  resumeName: {
    margin: 0,
    fontSize: "28px",
  },
  resumeContact: {
    margin: "8px 0 0",
    fontSize: "14px",
  },
  resumeSectionTitle: {
    textAlign: "center",
    fontSize: "15px",
    margin: "0 0 8px",
    textTransform: "uppercase",
  },
  resumeText: {
    fontSize: "14px",
    lineHeight: 1.5,
    margin: 0,
  },
  resumeStrong: {
    fontSize: "14px",
    fontWeight: 700,
    margin: "0 0 6px",
  },
  resumeBlock: {
    marginBottom: "12px",
  },
};
