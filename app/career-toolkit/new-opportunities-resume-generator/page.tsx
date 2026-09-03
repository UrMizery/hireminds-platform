"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

type ResumeFont = "Times New Roman" | "Arial" | "Calibri";
type OpportunityPath =
  | "reentry"
  | "little-no-experience"
  | "career-restart"
  | "caregiver"
  | "veteran";

type ResumeLayout = "Skills First" | "Balanced" | "Experience First";

type ExperienceSource =
  | "Paid Job"
  | "Institutional Work Assignment"
  | "Volunteer / Community"
  | "Caregiving / Home"
  | "Training / Project"
  | "Other";

type Bullet = { text: string };

type ExperienceItem = {
  sourceType: ExperienceSource;
  organizationName: string;
  city: string;
  state: string;
  roleTitle: string;
  startMonth: string;
  startYear: string;
  endMonth: string;
  endYear: string;
  isPresent: boolean;
  bullets: Bullet[];
};

type CredentialItem = {
  organizationName: string;
  city: string;
  state: string;
  credentialName: string;
  details: string;
  year: string;
};

const BULLET_LIMIT = 5;
const SKILL_LIMIT = 9;
const STORAGE_KEY = "hireminds-new-opportunities-resume-draft-v2";

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
    kicker: "BEST FOR LITTLE EXPERIENCE",
    description:
      "Leads with strengths and job-ready skills before work history.",
  },
  {
    name: "Balanced",
    kicker: "BEST ALL-AROUND",
    description:
      "Gives skills and experience equal weight in a clean, flexible format.",
  },
  {
    name: "Experience First",
    kicker: "BEST WITH SOLID WORK HISTORY",
    description:
      "Puts your strongest work history closer to the top.",
  },
];

const PATH_LABELS: Record<OpportunityPath, string> = {
  reentry: "Reentry / Second Chance",
  "little-no-experience": "Little to No Experience",
  "career-restart": "Career Restart",
  caregiver: "Caregiver / Homemaker",
  veteran: "Veteran / Service Transition",
};

function createExperience(): ExperienceItem {
  return {
    sourceType: "Paid Job",
    organizationName: "",
    city: "",
    state: "",
    roleTitle: "",
    startMonth: "",
    startYear: "",
    endMonth: "",
    endYear: "",
    isPresent: false,
    bullets: [{ text: "" }, { text: "" }, { text: "" }],
  };
}

function createCredential(): CredentialItem {
  return {
    organizationName: "",
    city: "",
    state: "",
    credentialName: "",
    details: "",
    year: "",
  };
}

function hasExperience(item: ExperienceItem) {
  return Boolean(
    item.organizationName ||
      item.roleTitle ||
      item.city ||
      item.state ||
      item.startMonth ||
      item.startYear ||
      item.endMonth ||
      item.endYear ||
      item.isPresent ||
      item.bullets.some((bullet) => bullet.text.trim())
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

function normalizeSkills(raw: string) {
  return Array.from(
    new Set(
      raw
        .split(",")
        .map((item) => item.trim().replace(/\s+/g, " "))
        .filter(Boolean)
        .map((item) =>
          item.replace(/\b\w/g, (letter) => letter.toUpperCase())
        )
    )
  ).slice(0, SKILL_LIMIT);
}

function buildSectionOrder(layout: ResumeLayout) {
  if (layout === "Skills First") {
    return ["skills", "summary", "experience", "education", "accomplishments"] as const;
  }

  if (layout === "Experience First") {
    return ["summary", "experience", "skills", "education", "accomplishments"] as const;
  }

  return ["summary", "skills", "experience", "education", "accomplishments"] as const;
}

export default function NewOpportunitiesResumeGeneratorPage() {
  const [loadingUser, setLoadingUser] = useState(true);
  const [userId, setUserId] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const openTrackedRef = useRef(false);
  const resumePrintRef = useRef<HTMLDivElement>(null);

  const [draftLoaded, setDraftLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  const [fontFamily, setFontFamily] = useState<ResumeFont>("Arial");
  const [layoutChoice, setLayoutChoice] = useState<ResumeLayout>("Skills First");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [email, setEmail] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");

  const [pathType, setPathType] = useState<OpportunityPath>("reentry");
  const [targetRole, setTargetRole] = useState("");
  const [strengthsText, setStrengthsText] = useState("");
  const [thingsDoneText, setThingsDoneText] = useState("");
  const [workPreferences, setWorkPreferences] = useState("");

  const [summaryText, setSummaryText] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [accomplishments, setAccomplishments] = useState("");

  const [experiences, setExperiences] = useState<ExperienceItem[]>([
    createExperience(),
  ]);

  const [credentials, setCredentials] = useState<CredentialItem[]>([
    createCredential(),
  ]);

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

        const { error: activityError } = await supabase.from("user_activity").insert({
          user_id: data.user.id,
          full_name: profile?.full_name || null,
          email: profile?.email || data.user.email || null,
          referral_code: profile?.referral_code || null,
          event_type: "tool_opened",
          tool_name: "new_opportunities_resume_generator",
          page_name: "/career-toolkit/new-opportunities-resume-generator",
        });

        if (activityError) {
          console.error("New Opportunities Resume Generator tracking error:", activityError);
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
        setCity(draft.city || "");
        setStateName(draft.stateName || "");
        setEmail(draft.email || "");
        setLinkedinUrl(draft.linkedinUrl || "");
        setPathType(draft.pathType || "reentry");
        setTargetRole(draft.targetRole || "");
        setStrengthsText(draft.strengthsText || "");
        setThingsDoneText(draft.thingsDoneText || "");
        setWorkPreferences(draft.workPreferences || "");
        setSummaryText(draft.summaryText || "");
        setSkillsInput(draft.skillsInput || "");
        setAccomplishments(draft.accomplishments || "");

        setExperiences(
          Array.isArray(draft.experiences) && draft.experiences.length
            ? draft.experiences.map((item: ExperienceItem) => ({
                ...createExperience(),
                ...item,
                sourceType: item.sourceType || "Paid Job",
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
      // Ignore a bad local draft.
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
        city,
        stateName,
        email,
        linkedinUrl,
        pathType,
        targetRole,
        strengthsText,
        thingsDoneText,
        workPreferences,
        summaryText,
        skillsInput,
        accomplishments,
        experiences,
        credentials,
      })
    );
  }, [
    draftLoaded,
    fontFamily,
    layoutChoice,
    fullName,
    phone,
    city,
    stateName,
    email,
    linkedinUrl,
    pathType,
    targetRole,
    strengthsText,
    thingsDoneText,
    workPreferences,
    summaryText,
    skillsInput,
    accomplishments,
    experiences,
    credentials,
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

  const sectionOrder = useMemo(
    () => buildSectionOrder(layoutChoice),
    [layoutChoice]
  );

  const progress = useMemo(() => {
    let points = 0;
    const total = 7;

    if (fullName.trim() && (phone.trim() || email.trim())) points += 1;
    if (targetRole.trim()) points += 1;
    if (strengthsText.trim() || thingsDoneText.trim()) points += 1;
    if (summaryText.trim()) points += 1;
    if (skills.length >= 3) points += 1;
    if (activeExperiences.length) points += 1;
    if (activeCredentials.length) points += 1;

    return Math.round((points / total) * 100);
  }, [
    fullName,
    phone,
    email,
    targetRole,
    strengthsText,
    thingsDoneText,
    summaryText,
    skills,
    activeExperiences,
    activeCredentials,
  ]);

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

  function addExperienceBullet(index: number) {
    setExperiences((prev) =>
      prev.map((item, itemIndex) => {
        if (itemIndex !== index || item.bullets.length >= BULLET_LIMIT) return item;
        return { ...item, bullets: [...item.bullets, { text: "" }] };
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
        pathType,
        targetRole,
        strengthsText,
        thingsDoneText,
        workPreferences,
        summaryText,
        skillsInput,
        experiences,
        credentials,
        ...extra,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.error || "AI assistance is unavailable right now.");
    }

    return data;
  }

  async function handleFindSkills() {
    try {
      setAiLoading("skills");
      setMessage("");

      const data = await callAi("skills");
      const nextSkills = Array.isArray(data?.skills)
        ? data.skills.slice(0, SKILL_LIMIT).join(", ")
        : "";

      if (!nextSkills) throw new Error("No skill suggestions were returned.");

      setSkillsInput(nextSkills);
      setMessage("Skills identified. Keep the ones that truly fit you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to identify skills.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleWriteSummary() {
    try {
      setAiLoading("summary");
      setMessage("");

      const data = await callAi("summary");

      if (!data?.summary) throw new Error("No summary was returned.");

      setSummaryText(String(data.summary));
      setMessage("Summary created. Review it and make sure it sounds like you.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create summary.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleStrengthenBullet(
    experienceIndex: number,
    bulletIndex: number
  ) {
    const bullet = experiences[experienceIndex]?.bullets[bulletIndex]?.text || "";

    if (!bullet.trim()) {
      setMessage("Type what you did in simple words first.");
      return;
    }

    try {
      setAiLoading(`bullet-${experienceIndex}-${bulletIndex}`);
      setMessage("");

      const item = experiences[experienceIndex];
      const data = await callAi("bullet", {
        bullet,
        sourceType: item.sourceType,
        organizationName: item.organizationName,
        roleTitle: item.roleTitle,
      });

      if (!data?.bullet) throw new Error("No stronger bullet was returned.");

      updateExperienceBullet(experienceIndex, bulletIndex, String(data.bullet));
      setMessage("Bullet strengthened without adding experience you did not provide.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to strengthen bullet.");
    } finally {
      setAiLoading(null);
    }
  }

  async function handleBuildStarterResume() {
    try {
      setAiLoading("starter");
      setMessage("");

      const data = await callAi("starter");

      if (data?.summary) setSummaryText(String(data.summary));

      if (Array.isArray(data?.skills)) {
        setSkillsInput(data.skills.slice(0, SKILL_LIMIT).join(", "));
      }

      if (Array.isArray(data?.experienceBullets)) {
        setExperiences((prev) =>
          prev.map((item, experienceIndex) => ({
            ...item,
            bullets: item.bullets.map((bullet, bulletIndex) => {
              const replacement =
                data.experienceBullets?.[experienceIndex]?.[bulletIndex];

              return replacement?.trim()
                ? { text: String(replacement).trim() }
                : bullet;
            }),
          }))
        );
      }

      setMessage(
        "Starter resume built. Review every section and keep only what is accurate."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to build the starter resume right now."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSaveDraft() {
    try {
      setSaving(true);
      setMessage("");

      const draft = {
        fontFamily,
        layoutChoice,
        fullName,
        phone,
        city,
        stateName,
        email,
        linkedinUrl,
        pathType,
        targetRole,
        strengthsText,
        thingsDoneText,
        workPreferences,
        summaryText,
        skillsInput,
        accomplishments,
        experiences,
        credentials,
      };

      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));

      if (userId) {
        const { error: activityError } = await supabase.from("user_activity").insert({
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

    const html = node.innerHTML;

    printWindow.document.open();
    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>${fullName || "Resume"} - Resume</title>
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
              min-height: 0;
              padding: 0;
              margin: 0;
              border: 0;
              box-shadow: none;
            }
            .resumeHeader {
              margin: 0 0 18px;
              padding: 0 0 12px;
              border-bottom: 2px solid #1677FF;
            }
            .resumeName {
              margin: 0 0 5px;
              font-size: 25px;
              line-height: 1.1;
              font-weight: 800;
              color: #0F172A;
            }
            .resumeContact,
            .resumeLinkedin {
              margin: 2px 0;
              font-size: 10.5pt;
              line-height: 1.35;
              color: #475569;
            }
            .resumeLinkedin { color: #145fad; }
            .resumeSection { margin: 0 0 16px; }
            .resumeSectionTitle {
              margin: 0 0 7px;
              font-size: 12pt;
              line-height: 1.2;
              font-weight: 800;
              letter-spacing: .04em;
              color: #0F172A;
              border-bottom: 1px solid #CBD5E1;
              padding-bottom: 4px;
            }
            .resumeParagraph {
              margin: 0;
              font-size: 10.5pt;
              line-height: 1.48;
              color: #1F2937;
            }
            .skillsGrid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 4px 16px;
            }
            .skillItem {
              margin: 0;
              font-size: 10.5pt;
              line-height: 1.35;
            }
            .resumeEntry {
              margin-bottom: 12px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            .resumeEntryTop {
              display: flex;
              justify-content: space-between;
              gap: 16px;
              align-items: flex-start;
              margin-bottom: 4px;
            }
            .resumeEntryHeading {
              margin: 0;
              font-size: 10.8pt;
              font-weight: 800;
            }
            .resumeEntrySubheading {
              margin: 2px 0 0;
              font-size: 10.4pt;
              font-weight: 600;
              color: #334155;
            }
            .resumeEntryDates {
              margin: 0;
              font-size: 9.5pt;
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
          <div class="resumePaper">${html}</div>
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
                    {item.organizationName || item.sourceType}
                    {item.city || item.state
                      ? ` — ${[item.city, item.state].filter(Boolean).join(", ")}`
                      : ""}
                  </p>
                  <p
                    className="resumeEntrySubheading"
                    style={styles.resumeEntrySubheading}
                  >
                    {item.roleTitle || item.sourceType}
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

    if (section === "accomplishments") {
      if (!accomplishments.trim()) return null;

      return (
        <section className="resumeSection" style={styles.resumeSection}>
          <h3 className="resumeSectionTitle" style={styles.resumeSectionTitle}>
            ADDITIONAL STRENGTHS
          </h3>
          <p className="resumeParagraph" style={styles.resumeParagraph}>
            {accomplishments}
          </p>
        </section>
      );
    }

    return null;
  }

  if (loadingUser) {
    return (
      <main style={styles.page}>
        <div style={styles.loading}>Loading your builder...</div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media (max-width: 1120px) {
          .newopp-layout {
            grid-template-columns: 1fr !important;
          }

          .newopp-preview {
            position: static !important;
          }
        }

        @media (max-width: 720px) {
          .newopp-page {
            padding: 18px 14px 50px !important;
          }

          .newopp-two-col,
          .newopp-layout-choices,
          .newopp-actions {
            grid-template-columns: 1fr !important;
          }

          .newopp-hero {
            grid-template-columns: 1fr !important;
          }

          .newopp-progress {
            text-align: left !important;
          }

          .newopp-ai-row {
            align-items: flex-start !important;
            flex-direction: column !important;
          }

          .newopp-resume-paper {
            padding: 30px 24px !important;
          }
        }
      `}</style>

      <div className="newopp-page" style={styles.pageInner}>
        <section className="newopp-hero" style={styles.hero}>
          <div>
            <p style={styles.heroKicker}>NEW OPPORTUNITIES RESUME BUILDER</p>
            <h1 style={styles.heroTitle}>
              You have more experience than you think.
            </h1>
            <p style={styles.heroText}>
              Start with simple answers. HireMinds helps turn work assignments,
              caregiving, training, volunteer work, life experience, and traditional
              jobs into a professional resume without making anything up.
            </p>
          </div>

          <div className="newopp-progress" style={styles.progressWrap}>
            <span style={styles.progressLabel}>RESUME PROGRESS</span>
            <strong style={styles.progressNumber}>{progress}%</strong>
            <div style={styles.progressTrack}>
              <span style={{ ...styles.progressFill, width: `${progress}%` }} />
            </div>
            <span style={styles.progressHint}>You do not need to fill in everything.</span>
          </div>
        </section>

        <div className="newopp-layout" style={styles.layout}>
          <div>
            <section style={styles.panel}>
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>CHOOSE YOUR STARTING POINT</p>
                  <h2 style={styles.sectionTitle}>What best fits your situation?</h2>
                </div>
              </div>

              <div style={styles.pathPills}>
                {(Object.keys(PATH_LABELS) as OpportunityPath[]).map((path) => (
                  <button
                    key={path}
                    type="button"
                    onClick={() => setPathType(path)}
                    style={{
                      ...styles.pathPill,
                      ...(pathType === path ? styles.pathPillActive : {}),
                    }}
                  >
                    {PATH_LABELS[path]}
                  </button>
                ))}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>PICK A RESUME DIRECTION</p>
                  <h2 style={styles.sectionTitle}>Choose one of 3 simple layouts</h2>
                  <p style={styles.sectionCopy}>
                    No moving sections around. Pick the version that best supports your
                    background and HireMinds handles the order.
                  </p>
                </div>
              </div>

              <div className="newopp-layout-choices" style={styles.layoutChoices}>
                {LAYOUTS.map((option) => {
                  const selected = layoutChoice === option.name;

                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setLayoutChoice(option.name)}
                      style={{
                        ...styles.layoutChoice,
                        ...(selected ? styles.layoutChoiceSelected : {}),
                      }}
                    >
                      <span style={styles.layoutKicker}>{option.kicker}</span>
                      <strong style={styles.layoutName}>{option.name}</strong>
                      <span style={styles.layoutDescription}>{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>QUICK START</p>
                  <h2 style={styles.sectionTitle}>Tell us where you want to go</h2>
                  <p style={styles.sectionCopy}>
                    Plain language is fine. You do not need resume words.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleBuildStarterResume}
                  disabled={aiLoading !== null}
                  style={{
                    ...styles.bigAiButton,
                    ...(aiLoading !== null ? styles.disabledButton : {}),
                  }}
                >
                  {aiLoading === "starter" ? "Building..." : "✦ Build My Starter Resume"}
                </button>
              </div>

              <div className="newopp-two-col" style={styles.twoCol}>
                <Field
                  label="Job or type of work you want"
                  value={targetRole}
                  onChange={setTargetRole}
                  placeholder="Example: Warehouse Associate, Customer Service, Maintenance"
                />

                <Field
                  label="What kind of work are you looking for?"
                  value={workPreferences}
                  onChange={setWorkPreferences}
                  placeholder="Example: stable schedule, hands-on work, room to grow"
                />
              </div>

              <TextArea
                label="What are you good at?"
                helper="Use everyday words: good with people, organized, fixing things, cleaning, cooking, following instructions, staying calm..."
                value={strengthsText}
                onChange={setStrengthsText}
                placeholder="Example: dependable, learn fast, good with my hands, patient, organized"
              />

              <TextArea
                label="What have you done before?"
                helper="This can include jobs, jail/prison work assignments, kitchen work, cleaning, maintenance, laundry, programs, caregiving, volunteer work, training, or responsibilities at home."
                value={thingsDoneText}
                onChange={setThingsDoneText}
                placeholder="Example: worked in kitchen, cleaned housing unit, helped train new workers, took GED classes, cared for family..."
              />

              <div style={styles.aiQuickRow}>
                <button
                  type="button"
                  onClick={handleFindSkills}
                  disabled={aiLoading !== null}
                  style={styles.aiChip}
                >
                  {aiLoading === "skills" ? "Finding skills..." : "✦ Help Me Find My Skills"}
                </button>

                <button
                  type="button"
                  onClick={handleWriteSummary}
                  disabled={aiLoading !== null}
                  style={styles.aiChip}
                >
                  {aiLoading === "summary" ? "Writing..." : "✦ Write My Summary"}
                </button>
              </div>
            </section>

            <section style={styles.panel}>
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>BASIC INFO</p>
                  <h2 style={styles.sectionTitle}>Your resume header</h2>
                </div>

                <div style={styles.fontControl}>
                  <label style={styles.smallLabel}>Font</label>
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

              <div className="newopp-two-col" style={styles.twoCol}>
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
              <div className="newopp-ai-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>SUMMARY</p>
                  <h2 style={styles.sectionTitle}>Professional summary</h2>
                  <p style={styles.sectionCopy}>
                    Keep it short. Focus on what you bring now and where you are going.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleWriteSummary}
                  disabled={aiLoading !== null}
                  style={styles.aiChip}
                >
                  {aiLoading === "summary"
                    ? "Writing..."
                    : summaryText.trim()
                      ? "✦ Strengthen My Summary"
                      : "✦ Write My Summary"}
                </button>
              </div>

              <textarea
                value={summaryText}
                onChange={(e) => setSummaryText(e.target.value)}
                placeholder="HireMinds can help create this for you."
                style={styles.textarea}
              />
            </section>

            <section style={styles.panel}>
              <div className="newopp-ai-row" style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>SKILLS</p>
                  <h2 style={styles.sectionTitle}>Your strongest job-ready skills</h2>
                  <p style={styles.sectionCopy}>
                    Choose skills that are true for you. Up to 9 will appear on the resume.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleFindSkills}
                  disabled={aiLoading !== null}
                  style={styles.aiChip}
                >
                  {aiLoading === "skills" ? "Finding..." : "✦ Identify My Skills"}
                </button>
              </div>

              <input
                value={skillsInput}
                onChange={(e) => setSkillsInput(e.target.value)}
                placeholder="Communication, Dependability, Cleaning, Food Preparation..."
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
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>EXPERIENCE</p>
                  <h2 style={styles.sectionTitle}>Add anything that shows what you can do</h2>
                  <p style={styles.sectionCopy}>
                    A traditional job is not required. Institutional work assignments,
                    volunteer work, caregiving, training, projects, and other real
                    responsibilities can count when described accurately.
                  </p>
                </div>
              </div>

              {experiences.map((item, index) => (
                <div style={styles.experienceBlock} key={index}>
                  <div className="newopp-two-col" style={styles.twoCol}>
                    <SelectField
                      label="What kind of experience was this?"
                      value={item.sourceType}
                      onChange={(value) =>
                        updateExperience(index, "sourceType", value as ExperienceSource)
                      }
                      options={[
                        "Paid Job",
                        "Institutional Work Assignment",
                        "Volunteer / Community",
                        "Caregiving / Home",
                        "Training / Project",
                        "Other",
                      ]}
                    />

                    <Field
                      label="Role / Assignment"
                      value={item.roleTitle}
                      onChange={(value) =>
                        updateExperience(index, "roleTitle", value)
                      }
                      placeholder="Example: Kitchen Worker, Porter, Laundry Worker"
                    />

                    <Field
                      label="Organization / Setting"
                      value={item.organizationName}
                      onChange={(value) =>
                        updateExperience(index, "organizationName", value)
                      }
                      placeholder={
                        item.sourceType === "Institutional Work Assignment"
                          ? "Example: Institutional Food Service"
                          : "Organization or setting"
                      }
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

                    <div style={styles.checkboxWrap}>
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
                    </div>
                  </div>

                  <div className="newopp-two-col" style={styles.twoCol}>
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
                    ) : (
                      <div />
                    )}
                  </div>

                  <div style={styles.bulletIntro}>
                    <strong>What did you do?</strong>
                    <span>
                      Write it normally. Example: “served food,” “cleaned floors,”
                      “kept track of supplies,” “helped new workers.”
                    </span>
                  </div>

                  {item.bullets.map((bullet, bulletIndex) => (
                    <div style={styles.bulletRow} key={bulletIndex}>
                      <input
                        value={bullet.text}
                        onChange={(e) =>
                          updateExperienceBullet(index, bulletIndex, e.target.value)
                        }
                        placeholder="Type what you did in simple words"
                        style={styles.input}
                      />

                      <button
                        type="button"
                        onClick={() =>
                          handleStrengthenBullet(index, bulletIndex)
                        }
                        disabled={aiLoading !== null}
                        style={styles.bulletAiButton}
                      >
                        {aiLoading === `bullet-${index}-${bulletIndex}`
                          ? "..."
                          : "✦ Strengthen"}
                      </button>
                    </div>
                  ))}

                  {item.bullets.length < BULLET_LIMIT ? (
                    <button
                      type="button"
                      onClick={() => addExperienceBullet(index)}
                      style={styles.textButton}
                    >
                      + Add another responsibility
                    </button>
                  ) : null}
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setExperiences((prev) => [...prev, createExperience()])
                }
                style={styles.secondaryAddButton}
              >
                + Add Another Experience
              </button>
            </section>

            <section style={styles.panel}>
              <div style={styles.sectionHeading}>
                <div>
                  <p style={styles.stepLabel}>EDUCATION + TRAINING</p>
                  <h2 style={styles.sectionTitle}>School, GED, classes, programs & certificates</h2>
                  <p style={styles.sectionCopy}>
                    Add only what you have. It is okay if this section is short.
                  </p>
                </div>
              </div>

              {credentials.map((item, index) => (
                <div style={styles.credentialBlock} key={index}>
                  <div className="newopp-two-col" style={styles.twoCol}>
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
                      placeholder="Coursework, hands-on training, program focus"
                    />
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={() =>
                  setCredentials((prev) => [...prev, createCredential()])
                }
                style={styles.secondaryAddButton}
              >
                + Add Education / Training
              </button>
            </section>

            <section style={styles.panel}>
              <p style={styles.stepLabel}>OPTIONAL</p>
              <h2 style={styles.sectionTitle}>Anything else worth showing?</h2>
              <p style={styles.sectionCopy}>
                Awards, recognition, licenses, programs completed, community involvement,
                or other strengths can go here.
              </p>

              <textarea
                value={accomplishments}
                onChange={(e) => setAccomplishments(e.target.value)}
                placeholder="Optional additional strengths or accomplishments"
                style={styles.textarea}
              />
            </section>

            {message ? <div style={styles.message}>{message}</div> : null}

            <div className="newopp-actions" style={styles.actions}>
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

          <aside className="newopp-preview" style={styles.previewColumn}>
            <div style={styles.previewHeader}>
              <div>
                <p style={styles.previewKicker}>LIVE PREVIEW</p>
                <strong style={styles.previewTitle}>{layoutChoice}</strong>
              </div>
              <span style={styles.previewBadge}>{PATH_LABELS[pathType]}</span>
            </div>

            <div
              ref={resumePrintRef}
              className="newopp-resume-paper resumePaper"
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

              {sectionOrder.map((section) => (
                <div key={section}>{renderSection(section)}</div>
              ))}

              {!summaryText.trim() &&
              !skills.length &&
              !activeExperiences.length &&
              !activeCredentials.length ? (
                <div style={styles.emptyPreview}>
                  <span>START SIMPLE</span>
                  <strong>Your resume will build here as you answer.</strong>
                  <p>
                    You do not need a traditional work history to get started.
                  </p>
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

function TextArea({
  label,
  helper,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  helper?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      {helper ? <p style={styles.helper}>{helper}</p> : null}
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={styles.select}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
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
    <div style={styles.dateGroup}>
      <div>
        <label style={styles.smallLabel}>{prefix} Month</label>
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
        <label style={styles.smallLabel}>{prefix} Year</label>
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
      "radial-gradient(circle at 7% 0%, rgba(22,119,255,.16), transparent 22%), linear-gradient(180deg, #071522 0%, #0A213B 48%, #071522 100%)",
    color: "#FFFFFF",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  pageInner: {
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "28px 24px 60px",
  },

  loading: {
    minHeight: "70vh",
    display: "grid",
    placeItems: "center",
    color: "#C7D6E7",
  },

  hero: {
    marginBottom: "22px",
    padding: "34px",
    borderRadius: "22px",
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) 280px",
    gap: "30px",
    alignItems: "end",
    background:
      "linear-gradient(120deg, rgba(7,31,57,.98), rgba(13,60,111,.96) 68%, rgba(22,119,255,.92) 145%)",
    border: "1px solid rgba(255,255,255,.10)",
    boxShadow: "0 22px 54px rgba(0,0,0,.20)",
  },

  heroKicker: {
    margin: "0 0 10px",
    color: "#67AFFF",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".16em",
  },

  heroTitle: {
    margin: "0 0 14px",
    maxWidth: "820px",
    color: "#FFFFFF",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "clamp(42px,5vw,70px)",
    lineHeight: .98,
    letterSpacing: "-.045em",
    fontWeight: 400,
  },

  heroText: {
    margin: 0,
    maxWidth: "830px",
    color: "#C3D3E4",
    fontSize: "14px",
    lineHeight: 1.7,
  },

  progressWrap: {
    textAlign: "right",
  },

  progressLabel: {
    display: "block",
    color: "#9BCBFF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  progressNumber: {
    display: "block",
    margin: "5px 0 9px",
    color: "#FFFFFF",
    fontSize: "40px",
    lineHeight: 1,
  },

  progressTrack: {
    height: "6px",
    borderRadius: "999px",
    overflow: "hidden",
    background: "rgba(255,255,255,.12)",
  },

  progressFill: {
    display: "block",
    height: "100%",
    borderRadius: "999px",
    background: "#5EB0FF",
  },

  progressHint: {
    display: "block",
    marginTop: "7px",
    color: "#B9CCE0",
    fontSize: "9px",
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
    border: "1px solid rgba(255,255,255,.10)",
    background:
      "linear-gradient(145deg, rgba(15,39,65,.92), rgba(9,27,46,.92))",
    boxShadow: "0 14px 30px rgba(0,0,0,.12)",
  },

  sectionHeading: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "18px",
    marginBottom: "17px",
  },

  stepLabel: {
    margin: "0 0 6px",
    color: "#5AA6FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".13em",
  },

  sectionTitle: {
    margin: "0 0 7px",
    color: "#F8FBFF",
    fontSize: "23px",
    lineHeight: 1.15,
    letterSpacing: "-.025em",
  },

  sectionCopy: {
    margin: 0,
    maxWidth: "690px",
    color: "#AFC0D3",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  pathPills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },

  pathPill: {
    minHeight: "36px",
    padding: "0 13px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.13)",
    background: "rgba(255,255,255,.04)",
    color: "#C8D7E7",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  pathPillActive: {
    borderColor: "#1677FF",
    background: "#1677FF",
    color: "#FFFFFF",
  },

  layoutChoices: {
    display: "grid",
    gridTemplateColumns: "repeat(3,minmax(0,1fr))",
    gap: "10px",
  },

  layoutChoice: {
    minHeight: "125px",
    padding: "16px",
    textAlign: "left",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,.10)",
    background: "rgba(255,255,255,.035)",
    color: "#FFFFFF",
    cursor: "pointer",
  },

  layoutChoiceSelected: {
    borderColor: "#459EFF",
    background:
      "linear-gradient(145deg, rgba(22,119,255,.20), rgba(22,119,255,.07))",
    boxShadow: "0 0 0 2px rgba(22,119,255,.08)",
  },

  layoutKicker: {
    display: "block",
    marginBottom: "8px",
    color: "#6EB4FF",
    fontSize: "7.5px",
    fontWeight: 900,
    letterSpacing: ".08em",
  },

  layoutName: {
    display: "block",
    marginBottom: "6px",
    fontSize: "15px",
  },

  layoutDescription: {
    display: "block",
    color: "#AFC0D3",
    fontSize: "10px",
    lineHeight: 1.5,
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
    color: "#DCE7F3",
    fontSize: "11px",
    fontWeight: 750,
  },

  smallLabel: {
    display: "block",
    marginBottom: "5px",
    color: "#AFC0D3",
    fontSize: "9px",
    fontWeight: 750,
  },

  helper: {
    margin: "-1px 0 7px",
    color: "#8FA6BE",
    fontSize: "10px",
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    minHeight: "43px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid rgba(173,197,222,.20)",
    background: "rgba(3,15,27,.72)",
    color: "#FFFFFF",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },

  select: {
    width: "100%",
    minHeight: "43px",
    padding: "10px 12px",
    borderRadius: "9px",
    border: "1px solid rgba(173,197,222,.20)",
    background: "#081A2C",
    color: "#FFFFFF",
    fontSize: "12px",
    outline: "none",
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: "105px",
    padding: "11px 12px",
    borderRadius: "9px",
    border: "1px solid rgba(173,197,222,.20)",
    background: "rgba(3,15,27,.72)",
    color: "#FFFFFF",
    fontSize: "12px",
    lineHeight: 1.55,
    resize: "vertical",
    outline: "none",
    boxSizing: "border-box",
  },

  fontControl: {
    minWidth: "160px",
  },

  bigAiButton: {
    flexShrink: 0,
    minHeight: "42px",
    padding: "0 15px",
    borderRadius: "999px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    cursor: "pointer",
  },

  aiQuickRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
    marginTop: "3px",
  },

  aiChip: {
    minHeight: "34px",
    padding: "0 12px",
    borderRadius: "999px",
    border: "1px solid rgba(74,162,255,.28)",
    background: "rgba(22,119,255,.10)",
    color: "#89C3FF",
    fontSize: "9px",
    fontWeight: 850,
    cursor: "pointer",
  },

  disabledButton: {
    opacity: .55,
    cursor: "not-allowed",
  },

  skillChips: {
    display: "flex",
    flexWrap: "wrap",
    gap: "7px",
    marginTop: "11px",
  },

  skillChip: {
    padding: "6px 9px",
    borderRadius: "999px",
    background: "rgba(22,119,255,.12)",
    border: "1px solid rgba(22,119,255,.24)",
    color: "#A7D3FF",
    fontSize: "9px",
    fontWeight: 750,
  },

  experienceBlock: {
    marginBottom: "14px",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(1,13,24,.38)",
  },

  credentialBlock: {
    marginBottom: "12px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,.07)",
    background: "rgba(1,13,24,.30)",
  },

  checkboxWrap: {
    display: "flex",
    alignItems: "center",
    paddingTop: "22px",
  },

  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#C6D5E5",
    fontSize: "10px",
  },

  dateGroup: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "8px",
    marginBottom: "12px",
  },

  bulletIntro: {
    margin: "6px 0 10px",
    display: "grid",
    gap: "3px",
    color: "#DCE7F3",
    fontSize: "10px",
  },

  bulletRow: {
    display: "grid",
    gridTemplateColumns: "minmax(0,1fr) auto",
    gap: "8px",
    marginBottom: "8px",
  },

  bulletAiButton: {
    minWidth: "92px",
    borderRadius: "9px",
    border: "1px solid rgba(22,119,255,.28)",
    background: "rgba(22,119,255,.10)",
    color: "#80BFFF",
    fontSize: "9px",
    fontWeight: 850,
    cursor: "pointer",
  },

  textButton: {
    marginTop: "3px",
    border: "none",
    background: "transparent",
    color: "#79B7F8",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryAddButton: {
    minHeight: "38px",
    padding: "0 12px",
    borderRadius: "9px",
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.04)",
    color: "#D7E4F1",
    fontSize: "10px",
    fontWeight: 800,
    cursor: "pointer",
  },

  message: {
    marginBottom: "13px",
    padding: "12px 14px",
    borderRadius: "11px",
    border: "1px solid rgba(22,119,255,.25)",
    background: "rgba(22,119,255,.10)",
    color: "#CBE5FF",
    fontSize: "10.5px",
    lineHeight: 1.55,
  },

  actions: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "9px",
    marginBottom: "30px",
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
    border: "1px solid #31577D",
    background: "#0D2B4A",
    color: "#FFFFFF",
    fontSize: "11px",
    fontWeight: 900,
    cursor: "pointer",
  },

  backButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,.12)",
    background: "rgba(255,255,255,.03)",
    color: "#C8D7E7",
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

  previewHeader: {
    marginBottom: "9px",
    padding: "12px 14px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    background: "linear-gradient(120deg, #0B2D52, #124C89)",
    border: "1px solid rgba(255,255,255,.10)",
  },

  previewKicker: {
    margin: "0 0 3px",
    color: "#6DB6FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".11em",
  },

  previewTitle: {
    color: "#FFFFFF",
    fontSize: "13px",
  },

  previewBadge: {
    maxWidth: "190px",
    padding: "6px 8px",
    borderRadius: "999px",
    background: "rgba(255,255,255,.08)",
    color: "#D7E9FA",
    fontSize: "8px",
    fontWeight: 800,
    textAlign: "center",
  },

  resumePaper: {
    width: "100%",
    minHeight: "900px",
    padding: "38px 38px 46px",
    borderRadius: "6px",
    border: "1px solid #D5DEE8",
    background: "#FFFFFF",
    color: "#111827",
    boxShadow: "0 24px 60px rgba(0,0,0,.22)",
    boxSizing: "border-box",
  },

  resumeHeader: {
    marginBottom: "19px",
    paddingBottom: "12px",
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
    marginBottom: "16px",
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
    marginBottom: "12px",
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
    marginTop: "70px",
    padding: "24px 0",
    textAlign: "center",
    color: "#718096",
  },
};
