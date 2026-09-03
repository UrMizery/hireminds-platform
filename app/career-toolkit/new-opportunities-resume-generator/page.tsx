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

const STORAGE_KEY = "hireminds-reentry-resume-draft-v4";
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
  description: string;
}> = [
  {
    name: "Skills First",
    description: "Best when your transferable skills are stronger than your work history.",
  },
  {
    name: "Balanced",
    description: "A simple mix of summary, skills, and experience.",
  },
  {
    name: "Experience First",
    description: "Best when you have work assignments or jobs you want employers to see first.",
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
    bullets: [
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
      { text: "" },
    ],
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

function buildSectionOrder(layout: ResumeLayout) {
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
                bullets: [
                  ...(Array.isArray(item.bullets) ? item.bullets : []),
                  ...createExperience().bullets,
                ].slice(0, BULLET_LIMIT),
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
    () => buildSectionOrder(layoutChoice),
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
          parsed.experiences.slice(0, 5).map((item) => {
            const importedBullets =
              Array.isArray(item.bullets) && item.bullets.length
                ? item.bullets
                    .slice(0, BULLET_LIMIT)
                    .map((bullet) => ({ text: bullet.text || "" }))
                : [];

            return {
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
              bullets: [
                ...importedBullets,
                ...createExperience().bullets,
              ].slice(0, BULLET_LIMIT),
            };
          })
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
        "Resume imported. Review it, then use the AI helpers only where you need them."
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
      setMessage("Add a title or tell us what you did first.");
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
                  bullets: [
                    ...data.bullets
                      .slice(0, BULLET_LIMIT)
                      .map((bullet: unknown) => ({ text: String(bullet) })),
                    ...createExperience().bullets,
                  ].slice(0, BULLET_LIMIT),
                }
              : experience
          )
        );
      }

      setMessage(
        "Done. I added supported skills and built resume bullets from what you described."
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

  async function handleSummary() {
    try {
      setAiLoading("summary");
      setMessage("");

      const data = await callAi("summary");

      if (!data?.summary) throw new Error("No summary was returned.");

      setSummaryText(String(data.summary));
      setMessage("Summary created. Review it and edit anything you want.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to create summary."
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
        <div style={styles.centerWrap}>Loading your resume builder...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        html { scroll-behavior: smooth; }

        @media (max-width: 1120px) {
          .reentry-layout {
            grid-template-columns: 1fr !important;
          }

          .reentry-preview {
            position: static !important;
            max-height: none !important;
          }
        }

        @media (max-width: 720px) {
          .reentry-page {
            padding: 20px 14px 44px !important;
          }

          .reentry-two-col,
          .reentry-layout-choices,
          .reentry-actions {
            grid-template-columns: 1fr !important;
          }

          .reentry-topbar {
            align-items: flex-start !important;
          }

          .reentry-section-heading {
            flex-direction: column !important;
            align-items: flex-start !important;
          }

          .reentry-bullet-row {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div className="reentry-page" style={styles.container}>
        <div className="reentry-topbar" style={styles.topBar}>
          <div>
            <p style={styles.kicker}>REENTRY / SECOND CHANCE RESUME GENERATOR</p>
            <h1 style={styles.pageTitle}>
              Build your resume one simple section at a time.
            </h1>
            <p style={styles.pageIntro}>
              No moving sections. No complicated setup. Add what you know, describe what
              you did, and use AI only when you want help.
            </p>
          </div>

          <a href="/career-toolkit" style={styles.backTop}>
            ← Career ToolKit
          </a>
        </div>

        <nav style={styles.stepNav}>
          <a href="#start" style={styles.stepLink}>Start</a>
          <a href="#experience" style={styles.stepLink}>Experience</a>
          <a href="#skills" style={styles.stepLink}>Skills</a>
          <a href="#summary" style={styles.stepLink}>Summary</a>
          <a href="#education" style={styles.stepLink}>Education</a>
        </nav>

        <div className="reentry-layout" style={styles.layout}>
          <div style={styles.leftCol}>
            <section id="start" style={styles.card}>
              <div className="reentry-section-heading" style={styles.sectionHeading}>
                <div>
                  <p style={styles.cardKicker}>START</p>
                  <h2 style={styles.cardTitle}>Start fresh or upload what you already have</h2>
                  <p style={styles.previewHelp}>
                    If you already have a resume, upload the PDF or DOCX. HireMinds will
                    pull in the information so you can improve it instead of starting over.
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
                      ? "Reading..."
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
                      style={styles.smallButton}
                    >
                      Remove
                    </button>
                  ) : null}
                </div>
              </div>

              {resumeFileName ? (
                <p style={styles.importedText}>✓ Imported: {resumeFileName}</p>
              ) : null}

              <div style={styles.sectionGroup}>
                <p style={styles.cardKicker}>CHOOSE YOUR RESUME STYLE</p>
                <div className="reentry-layout-choices" style={styles.layoutChoices}>
                  {LAYOUTS.map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setLayoutChoice(item.name)}
                      style={{
                        ...styles.layoutCard,
                        ...(layoutChoice === item.name
                          ? styles.layoutCardSelected
                          : {}),
                      }}
                    >
                      <strong style={styles.layoutName}>{item.name}</strong>
                      <span style={styles.layoutDescription}>{item.description}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div style={styles.sectionGroup}>
                <div className="reentry-two-col" style={styles.twoColForm}>
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
                  />
                  <Field
                    label="Target Job"
                    value={targetRole}
                    onChange={setTargetRole}
                    placeholder="Warehouse Associate, Food Service, Maintenance..."
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
                  <Field
                    label="LinkedIn (optional)"
                    value={linkedinUrl}
                    onChange={setLinkedinUrl}
                  />

                  <div>
                    <label style={styles.inputLabel}>Resume Font</label>
                    <select
                      value={fontFamily}
                      onChange={(e) =>
                        setFontFamily(e.target.value as ResumeFont)
                      }
                      style={styles.select}
                    >
                      <option>Arial</option>
                      <option>Calibri</option>
                      <option>Times New Roman</option>
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section id="experience" style={styles.card}>
              <p style={styles.cardKicker}>EXPERIENCE</p>
              <h2 style={styles.cardTitle}>Tell us what you did. We’ll help with the resume words.</h2>
              <p style={styles.previewHelp}>
                This can be a regular job or a work assignment while incarcerated.
                Type the real title and describe the work in everyday language.
              </p>

              {experiences.map((item, index) => (
                <div key={index} style={styles.experienceGroup}>
                  <div className="reentry-two-col" style={styles.twoColForm}>
                    <Field
                      label="Role / Assignment Title"
                      value={item.roleTitle}
                      onChange={(value) =>
                        updateExperience(index, "roleTitle", value)
                      }
                      placeholder="Kitchen Worker, Porter, Laundry Worker, Maintenance..."
                    />

                    <Field
                      label="Organization / Work Setting"
                      value={item.organizationName}
                      onChange={(value) =>
                        updateExperience(index, "organizationName", value)
                      }
                      placeholder="Employer or institutional work setting"
                    />

                    <Field
                      label="City"
                      value={item.city}
                      onChange={(value) =>
                        updateExperience(index, "city", value)
                      }
                    />

                    <Field
                      label="State"
                      value={item.state}
                      onChange={(value) =>
                        updateExperience(index, "state", value)
                      }
                    />
                  </div>

                  <div className="reentry-two-col" style={styles.twoColForm}>
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
                      <label style={styles.checkboxRow}>
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

                  <div style={styles.aiDescribeBox}>
                    <div>
                      <p style={styles.aiMiniKicker}>AI SKILL + BULLET HELPER</p>
                      <h3 style={styles.aiDescribeTitle}>Describe what you did</h3>
                      <p style={styles.helper}>
                        Example: prepared trays, cleaned kitchen areas, counted supplies,
                        followed sanitation rules, helped newer workers learn the routine.
                      </p>
                    </div>

                    <textarea
                      value={item.description}
                      onChange={(e) =>
                        updateExperience(index, "description", e.target.value)
                      }
                      placeholder="Just explain the work in your own words..."
                      style={styles.textarea}
                    />

                    <button
                      type="button"
                      onClick={() => handleAnalyzeExperience(index)}
                      disabled={aiLoading !== null}
                      style={styles.aiPrimaryButton}
                    >
                      {aiLoading === `experience-${index}`
                        ? "Working..."
                        : "✦ Find My Skills + Build My Bullets"}
                    </button>
                  </div>

                  <div style={styles.bulletBlock}>
                    <div style={styles.bulletHeading}>
                      <strong>Resume Bullet Points</strong>
                      <span>Up to 5</span>
                    </div>

                    {item.bullets.map((bullet, bulletIndex) => (
                      <div
                        className="reentry-bullet-row"
                        style={styles.bulletRow}
                        key={bulletIndex}
                      >
                        <span style={styles.bulletNumber}>{bulletIndex + 1}</span>
                        <input
                          value={bullet.text}
                          onChange={(e) =>
                            updateExperienceBullet(
                              index,
                              bulletIndex,
                              e.target.value
                            )
                          }
                          placeholder="Resume bullet"
                          style={styles.input}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setExperiences((prev) => [...prev, createExperience()])
                }
                style={styles.smallButton}
              >
                + Add Another Experience
              </button>
            </section>

            <section id="skills" style={styles.card}>
              <div className="reentry-section-heading" style={styles.sectionHeading}>
                <div>
                  <p style={styles.cardKicker}>SKILLS</p>
                  <h2 style={styles.cardTitle}>Your Stand-Alone Skills Section</h2>
                  <p style={styles.previewHelp}>
                    Add skills yourself or let HireMinds pull supported skills from the
                    experience you described above. Up to 9 appear on the resume.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSkills}
                  disabled={aiLoading !== null}
                  style={styles.aiSecondaryButton}
                >
                  {aiLoading === "skills"
                    ? "Finding..."
                    : "✦ Identify Skills From My Experience"}
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
                    <button
                      key={skill}
                      type="button"
                      title="Remove skill"
                      onClick={() =>
                        setSkillsInput(
                          skills.filter((item) => item !== skill).join(", ")
                        )
                      }
                      style={styles.skillChip}
                    >
                      {skill} ×
                    </button>
                  ))}
                </div>
              ) : null}
            </section>

            <section id="summary" style={styles.card}>
              <div className="reentry-section-heading" style={styles.sectionHeading}>
                <div>
                  <p style={styles.cardKicker}>SUMMARY</p>
                  <h2 style={styles.cardTitle}>Professional Summary</h2>
                  <p style={styles.previewHelp}>
                    This should focus on what you can offer now. It does not need to
                    mention reentry or your past.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSummary}
                  disabled={aiLoading !== null}
                  style={styles.aiSecondaryButton}
                >
                  {aiLoading === "summary"
                    ? "Writing..."
                    : summaryText.trim()
                      ? "✦ Strengthen Summary"
                      : "✦ Write My Summary"}
                </button>
              </div>

              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="Write your own or use the AI button."
                style={styles.textarea}
              />
            </section>

            <section id="education" style={styles.card}>
              <p style={styles.cardKicker}>EDUCATION + TRAINING</p>
              <h2 style={styles.cardTitle}>Add what you have</h2>
              <p style={styles.previewHelp}>
                GED, high school, college, vocational training, OSHA, ServSafe,
                workforce programs, certificates, classes, or other completed training.
              </p>

              {credentials.map((item, index) => (
                <div key={index} style={styles.sectionGroup}>
                  <div className="reentry-two-col" style={styles.twoColForm}>
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
                style={styles.smallButton}
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

          <aside className="reentry-preview" style={styles.rightCol}>
            <div style={styles.previewCard}>
              <div style={styles.previewCardTop}>
                <div>
                  <p style={styles.cardKicker}>LIVE PREVIEW</p>
                  <strong style={styles.previewChoice}>{layoutChoice}</strong>
                </div>
                <span style={styles.previewTag}>REENTRY / SECOND CHANCE</span>
              </div>
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
                  <strong>Your resume will build here.</strong>
                  <p>Start with one experience or upload an existing resume.</p>
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
    <div>
      <label style={styles.inputLabel}>{label}</label>
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
        <label style={styles.inputLabel}>{prefix} Month</label>
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
        <label style={styles.inputLabel}>{prefix} Year</label>
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
      "radial-gradient(ellipse at 12% 8%, rgba(22,119,255,0.12) 0%, transparent 34%), linear-gradient(180deg, #030812 0%, #07111f 52%, #030812 100%)",
    color: "#f5f7fb",
    padding: "28px 24px 56px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  container: {
    maxWidth: "1380px",
    margin: "0 auto",
  },

  centerWrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#e5e7eb",
  },

  topBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "16px",
    paddingBottom: "20px",
    borderBottom: "1px solid rgba(148,163,184,0.18)",
    flexWrap: "wrap",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 800,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  pageTitle: {
    margin: 0,
    maxWidth: "760px",
    color: "#ffffff",
    fontSize: "clamp(34px, 4vw, 48px)",
    lineHeight: 1.04,
    letterSpacing: "-0.045em",
    fontWeight: 760,
  },

  pageIntro: {
    margin: "12px 0 0",
    maxWidth: "760px",
    color: "#9aa9bc",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  backTop: {
    color: "#8FC1FF",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
  },

  stepNav: {
    position: "sticky",
    top: "0",
    zIndex: 20,
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginBottom: "18px",
    padding: "10px 0",
    background:
      "linear-gradient(180deg, rgba(3,8,18,.98) 0%, rgba(3,8,18,.92) 78%, rgba(3,8,18,0) 100%)",
    backdropFilter: "blur(10px)",
  },

  stepLink: {
    padding: "8px 12px",
    borderRadius: "999px",
    border: "1px solid rgba(148,163,184,.22)",
    background: "rgba(255,255,255,.025)",
    color: "#c9d4e2",
    textDecoration: "none",
    fontSize: "10px",
    fontWeight: 800,
  },

  layout: {
    display: "grid",
    gridTemplateColumns: "minmax(380px, 0.82fr) minmax(0, 1.18fr)",
    gap: "34px",
    alignItems: "start",
  },

  leftCol: {
    minWidth: 0,
  },

  rightCol: {
    position: "sticky",
    top: "58px",
    alignSelf: "start",
    maxHeight: "calc(100vh - 68px)",
    overflowY: "auto",
    paddingRight: "4px",
  },

  card: {
    background: "transparent",
    border: "none",
    borderBottom: "1px solid rgba(148,163,184,0.16)",
    borderRadius: 0,
    padding: "24px 0 30px",
    boxShadow: "none",
    marginBottom: 0,
    scrollMarginTop: "72px",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "18px",
    marginBottom: "16px",
  },

  cardKicker: {
    margin: "0 0 7px",
    color: "#1677FF",
    fontSize: "10px",
    fontWeight: 850,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
  },

  cardTitle: {
    margin: "0 0 12px",
    color: "#ffffff",
    fontSize: "23px",
    lineHeight: 1.15,
    fontWeight: 750,
    letterSpacing: "-0.02em",
  },

  previewHelp: {
    margin: 0,
    maxWidth: "720px",
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.55,
  },

  uploadActions: {
    display: "flex",
    gap: "8px",
    flexShrink: 0,
  },

  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "42px",
    padding: "0 18px",
    borderRadius: "8px",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: 800,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  importedText: {
    margin: "12px 0 0",
    color: "#8FC1FF",
    fontSize: "12px",
  },

  sectionGroup: {
    borderTop: "1px solid rgba(148,163,184,0.14)",
    padding: "20px 0 4px",
    marginTop: "18px",
  },

  layoutChoices: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "10px",
  },

  layoutCard: {
    minHeight: "105px",
    padding: "14px",
    borderRadius: "9px",
    border: "1px solid rgba(148,163,184,.22)",
    background: "rgba(3,8,18,.40)",
    textAlign: "left",
    cursor: "pointer",
  },

  layoutCardSelected: {
    borderColor: "#1677FF",
    background: "rgba(22,119,255,.11)",
    boxShadow: "0 0 0 2px rgba(22,119,255,.06)",
  },

  layoutName: {
    display: "block",
    marginBottom: "6px",
    color: "#ffffff",
    fontSize: "13px",
  },

  layoutDescription: {
    display: "block",
    color: "#9aa9bc",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  twoColForm: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px 16px",
  },

  inputLabel: {
    display: "block",
    margin: "0 0 6px",
    color: "#f5f5f5",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    background: "rgba(3,8,18,0.56)",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "108px",
    resize: "vertical",
    background: "rgba(3,8,18,0.56)",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.28)",
    borderRadius: "8px",
    padding: "11px 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
    marginBottom: "12px",
  },

  select: {
    width: "100%",
    background: "rgba(4,10,20,0.72)",
    color: "#fff",
    border: "1px solid rgba(148,163,184,0.30)",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    margin: "22px 0 10px",
    color: "#f5f5f5",
    fontSize: "13px",
  },

  dateRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
  },

  experienceGroup: {
    marginTop: "20px",
    paddingTop: "18px",
    borderTop: "1px solid rgba(148,163,184,.14)",
  },

  aiDescribeBox: {
    marginTop: "16px",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(22,119,255,.30)",
    background:
      "linear-gradient(120deg, rgba(22,119,255,.09), rgba(3,8,18,.38))",
  },

  aiMiniKicker: {
    margin: "0 0 5px",
    color: "#66ACFF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  aiDescribeTitle: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: "15px",
  },

  helper: {
    margin: "0 0 11px",
    color: "#9aa9bc",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  aiPrimaryButton: {
    minHeight: "40px",
    borderRadius: "8px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#ffffff",
    padding: "0 14px",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  aiSecondaryButton: {
    minHeight: "38px",
    borderRadius: "8px",
    border: "1px solid rgba(22,119,255,.42)",
    background: "transparent",
    color: "#8FC1FF",
    padding: "0 13px",
    fontSize: "10px",
    fontWeight: 850,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },

  bulletBlock: {
    marginTop: "16px",
  },

  bulletHeading: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    marginBottom: "8px",
    color: "#dfe8f3",
    fontSize: "11px",
  },

  bulletRow: {
    display: "grid",
    gridTemplateColumns: "28px 1fr",
    gap: "8px",
    alignItems: "center",
    marginBottom: "8px",
  },

  bulletNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    border: "1px solid rgba(148,163,184,.24)",
    color: "#8FC1FF",
    fontSize: "9px",
    fontWeight: 850,
  },

  skillChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "11px",
  },

  skillChip: {
    borderRadius: "999px",
    border: "1px solid rgba(22,119,255,.30)",
    background: "rgba(22,119,255,.08)",
    color: "#9CCBFF",
    padding: "6px 9px",
    fontSize: "9px",
    fontWeight: 800,
    cursor: "pointer",
  },

  smallButton: {
    marginTop: "12px",
    background: "transparent",
    color: "#8FC1FF",
    border: "1px solid rgba(22,119,255,0.42)",
    borderRadius: "8px",
    padding: "9px 12px",
    fontSize: "13px",
    fontWeight: 750,
    cursor: "pointer",
  },

  disabled: {
    opacity: .55,
    cursor: "not-allowed",
  },

  message: {
    margin: "18px 0 0",
    padding: "12px 14px",
    borderRadius: "8px",
    border: "1px solid rgba(22,119,255,.24)",
    background: "rgba(22,119,255,.08)",
    color: "#cfe6ff",
    fontSize: "11px",
    lineHeight: 1.5,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "20px",
    marginBottom: "30px",
  },

  primaryButton: {
    minHeight: "44px",
    borderRadius: "8px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  printButton: {
    minHeight: "44px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,.28)",
    background: "#0F244D",
    color: "#ffffff",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  backButton: {
    minHeight: "44px",
    borderRadius: "8px",
    border: "1px solid rgba(148,163,184,.24)",
    background: "transparent",
    color: "#dbe6f2",
    display: "grid",
    placeItems: "center",
    textDecoration: "none",
    fontSize: "11px",
    fontWeight: 850,
  },

  previewCard: {
    background: "rgba(7,17,31,0.78)",
    border: "1px solid rgba(148,163,184,0.16)",
    borderRadius: "12px",
    padding: "12px 14px",
    boxShadow: "0 12px 34px rgba(0,0,0,0.16)",
    marginBottom: "12px",
    backdropFilter: "blur(12px)",
  },

  previewCardTop: {
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    alignItems: "center",
  },

  previewChoice: {
    color: "#ffffff",
    fontSize: "13px",
  },

  previewTag: {
    color: "#8FC1FF",
    fontSize: "8px",
    fontWeight: 850,
    letterSpacing: ".06em",
  },

  resumePaper: {
    width: "100%",
    minHeight: "900px",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "4px",
    padding: "40px 42px 48px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
    boxSizing: "border-box",
  },

  resumeHeader: {
    marginBottom: "18px",
    paddingBottom: "11px",
    borderBottom: "2px solid #1677FF",
  },

  resumeName: {
    margin: "0 0 5px",
    color: "#111827",
    fontSize: "27px",
    fontWeight: 800,
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
  },

  resumeSection: {
    marginBottom: "15px",
  },

  resumeSectionTitle: {
    margin: "0 0 7px",
    paddingBottom: "4px",
    borderBottom: "1px solid #CBD5E1",
    color: "#111827",
    fontSize: "11px",
    fontWeight: 850,
    letterSpacing: ".04em",
  },

  resumeParagraph: {
    margin: 0,
    color: "#273548",
    fontSize: "10px",
    lineHeight: 1.5,
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
