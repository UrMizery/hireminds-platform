"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { supabase } from "../../lib/supabase";

const COVER_LETTER_DRAFT_KEY = "hireminds-cover-letter-draft-v1";

type CoverLetterTemplate = "Modern" | "Executive" | "Minimal";
type SignatureStyle = "Elegant Script" | "Modern Script" | "Clean Signature";

const TEMPLATE_OPTIONS: {
  name: CoverLetterTemplate;
  eyebrow: string;
  description: string;
}[] = [
  {
    name: "Modern",
    eyebrow: "CLEAN + CURRENT",
    description: "Blue accent line, strong name header, and a polished contemporary layout.",
  },
  {
    name: "Executive",
    eyebrow: "REFINED + FORMAL",
    description: "Traditional alignment with elevated typography and restrained navy details.",
  },
  {
    name: "Minimal",
    eyebrow: "SIMPLE + SHARP",
    description: "Extra white space, subtle rules, and a crisp editorial-style presentation.",
  },
];

const SIGNATURE_OPTIONS: SignatureStyle[] = [
  "Elegant Script",
  "Modern Script",
  "Clean Signature",
];

export default function CoverLetterGeneratorPage() {
  const [fontFamily, setFontFamily] = useState("Times New Roman");
  const [template, setTemplate] = useState<CoverLetterTemplate>("Modern");
  const [signatureStyle, setSignatureStyle] =
    useState<SignatureStyle>("Elegant Script");

  const [todayDate, setTodayDate] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [employerName, setEmployerName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [openingLine, setOpeningLine] = useState("");
  const [experienceLine, setExperienceLine] = useState("");
  const [valueLine, setValueLine] = useState("");
  const [closingLine, setClosingLine] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [message, setMessage] = useState("");
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [aiLoading, setAiLoading] = useState<
    "opening" | "experience" | "value" | "closing" | "all" | null
  >(null);

  const [userId, setUserId] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const openTrackedRef = useRef(false);

  useEffect(() => {
    async function loadUserAndTrack() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user || openTrackedRef.current) return;

      openTrackedRef.current = true;
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("full_name, phone, email, referral_code")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setReferralCode(profile?.referral_code || null);

      if (!draftLoaded) {
        if (profile?.full_name) setFullName(profile.full_name);
        if (profile?.phone) setPhone(profile.phone);
        if (profile?.email || data.user.email) setEmail(profile?.email || data.user.email || "");
      }

      const { error: activityError } = await supabase.from("user_activity").insert({
        user_id: data.user.id,
        full_name: profile?.full_name || null,
        email: profile?.email || data.user.email || null,
        referral_code: profile?.referral_code || null,
        event_type: "tool_opened",
        tool_name: "cover_letter_generator",
        page_name: "/career-toolkit/cover-letter-generator",
      });

      if (activityError) {
        console.error("Cover letter generator tracking error:", activityError);
      }
    }

    void loadUserAndTrack();
  }, [draftLoaded]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(COVER_LETTER_DRAFT_KEY);

      if (raw) {
        const draft = JSON.parse(raw);

        setFontFamily(draft.fontFamily || "Times New Roman");
        setTemplate(draft.template || "Modern");
        setSignatureStyle(draft.signatureStyle || "Elegant Script");
        setTodayDate(draft.todayDate || "");
        setFullName(draft.fullName || "");
        setPhone(draft.phone || "");
        setEmail(draft.email || "");
        setEmployerName(draft.employerName || "");
        setJobTitle(draft.jobTitle || "");
        setCompanyName(draft.companyName || "");
        setHiringManager(draft.hiringManager || "");
        setOpeningLine(draft.openingLine || "");
        setExperienceLine(draft.experienceLine || "");
        setValueLine(draft.valueLine || "");
        setClosingLine(draft.closingLine || "");
        setSignatureName(draft.signatureName || "");
      }
    } catch {
      // Ignore a bad local draft.
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!draftLoaded) return;

    const draft = {
      fontFamily,
      template,
      signatureStyle,
      todayDate,
      fullName,
      phone,
      email,
      employerName,
      jobTitle,
      companyName,
      hiringManager,
      openingLine,
      experienceLine,
      valueLine,
      closingLine,
      signatureName,
    };

    window.localStorage.setItem(COVER_LETTER_DRAFT_KEY, JSON.stringify(draft));
  }, [
    draftLoaded,
    fontFamily,
    template,
    signatureStyle,
    todayDate,
    fullName,
    phone,
    email,
    employerName,
    jobTitle,
    companyName,
    hiringManager,
    openingLine,
    experienceLine,
    valueLine,
    closingLine,
    signatureName,
  ]);

  async function requestAiSection(
    section: "opening" | "experience" | "value" | "closing"
  ) {
    try {
      setAiLoading(section);
      setMessage("");

      const currentText =
        section === "opening"
          ? openingLine
          : section === "experience"
            ? experienceLine
            : section === "value"
              ? valueLine
              : closingLine;

      const response = await fetch("/api/cover-letter-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "section",
          section,
          fullName,
          jobTitle,
          companyName,
          employerName,
          hiringManager,
          openingLine,
          experienceLine,
          valueLine,
          closingLine,
          currentText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate AI suggestions.");
      }

      const generated = String(data?.text || "").trim();

      if (!generated) {
        throw new Error("AI returned an empty response.");
      }

      if (section === "opening") setOpeningLine(generated);
      if (section === "experience") setExperienceLine(generated);
      if (section === "value") setValueLine(generated);
      if (section === "closing") setClosingLine(generated);

      setMessage("AI suggestion added. Review and personalize it before saving.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate AI suggestions right now."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function requestAiFullDraft() {
    try {
      setAiLoading("all");
      setMessage("");

      const response = await fetch("/api/cover-letter-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "all",
          fullName,
          jobTitle,
          companyName,
          employerName,
          hiringManager,
          openingLine,
          experienceLine,
          valueLine,
          closingLine,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Unable to generate the cover letter draft.");
      }

      if (data?.opening) setOpeningLine(String(data.opening).trim());
      if (data?.experience) setExperienceLine(String(data.experience).trim());
      if (data?.value) setValueLine(String(data.value).trim());
      if (data?.closing) setClosingLine(String(data.closing).trim());

      setMessage(
        "AI draft created. Review each paragraph and personalize the details before saving."
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to generate the cover letter draft right now."
      );
    } finally {
      setAiLoading(null);
    }
  }

  async function handleSaveDraft() {
    try {
      const draft = {
        fontFamily,
        template,
        signatureStyle,
        todayDate,
        fullName,
        phone,
        email,
        employerName,
        jobTitle,
        companyName,
        hiringManager,
        openingLine,
        experienceLine,
        valueLine,
        closingLine,
        signatureName,
      };

      window.localStorage.setItem(COVER_LETTER_DRAFT_KEY, JSON.stringify(draft));

      if (userId) {
        const { error: activityError } = await supabase.from("user_activity").insert({
          user_id: userId,
          full_name: fullName || null,
          email: email || null,
          referral_code: referralCode,
          event_type: "tool_completed",
          tool_name: "cover_letter_generator",
          page_name: "/career-toolkit/cover-letter-generator",
        });

        if (activityError) {
          console.error("Cover letter save tracking error:", activityError);
        }
      }

      setMessage("Cover letter draft saved locally in this browser.");
    } catch {
      setMessage("Unable to save your draft locally.");
    }
  }

  function handlePrint() {
    window.print();
  }

  const templateStyles = getTemplateStyles(template);
  const signatureFont = getSignatureFont(signatureStyle);

  const recipientName = hiringManager || employerName || "Hiring Manager";
  const signatureDisplay = signatureName || fullName || "Your Name";

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          @page {
            size: letter;
            margin: 0.55in;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body * {
            visibility: hidden !important;
          }

          .print-wrap,
          .print-wrap * {
            visibility: visible !important;
          }

          .print-wrap {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .cover-letter-paper {
            width: 100% !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
          }

          .hide-on-print {
            display: none !important;
          }
        }

        @media (max-width: 1100px) {
          .cover-letter-shell {
            grid-template-columns: 1fr !important;
          }

          .cover-letter-preview {
            position: static !important;
          }
        }

        @media (max-width: 720px) {
          .cover-letter-page {
            padding: 22px 14px 48px !important;
          }

          .cover-letter-form-grid {
            grid-template-columns: 1fr !important;
          }

          .cover-letter-template-grid {
            grid-template-columns: 1fr !important;
          }

          .cover-letter-actions {
            grid-template-columns: 1fr !important;
          }

          .cover-letter-paper {
            padding: 34px 28px !important;
          }
        }
      `}</style>

      <div className="cover-letter-page" style={styles.pageInner}>
        <header className="hide-on-print" style={styles.pageHeader}>
          <div>
            <p style={styles.kicker}>COVER LETTER STUDIO</p>
            <h1 style={styles.pageTitle}>Create a cover letter that looks as strong as it reads.</h1>
            <p style={styles.pageSubtitle}>
              Choose a layout, add your content, and watch the finished letter update live.
            </p>
          </div>

          <a href="/career-toolkit" style={styles.backTop}>
            ← Career ToolKit
          </a>
        </header>

        <div className="cover-letter-shell" style={styles.shell}>
          <section className="hide-on-print" style={styles.leftCol}>
            <section style={styles.controlSection}>
              <div style={styles.sectionHeadingRow}>
                <div>
                  <p style={styles.sectionKicker}>STYLE</p>
                  <h2 style={styles.sectionTitle}>Choose your template</h2>
                </div>
                <span style={styles.sectionHint}>3 professional layouts</span>
              </div>

              <div
                className="cover-letter-template-grid"
                style={styles.templateGrid}
              >
                {TEMPLATE_OPTIONS.map((option) => {
                  const selected = template === option.name;

                  return (
                    <button
                      key={option.name}
                      type="button"
                      onClick={() => setTemplate(option.name)}
                      style={{
                        ...styles.templateCard,
                        ...(selected ? styles.templateCardSelected : {}),
                      }}
                    >
                      <TemplateThumbnail template={option.name} selected={selected} />
                      <span style={styles.templateEyebrow}>{option.eyebrow}</span>
                      <strong style={styles.templateName}>{option.name}</strong>
                      <span style={styles.templateDescription}>{option.description}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section style={styles.controlSection}>
              <div style={styles.sectionHeadingRow}>
                <div>
                  <p style={styles.sectionKicker}>DOCUMENT SETTINGS</p>
                  <h2 style={styles.sectionTitle}>Typography & signature</h2>
                </div>
              </div>

              <div className="cover-letter-form-grid" style={styles.twoCol}>
                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Letter Font</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    style={styles.input}
                  >
                    <option>Times New Roman</option>
                    <option>Arial</option>
                    <option>Calibri</option>
                  </select>
                </div>

                <div style={styles.fieldWrap}>
                  <label style={styles.label}>Signature Style</label>
                  <select
                    value={signatureStyle}
                    onChange={(e) => setSignatureStyle(e.target.value as SignatureStyle)}
                    style={styles.input}
                  >
                    {SIGNATURE_OPTIONS.map((style) => (
                      <option key={style}>{style}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.signaturePreviewRow}>
                <span style={styles.signaturePreviewLabel}>Signature preview</span>
                <span
                  style={{
                    ...styles.signaturePreview,
                    fontFamily: signatureFont,
                    ...getSignatureExtraStyle(signatureStyle),
                  }}
                >
                  {signatureDisplay}
                </span>
              </div>
            </section>

            <section style={styles.controlSection}>
              <div style={styles.sectionHeadingRow}>
                <div>
                  <p style={styles.sectionKicker}>CONTACT</p>
                  <h2 style={styles.sectionTitle}>Your information</h2>
                </div>
              </div>

              <div className="cover-letter-form-grid" style={styles.twoCol}>
                <Field
                  label="Date"
                  value={todayDate}
                  onChange={setTodayDate}
                  placeholder="March 25, 2026"
                />
                <Field
                  label="Your Full Name"
                  value={fullName}
                  onChange={setFullName}
                  placeholder="Your Name"
                />
                <Field
                  label="Phone Number"
                  value={phone}
                  onChange={setPhone}
                  placeholder="475-777-7777"
                />
                <Field
                  label="Email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@email.com"
                />
              </div>
            </section>

            <section style={styles.controlSection}>
              <div style={styles.sectionHeadingRow}>
                <div>
                  <p style={styles.sectionKicker}>RECIPIENT</p>
                  <h2 style={styles.sectionTitle}>Who is receiving it?</h2>
                </div>
              </div>

              <div className="cover-letter-form-grid" style={styles.twoCol}>
                <Field
                  label="Employer / Contact Name"
                  value={employerName}
                  onChange={setEmployerName}
                  placeholder="Employer Name"
                />
                <Field
                  label="Hiring Manager (optional)"
                  value={hiringManager}
                  onChange={setHiringManager}
                  placeholder="Mr. Smith"
                />
                <Field
                  label="Job Title"
                  value={jobTitle}
                  onChange={setJobTitle}
                  placeholder="Customer Service Representative"
                />
                <Field
                  label="Company Name"
                  value={companyName}
                  onChange={setCompanyName}
                  placeholder="Company Name"
                />
              </div>
            </section>

            <section style={styles.controlSection}>
              <div style={styles.sectionHeadingRow}>
                <div>
                  <p style={styles.sectionKicker}>LETTER CONTENT</p>
                  <h2 style={styles.sectionTitle}>Build the message</h2>
                </div>

                <button
                  type="button"
                  onClick={requestAiFullDraft}
                  disabled={aiLoading !== null}
                  style={{
                    ...styles.aiDraftAllButton,
                    ...(aiLoading !== null ? styles.aiButtonDisabled : {}),
                  }}
                >
                  {aiLoading === "all" ? "Drafting..." : "✦ Draft All with AI"}
                </button>
              </div>

              <TextAreaField
                label="Opening Paragraph"
                value={openingLine}
                onChange={setOpeningLine}
                placeholder="I am writing to express my interest in the [Job Title] position at [Company Name]."
                onAi={() => requestAiSection("opening")}
                aiLoading={aiLoading === "opening"}
                aiDisabled={aiLoading !== null}
              />

              <TextAreaField
                label="Experience / Fit"
                value={experienceLine}
                onChange={setExperienceLine}
                placeholder="Connect your experience and strengths to the role."
                onAi={() => requestAiSection("experience")}
                aiLoading={aiLoading === "experience"}
                aiDisabled={aiLoading !== null}
              />

              <TextAreaField
                label="Value / Why You"
                value={valueLine}
                onChange={setValueLine}
                placeholder="Explain the value you would bring to the team."
                onAi={() => requestAiSection("value")}
                aiLoading={aiLoading === "value"}
                aiDisabled={aiLoading !== null}
              />

              <TextAreaField
                label="Closing Paragraph"
                value={closingLine}
                onChange={setClosingLine}
                placeholder="Thank the employer and close with interest in speaking further."
                onAi={() => requestAiSection("closing")}
                aiLoading={aiLoading === "closing"}
                aiDisabled={aiLoading !== null}
              />

              <Field
                label="Signature Name"
                value={signatureName}
                onChange={setSignatureName}
                placeholder="Leave blank to use your full name"
              />
            </section>

            {message ? <p style={styles.message}>{message}</p> : null}

            <div
              className="cover-letter-actions"
              style={styles.buttonRowThree}
            >
              <button onClick={handleSaveDraft} style={styles.primaryButton}>
                Save Draft
              </button>

              <button onClick={handlePrint} style={styles.secondaryButton}>
                Print / Save PDF
              </button>

              <a href="/career-toolkit" style={styles.linkButton}>
                Back to Career ToolKit
              </a>
            </div>
          </section>

          <aside
            className="print-wrap cover-letter-preview"
            style={styles.rightCol}
          >
            <div style={styles.previewToolbar} className="hide-on-print">
              <div>
                <p style={styles.previewKicker}>LIVE PREVIEW</p>
                <strong style={styles.previewTemplateName}>{template} Template</strong>
              </div>
              <span style={styles.previewHint}>Updates as you type</span>
            </div>

            <div
              className="cover-letter-paper"
              style={{
                ...styles.previewPaper,
                ...templateStyles.paper,
                fontFamily,
              }}
            >
              <header style={{ ...styles.letterHeader, ...templateStyles.header }}>
                <div>
                  <h2 style={{ ...styles.letterName, ...templateStyles.name }}>
                    {fullName || "Your Name"}
                  </h2>

                  {jobTitle ? (
                    <p style={{ ...styles.targetRole, ...templateStyles.targetRole }}>
                      {jobTitle}
                    </p>
                  ) : null}
                </div>

                <div style={{ ...styles.contactBlock, ...templateStyles.contact }}>
                  {phone ? <span>{phone}</span> : null}
                  {email ? <span>{email}</span> : null}
                </div>
              </header>

              <div style={{ ...styles.headerRule, ...templateStyles.rule }} />

              <div style={styles.letterBody}>
                <p style={styles.dateText}>{todayDate || "March 25, 2026"}</p>

                <div style={styles.recipientBlock}>
                  <p style={styles.letterText}>{employerName || "Employer Name"}</p>
                  {hiringManager ? <p style={styles.letterText}>{hiringManager}</p> : null}
                  {companyName ? <p style={styles.letterText}>{companyName}</p> : null}
                </div>

                <p style={styles.salutation}>Dear {recipientName},</p>

                <p style={styles.letterParagraph}>
                  {openingLine ||
                    "I am writing to express my interest in the position with your company. I am excited about the opportunity to contribute my skills and professionalism to your team."}
                </p>

                <p style={styles.letterParagraph}>
                  {experienceLine ||
                    "I bring strong communication, teamwork, organization, and customer service skills, along with the ability to adapt quickly and work well in fast-paced environments."}
                </p>

                <p style={styles.letterParagraph}>
                  {valueLine ||
                    "I am confident that my professionalism, adaptability, and willingness to learn would make me a strong addition to your team."}
                </p>

                <p style={styles.letterParagraph}>
                  {closingLine ||
                    "Thank you for your time and consideration. I look forward to the opportunity to speak with you further about how I can contribute to your organization."}
                </p>

                <div style={styles.signOff}>
                  <p style={styles.sincerely}>Sincerely,</p>

                  <p
                    style={{
                      ...styles.signature,
                      fontFamily: signatureFont,
                      ...getSignatureExtraStyle(signatureStyle),
                    }}
                  >
                    {signatureDisplay}
                  </p>

                  <p style={styles.signatureContact}>
                    {[phone, email].filter(Boolean).join(" • ") || "Phone • Email"}
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}

function TemplateThumbnail({
  template,
  selected,
}: {
  template: CoverLetterTemplate;
  selected: boolean;
}) {
  const visual = getTemplateStyles(template);

  return (
    <span
      style={{
        ...styles.templateThumbnail,
        borderColor: selected ? "#1677FF" : "#dbe3ed",
      }}
    >
      <span style={{ ...styles.thumbName, ...visual.thumbName }} />
      <span style={{ ...styles.thumbRule, ...visual.thumbRule }} />
      <span style={styles.thumbShort} />
      <span style={styles.thumbLine} />
      <span style={styles.thumbLine} />
      <span style={{ ...styles.thumbLine, width: "72%" }} />
      <span style={styles.thumbSignature} />
    </span>
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

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  onAi,
  aiLoading,
  aiDisabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onAi?: () => void;
  aiLoading?: boolean;
  aiDisabled?: boolean;
}) {
  return (
    <div style={styles.fieldWrap}>
      <div style={styles.textAreaLabelRow}>
        <label style={{ ...styles.label, marginBottom: 0 }}>{label}</label>

        {onAi ? (
          <button
            type="button"
            onClick={onAi}
            disabled={aiDisabled}
            style={{
              ...styles.aiAssistButton,
              ...(aiDisabled ? styles.aiButtonDisabled : {}),
            }}
          >
            {aiLoading ? "Thinking..." : value.trim() ? "✦ Improve with AI" : "✦ Write with AI"}
          </button>
        ) : null}
      </div>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.textarea}
      />
    </div>
  );
}

function getSignatureFont(style: SignatureStyle) {
  if (style === "Modern Script") {
    return '"Segoe Script", "Lucida Handwriting", "Brush Script MT", cursive';
  }

  if (style === "Clean Signature") {
    return '"Trebuchet MS", "Segoe UI", Arial, sans-serif';
  }

  return '"Brush Script MT", "Segoe Script", "Lucida Handwriting", cursive';
}

function getSignatureExtraStyle(style: SignatureStyle): CSSProperties {
  if (style === "Modern Script") {
    return {
      fontSize: "23px",
      fontWeight: 400,
      letterSpacing: "-0.02em",
      transform: "none",
    };
  }

  if (style === "Clean Signature") {
    return {
      fontSize: "17px",
      fontWeight: 600,
      fontStyle: "italic",
      letterSpacing: "-0.01em",
      transform: "none",
    };
  }

  return {
    fontSize: "24px",
    fontWeight: 400,
    letterSpacing: "-0.02em",
    transform: "none",
  };
}

function getTemplateStyles(template: CoverLetterTemplate) {
  if (template === "Executive") {
    return {
      paper: {
        borderTop: "8px solid #0B2748",
      } as CSSProperties,
      header: {
        alignItems: "flex-end",
      } as CSSProperties,
      name: {
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: "31px",
        color: "#0B2748",
      } as CSSProperties,
      targetRole: {
        color: "#475569",
      } as CSSProperties,
      contact: {
        color: "#475569",
      } as CSSProperties,
      rule: {
        background: "#0B2748",
        height: "1px",
      } as CSSProperties,
      thumbName: {
        background: "#0B2748",
        width: "48%",
      } as CSSProperties,
      thumbRule: {
        background: "#0B2748",
      } as CSSProperties,
    };
  }

  if (template === "Minimal") {
    return {
      paper: {
        borderTop: "1px solid #d7dee8",
      } as CSSProperties,
      header: {
        alignItems: "center",
      } as CSSProperties,
      name: {
        fontSize: "28px",
        color: "#111827",
        letterSpacing: "-0.03em",
      } as CSSProperties,
      targetRole: {
        color: "#c7d6e7",
      } as CSSProperties,
      contact: {
        color: "#64748b",
      } as CSSProperties,
      rule: {
        background: "#d7dee8",
        height: "1px",
      } as CSSProperties,
      thumbName: {
        background: "#111827",
        width: "38%",
      } as CSSProperties,
      thumbRule: {
        background: "#d7dee8",
      } as CSSProperties,
    };
  }

  return {
    paper: {
      borderTop: "6px solid #1677FF",
    } as CSSProperties,
    header: {
      alignItems: "flex-end",
    } as CSSProperties,
    name: {
      fontSize: "32px",
      color: "#0F172A",
    } as CSSProperties,
    targetRole: {
      color: "#1677FF",
    } as CSSProperties,
    contact: {
      color: "#64748b",
    } as CSSProperties,
    rule: {
      background: "#1677FF",
      height: "2px",
    } as CSSProperties,
    thumbName: {
      background: "#1677FF",
      width: "46%",
    } as CSSProperties,
    thumbRule: {
      background: "#1677FF",
    } as CSSProperties,
  };
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at 8% 0%, rgba(22,119,255,.18), transparent 24%), radial-gradient(circle at 92% 12%, rgba(10,42,78,.12), transparent 26%), linear-gradient(180deg, #DCE7F2 0%, #E8EEF5 48%, #DDE6EF 100%)",
    color: "#0f172a",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  pageInner: {
    maxWidth: "1480px",
    margin: "0 auto",
    padding: "34px 24px 64px",
  },

  pageHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "24px",
    marginBottom: "26px",
    padding: "28px 30px",
    borderRadius: "20px",
    border: "1px solid rgba(33,78,124,.18)",
    background:
      "linear-gradient(120deg, rgba(9,36,67,.98) 0%, rgba(13,55,101,.96) 62%, rgba(22,119,255,.88) 130%)",
    boxShadow: "0 18px 38px rgba(18,49,82,.14)",
  },

  kicker: {
    margin: "0 0 9px",
    color: "#1677FF",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".16em",
  },

  pageTitle: {
    margin: "0 0 10px",
    maxWidth: "860px",
    color: "#ffffff",
    fontSize: "clamp(36px, 4vw, 54px)",
    lineHeight: 1.02,
    letterSpacing: "-0.045em",
    fontWeight: 820,
  },

  pageSubtitle: {
    margin: 0,
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.65,
  },

  backTop: {
    flexShrink: 0,
    color: "#dcecff",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
    padding: "10px 14px",
    borderRadius: "999px",
    border: "1px solid rgba(255,255,255,.18)",
    background: "rgba(255,255,255,.06)",
  },

  shell: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(520px, .9fr)",
    gap: "28px",
    alignItems: "start",
  },

  leftCol: {
    display: "grid",
    gap: "16px",
    padding: "0 2px",
  },

  rightCol: {
    position: "sticky",
    top: "22px",
  },

  controlSection: {
    padding: "24px",
    borderRadius: "18px",
    border: "1px solid rgba(57,93,131,.16)",
    background:
      "linear-gradient(145deg, rgba(244,248,252,.82) 0%, rgba(229,237,246,.72) 100%)",
    boxShadow: "0 12px 28px rgba(30,58,90,.055)",
  },

  sectionHeadingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    marginBottom: "17px",
  },

  sectionKicker: {
    margin: "0 0 5px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".13em",
  },

  sectionTitle: {
    margin: 0,
    color: "#ffffff",
    fontSize: "22px",
    lineHeight: 1.2,
    letterSpacing: "-0.025em",
    fontWeight: 800,
  },

  sectionHint: {
    color: "#7b8a9c",
    fontSize: "11px",
  },

  templateGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "12px",
  },

  templateCard: {
    padding: "14px",
    textAlign: "left",
    borderRadius: "14px",
    border: "1px solid #dbe3ed",
    background: "rgba(242,247,252,.78)",
    color: "#0f172a",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  templateCardSelected: {
    borderColor: "#1677FF",
    background: "linear-gradient(145deg, #EDF5FF 0%, #DDEBFA 100%)",
    boxShadow: "0 0 0 3px rgba(22,119,255,.08)",
  },

  templateThumbnail: {
    height: "105px",
    marginBottom: "12px",
    padding: "13px",
    display: "grid",
    alignContent: "start",
    gap: "6px",
    borderRadius: "9px",
    border: "1px solid",
    background: "#ffffff",
    boxShadow: "0 6px 16px rgba(15,23,42,.05)",
  },

  thumbName: {
    display: "block",
    height: "7px",
    borderRadius: "999px",
  },

  thumbRule: {
    display: "block",
    width: "100%",
    height: "2px",
    margin: "2px 0 3px",
  },

  thumbShort: {
    display: "block",
    width: "28%",
    height: "4px",
    borderRadius: "999px",
    background: "#aab7c6",
  },

  thumbLine: {
    display: "block",
    width: "100%",
    height: "4px",
    borderRadius: "999px",
    background: "#dce3ea",
  },

  thumbSignature: {
    display: "block",
    width: "35%",
    height: "6px",
    marginTop: "6px",
    borderRadius: "999px",
    background: "#9aabc0",
    transform: "skewX(-22deg)",
  },

  templateEyebrow: {
    display: "block",
    marginBottom: "5px",
    color: "#1677FF",
    fontSize: "8px",
    fontWeight: 900,
    letterSpacing: ".08em",
  },

  templateName: {
    display: "block",
    marginBottom: "5px",
    color: "#102238",
    fontSize: "14px",
  },

  templateDescription: {
    display: "block",
    color: "#6c7b8e",
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
    marginBottom: "7px",
    color: "#42556d",
    fontSize: "12px",
    fontWeight: 700,
  },

  input: {
    width: "100%",
    minHeight: "44px",
    padding: "11px 13px",
    borderRadius: "9px",
    border: "1px solid #cfd9e5",
    background: "rgba(247,250,253,.88)",
    color: "#102238",
    fontSize: "13px",
    boxSizing: "border-box",
    outline: "none",
  },

  textarea: {
    width: "100%",
    minHeight: "104px",
    padding: "12px 13px",
    borderRadius: "9px",
    border: "1px solid #cfd9e5",
    background: "rgba(255,255,255,.82)",
    color: "#102238",
    fontSize: "13px",
    lineHeight: 1.55,
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },

  signaturePreviewRow: {
    marginTop: "6px",
    padding: "14px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderRadius: "12px",
    border: "1px solid #cbd9e8",
    background: "linear-gradient(120deg, #EAF2FB 0%, #DDEAF8 100%)",
  },

  signaturePreviewLabel: {
    color: "#7b8a9c",
    fontSize: "10px",
    fontWeight: 800,
    letterSpacing: ".06em",
    textTransform: "uppercase",
  },

  signaturePreview: {
    color: "#102238",
    whiteSpace: "nowrap",
    maxWidth: "240px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  textAreaLabelRow: {
    marginBottom: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
  },

  aiAssistButton: {
    flexShrink: 0,
    minHeight: "30px",
    padding: "0 11px",
    borderRadius: "999px",
    border: "1px solid rgba(22,119,255,.24)",
    background: "linear-gradient(120deg, rgba(22,119,255,.10), rgba(22,119,255,.04))",
    color: "#145fad",
    fontSize: "10px",
    fontWeight: 850,
    cursor: "pointer",
  },

  aiDraftAllButton: {
    flexShrink: 0,
    minHeight: "36px",
    padding: "0 14px",
    borderRadius: "999px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#FFFFFF",
    fontSize: "10px",
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 8px 18px rgba(22,119,255,.16)",
  },

  aiButtonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  message: {
    margin: "2px 0 0",
    color: "#24466b",
    fontSize: "12px",
    lineHeight: 1.6,
  },

  buttonRowThree: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px",
    marginTop: "2px",
  },

  primaryButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid #1677FF",
    background: "#1677FF",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },

  secondaryButton: {
    minHeight: "46px",
    borderRadius: "10px",
    border: "1px solid #183c64",
    background: "#0d2948",
    color: "#fff",
    fontSize: "12px",
    fontWeight: 850,
    cursor: "pointer",
  },

  linkButton: {
    minHeight: "46px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "10px",
    border: "1px solid #cbd6e2",
    background: "rgba(255,255,255,.72)",
    color: "#24466b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
  },

  previewToolbar: {
    marginBottom: "10px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "12px",
    background: "linear-gradient(120deg, #0B2748 0%, #123E6C 100%)",
    boxShadow: "0 10px 24px rgba(11,39,72,.12)",
  },

  previewKicker: {
    margin: "0 0 4px",
    color: "#1677FF",
    fontSize: "9px",
    fontWeight: 900,
    letterSpacing: ".12em",
  },

  previewTemplateName: {
    color: "#102238",
    fontSize: "14px",
  },

  previewHint: {
    color: "#a9c6e5",
    fontSize: "10px",
  },

  previewPaper: {
    minHeight: "980px",
    padding: "58px 62px",
    background:
      "linear-gradient(180deg, #FCFDFE 0%, #F7FAFC 100%)",
    color: "#111827",
    borderRadius: "8px",
    border: "1px solid #C9D6E4",
    boxShadow: "0 28px 70px rgba(15,23,42,.16)",
    boxSizing: "border-box",
  },

  letterHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "24px",
  },

  letterName: {
    margin: 0,
    lineHeight: 1.05,
    letterSpacing: "-0.035em",
    fontWeight: 800,
  },

  targetRole: {
    margin: "7px 0 0",
    fontSize: "11px",
    fontWeight: 800,
  },

  contactBlock: {
    display: "grid",
    gap: "4px",
    textAlign: "right",
    fontSize: "10px",
    lineHeight: 1.4,
  },

  headerRule: {
    width: "100%",
    margin: "21px 0 28px",
  },

  letterBody: {
    maxWidth: "100%",
  },

  dateText: {
    margin: "0 0 22px",
    color: "#374151",
    fontSize: "11.5pt",
    lineHeight: 1.55,
  },

  recipientBlock: {
    marginBottom: "22px",
  },

  salutation: {
    margin: "0 0 22px",
    fontSize: "11.5pt",
    lineHeight: 1.55,
    color: "#111827",
  },

  letterText: {
    margin: 0,
    fontSize: "11.5pt",
    lineHeight: 1.55,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  letterParagraph: {
    margin: "0 0 18px",
    fontSize: "11.5pt",
    lineHeight: 1.62,
    color: "#111827",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },

  signOff: {
    marginTop: "28px",
  },

  sincerely: {
    margin: "0 0 11px",
    color: "#111827",
    fontSize: "11.5pt",
  },

  signature: {
    margin: "0 0 4px",
    color: "#0f172a",
    lineHeight: 1.12,
    transformOrigin: "left center",
  },

  signatureContact: {
    margin: 0,
    color: "#64748b",
    fontSize: "9.5pt",
    lineHeight: 1.45,
  },
};
