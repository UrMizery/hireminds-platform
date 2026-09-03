"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type ResumeFont = "Times New Roman" | "Arial" | "Calibri";
type ResumeLayout = "Skills First" | "Balanced" | "Experience First";
type Bullet = { text: string };

type ParsedResume = {
  fullName?: string;
  phone?: string;
  email?: string;
  city?: string;
  stateName?: string;
  linkedinUrl?: string;
  summaryText?: string;
  skills?: string[];
  experiences?: Array<{
    companyName?: string;
    city?: string;
    state?: string;
    roleTitle?: string;
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isPresent?: boolean;
    bullets?: Array<{ text?: string }>;
  }>;
  educationItems?: Array<{
    schoolName?: string;
    degree?: string;
  }>;
  certificateItems?: Array<{
    organizationName?: string;
    certificateName?: string;
  }>;
};

type ExperienceItem = {
  organizationName: string;
  city: string;
  state: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  description: string;
  bullets: Bullet[];
};

type CredentialItem = {
  organizationName: string;
  credentialName: string;
  details: string;
  city: string;
  state: string;
  year: string;
};

const STORAGE_KEY = "hireminds-reentry-resume-draft-v3";
const SKILL_LIMIT = 9;
const BULLET_LIMIT = 5;

const MONTHS = [
  "",
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const LAYOUTS: Array<{
  name: ResumeLayout;
  kicker: string;
  description: string;
}> = [
  {
    name: "Skills First",
    kicker: "GREAT IF EXPERIENCE IS LIMITED",
    description:
      "Puts your strongest transferable skills right near the top.",
  },
  {
    name: "Balanced",
    kicker: "A LITTLE OF BOTH",
    description:
      "Balances skills, summary, and experience in a simple professional flow.",
  },
  {
    name: "Experience First",
    kicker: "GOOD IF YOU HAVE SOLID WORK ASSIGNMENTS",
    description:
      "Shows your strongest experience sooner while still keeping skills visible.",
  },
];

function createExperience(): ExperienceItem {
  return {
    organizationName: "",
    city: "",
    state: "",
    roleTitle: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
    description: "",
    bullets: [{ text: "" }, { text: "" }, { text: "" }],
  };
}

function createCredential(): CredentialItem {
  return {
    organizationName: "",
    credentialName: "",
    details: "",
    city: "",
    state: "",
    year: "",
  };
}

function formatDateRange(item: ExperienceItem) {
  const from = [item.startMonth, item.startYear].filter(Boolean).join(" ");
  const to = item.isPresent
    ? "Present"
    : [item.endMonth, item.endYear].filter(Boolean).join(" ");

  if (!from && !to) return "";
  if (from && !to) return from;
  if (!from && to) return to;
  return `${from} – ${to}`;
}

function normalizeSkills(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .map((item) => item.replace(/\b\w/g, (c) => c.toUpperCase()))
    )
  ).slice(0, SKILL_LIMIT);
}

function hasExperience(item: ExperienceItem) {
  return Boolean(
    item.organizationName ||
      item.roleTitle ||
      item.description ||
      item.city ||
      item.state ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent ||
      item.bullets.some((b) => b.text.trim())
  );
}

function hasCredential(item: CredentialItem) {
  return Boolean(
    item.organizationName ||
      item.credentialName ||
      item.details ||
      item.city ||
      item.state ||
      item.year
  );
}

function sectionOrder(layout: ResumeLayout) {
  if (layout === "Skills First") {
    return ["skills", "summary", "experience", "education"] as const;
  }

  if (layout === "Experience First") {
    return ["summary", "experience", "skills", "education"] as const;
  }

  return ["summary", "skills", "experience", "education"] as const;
}

export default function NewOpportunitiesResumeGeneratorPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [userId, setUserId] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const openTrackedRef = useRef(false);
  const resumePrintRef = useRef<HTMLDivElement>(null);

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [fontFamily, setFontFamily] = useState<ResumeFont>("Arial");
  const [layoutChoice, setLayoutChoice] =
    useState<ResumeLayout>("Skills First");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [targetRole, setTargetRole] = useState("");
  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    createExperience(),
  ]);

  const [credentials, setCredentials] = useState<CredentialItem[]>([
    createCredential(),
  ]);

  const [resumeContext, setResumeContext] = useState<ParsedResume | null>(null);
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumeUploadLoading, setResumeUploadLoading] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        setLoadingUser(false);
        return;
      }

      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("full_name, phone, city, state, email, linkedin_url, referral_code")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setReferralCode(profile?.referral_code || null);

      if (!draftLoaded) {
        setFullName(profile?.full_name || "");
        setPhone(profile?.phone || "");
        setCity(profile?.city || "");
        setStateName(profile?.state || "");
        setEmail(profile?.email || data.user.email || "");
        setLinkedinUrl(profile?.linkedin_url || "");
      }

      if (!openTrackedRef.current) {
        openTrackedRef.current = true;

        const { error: activityError } = await supabase
          .from("user_activity")
          .insert({
            user_id: data.user.id,
            full_name: profile?.full_name || null,
            email: profile?.email || data.user.email || null,
            referral_code: profile?.referral_code || null,
            event_type: "tool_opened",
            tool_name: "new_opportunities_resume_generator",
            page_name: "/career-toolkit/new-opportunities-resume-generator",
          });

        if (activityError) {
          console.error("New Opportunities tracking error:", activityError);
        }
      }

      setLoadingUser(false);
    }

    void loadUser();
  }, [draftLoaded]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);

      if (raw) {
        const draft = JSON.parse(raw);

        setFontFamily(draft.fontFamily || "Arial");
        setLayoutChoice(draft.layoutChoice || "Skills First");
        setFullName(draft.fullName || "");
        setPhone(draft.phone || "");
        setEmail(draft.email || "");
        setCity(draft.city || "");
        setStateName(draft.stateName || "");
        setLinkedinUrl(draft.linkedinUrl || "");
        setTargetRole(draft.targetRole || "");
        setSummaryText(draft.summaryText || "");
        setSkillsInput(draft.skillsInput || "");
        setResumeContext(draft.resumeContext || null);
        setResumeFileName(draft.resumeFileName || "");

        setExperiences(
          Array.isArray(draft.experiences) && draft.experiences.length
            ? draft.experiences.map((item: ExperienceItem) => ({
                ...createExperience(),
                ...item,
                bullets:
                  Array.isArray(item.bullets) && item.bullets.length
                    ? item.bullets
                    : createExperience().bullets,
              }))
            : [createExperience()]
        );

        setCredentials(
          Array.isArray(draft.credentials) && draft.credentials.length
            ? draft.credentials
            : [createCredential()]
        );
      }
    } catch {
      // Ignore bad draft.
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        fontFamily,
        layoutChoice,
        fullName,
        phone,
        email,
        city,
        stateName,
        linkedinUrl,
        targetRole,
        summaryText,
        skillsInput,
        experiences,
        credentials,
        resumeContext,
        resumeFileName,
      })
    );
  }, [
    draftLoaded,
    fontFamily,
    layoutChoice,
    fullName,
    phone,
    email,
    city,
    stateName,
    linkedinUrl,
    targetRole,
    summaryText,
    skillsInput,
    experiences,
    credentials,
    resumeContext,
    resumeFileName,
  ]);

  const skills = useMemo(() => normalizeSkills(skillsInput), [skillsInput]);
  const activeExperiences = useMemo(
    () => experiences.filter(hasExperience),
    [experiences]
  );
  const activeCredentials = useMemo(
    () => credentials.filter(hasCredential),
    [credentials]
  );
  const orderedSections = useMemo(
    () => sectionOrder(layoutChoice),
    [layoutChoice]
  );

  async function handleResumeUpload(file: File | null) {
    if (!file) return;

    const lowerName = file.name.toLowerCase();

    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
      setMessage("Please upload a PDF or DOCX resume.");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setMessage("Resume file must be 8 MB or smaller.");
      return;
    }

    try {
      setResumeUploadLoading(true);
      setMessage("");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/resume-parse", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to read this resume.");
      }

      const parsed = data?.parsedResume as ParsedResume | undefined;

      if (!parsed) {
        throw new Error("Resume uploaded, but no usable resume data was returned.");
      }

      setResumeContext(parsed);
      setResumeFileName(file.name);

      if (!fullName && parsed.fullName) setFullName(parsed.fullName);
      if (!phone && parsed.phone) setPhone(parsed.phone);
      if (!email && parsed.email) setEmail(parsed.email);
      if (!city && parsed.city) setCity(parsed.city);
      if (!stateName && parsed.stateName) setStateName(parsed.stateName);
      if (!linkedinUrl && parsed.linkedinUrl) setLinkedinUrl(parsed.linkedinUrl);
      if (!summaryText && parsed.summaryText) setSummaryText(parsed.summaryText);

      if (!skillsInput && Array.isArray(parsed.skills)) {
        setSkillsInput(parsed.skills.slice(0, SKILL_LIMIT).join(", "));
      }

      if (Array.isArray(parsed.experiences) && parsed.experiences.length) {
        setExperiences(
          parsed.experiences.slice(0, 5).map((item) => ({
            organizationName: item.companyName || "",
            city: item.city || "",
            state: item.state || "",
            roleTitle: item.roleTitle || "",
            startMonth: item.startMonth || "",
            startYear: item.startYear || "",
            endMonth: item.endMonth || "",
            endYear: item.endYear || "",
            isPresent: Boolean(item.isPresent),
            description: "",
            bullets:
              Array.isArray(item.bullets) && item.bullets.length
                ? item.bullets
                    .slice(0, BULLET_LIMIT)
                    .map((bullet) => ({ text: bullet.text || "" }))
                : createExperience().bullets,
          }))
        );
      }

      const importedCredentials: CredentialItem[] = [];

      if (Array.isArray(parsed.educationItems)) {
        parsed.educationItems.slice(0, 4).forEach((item) => {
          importedCredentials.push({
            ...createCredential(),
            organizationName: item.schoolName || "",
            credentialName: item.degree || "",
          });
        });
      }

      if (Array.isArray(parsed.certificateItems)) {
        parsed.certificateItems.slice(0, 4).forEach((item) => {
          importedCredentials.push({
            ...createCredential(),
            organizationName: item.organizationName || "",
            credentialName: item.certificateName || "",
          });
        });
      }

      if (importedCredentials.length) {
        setCredentials(importedCredentials);
      }

      setMessage(
        "Resume imported. Review what came in, then use the AI helpers to strengthen it."
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to read this resume."
      );
    } finally {
      setResumeUploadLoading(false);
    }
  }

  function updateExperience(
    index: number,
    field: keyof ExperienceItem,
    value: string | boolean
  ) {
    setExperiences((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  function updateExperienceBullet(
    index: number,
    bulletIndex: number,
    value: string
  ) {
    setExperiences((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          bullets: item.bullets.map((bullet, currentBulletIndex) =>
            currentBulletIndex === bulletIndex ? { text: value } : bullet
          ),
        };
      })
    );
  }

  function updateCredential(
    index: number,
    field: keyof CredentialItem,
    value: string
  ) {
    setCredentials((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  }

  async function callAi(action: string, extra: Record<string, unknown> = {}) {
    const response = await fetch("/api/new-opportunities-resume-ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        targetRole,
        summaryText,
        skillsInput,
        experiences,
        credentials,
        resumeContext,
        ...extra,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "AI help is unavailable right now.");
    }

    return data;
  }

  async function handleAnalyzeExperience(index: number) {
    const item = experiences[index];

    if (!item.roleTitle.trim() && !item.description.trim()) {
      setMessage("Add a title or describe what you did first.");
      return;
    }

    try {
      setAiLoading(`experience-${index}`);
      setMessage("");

      const data = await callAi("experience-helper", {
        roleTitle: item.roleTitle,
        organizationName: item.organizationName,
        description: item.description,
      });

      if (Array.isArray(data?.skills)) {
        const merged = Array.from(
          new Set([...skills, ...data.skills.map((x: unknown) => String(x))])
        ).slice(0, SKILL_LIMIT);

        setSkillsInput(merged.join(", "));
      }

      if (Array.isArray(data?.bullets)) {
        setExperiences((prev) =>
          prev.map((experience, itemIndex) =>
            itemIndex === index
              ? {
                  ...experience,
                  bullets: data.bullets
                    .slice(0, BULLET_LIMIT)
                    .map((bullet: unknown) => ({ text: String(bullet) })),
                }
              : experience
          )
        );
      }

      setMessage(
        "I found transferable skills and created resume bullets from what you described."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to analyze that experience right now."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSummary() {
    try {
      setAiLoading("summary");
      setMessage("");

      const data = await callAi("summary");

      if (!data?.summary) throw new Error("No summary was returned.");

      setSummaryText(String(data.summary));
      setMessage("Summary created. Review it and keep only what feels accurate.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create summary."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSkills() {
    try {
      setAiLoading("skills");
      setMessage("");

      const data = await callAi("skills");

      if (!Array.isArray(data?.skills)) {
        throw new Error("No skills were returned.");
      }

      setSkillsInput(data.skills.slice(0, SKILL_LIMIT).join(", "));
      setMessage("Skills identified from the experience you entered.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to identify skills."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setMessage("");

      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          fontFamily,
          layoutChoice,
          fullName,
          phone,
          email,
          city,
          stateName,
          linkedinUrl,
          targetRole,
          summaryText,
          skillsInput,
          experiences,
          credentials,
          resumeContext,
          resumeFileName,
        })
      );

      if (userId) {
        const { error: activityError } = await supabase
          .from("user_activity")
          .insert({
            user_id: userId,
            full_name: fullName || null,
            email: email || null,
            referral_code: referralCode,
            event_type: "draft_saved",
            tool_name: "new_opportunities_resume_generator",
            page_name: "/career-toolkit/new-opportunities-resume-generator",
          });

        if (activityError) {
          console.error("New Opportunities save tracking error:", activityError);
        }
      }

      setMessage("Resume draft saved locally in this browser.");
    } catch {
      setMessage("Unable to save your resume draft.");
    } finally {
      setSaving(false);
    }
  }

  function handlePrint() {
    const node = resumePrintRef.current;

    if (!node) {
      setMessage("Resume preview is not ready yet.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=900,height=1200");

    if (!printWindow) {
      setMessage("Pop-up blocked. Please allow pop-ups and try again.");
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${fullName || "Resume"}</title>
          <style>
            @page { size: letter; margin: 0.45in 0.5in; }
            * { box-sizing: border-box; }
            html, body {
              margin: 0;
              padding: 0;
              background: white;
              color: #111827;
              font-family: ${fontFamily}, Arial, sans-serif;
            }
            body {
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .resumePaper {
              width: 100%;
              margin: 0;
              padding: 0;
            }
            .resumeHeader {
              margin: 0 0 18px;
              padding: 0 0 11px;
              border-bottom: 2px solid #1677FF;
            }
            .resumeName {
              margin: 0 0 5px;
              font-size: 25px;
              font-weight: 800;
            }
            .resumeContact,
            .resumeLinkedin {
              margin: 2px 0;
              font-size: 10.5pt;
              line-height: 1.35;
              color: #475569;
            }
            .resumeLinkedin { color: #145fad; }
            .resumeSection { margin-bottom: 15px; }
            .resumeSectionTitle {
              margin: 0 0 7px;
              padding-bottom: 4px;
              border-bottom: 1px solid #CBD5E1;
              font-size: 11.5pt;
              font-weight: 800;
              letter-spacing: .03em;
            }
            .resumeParagraph {
              margin: 0;
              font-size: 10.5pt;
              line-height: 1.48;
            }
            .skillsGrid {
              display: grid;
              grid-template-columns: repeat(3,1fr);
              gap: 4px 16px;
            }
            .skillItem {
              margin: 0;
              font-size: 10.3pt;
              line-height: 1.35;
            }
            .resumeEntry {
              margin-bottom: 11px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .resumeEntryTop {
              display: flex;
              justify-content: space-between;
              gap: 15px;
              align-items: flex-start;
              margin-bottom: 4px;
            }
            .resumeEntryHeading {
              margin: 0;
              font-size: 10.7pt;
              font-weight: 800;
            }
            .resumeEntrySubheading {
              margin: 2px 0 0;
              font-size: 10.2pt;
              font-weight: 600;
              color: #475569;
            }
            .resumeEntryDates {
              margin: 0;
              font-size: 9.4pt;
              color: #64748B;
              white-space: nowrap;
            }
            .resumeBullet {
              margin: 3px 0 3px 16px;
              font-size: 10.2pt;
              line-height: 1.42;
            }
          </style>
        </head>
        <body>
          <div class="resumePaper">
            ${node.innerHTML}
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  function renderSection(section: string) {
    if (section === "summary") {
      if (!summaryText.trim()) return null;

      return (
        <section className="resumeSection" style={styles.resumeSection}>
          <h3 className="resumeSectionTitle" style={styles.resumeSectionTitle}>
            PROFESSIONAL SUMMARY
          </h3>
          <p className="resumeParagraph" style={styles.resumeParagraph}>
            {summaryText}
          </p>
        </section>
      );
    }

    if (section === "skills") {
      if (!skills.length) return null;

      return (
        <section className="resumeSection" style={styles.resumeSection}>
          <h3 className="resumeSectionTitle" style={styles.resumeSectionTitle}>
            CORE SKILLS
          </h3>
          <div className="skillsGrid" style={styles.skillsGrid}>
            {skills.map((skill) => (
              <p key={skill} className="skillItem" style={styles.skillItem}>
                • {skill}
              </p>
            ))}
          </div>
        </section>
      );
    }

    if (section === "experience") {
      if (!activeExperiences.length) return null;

      return (
        <section className="resumeSection" style={styles.resumeSection}>
          <h3 className="resumeSectionTitle" style={styles.resumeSectionTitle}>
            EXPERIENCE
          </h3>

          {activeExperiences.map((item, index) => (
            <div className="resumeEntry" style={styles.resumeEntry} key={index}>
              <div className="resumeEntryTop" style={styles.resumeEntryTop}>
                <div>
                  <p className="resumeEntryHeading" style={styles.resumeEntryHeading}>
                    {item.organizationName || "Work Assignment / Organization"}
                    {item.city || item.state
                      ? ` — ${[item.city, item.state].filter(Boolean).join(", ")}`
                      : ""}
                  </p>
                  <p
                    className="resumeEntrySubheading"
                    style={styles.resumeEntrySubheading}
                  >
                    {item.roleTitle || "Role / Assignment"}
                  </p>
                </div>

                <p className="resumeEntryDates" style={styles.resumeEntryDates}>
                  {formatDateRange(item)}
                </p>
              </div>

              {item.bullets
                .filter((bullet) => bullet.text.trim())
                .map((bullet, bulletIndex) => (
                  <p
                    key={bulletIndex}
                    className="resumeBullet"
                    style={styles.resumeBullet}
                  >
                    • {bullet.text}
                  </p>
                ))}
            </div>
          ))}
        </section>
      );
    }

    if (section === "education") {
      if (!activeCredentials.length) return null;

      return (
        <section className="resumeSection" style={styles.resumeSection}>
          <h3 className="resumeSectionTitle" style={styles.resumeSectionTitle}>
            EDUCATION + TRAINING
          </h3>

          {activeCredentials.map((item, index) => (
            <div className="resumeEntry" style={styles.resumeEntry} key={index}>
              <div className="resumeEntryTop" style={styles.resumeEntryTop}>
                <div>
                  <p className="resumeEntryHeading" style={styles.resumeEntryHeading}>
                    {item.organizationName || "School / Program"}
                    {item.city || item.state
                      ? ` — ${[item.city, item.state].filter(Boolean).join(", ")}`
                      : ""}
                  </p>
                  <p
                    className="resumeEntrySubheading"
                    style={styles.resumeEntrySubheading}
                  >
                    {[item.credentialName, item.details].filter(Boolean).join(" | ")}
                  </p>
                </div>

                {item.year ? (
                  <p className="resumeEntryDates" style={styles.resumeEntryDates}>
                    {item.year}
                  </p>
                ) : null}
              </div>
            </div>
          ))}
        </section>
      );
    }

    return null;
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Loading your resume builder...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media (max-width: 1120px) {
          .reentry-layout {
            grid-template-columns: 1fr !important;
          }

          .reentry-preview {
            position: static !important;
          }
        }

        @media (max-width: 720px) {
          .reentry-page {
            padding: 16px 12px 44px !important;
          }

          .reentry-two-col,
          .reentry-layout-choices,
          .reentry-actions {
            grid-template-columns: 1fr !important;
          }

          .reentry-hero {
            grid-template-columns: 1fr !important;
          }

          .reentry-builder-row {
            flex-direction: column !important;
            align-items: flex-start !important;
          }
        }
      `}</style>

      <div className="reentry-page" style={styles.pageInner}>
        <section className="reentry-hero" style={styles.hero}>
          <div>
            <p style={styles.heroKicker}>REENTRY / SECOND CHANCE RESUME BUILDER</p>
            <h1 style={styles.heroTitle}>
              Start with what you’ve done.
              <span style={styles.heroAccent}> We’ll help turn it into a resume.</span>
            </h1>
            <p style={styles.heroText}>
              You do not need a long work history. Work assignments, kitchen work,
              cleaning, maintenance, laundry, training, programs, volunteer work,
              and other real responsibilities can all help show what you know how to do.
            </p>
          </div>

          <div style={styles.heroBubble}>
            <span style={styles.heroBubbleSmall}>HOW IT WORKS</span>
            <strong>Describe it → Find the skill → Build the bullet</strong>
          </div>
        </section>

        <div className="reentry-layout" style={styles.layout}>
          <div>
            <section style={styles.panel}>
              <div className="reentry-builder-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>START HERE</p>
                  <h2 style={styles.sectionTitle}>Already have a resume?</h2>
                  <p style={styles.sectionCopy}>
                    Upload it and we’ll pull in what is already there. You can clean it up
                    instead of starting over.
                  </p>
                </div>

                <div style={styles.uploadActions}>
                  <label
                    style={{
                      ...styles.uploadButton,
                      ...(resumeUploadLoading ? styles.disabled : {}),
                    }}
                  >
                    {resumeUploadLoading
                      ? "Reading Resume..."
                      : resumeContext
                        ? "Replace Resume"
                        : "Upload Resume"}
                    <input
                      type="file"
                      accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      disabled={resumeUploadLoading}
                      onChange={(event) => {
                        const file = event.target.files?.[0] || null;
                        void handleResumeUpload(file);
                        event.currentTarget.value = "";
                      }}
                      style={{ display: "none" }}
                    />
                  </label>

                  {resumeContext ? (
                    <button
                      type="button"
                      onClick={() => {
                        setResumeContext(null);
                        setResumeFileName("");
                      }}
                      style={styles.smallGhostButton}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {resumeFileName ? (
                <div style={styles.uploadSuccess}>
                  <span>✓</span>
                  <strong>{resumeFileName}</strong>
                  <span>imported</span>
                </div>
              ) : null}
            </section>

            <section style={styles.panel}>
              <p style={styles.stepLabel}>CHOOSE YOUR RESUME STYLE</p>
              <h2 style={styles.sectionTitle}>Pick one. No moving sections around.</h2>

              <div className="reentry-layout-choices" style={styles.layoutChoices}>
                {LAYOUTS.map((item) => {
                  const selected = layoutChoice === item.name;

                  return (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setLayoutChoice(item.name)}
                      style={{
                        ...styles.layoutCard,
                        ...(selected ? styles.layoutCardSelected : {}),
                      }}
                    >
                      <span style={styles.layoutKicker}>{item.kicker}</span>
                      <strong style={styles.layoutTitle}>{item.name}</strong>
                      <span style={styles.layoutCopy}>{item.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={styles.panel}>
              <div className="reentry-builder-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>YOUR GOAL</p>
                  <h2 style={styles.sectionTitle}>What kind of job are you trying to get?</h2>
                  <p style={styles.sectionCopy}>
                    This helps HireMinds choose better wording and transferable skills.
                  </p>
                </div>

                <div style={styles.fontControl}>
                  <span style={styles.smallLabel}>Resume Font</span>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as ResumeFont)}
                    style={styles.select}
                  >
                    <option>Arial</option>
                    <option>Calibri</option>
                    <option>Times New Roman</option>
                  </select>
                </div>
              </div>

              <Field
                label="Target Job"
                value={targetRole}
                onChange={setTargetRole}
                placeholder="Example: Warehouse Associate, Food Service, Maintenance, Customer Service"
              />
            </section>

            <section style={styles.panel}>
              <p style={styles.stepLabel}>YOUR INFORMATION</p>
              <h2 style={styles.sectionTitle}>Resume header</h2>

              <div className="reentry-two-col" style={styles.twoCol}>
                <Field label="Full Name" value={fullName} onChange={setFullName} />
                <Field label="Phone" value={phone} onChange={setPhone} />
                <Field label="Email" value={email} onChange={setEmail} />
                <Field label="City" value={city} onChange={setCity} />
                <Field label="State" value={stateName} onChange={setStateName} />
                <Field
                  label="LinkedIn (optional)"
                  value={linkedinUrl}
                  onChange={setLinkedinUrl}
                />
              </div>
            </section>

            <section style={styles.panel}>
              <div className="reentry-builder-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>PROFESSIONAL SUMMARY</p>
                  <h2 style={styles.sectionTitle}>We can help write this part.</h2>
                  <p style={styles.sectionCopy}>
                    The summary should focus on what you can offer now — not your past.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSummary}
                  disabled={aiLoading !== null}
                  style={styles.aiButton}
                >
                  {aiLoading === "summary"
                    ? "Writing..."
                    : summaryText.trim()
                      ? "✦ Strengthen My Summary"
                      : "✦ Help Write My Summary"}
                </button>
              </div>

              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="Leave this blank and use the AI button if you want help."
                style={styles.textarea}
              />
            </section>

            <section style={styles.panel}>
              <div className="reentry-builder-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>SKILLS</p>
                  <h2 style={styles.sectionTitle}>Not sure what your skills are?</h2>
                  <p style={styles.sectionCopy}>
                    That’s okay. Describe what you did in the experience section below,
                    then HireMinds can identify the skills you built from it.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSkills}
                  disabled={aiLoading !== null}
                  style={styles.aiButton}
                >
                  {aiLoading === "skills"
                    ? "Finding..."
                    : "✦ Find Skills From My Experience"}
                </button>
              </div>

              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Communication, Food Preparation, Cleaning, Teamwork..."
                style={styles.input}
              />

              {skills.length ? (
                <div style={styles.skillChips}>
                  {skills.map((skill) => (
                    <span key={skill} style={styles.skillChip}>
                      {skill}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>

            <section style={styles.panel}>
              <p style={styles.stepLabel}>EXPERIENCE</p>
              <h2 style={styles.sectionTitle}>Tell us what you did. Keep it simple.</h2>
              <p style={styles.sectionCopy}>
                This can be a regular job or work you did while incarcerated. Use the
                real title and setting you are comfortable documenting. HireMinds will
                help translate the duties into professional resume language without
                inventing anything.
              </p>

              {experiences.map((item, index) => (
                <div style={styles.experienceCard} key={index}>
                  <div className="reentry-two-col" style={styles.twoCol}>
                    <Field
                      label="Role / Job / Assignment Title"
                      value={item.roleTitle}
                      onChange={(value) =>
                        updateExperience(index, "roleTitle", value)
                      }
                      placeholder="Example: Kitchen Worker, Porter, Laundry Worker, Maintenance"
                    />

                    <Field
                      label="Organization / Work Setting"
                      value={item.organizationName}
                      onChange={(value) =>
                        updateExperience(index, "organizationName", value)
                      }
                      placeholder="Example: Institutional Food Service or employer name"
                    />

                    <Field
                      label="City"
                      value={item.city}
                      onChange={(value) => updateExperience(index, "city", value)}
                    />

                    <Field
                      label="State"
                      value={item.state}
                      onChange={(value) => updateExperience(index, "state", value)}
                    />
                  </div>

                  <div className="reentry-two-col" style={styles.twoCol}>
                    <DateFields
                      prefix="From"
                      month={item.startMonth}
                      year={item.startYear}
                      onMonth={(value) =>
                        updateExperience(index, "startMonth", value)
                      }
                      onYear={(value) =>
                        updateExperience(index, "startYear", value)
                      }
                    />

                    <div>
                      <label style={styles.checkboxLabel}>
                        <input
                          type="checkbox"
                          checked={item.isPresent}
                          onChange={(e) =>
                            updateExperience(index, "isPresent", e.target.checked)
                          }
                        />
                        <span>I currently do this</span>
                      </label>

                      {!item.isPresent ? (
                        <DateFields
                          prefix="To"
                          month={item.endMonth}
                          year={item.endYear}
                          onMonth={(value) =>
                            updateExperience(index, "endMonth", value)
                          }
                          onYear={(value) =>
                            updateExperience(index, "endYear", value)
                          }
                        />
                      ) : null}
                    </div>
                  </div>

                  <div style={styles.describeBox}>
                    <div>
                      <span style={styles.describeKicker}>TELL ME WHAT YOU DID</span>
                      <strong style={styles.describeTitle}>
                        Describe your work in your own words.
                      </strong>
                      <p style={styles.describeCopy}>
                        Example: “I prepared trays, cleaned the kitchen, counted supplies,
                        followed sanitation rules, and helped newer workers learn the routine.”
                      </p>
                    </div>

                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                      placeholder="Just tell me what you did. It does not have to sound professional."
                      style={{ ...styles.textarea, minHeight: "120px" }}
                    />

                    <button
                      type="button"
                      onClick={() => handleAnalyzeExperience(index)}
                      disabled={aiLoading !== null}
                      style={styles.bigFunButton}
                    >
                      {aiLoading === `experience-${index}`
                        ? "Finding your skills..."
                        : "✦ Tell Me What Skills I Gained + Build My Bullets"}
                    </button>
                  </div>

                  <div style={styles.bulletSection}>
                    <span style={styles.smallLabel}>Resume bullet points</span>

                    {item.bullets.map((bullet, bulletIndex) => (
                      <input
                        key={bulletIndex}
                        value={bullet.text}
                        onChange={(e) =>
                          updateExperienceBullet(index, bulletIndex, e.target.value)
                        }
                        placeholder={`Bullet ${bulletIndex + 1}`}
                        style={styles.input}
                      />
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setExperiences((prev) => [...prev, createExperience()])
                }
                style={styles.addButton}
              >
                + Add Another Experience
              </button>
            </section>

            <section style={styles.panel}>
              <p style={styles.stepLabel}>EDUCATION + TRAINING</p>
              <h2 style={styles.sectionTitle}>Add what you have.</h2>
              <p style={styles.sectionCopy}>
                GED, high school, college, OSHA, ServSafe, vocational training,
                workforce programs, certificates, classes, and other completed training can go here.
              </p>

              {credentials.map((item, index) => (
                <div style={styles.educationCard} key={index}>
                  <div className="reentry-two-col" style={styles.twoCol}>
                    <Field
                      label="School / Program / Organization"
                      value={item.organizationName}
                      onChange={(value) =>
                        updateCredential(index, "organizationName", value)
                      }
                    />
                    <Field
                      label="Credential / Training"
                      value={item.credentialName}
                      onChange={(value) =>
                        updateCredential(index, "credentialName", value)
                      }
                      placeholder="GED, OSHA 10, Culinary Training..."
                    />
                    <Field
                      label="City"
                      value={item.city}
                      onChange={(value) =>
                        updateCredential(index, "city", value)
                      }
                    />
                    <Field
                      label="State"
                      value={item.state}
                      onChange={(value) =>
                        updateCredential(index, "state", value)
                      }
                    />
                    <Field
                      label="Year"
                      value={item.year}
                      onChange={(value) =>
                        updateCredential(index, "year", value)
                      }
                      placeholder="2026"
                    />
                    <Field
                      label="Details (optional)"
                      value={item.details}
                      onChange={(value) =>
                        updateCredential(index, "details", value)
                      }
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCredentials((prev) => [...prev, createCredential()])
                }
                style={styles.addButton}
              >
                + Add Education / Training
              </button>
            </section>

            {message ? <div style={styles.message}>{message}</div> : null}

            <div className="reentry-actions" style={styles.actions}>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                style={styles.primaryButton}
              >
                {saving ? "Saving..." : "Save Draft"}
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={styles.printButton}
              >
                Print / Save PDF
              </button>

              <a href="/career-toolkit" style={styles.backButton}>
                Back to Career ToolKit
              </a>
            </div>
          </div>

          <aside className="reentry-preview" style={styles.previewColumn}>
            <div style={styles.previewTop}>
              <div>
                <span style={styles.previewKicker}>LIVE PREVIEW</span>
                <strong style={styles.previewTitle}>{layoutChoice}</strong>
              </div>
              <span style={styles.previewPill}>Second Chance Ready</span>
            </div>

            <div
              ref={resumePrintRef}
              className="resumePaper"
              style={{ ...styles.resumePaper, fontFamily }}
            >
              <header className="resumeHeader" style={styles.resumeHeader}>
                <h1 className="resumeName" style={styles.resumeName}>
                  {fullName || "Your Name"}
                </h1>

                <p className="resumeContact" style={styles.resumeContact}>
                  {[phone, email, [city, stateName].filter(Boolean).join(", ")]
                    .filter(Boolean)
                    .join(" • ") || "Phone • Email • City, State"}
                </p>

                {linkedinUrl ? (
                  <p className="resumeLinkedin" style={styles.resumeLinkedin}>
                    {linkedinUrl}
                  </p>
                ) : null}
              </header>

              {orderedSections.map((section) => (
                <div key={section}>{renderSection(section)}</div>
              ))}

              {!summaryText.trim() &&
              !skills.length &&
              !activeExperiences.length &&
              !activeCredentials.length ? (
                <div style={styles.emptyPreview}>
                  <span>YOU’RE NOT STARTING FROM NOTHING.</span>
                  <strong>Your resume will build here.</strong>
                  <p>Start by adding one thing you know how to do.</p>
                </div>
              ) : null}
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Field({
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
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

function DateFields({
  prefix,
  month,
  year,
  onMonth,
  onYear,
}: {
  prefix: string;
  month: string;
  year: string;
  onMonth: (value: string) => void;
  onYear: (value: string) => void;
}) {
  return (
    <div style={styles.dateRow}>
      <div>
        <span style={styles.smallLabel}>{prefix} Month</span>
        <select
          value={month}
          onChange={(e) => onMonth(e.target.value)}
          style={styles.select}
        >
          {MONTHS.map((item) => (
            <option key={item} value={item}>
              {item || "Month"}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span style={styles.smallLabel}>{prefix} Year</span>
        <input
          value={year}
          onChange={(e) => onYear(e.target.value)}
          placeholder="2024"
          style={styles.input}
        />
      </div>
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 8% 0%, rgba(22,119,255,.10), transparent 24%), linear-gradient(180deg, #EAF2F9 0%, #F6F8FB 54%, #EAF1F7 100%)",
    color: "#102238",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  pageInner: {
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "26px 22px 56px",
  },

  loading: {
    minHeight: "70vh",
    display: "grid",
    placeItems: "center",
    color: "#4D6480",
  },

  hero: {
    marginBottom: "22px",
    padding: "34px",
    borderRadius: "24px",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 320px",
    gap: "28px",
    alignItems: "center",
    background:
      "linear-gradient(120deg, #FFFFFF 0%, #F4F9FF 68%, #E5F1FF 100%)",
    border: "1px solid #D5E2EF",
    boxShadow: "0 18px 40px rgba(44,79,115,.09)",
  },

  heroKicker: {
    margin: "0 0 10px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".15em",
  },

  heroTitle: {
    margin: "0 0 12px",
    maxWidth: "850px",
    color: "#102238",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(42px,5vw,68px)",
    lineHeight: .98,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  heroAccent: {
    color: "#1677FF",
  },

  heroText: {
    margin: 0,
    maxWidth: "860px",
    color: "#61758D",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  heroBubble: {
    padding: "22px",
    borderRadius: "22px",
    background: "#1677FF",
    color: "#FFFFFF",
    boxShadow: "0 16px 32px rgba(22,119,255,.16)",
  },

  heroBubbleSmall: {
    display: "block",
    marginBottom: "7px",
    color: "#D7ECFF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 520px",
    gap: "22px",
    alignItems: "start",
  },

  panel: {
    marginBottom: "14px",
    padding: "22px",
    borderRadius: "18px",
    border: "1px solid #D7E1EB",
    background: "rgba(255,255,255,.84)",
    boxShadow: "0 12px 28px rgba(39,73,105,.05)",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "18px",
    marginBottom: "16px",
  },

  stepLabel: {
    margin: "0 0 6px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".13em",
  },

  sectionTitle: {
    margin: "0 0 6px",
    color: "#102238",
    fontSize: "23px",
    lineHeight: 1.14,
    letterSpacing: "-.025em",
  },

  sectionCopy: {
    margin: 0,
    maxWidth: "720px",
    color: "#687C92",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  uploadActions: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },

  uploadButton: {
    minHeight: "38px",
    padding: "0 13px",
    borderRadius: "999px",
    background: "#1677FF",
    color: "#FFFFFF",
    display: "inline-flex",
    alignItems: "center",
    fontSize: "10px",
    fontWeight: 900,
    cursor: "pointer",
  },

  smallGhostButton: {
    minHeight: "38px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid #C8D5E3",
    background: "#FFFFFF",
    color: "#5B7188",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  uploadSuccess: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "11px 13px",
    borderRadius: "11px",
    background: "#EEF7FF",
    color: "#315B87",
    fontSize: "10px",
  },

  layoutChoices: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "10px",
    marginTop: "15px",
  },

  layoutCard: {
    minHeight: "128px",
    padding: "15px",
    borderRadius: "14px",
    border: "1px solid #D6E1EB",
    background: "#FAFCFE",
    textAlign: "left",
    cursor: "pointer",
  },

  layoutCardSelected: {
    borderColor: "#1677FF",
    background: "linear-gradient(145deg, #EDF6FF, #E4F1FF)",
    boxShadow: "0 0 0 3px rgba(22,119,255,.07)",
  },

  layoutKicker: {
    display: "block",
    marginBottom: "8px",
    color: "#1677FF",
    fontSize: "7.5px",
    fontWeight: 900,
    letterSpacing: ".08em",
  },

  layoutTitle: {
    display: "block",
    marginBottom: "6px",
    color: "#16304B",
    fontSize: "14px",
  },

  layoutCopy: {
    display: "block",
    color: "#6D8196",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  fontControl: {
    minWidth: "160px",
  },

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
    marginBottom: "6px",
    color: "#405A74",
    fontSize: "11px",
    fontWeight: 750,
  },

  smallLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#70849A",
    fontSize: "9px",
    fontWeight: 750,
  },

  input: {
    width: "100%",
    minHeight: "43px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid #C9D7E5",
    background: "#FBFDFF",
    color: "#17304A",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    minHeight: "43px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid #C9D7E5",
    background: "#FFFFFF",
    color: "#17304A",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "105px",
    padding: "11px 12px",
    borderRadius: "10px",
    border: "1px solid #C9D7E5",
    background: "#FBFDFF",
    color: "#17304A",
    fontSize: "12px",
    lineHeight: 1.55,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },

  aiButton: {
    minHeight: "36px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid rgba(22,119,255,.24)",
    background: "#EEF6FF",
    color: "#145FAD",
    fontSize: "9px",
    fontWeight: 900,
    cursor: "pointer",
  },

  describeBox: {
    marginTop: "8px",
    padding: "16px",
    borderRadius: "15px",
    border: "1px solid #BFD7EF",
    background:
      "linear-gradient(145deg, #F5FAFF 0%, #ECF6FF 100%)",
  },

  describeKicker: {
    display: "block",
    marginBottom: "5px",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".10em",
  },

  describeTitle: {
    display: "block",
    marginBottom: "5px",
    color: "#16304B",
    fontSize: "14px",
  },

  describeCopy: {
    margin: "0 0 12px",
    color: "#6A7E94",
    fontSize: "10px",
    lineHeight: 1.55,
  },

  bigFunButton: {
    width: "100%",
    minHeight: "43px",
    marginTop: "9px",
    borderRadius: "11px",
    border: "1px solid #1677FF",
    background:
      "linear-gradient(120deg, #1677FF 0%, #3C95FF 100%)",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 10px 20px rgba(22,119,255,.12)",
  },

  skillChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "10px",
  },

  skillChip: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "#EAF4FF",
    border: "1px solid #C7DFF8",
    color: "#245E96",
    fontSize: "9px",
    fontWeight: 750,
  },

  experienceCard: {
    marginTop: "15px",
    padding: "16px",
    borderRadius: "15px",
    border: "1px solid #D7E1EB",
    background: "#FCFDFE",
  },

  educationCard: {
    marginTop: "13px",
    padding: "14px",
    borderRadius: "13px",
    border: "1px solid #DCE5EE",
    background: "#FAFCFE",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "21px 0 9px",
    color: "#657A90",
    fontSize: "10px",
  },

  dateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  bulletSection: {
    display: "grid",
    gap: "7px",
    marginTop: "12px",
  },

  addButton: {
    minHeight: "38px",
    marginTop: "12px",
    padding: "0 12px",
    borderRadius: "10px",
    border: "1px solid #BFCFDE",
    background: "#FFFFFF",
    color: "#365B80",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  disabled: {
    opacity: .55,
    cursor: "not-allowed",
  },

  message: {
    marginBottom: "13px",
    padding: "12px 14px",
    borderRadius: "11px",
    border: "1px solid #C4DCF4",
    background: "#EEF7FF",
    color: "#315E8B",
    fontSize: "10.5px",
    lineHeight: 1.55,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "9px",
    marginBottom: "28px",
  },

  primaryButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  printButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid #274F78",
    background: "#163B61",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  backButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid #CAD6E2",
    background: "#FFFFFF",
    color: "#41617F",
    textDecoration: "none",
    display: "grid",
    placeItems: "center",
    fontSize: "11px",
    fontWeight: 800,
  },

  previewColumn: {
    position: "sticky",
    top: "18px",
  },

  previewTop: {
    marginBottom: "9px",
    padding: "12px 14px",
    borderRadius: "12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "12px",
    background: "#FFFFFF",
    border: "1px solid #D3DFEA",
    boxShadow: "0 10px 22px rgba(50,78,105,.06)",
  },

  previewKicker: {
    display: "block",
    marginBottom: "3px",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  previewTitle: {
    color: "#16304B",
    fontSize: "13px",
  },

  previewPill: {
    padding: "6px 8px",
    borderRadius: "999px",
    background: "#EAF4FF",
    color: "#245E96",
    fontSize: "8px",
    fontWeight: 800,
  },

  resumePaper: {
    width: "100%",
    minHeight: "880px",
    padding: "38px 38px 44px",
    borderRadius: "7px",
    border: "1px solid #D5DEE8",
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 22px 55px rgba(38,70,101,.12)",
    boxSizing: "border-box",
  },

  resumeHeader: {
    marginBottom: "18px",
    paddingBottom: "11px",
    borderBottom: "2px solid #1677FF",
  },

  resumeName: {
    margin: "0 0 5px",
    color: "#0F172A",
    fontSize: "27px",
    lineHeight: 1.08,
    fontWeight: 850,
  },

  resumeContact: {
    margin: "0 0 3px",
    color: "#475569",
    fontSize: "10px",
    lineHeight: 1.4,
  },

  resumeLinkedin: {
    margin: 0,
    color: "#145FAD",
    fontSize: "10px",
    lineHeight: 1.4,
  },

  resumeSection: {
    marginBottom: "15px",
  },

  resumeSectionTitle: {
    margin: "0 0 7px",
    paddingBottom: "4px",
    borderBottom: "1px solid #CBD5E1",
    color: "#0F172A",
    fontSize: "11px",
    lineHeight: 1.2,
    fontWeight: 850,
    letterSpacing: ".04em",
  },

  resumeParagraph: {
    margin: 0,
    color: "#273548",
    fontSize: "10px",
    lineHeight: 1.5,
    whiteSpace: "pre-wrap",
  },

  skillsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3,1fr)",
    gap: "5px 12px",
  },

  skillItem: {
    margin: 0,
    color: "#273548",
    fontSize: "9.5px",
    lineHeight: 1.35,
  },

  resumeEntry: {
    marginBottom: "11px",
  },

  resumeEntryTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "14px",
    alignItems: "flex-start",
    marginBottom: "4px",
  },

  resumeEntryHeading: {
    margin: 0,
    color: "#111827",
    fontSize: "10px",
    fontWeight: 850,
  },

  resumeEntrySubheading: {
    margin: "2px 0 0",
    color: "#475569",
    fontSize: "9.5px",
    fontWeight: 650,
  },

  resumeEntryDates: {
    margin: 0,
    color: "#64748B",
    fontSize: "9px",
    whiteSpace: "nowrap",
  },

  resumeBullet: {
    margin: "3px 0 3px 13px",
    color: "#273548",
    fontSize: "9.5px",
    lineHeight: 1.42,
  },

  emptyPreview: {
    marginTop: "80px",
    textAlign: "center",
    color: "#70849A",
  },
};
