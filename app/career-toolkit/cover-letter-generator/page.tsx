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
                <span style={styles.sectionHint}>Keep it focused and specific</span>
              </div>

              <TextAreaField
                label="Opening Paragraph"
                value={openingLine}
                onChange={setOpeningLine}
                placeholder="I am writing to express my interest in the [Job Title] position at [Company Name]."
              />

              <TextAreaField
                label="Experience / Fit"
                value={experienceLine}
                onChange={setExperienceLine}
                placeholder="Connect your experience and strengths to the role."
              />

              <TextAreaField
                label="Value / Why You"
                value={valueLine}
                onChange={setValueLine}
                placeholder="Explain the value you would bring to the team."
              />

              <TextAreaField
                label="Closing Paragraph"
                value={closingLine}
                onChange={setClosingLine}
                placeholder="Thank the employer and close with interest in speaking further."
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
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>{label}</label>
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
      fontSize: "31px",
      fontWeight: 400,
      letterSpacing: "-0.04em",
      transform: "rotate(-1deg)",
    };
  }

  if (style === "Clean Signature") {
    return {
      fontSize: "20px",
      fontWeight: 700,
      fontStyle: "italic",
      letterSpacing: "-0.02em",
      transform: "none",
    };
  }

  return {
    fontSize: "34px",
    fontWeight: 400,
    letterSpacing: "-0.035em",
    transform: "rotate(-2deg)",
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
        color: "#64748b",
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
      "radial-gradient(circle at 7% 0%, rgba(22,119,255,.10), transparent 24%), linear-gradient(180deg, #EDF3F9 0%, #F6F8FB 100%)",
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
    paddingBottom: "22px",
    borderBottom: "1px solid #d8e2ed",
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
    color: "#0b1b31",
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
    color: "#24466b",
    textDecoration: "none",
    fontSize: "12px",
    fontWeight: 800,
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
  },

  rightCol: {
    position: "sticky",
    top: "22px",
  },

  controlSection: {
    padding: "24px 0",
    borderBottom: "1px solid #dbe4ee",
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
    color: "#102238",
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
    background: "rgba(255,255,255,.72)",
    color: "#0f172a",
    cursor: "pointer",
    fontFamily: "inherit",
  },

  templateCardSelected: {
    borderColor: "#1677FF",
    background: "#f8fbff",
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
    background: "rgba(255,255,255,.82)",
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
    marginTop: "2px",
    padding: "15px 0 2px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "20px",
    borderTop: "1px solid #e0e7ef",
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
    color: "#7c8b9d",
    fontSize: "10px",
  },

  previewPaper: {
    minHeight: "980px",
    padding: "58px 62px",
    background: "#ffffff",
    color: "#111827",
    borderRadius: "4px",
    border: "1px solid #dbe3ec",
    boxShadow: "0 26px 65px rgba(15,23,42,.12)",
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
    margin: "0 0 5px",
    color: "#0f172a",
    lineHeight: 1.08,
    transformOrigin: "left center",
  },

  signatureContact: {
    margin: 0,
    color: "#64748b",
    fontSize: "9.5pt",
    lineHeight: 1.45,
  },
};
