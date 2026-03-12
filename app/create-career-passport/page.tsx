"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

type ExperienceBullet = {
  text: string;
};

type ExperienceItem = {
  companyName: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  bullets: ExperienceBullet[];
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

type ResumeLanguage =
  | "English"
  | "Spanish"
  | "Polish"
  | "Mandarin"
  | "Russian"
  | "Arabic"
  | "Vietnamese";

const FREE_SKILL_LIMIT = 9;
const FREE_BULLET_LIMIT = 4;
const PAID_BULLET_LIMIT = 6;

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
  const nextIndex = direction === "up" ? index - 1 : index + 1;
  if (nextIndex < 0 || nextIndex >= arr.length) return arr;
  [updated[index], updated[nextIndex]] = [updated[nextIndex], updated[index]];
  return updated;
}

function formatDateRange(item: ExperienceItem) {
  const from = [item.startMonth, item.startYear].filter(Boolean).join(" ");
  const to = item.isPresent ? "Present" : [item.endMonth, item.endYear].filter(Boolean).join(" ");
  if (!from && !to) return "";
  return `${from || "Start"} - ${to || "End"}`;
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

  const [summaryHeading, setSummaryHeading] = useState("Summary");
  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [education, setEducation] = useState("");
  const [volunteerWork, setVolunteerWork] = useState("");
  const [accomplishments, setAccomplishments] = useState("");
  const [resumeLanguage, setResumeLanguage] = useState<ResumeLanguage>("English");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [introVideoFile, setIntroVideoFile] = useState<File | null>(null);
  const [wantsVerification, setWantsVerification] = useState(false);
  const [isPaidUser, setIsPaidUser] = useState(false);

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    {
      companyName: "",
      roleTitle: "",
      startMonth: "",
      startYear: "",
      endMonth: "",
      endYear: "",
      isPresent: false,
      bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
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

  const passportSlug = useMemo(() => slugify(fullName || "your-name"), [fullName]);
  const skills = skillsInput
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, FREE_SKILL_LIMIT);

  const activeExperiences = experiences.filter(
    (item) =>
      item.companyName ||
      item.roleTitle ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent ||
      item.bullets.some((bullet) => bullet.text)
  );

  const activeCertificates = certificates.filter(
    (item) => item.certificateName || item.organizationName
  );

  async function uploadFile(bucket: "resumes" | "profile-videos", file: File, currentUserId: string) {
    const filePath = `${currentUserId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  function addExperience() {
    setExperiences((prev) => [
      ...prev,
      {
        companyName: "",
        roleTitle: "",
        startMonth: "",
        startYear: "",
        endMonth: "",
        endYear: "",
        isPresent: false,
        bullets: [{ text: "" }, { text: "" }, { text: "" }, { text: "" }],
      },
    ]);
  }

  function updateExperience(index: number, field: keyof ExperienceItem, value: string | boolean | ExperienceBullet[]) {
    setExperiences((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function updateBullet(expIndex: number, bulletIndex: number, value: string) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== expIndex) return item;
        const bullets = item.bullets.map((bullet, j) => (j === bulletIndex ? { text: value } : bullet));
        return { ...item, bullets };
      })
    );
  }

  function addBullet(expIndex: number) {
    setExperiences((prev) =>
      prev.map((item, i) => {
        if (i !== expIndex) return item;
        const max = isPaidUser ? PAID_BULLET_LIMIT : FREE_BULLET_LIMIT;
        if (item.bullets.length >= max) return item;
        return { ...item, bullets: [...item.bullets, { text: "" }] };
      })
    );
  }

  function addCertificate() {
    setCertificates((prev) => [...prev, { certificateName: "", organizationName: "" }]);
  }

  function updateCertificate(index: number, field: keyof CertificateItem, value: string) {
    setCertificates((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
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
        introVideoUrl = await uploadFile("profile-videos", introVideoFile, userId);
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
        page_limit: isPaidUser ? 2 : 1,
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
        const { error: expError } = await supabase.from("work_experiences").insert(
          activeExperiences.map((item, index) => ({
            profile_id: profileId,
            sort_order: index,
            company_name: item.companyName,
            role_title: item.roleTitle,
            description: JSON.stringify({
              startMonth: item.startMonth,
              startYear: item.startYear,
              endMonth: item.endMonth,
              endYear: item.endYear,
              isPresent: item.isPresent,
              bullets: item.bullets.map((bullet) => bullet.text).filter(Boolean),
            }),
          }))
        );

        if (expError) throw expError;
      }

      if (activeCertificates.length > 0) {
        const { error: certError } = await supabase.from("certificates").insert(
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
            <h1 style={styles.mainTitle}>Create Your Career Passport</h1>
            <p style={styles.topText}>Future profile URL: hireminds.app/passport/{passportSlug}</p>

            <div style={styles.badgeRow}>
              <span style={styles.pill}>Professional builder</span>
              <span style={styles.pillMuted}>Dark mode interface</span>
            </div>

            <h2 style={styles.sectionTitle}>Passport + Resume Setup</h2>

            <label style={styles.label}>Preferred Resume Prompt Language</label>
            <select value={resumeLanguage} onChange={(e) => setResumeLanguage(e.target.value as ResumeLanguage)} style={styles.input}>
              <option>English</option>
              <option>Spanish</option>
              <option>Polish</option>
              <option>Mandarin</option>
              <option>Russian</option>
              <option>Arabic</option>
              <option>Vietnamese</option>
            </select>
            <p style={styles.helpText}>
              Candidates can read and answer prompts in their preferred language. Resume output should still be translated into professional English.
            </p>

            <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" style={styles.input} />
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" style={styles.input} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={styles.input} />
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="City (optional)" style={styles.input} />
            <input value={stateName} onChange={(e) => setStateName(e.target.value)} placeholder="State (optional)" style={styles.input} />
            <input value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} placeholder="LinkedIn (optional)" style={styles.input} />
            <input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Professional Headline" style={styles.input} />
            <textarea value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Short bio for Career Passport" style={styles.textarea} />

            <h2 style={styles.sectionTitle}>Career Passport Uploads</h2>
            <p style={styles.helpText}>This is where candidates can upload their resume and intro video for the public-facing Career Passport profile.</p>

            <label style={styles.label}>Resume Upload</label>
            <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files?.[0] || null)} style={styles.input} />

            <label style={styles.label}>Intro Video Upload</label>
            <input type="file" accept="video/*" onChange={(e) => setIntroVideoFile(e.target.files?.[0] || null)} style={styles.input} />

            <div style={styles.toggleCard}>
              <label style={styles.toggleRow}>
                <input type="checkbox" checked={wantsVerification} onChange={(e) => setWantsVerification(e.target.checked)} />
                <span>Request employer verification for Career Passport</span>
              </label>
              <p style={styles.helpText}>Employer verification is a paid feature and should appear during signup / passport setup.</p>
            </div>

            <div style={styles.toggleCard}>
              <label style={styles.toggleRow}>
                <input type="checkbox" checked={isPaidUser} onChange={(e) => setIsPaidUser(e.target.checked)} />
                <span>Paid version preview</span>
              </label>
              <p style={styles.helpText}>Free users get up to 4 bullets per role. Paid users can add up to 6 bullets per role and unlock 2-page resumes / CVs.</p>
            </div>

            <h2 style={styles.sectionTitle}>Summary + AI Help</h2>
            <input value={summaryHeading} onChange={(e) => setSummaryHeading(e.target.value)} placeholder='Summary heading (optional, can be blank or "Summary")' style={styles.input} />
            <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)} placeholder="Example: Client-focused workforce development professional with experience in talent acquisition, resume writing, employer engagement, and job readiness coaching. Skilled in connecting candidates to opportunities through personalized support, strategic sourcing, and career-focused communication." style={styles.textarea} />
            <div style={styles.aiPanel}>
              <p style={styles.aiTitle}>AI Assist Ideas</p>
              <ul style={styles.aiList}>
                <li>AI can write or rewrite your summary</li>
                <li>AI can suggest or improve skills</li>
                <li>AI can rewrite job descriptions into resume bullets</li>
              </ul>
            </div>

            <h2 style={styles.sectionTitle}>Skills</h2>
            <input value={skillsInput} onChange={(e) => setSkillsInput(e.target.value)} placeholder="Skills, comma separated, up to 9" style={styles.input} />

            <h2 style={styles.sectionTitle}>Work Experience</h2>
            {experiences.map((item, index) => {
              const bulletLimit = isPaidUser ? PAID_BULLET_LIMIT : FREE_BULLET_LIMIT;
              return (
                <div key={index} style={styles.subCard}>
                  <input value={item.companyName} onChange={(e) => updateExperience(index, "companyName", e.target.value)} placeholder="Company Name" style={styles.input} />
                  <input value={item.roleTitle} onChange={(e) => updateExperience(index, "roleTitle", e.target.value)} placeholder="Role Title" style={styles.input} />

                  <div style={styles.twoCol}>
                    <input value={item.startMonth} onChange={(e) => updateExperience(index, "startMonth", e.target.value)} placeholder="From Month" style={styles.input} />
                    <input value={item.startYear} onChange={(e) => updateExperience(index, "startYear", e.target.value)} placeholder="From Year" style={styles.input} />
                  </div>

                  <label style={styles.toggleRow}>
                    <input type="checkbox" checked={item.isPresent} onChange={(e) => updateExperience(index, "isPresent", e.target.checked)} />
                    <span>I currently work here</span>
                  </label>

                  {!item.isPresent ? (
                    <div style={styles.twoCol}>
                      <input value={item.endMonth} onChange={(e) => updateExperience(index, "endMonth", e.target.value)} placeholder="To Month" style={styles.input} />
                      <input value={item.endYear} onChange={(e) => updateExperience(index, "endYear", e.target.value)} placeholder="To Year" style={styles.input} />
                    </div>
                  ) : null}

                  <p style={styles.helpText}>Free version: up to 4 bullet points per role. Paid version: up to 6 bullet points.</p>
                  {item.bullets.map((bullet, bulletIndex) => (
                    <input
                      key={bulletIndex}
                      value={bullet.text}
                      onChange={(e) => updateBullet(index, bulletIndex, e.target.value)}
                      placeholder={`Bullet point ${bulletIndex + 1}`}
                      style={styles.input}
                    />
                  ))}

                  {item.bullets.length < bulletLimit ? (
                    <button type="button" onClick={() => addBullet(index)} style={styles.secondaryButton}>
                      + Add Bullet
                    </button>
                  ) : null}
                </div>
              );
            })}
            <button type="button" onClick={addExperience} style={styles.secondaryButton}>
              + Add Work Experience
            </button>

            <h2 style={styles.sectionTitle}>Certifications (optional)</h2>
            {certificates.map((item, index) => (
              <div key={index} style={styles.subCard}>
                <input value={item.certificateName} onChange={(e) => updateCertificate(index, "certificateName", e.target.value)} placeholder="Certification Name" style={styles.input} />
                <input value={item.organizationName} onChange={(e) => updateCertificate(index, "organizationName", e.target.value)} placeholder="Organization" style={styles.input} />
              </div>
            ))}
            <button type="button" onClick={addCertificate} style={styles.secondaryButton}>
              + Add Certification
            </button>

            <h2 style={styles.sectionTitle}>Education (optional)</h2>
            <textarea value={education} onChange={(e) => setEducation(e.target.value)} placeholder="Education" style={styles.textarea} />

            <h2 style={styles.sectionTitle}>Volunteer Work (optional)</h2>
            <textarea value={volunteerWork} onChange={(e) => setVolunteerWork(e.target.value)} placeholder="Volunteer work" style={styles.textarea} />

            <h2 style={styles.sectionTitle}>Accomplishments (optional)</h2>
            <textarea value={accomplishments} onChange={(e) => setAccomplishments(e.target.value)} placeholder="Accomplishments" style={styles.textarea} />

            <h2 style={styles.sectionTitle}>Move Resume Sections</h2>
            {sectionOrder.map((section, index) => (
              <div key={section} style={styles.moveRow}>
                <span style={styles.moveLabel}>{section}</span>
                <div style={styles.moveButtons}>
                  <button type="button" onClick={() => moveSection(index, "up")} style={styles.smallButton}>Up</button>
                  <button type="button" onClick={() => moveSection(index, "down")} style={styles.smallButton}>Down</button>
                </div>
              </div>
            ))}

            <button onClick={handleSave} disabled={saving} style={styles.primaryButton}>
              {saving ? "Saving..." : "Save Career Passport"}
            </button>

            {message ? <p style={styles.message}>{message}</p> : null}
          </div>
        </div>

        <aside style={styles.rightColumn}>
          <div style={styles.previewWrapper}>
            <h2 style={styles.previewTitle}>Live Resume Preview</h2>
            <p style={styles.helpText}>Centered headers • dark builder • one-page free preview</p>

            <div style={styles.resumePaper}>
              <div style={styles.resumeHeader}>
                <h1 style={styles.resumeName}>{fullName || "Your Name"}</h1>
                <p style={styles.resumeContact}>
                  {phone || "Phone"}
                  {email ? ` • ${email}` : ""}
                  {city || stateName ? ` • ${[city, stateName].filter(Boolean).join(", ")}` : ""}
                </p>
                {linkedinUrl ? <p style={styles.resumeContact}>{linkedinUrl}</p> : null}
              </div>

              {sectionOrder.map((section) => {
                if (section === "summary" && summaryText) {
                  return (
                    <ResumeSection key={section} title={summaryHeading || ""} hideTitle={!summaryHeading}>
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
                          <div style={styles.resumeLineTop}>
                            <p style={styles.resumeStrong}>
                              {item.roleTitle || "Role"}
                              {item.companyName ? ` — ${item.companyName}` : ""}
                            </p>
                            <p style={styles.resumeDate}>{formatDateRange(item)}</p>
                          </div>
                          {item.bullets.filter((bullet) => bullet.text).map((bullet, bulletIndex) => (
                            <p key={bulletIndex} style={styles.resumeBullet}>• {bullet.text}</p>
                          ))}
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
                          {item.organizationName ? ` — ${item.organizationName}` : ""}
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

function ResumeSection({ title, hideTitle, children }: { title: string; hideTitle?: boolean; children: React.ReactNode }) {
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
    background: "linear-gradient(180deg, #0b1120 0%, #111827 100%)",
    minHeight: "100vh",
    color: "#e5e7eb",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
  },
  containerWide: {
    display: "grid",
    gridTemplateColumns: "1fr 460px",
    gap: "24px",
    maxWidth: "1480px",
    margin: "0 auto",
  },
  leftColumn: { minWidth: 0 },
  rightColumn: { minWidth: 0 },
  formCard: {
    background: "#111827",
    padding: "28px",
    borderRadius: "20px",
    border: "1px solid #334155",
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  previewWrapper: {
    background: "#0f172a",
    padding: "20px",
    borderRadius: "20px",
    border: "1px solid #334155",
    position: "sticky",
    top: "20px",
  },
  mainTitle: {
    marginTop: 0,
    fontSize: "36px",
    color: "#f8fafc",
  },
  previewTitle: {
    marginTop: 0,
    color: "#f8fafc",
  },
  topText: {
    color: "#93c5fd",
    marginBottom: "20px",
  },
  badgeRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  pill: {
    background: "rgba(34,211,238,0.12)",
    color: "#67e8f9",
    border: "1px solid rgba(34,211,238,0.28)",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  pillMuted: {
    background: "rgba(148,163,184,0.12)",
    color: "#cbd5e1",
    border: "1px solid rgba(148,163,184,0.2)",
    padding: "8px 12px",
    borderRadius: "999px",
    fontSize: "13px",
    fontWeight: 700,
  },
  sectionTitle: {
    marginTop: "28px",
    marginBottom: "12px",
    color: "#f8fafc",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 600,
    color: "#e2e8f0",
  },
  helpText: {
    color: "#94a3b8",
    fontSize: "14px",
    lineHeight: 1.6,
    marginTop: "0",
    marginBottom: "12px",
  },
  input: {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f8fafc",
  },
  textarea: {
    display: "block",
    width: "100%",
    marginBottom: "12px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #334155",
    background: "#0f172a",
    color: "#f8fafc",
    minHeight: "110px",
  },
  toggleCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "14px",
  },
  toggleRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    marginBottom: "6px",
    color: "#f8fafc",
  },
  subCard: {
    background: "#0f172a",
    border: "1px solid #334155",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "12px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  secondaryButton: {
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
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
    padding: "12px 0",
    borderBottom: "1px solid #1e293b",
  },
  moveLabel: {
    textTransform: "capitalize",
    fontWeight: 600,
    color: "#e2e8f0",
  },
  moveButtons: {
    display: "flex",
    gap: "8px",
  },
  smallButton: {
    background: "#1e293b",
    color: "#e2e8f0",
    border: "1px solid #334155",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
  },
  primaryButton: {
    background: "linear-gradient(90deg, #06b6d4 0%, #3b82f6 100%)",
    color: "#eff6ff",
    border: "none",
    borderRadius: "12px",
    padding: "14px 18px",
    fontWeight: 700,
    cursor: "pointer",
    marginTop: "12px",
    width: "100%",
  },
  message: {
    marginTop: "16px",
    color: "#f8fafc",
    fontWeight: 600,
  },
  resumePaper: {
    background: "#ffffff",
    minHeight: "940px",
    padding: "36px",
    borderRadius: "12px",
    color: "#0f172a",
  },
  resumeHeader: {
    textAlign: "center",
    marginBottom: "24px",
  },
  resumeName: {
    margin: 0,
    fontSize: "28px",
    color: "#020617",
  },
  resumeContact: {
    margin: "8px 0 0",
    fontSize: "14px",
    color: "#334155",
  },
  resumeSectionTitle: {
    textAlign: "center",
    fontSize: "15px",
    margin: "0 0 8px",
    textTransform: "uppercase",
    color: "#0f172a",
  },
  resumeText: {
    fontSize: "14px",
    lineHeight: 1.55,
    margin: 0,
    color: "#0f172a",
  },
  resumeStrong: {
    fontSize: "14px",
    fontWeight: 700,
    margin: 0,
    color: "#0f172a",
  },
  resumeDate: {
    margin: 0,
    fontSize: "13px",
    color: "#475569",
  },
  resumeBlock: {
    marginBottom: "12px",
  },
  resumeLineTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "6px",
    alignItems: "baseline",
  },
  resumeBullet: {
    fontSize: "14px",
    lineHeight: 1.5,
    margin: "0 0 4px",
    color: "#0f172a",
  },
  aiPanel: {
    background: "rgba(59,130,246,0.08)",
    border: "1px solid rgba(59,130,246,0.24)",
    borderRadius: "14px",
    padding: "14px",
    marginBottom: "16px",
  },
  aiTitle: {
    marginTop: 0,
    color: "#bfdbfe",
    fontWeight: 700,
  },
  aiList: {
    margin: 0,
    paddingLeft: "18px",
    color: "#dbeafe",
    lineHeight: 1.7,
  },
};
