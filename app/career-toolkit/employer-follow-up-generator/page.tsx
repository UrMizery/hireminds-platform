"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { supabase } from "../../lib/supabase";

type TemplateType =
  | "thank-you"
  | "follow-up-status"
  | "withdraw-application"
  | "accept-job-offer"
  | "decline-job-offer"
  | "request-interview-reschedule"
  | "request-raise"
  | "request-promotion"
  | "request-pto"
  | "request-extended-leave"
  | "resignation-letter"
  | "farewell-message"
  | "new-position-introduction"
  | "confidential-hr-concern"
  | "report-workplace-incident";

const LETTER_DRAFT_KEY =
  "hireminds-house-of-letters-draft-v1";

export default function HouseOfLettersPage() {
  const [template, setTemplate] =
    useState<TemplateType>("thank-you");

  const [createdDate, setCreatedDate] =
    useState("");

  const [effectiveDate, setEffectiveDate] =
    useState("");

  const [candidateName, setCandidateName] =
    useState("");

  const [employerName, setEmployerName] =
    useState("");

  const [companyName, setCompanyName] =
    useState("");

  const [jobTitle, setJobTitle] =
    useState("");

  const [interviewDate, setInterviewDate] =
    useState("");

  const [customNote, setCustomNote] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [draftLoaded, setDraftLoaded] =
    useState(false);

  const [userId, setUserId] =
    useState("");

  const [referralCode, setReferralCode] =
    useState<string | null>(null);

  const openTrackedRef = useRef(false);

  /* ---------------------------------------------------------------------- */
  /* USER + ACTIVITY TRACKING                                               */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    async function loadUserAndTrack() {
      const { data, error } =
        await supabase.auth.getUser();

      if (
        error ||
        !data.user ||
        openTrackedRef.current
      ) {
        return;
      }

      openTrackedRef.current = true;

      setUserId(data.user.id);

      const { data: profile } =
        await supabase
          .from("candidate_profiles")
          .select(
            "full_name, email, referral_code"
          )
          .eq(
            "user_id",
            data.user.id
          )
          .maybeSingle();

      setReferralCode(
        profile?.referral_code || null
      );

      const { error: activityError } =
        await supabase
          .from("user_activity")
          .insert({
            user_id: data.user.id,

            full_name:
              profile?.full_name || null,

            email:
              profile?.email ||
              data.user.email ||
              null,

            referral_code:
              profile?.referral_code ||
              null,

            event_type:
              "tool_opened",

            tool_name:
              "house_of_letters",

            page_name:
              "/career-toolkit/house-of-letters",
          });

      if (activityError) {
        console.error(
          "House of Letters tracking error:",
          activityError
        );
      }
    }

    loadUserAndTrack();
  }, []);

  /* ---------------------------------------------------------------------- */
  /* LOAD SAVED DRAFT                                                       */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          LETTER_DRAFT_KEY
        );

      if (raw) {
        const draft =
          JSON.parse(raw);

        setTemplate(
          draft.template ||
            "thank-you"
        );

        setCreatedDate(
          draft.createdDate || ""
        );

        setEffectiveDate(
          draft.effectiveDate || ""
        );

        setCandidateName(
          draft.candidateName || ""
        );

        setEmployerName(
          draft.employerName || ""
        );

        setCompanyName(
          draft.companyName || ""
        );

        setJobTitle(
          draft.jobTitle || ""
        );

        setInterviewDate(
          draft.interviewDate || ""
        );

        setCustomNote(
          draft.customNote || ""
        );
      }
    } catch {
      // Ignore bad local draft.
    } finally {
      setDraftLoaded(true);
    }
  }, []);

  /* ---------------------------------------------------------------------- */
  /* AUTO SAVE                                                              */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!draftLoaded) return;

    const draft = {
      template,
      createdDate,
      effectiveDate,
      candidateName,
      employerName,
      companyName,
      jobTitle,
      interviewDate,
      customNote,
    };

    window.localStorage.setItem(
      LETTER_DRAFT_KEY,
      JSON.stringify(draft)
    );
  }, [
    draftLoaded,
    template,
    createdDate,
    effectiveDate,
    candidateName,
    employerName,
    companyName,
    jobTitle,
    interviewDate,
    customNote,
  ]);

  /* ---------------------------------------------------------------------- */
  /* SUBJECT                                                                */
  /* ---------------------------------------------------------------------- */

  const subjectLine = useMemo(() => {
    switch (template) {
      case "thank-you":
        return `Thank You - ${
          jobTitle || "Interview"
        }${
          companyName
            ? ` - ${companyName}`
            : ""
        }`;

      case "follow-up-status":
        return `Follow-Up on ${
          jobTitle || "Application"
        }${
          companyName
            ? ` - ${companyName}`
            : ""
        }`;

      case "withdraw-application":
        return `Withdrawal of Application${
          jobTitle
            ? ` - ${jobTitle}`
            : ""
        }`;

      case "accept-job-offer":
        return `Acceptance of Job Offer${
          jobTitle
            ? ` - ${jobTitle}`
            : ""
        }`;

      case "decline-job-offer":
        return `Declining Job Offer${
          jobTitle
            ? ` - ${jobTitle}`
            : ""
        }`;

      case "request-interview-reschedule":
        return `Request to Reschedule Interview${
          jobTitle
            ? ` - ${jobTitle}`
            : ""
        }`;

      case "request-raise":
        return "Request for Compensation Review";

      case "request-promotion":
        return "Request for Promotion Consideration";

      case "request-pto":
        return "Request for PTO";

      case "request-extended-leave":
        return "Request for Extended Leave / FMLA";

      case "resignation-letter":
        return "Resignation Letter";

      case "farewell-message":
        return "Farewell and Thank You";

      case "new-position-introduction":
        return "Introduction - Excited to Join the Team";

      case "confidential-hr-concern":
        return "Confidential HR Concern";

      case "report-workplace-incident":
        return "Report of Workplace Incident";

      default:
        return "Professional Letter";
    }
  }, [
    template,
    jobTitle,
    companyName,
  ]);

  /* ---------------------------------------------------------------------- */
  /* LETTER BODY                                                            */
  /* ---------------------------------------------------------------------- */

  const bodyText = useMemo(() => {
    const greetingName =
      employerName ||
      "Hiring Manager";

    const senderName =
      candidateName ||
      "Your Name";

    const roleText =
      jobTitle ||
      "the position";

    const companyText =
      companyName ||
      "your company";

    const dateText =
      interviewDate ||
      "our recent conversation";

    const createdText =
      createdDate ||
      "today";

    const effectiveText =
      effectiveDate ||
      "the requested date";

    switch (template) {
      case "thank-you":
        return `Dear ${greetingName},

Thank you for taking the time to speak with me regarding ${roleText} at ${companyText}. I appreciate the opportunity to learn more about the role and your team.

I enjoyed our conversation on ${dateText} and remain very interested in the opportunity. Our discussion confirmed my excitement about the role, and I would be grateful for the chance to contribute to your team.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;

      case "follow-up-status":
        return `Dear ${greetingName},

I hope you are doing well. I wanted to follow up regarding ${roleText} at ${companyText} and see whether there have been any updates on the hiring process.

I remain very interested in the opportunity and appreciate the time you and your team have taken to review my application. I enjoyed speaking with you on ${dateText} and would be glad to provide any additional information if needed.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Thank you again for your time and consideration. I look forward to hearing from you.

Sincerely,
${senderName}`;

      case "withdraw-application":
        return `Dear ${greetingName},

Thank you for considering me for ${roleText} at ${companyText}. After careful consideration, I would like to respectfully withdraw my application from consideration at this time.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I appreciate the time and consideration extended to me and wish you continued success in filling the position.

Sincerely,
${senderName}`;

      case "accept-job-offer":
        return `Dear ${greetingName},

Thank you for offering me the opportunity to join ${companyText} as ${roleText}. I am pleased to formally accept the offer.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I appreciate the confidence you and your team have placed in me, and I look forward to contributing to the organization.

Sincerely,
${senderName}`;

      case "decline-job-offer":
        return `Dear ${greetingName},

Thank you very much for offering me the opportunity to join ${companyText} as ${roleText}. After careful consideration, I have decided to respectfully decline the offer at this time.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I sincerely appreciate your time, consideration, and the opportunity to learn more about your team.

Sincerely,
${senderName}`;

      case "request-interview-reschedule":
        return `Dear ${greetingName},

Thank you for the opportunity to interview for ${roleText} at ${companyText}. I am very interested in the position and appreciate your time.

I am writing to respectfully ask whether it would be possible to reschedule the interview.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Thank you for your understanding and flexibility. I remain very interested in the opportunity and look forward to speaking with you.

Sincerely,
${senderName}`;

      case "request-raise":
        return `Dear ${greetingName},

I hope you are doing well. I am writing to respectfully request a conversation regarding my compensation and the possibility of a salary increase.

Over time, I have continued to contribute to my role and support the goals of ${companyText}. I would appreciate the opportunity to discuss my performance, responsibilities, and compensation in more detail.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Thank you for your time and consideration. I would be grateful for the opportunity to speak with you further.

Sincerely,
${senderName}`;

      case "request-promotion":
        return `Dear ${greetingName},

I hope you are doing well. I am writing to express my interest in being considered for a promotion opportunity within ${companyText}.

I value my role and the experience I have gained, and I would appreciate the opportunity to discuss my growth, contributions, and readiness for additional responsibility.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Thank you for your time and consideration. I would welcome the opportunity to speak with you further.

Sincerely,
${senderName}`;

      case "request-pto":
        return `Dear ${greetingName},

I am writing to respectfully request paid time off beginning on ${effectiveText}.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Please let me know whether this request can be approved or if any additional information is needed.

Thank you for your time and consideration.

Sincerely,
${senderName}`;

      case "request-extended-leave":
        return `Dear ${greetingName},

I am writing to formally request extended leave beginning on ${effectiveText}. This request may include leave under applicable policies such as FMLA, if appropriate.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}Please let me know what documentation or next steps are needed to support this request.

Thank you for your time and consideration.

Sincerely,
${senderName}`;

      case "resignation-letter":
        return `Dear ${greetingName},

Please accept this letter as formal notice of my resignation from my position${
          jobTitle
            ? ` as ${jobTitle}`
            : ""
        } at ${companyText}, effective ${effectiveText}.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I appreciate the opportunity to have been part of the organization and thank you for the experience and support provided during my time here.

Sincerely,
${senderName}`;

      case "farewell-message":
        return `Dear Team,

As I prepare to move on from ${companyText}, I wanted to take a moment to thank everyone for the support, collaboration, and experiences shared during my time here.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I truly appreciate the time we worked together and wish everyone continued success in the future.

Warm regards,
${senderName}`;

      case "new-position-introduction":
        return `Dear Team,

My name is ${senderName}, and I am excited to introduce myself as I begin my new position${
          jobTitle
            ? ` as ${jobTitle}`
            : ""
        }${
          companyText
            ? ` at ${companyText}`
            : ""
        }.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I look forward to working with everyone, learning from the team, and contributing in a positive and professional way.

Best regards,
${senderName}`;

      case "confidential-hr-concern":
        return `Dear ${greetingName},

I am writing on ${createdText} to raise a confidential workplace concern and respectfully request that this matter be handled with discretion.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I would appreciate the opportunity to discuss this matter further and understand the next appropriate steps.

Sincerely,
${senderName}`;

      case "report-workplace-incident":
        return `Dear ${greetingName},

I am writing on ${createdText} to formally document and report a workplace incident.

${
  customNote
    ? `${customNote}\n\n`
    : ""
}I am sharing this information so the matter is documented appropriately and can be reviewed according to company policy.

Sincerely,
${senderName}`;

      default:
        return "";
    }
  }, [
    template,
    employerName,
    candidateName,
    jobTitle,
    companyName,
    interviewDate,
    createdDate,
    effectiveDate,
    customNote,
  ]);

  /* ---------------------------------------------------------------------- */
  /* SAVE                                                                   */
  /* ---------------------------------------------------------------------- */

  async function handleSaveDraft() {
    try {
      const draft = {
        template,
        createdDate,
        effectiveDate,
        candidateName,
        employerName,
        companyName,
        jobTitle,
        interviewDate,
        customNote,
      };

      window.localStorage.setItem(
        LETTER_DRAFT_KEY,
        JSON.stringify(draft)
      );

      if (userId) {
        const { error: activityError } =
          await supabase
            .from("user_activity")
            .insert({
              user_id: userId,
              full_name: null,
              email: null,
              referral_code:
                referralCode,
              event_type:
                "tool_completed",
              tool_name:
                "house_of_letters",
              page_name:
                "/career-toolkit/house-of-letters",
            });

        if (activityError) {
          console.error(
            "House of Letters save tracking error:",
            activityError
          );
        }
      }

      setMessage(
        "Letter draft saved locally in this browser."
      );
    } catch {
      setMessage(
        "Unable to save your draft locally."
      );
    }
  }

  function handlePrint() {
    window.print();
  }

  /* ---------------------------------------------------------------------- */
  /* PAGE                                                                   */
  /* ---------------------------------------------------------------------- */

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-wrap,
          .print-wrap * {
            visibility: visible !important;
          }

          .print-wrap {
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            background: white !important;
            padding: 24px !important;
            margin: 0 !important;
            border: none !important;
            box-shadow: none !important;
          }

          .hide-on-print {
            display: none !important;
          }
        }

        @media (max-width: 1000px) {
          .house-layout {
            grid-template-columns: 1fr !important;
          }

          .house-preview {
            position: relative !important;
            top: auto !important;
          }
        }

        @media (max-width: 700px) {
          .house-form-grid {
            grid-template-columns: 1fr !important;
          }

          .house-template-grid {
            grid-template-columns: 1fr !important;
          }

          .house-actions {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* ABSTRACT BACKGROUND */}

      <div style={styles.blueGlow} />
      <div style={styles.grayGlow} />
      <div style={styles.dotPattern} />

      <div style={styles.shell}>
        {/* HERO */}

        <header style={styles.hero}>
          <div>
            <p style={styles.kicker}>
              CAREER TOOLKIT
            </p>

            <h1 style={styles.title}>
              The House of Letters
            </h1>

            <p style={styles.subtitle}>
              From thank-you notes to
              resignation letters, create
              the words that move your
              career forward.
            </p>
          </div>

          <a
            href="/career-toolkit"
            style={styles.backLink}
          >
            ← Career ToolKit
          </a>
        </header>

        {/* BLUE ACCENT */}

        <div style={styles.accentLine} />

        {/* MAIN WORKSPACE */}

        <div
          className="house-layout"
          style={styles.layout}
        >
          {/* FORM */}

          <section
            className="hide-on-print"
            style={styles.formArea}
          >
            <div
              style={
                styles.sectionHeading
              }
            >
              <p
                style={
                  styles.sectionKicker
                }
              >
                LETTER TYPE
              </p>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Choose your letter
              </h2>

              <p
                style={
                  styles.sectionDescription
                }
              >
                Select the type of
                professional message you
                need, then add your
                details below.
              </p>
            </div>

            {/* TEMPLATES */}

            <div
              className="house-template-grid"
              style={
                styles.templateGrid
              }
            >
              {TEMPLATES.map(
                (item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() =>
                      setTemplate(
                        item.value
                      )
                    }
                    style={{
                      ...styles.templateButton,

                      ...(template ===
                      item.value
                        ? styles.templateButtonActive
                        : {}),
                    }}
                  >
                    <span
                      style={{
                        ...styles.templateDot,

                        ...(template ===
                        item.value
                          ? styles.templateDotActive
                          : {}),
                      }}
                    />

                    {item.label}
                  </button>
                )
              )}
            </div>

            {/* DETAILS */}

            <div
              style={
                styles.formSectionDivider
              }
            />

            <div
              style={
                styles.sectionHeadingSmall
              }
            >
              <p
                style={
                  styles.sectionKicker
                }
              >
                YOUR DETAILS
              </p>

              <h2
                style={
                  styles.detailsTitle
                }
              >
                Personalize the letter
              </h2>
            </div>

            <div
              className="house-form-grid"
              style={styles.formGrid}
            >
              <Field
                label="Date Created / Sent"
                value={createdDate}
                onChange={
                  setCreatedDate
                }
                placeholder="March 28, 2026"
              />

              <Field
                label="Effective Date (if needed)"
                value={effectiveDate}
                onChange={
                  setEffectiveDate
                }
                placeholder="April 15, 2026"
              />

              <Field
                label="Your Name"
                value={candidateName}
                onChange={
                  setCandidateName
                }
                placeholder="Your full name"
              />

              <Field
                label="Employer / Manager / HR Name"
                value={employerName}
                onChange={
                  setEmployerName
                }
                placeholder="Hiring manager, HR, supervisor"
              />

              <Field
                label="Company Name"
                value={companyName}
                onChange={
                  setCompanyName
                }
                placeholder="Company name"
              />

              <Field
                label="Job Title / Role"
                value={jobTitle}
                onChange={
                  setJobTitle
                }
                placeholder="Job title or current role"
              />

              <Field
                label="Interview Date / Reference"
                value={interviewDate}
                onChange={
                  setInterviewDate
                }
                placeholder="Example: March 25 or our recent conversation"
              />
            </div>

            <div style={styles.fieldWrap}>
              <label style={styles.label}>
                Extra Details / Custom
                Note
              </label>

              <textarea
                value={customNote}
                onChange={(e) =>
                  setCustomNote(
                    e.target.value
                  )
                }
                placeholder="Add details, context, request information, incident notes, or a personalized message here."
                style={styles.textarea}
              />
            </div>

            {message ? (
              <div
                style={
                  styles.messageWrap
                }
              >
                <span
                  style={
                    styles.messageDot
                  }
                />

                <p
                  style={
                    styles.message
                  }
                >
                  {message}
                </p>
              </div>
            ) : null}

            <div
              className="house-actions"
              style={styles.actionRow}
            >
              <button
                type="button"
                onClick={
                  handleSaveDraft
                }
                style={
                  styles.primaryButton
                }
              >
                Save Draft
              </button>

              <button
                type="button"
                onClick={handlePrint}
                style={
                  styles.secondaryButton
                }
              >
                Print / Save
              </button>
            </div>
          </section>

          {/* LIVE PREVIEW */}

          <section
            className="print-wrap house-preview"
            style={styles.previewArea}
          >
            <div
              style={
                styles.previewHeading
              }
            >
              <div>
                <p
                  style={
                    styles.sectionKicker
                  }
                >
                  LIVE PREVIEW
                </p>

                <h2
                  style={
                    styles.previewTitle
                  }
                >
                  Letter Preview
                </h2>
              </div>

              <span
                style={
                  styles.liveBadge
                }
              >
                LIVE
              </span>
            </div>

            {/* PAPER */}

            <div
              style={
                styles.letterPaper
              }
            >
              <div
                style={
                  styles.paperAccent
                }
              />

              <div
                style={
                  styles.subjectArea
                }
              >
                <p
                  style={
                    styles.previewLabel
                  }
                >
                  SUBJECT
                </p>

                <p
                  style={
                    styles.subjectLine
                  }
                >
                  {subjectLine}
                </p>
              </div>

              <div
                style={
                  styles.previewDivider
                }
              />

              <div
                style={
                  styles.messageArea
                }
              >
                <p
                  style={
                    styles.previewLabel
                  }
                >
                  MESSAGE
                </p>

                <div
                  style={
                    styles.bodyBox
                  }
                >
                  {bodyText
                    .split("\n")
                    .map(
                      (
                        line,
                        index
                      ) => (
                        <p
                          key={
                            index
                          }
                          style={
                            styles.previewText
                          }
                        >
                          {line ||
                            "\u00A0"}
                        </p>
                      )
                    )}
                </div>
              </div>
            </div>

            <p
              style={
                styles.previewNote
              }
            >
              Your preview updates
              automatically as you enter
              your information.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* TEMPLATES                                                                  */
/* -------------------------------------------------------------------------- */

const TEMPLATES: {
  value: TemplateType;
  label: string;
}[] = [
  {
    value: "thank-you",
    label:
      "Thank-You After Interview",
  },

  {
    value: "follow-up-status",
    label:
      "Follow-Up on Status",
  },

  {
    value:
      "withdraw-application",
    label:
      "Withdraw Application",
  },

  {
    value:
      "accept-job-offer",
    label:
      "Accept Job Offer",
  },

  {
    value:
      "decline-job-offer",
    label:
      "Decline Job Offer",
  },

  {
    value:
      "request-interview-reschedule",
    label:
      "Request Interview Reschedule",
  },

  {
    value: "request-raise",
    label: "Request a Raise",
  },

  {
    value:
      "request-promotion",
    label:
      "Request a Promotion",
  },

  {
    value: "request-pto",
    label: "Request PTO",
  },

  {
    value:
      "request-extended-leave",
    label:
      "Request Extended Leave / FMLA",
  },

  {
    value:
      "resignation-letter",
    label:
      "Resignation Letter",
  },

  {
    value:
      "farewell-message",
    label:
      "Farewell / Goodbye Message",
  },

  {
    value:
      "new-position-introduction",
    label:
      "Accepted New Position - Introduction",
  },

  {
    value:
      "confidential-hr-concern",
    label:
      "Confidential HR Concern",
  },

  {
    value:
      "report-workplace-incident",
    label:
      "Report Workplace Incident",
  },
];

/* -------------------------------------------------------------------------- */
/* FIELD                                                                      */
/* -------------------------------------------------------------------------- */

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldWrap}>
      <label style={styles.label}>
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        placeholder={placeholder}
        style={styles.input}
      />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* STYLES                                                                     */
/* -------------------------------------------------------------------------- */

const styles: Record<
  string,
  React.CSSProperties
> = {
  page: {
    position: "relative",

    minHeight: "100vh",

    overflow: "hidden",

    background:
      "linear-gradient(180deg, #f7f9fc 0%, #ffffff 44%, #f6f8fb 100%)",

    color: "#0f172a",

    padding:
      "0 32px 80px",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  blueGlow: {
    position: "absolute",

    width: "680px",
    height: "680px",

    top: "-410px",
    right: "-140px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(37,99,235,.13) 0%, rgba(37,99,235,.04) 45%, rgba(37,99,235,0) 72%)",

    pointerEvents: "none",
  },

  grayGlow: {
    position: "absolute",

    width: "560px",
    height: "560px",

    top: "720px",
    left: "-310px",

    borderRadius: "50%",

    background:
      "radial-gradient(circle, rgba(100,116,139,.09) 0%, rgba(100,116,139,0) 72%)",

    pointerEvents: "none",
  },

  dotPattern: {
    position: "absolute",

    top: "34px",
    right: "8%",

    width: "200px",
    height: "200px",

    opacity: 0.2,

    backgroundImage:
      "radial-gradient(#2563eb 1.5px, transparent 1.5px)",

    backgroundSize:
      "27px 27px",

    pointerEvents: "none",
  },

  shell: {
    position: "relative",

    zIndex: 1,

    width: "100%",

    maxWidth: "1320px",

    margin: "0 auto",
  },

  /* HERO */

  hero: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems: "flex-start",

    gap: "30px",

    padding:
      "14px 0 42px",
  },

  kicker: {
    margin: "0 0 20px",

    color: "#2563eb",

    fontSize: "13px",

    fontWeight: 800,

    letterSpacing: ".18em",
  },

  title: {
    margin: 0,

    color: "#0f172a",

    fontSize:
      "clamp(44px, 6vw, 68px)",

    lineHeight: 1,

    fontWeight: 750,

    letterSpacing: "-0.05em",
  },

  subtitle: {
    maxWidth: "760px",

    margin: "24px 0 0",

    color: "#64748b",

    fontSize: "18px",

    lineHeight: 1.75,
  },

  backLink: {
    display: "inline-flex",

    alignItems: "center",

    marginTop: "7px",

    padding: "10px 0",

    color: "#64748b",

    textDecoration: "none",

    fontSize: "13px",

    fontWeight: 700,

    whiteSpace: "nowrap",
  },

  accentLine: {
    width: "48px",

    height: "4px",

    marginBottom: "38px",

    borderRadius: "999px",

    background: "#2563eb",
  },

  /* MAIN */

  layout: {
    display: "grid",

    gridTemplateColumns:
      "minmax(0, 1.06fr) minmax(390px, .94fr)",

    gap: "52px",

    alignItems: "start",
  },

  /* FORM SIDE */

  formArea: {
    minWidth: 0,
  },

  sectionHeading: {
    marginBottom: "24px",
  },

  sectionHeadingSmall: {
    marginBottom: "20px",
  },

  sectionKicker: {
    margin: "0 0 8px",

    color: "#2563eb",

    fontSize: "10px",

    fontWeight: 800,

    letterSpacing: ".16em",
  },

  sectionTitle: {
    margin: 0,

    color: "#0f172a",

    fontSize: "27px",

    fontWeight: 750,

    lineHeight: 1.2,

    letterSpacing: "-.025em",
  },

  detailsTitle: {
    margin: 0,

    color: "#0f172a",

    fontSize: "22px",

    fontWeight: 750,

    lineHeight: 1.25,

    letterSpacing: "-.02em",
  },

  sectionDescription: {
    maxWidth: "560px",

    margin: "8px 0 0",

    color: "#94a3b8",

    fontSize: "13px",

    lineHeight: 1.65,
  },

  /* TEMPLATES */

  templateGrid: {
    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: "8px 10px",
  },

  templateButton: {
    display: "flex",

    alignItems: "center",

    gap: "10px",

    minHeight: "46px",

    padding: "10px 12px",

    border:
      "1px solid #dbe3ee",

    borderRadius: "8px",

    background:
      "rgba(255,255,255,.72)",

    color: "#475569",

    fontWeight: 650,

    fontSize: "12px",

    lineHeight: 1.35,

    cursor: "pointer",

    textAlign: "left",

    transition:
      "all .18s ease",
  },

  templateButtonActive: {
    background: "#eff6ff",

    border:
      "1px solid #93c5fd",

    color: "#1e3a8a",

    boxShadow:
      "inset 3px 0 0 #2563eb",
  },

  templateDot: {
    flex: "0 0 auto",

    width: "7px",

    height: "7px",

    borderRadius: "50%",

    background: "#cbd5e1",
  },

  templateDotActive: {
    background: "#2563eb",
  },

  formSectionDivider: {
    height: "1px",

    margin: "32px 0",

    background: "#e2e8f0",
  },

  /* FORM */

  formGrid: {
    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: "2px 16px",
  },

  fieldWrap: {
    display: "grid",

    gap: "8px",

    marginBottom: "16px",
  },

  label: {
    color: "#334155",

    fontSize: "12px",

    fontWeight: 700,
  },

  input: {
    width: "100%",

    height: "48px",

    boxSizing: "border-box",

    padding: "0 14px",

    border:
      "1px solid #cbd5e1",

    borderRadius: "8px",

    background: "#ffffff",

    color: "#0f172a",

    fontSize: "14px",

    outline: "none",
  },

  textarea: {
    width: "100%",

    minHeight: "130px",

    boxSizing: "border-box",

    padding: "14px",

    border:
      "1px solid #cbd5e1",

    borderRadius: "8px",

    background: "#ffffff",

    color: "#0f172a",

    fontSize: "14px",

    lineHeight: 1.6,

    resize: "vertical",

    outline: "none",

    fontFamily: "inherit",
  },

  /* MESSAGE */

  messageWrap: {
    display: "flex",

    alignItems: "center",

    gap: "9px",

    margin: "2px 0 14px",
  },

  messageDot: {
    width: "7px",

    height: "7px",

    flex: "0 0 auto",

    borderRadius: "50%",

    background: "#2563eb",
  },

  message: {
    margin: 0,

    color: "#64748b",

    fontSize: "12px",

    lineHeight: 1.5,
  },

  /* BUTTONS */

  actionRow: {
    display: "grid",

    gridTemplateColumns:
      "1fr 1fr",

    gap: "12px",

    marginTop: "8px",
  },

  primaryButton: {
    width: "100%",

    minHeight: "50px",

    padding: "13px 18px",

    border:
      "1px solid #2563eb",

    borderRadius: "9px",

    background: "#2563eb",

    color: "#ffffff",

    fontSize: "14px",

    fontWeight: 800,

    cursor: "pointer",

    boxShadow:
      "0 9px 22px rgba(37,99,235,.16)",
  },

  secondaryButton: {
    width: "100%",

    minHeight: "50px",

    padding: "13px 18px",

    border:
      "1px solid #cbd5e1",

    borderRadius: "9px",

    background: "#ffffff",

    color: "#1e293b",

    fontSize: "14px",

    fontWeight: 750,

    cursor: "pointer",
  },

  /* PREVIEW */

  previewArea: {
    position: "sticky",

    top: "24px",

    minWidth: 0,
  },

  previewHeading: {
    display: "flex",

    alignItems: "flex-start",

    justifyContent:
      "space-between",

    gap: "20px",

    marginBottom: "18px",
  },

  previewTitle: {
    margin: 0,

    color: "#0f172a",

    fontSize: "27px",

    fontWeight: 750,

    lineHeight: 1.2,

    letterSpacing: "-.025em",
  },

  liveBadge: {
    display: "inline-flex",

    alignItems: "center",

    justifyContent:
      "center",

    minHeight: "25px",

    padding: "0 9px",

    borderRadius: "999px",

    background: "#eff6ff",

    color: "#2563eb",

    fontSize: "9px",

    fontWeight: 900,

    letterSpacing: ".1em",
  },

  letterPaper: {
    position: "relative",

    overflow: "hidden",

    minHeight: "620px",

    padding: "38px 38px 44px",

    background: "#ffffff",

    border:
      "1px solid #dbe3ee",

    borderRadius: "12px",

    boxShadow:
      "0 20px 55px rgba(15,23,42,.08)",
  },

  paperAccent: {
    position: "absolute",

    top: 0,

    left: 0,

    width: "100%",

    height: "4px",

    background:
      "linear-gradient(90deg, #2563eb 0%, #60a5fa 45%, #dbeafe 100%)",
  },

  subjectArea: {
    paddingBottom: "22px",
  },

  previewLabel: {
    margin: "0 0 8px",

    color: "#2563eb",

    fontSize: "9px",

    fontWeight: 850,

    letterSpacing: ".14em",
  },

  subjectLine: {
    margin: 0,

    color: "#0f172a",

    fontSize: "17px",

    fontWeight: 750,

    lineHeight: 1.5,
  },

  previewDivider: {
    height: "1px",

    marginBottom: "26px",

    background: "#e2e8f0",
  },

  messageArea: {
    minWidth: 0,
  },

  bodyBox: {
    marginTop: "14px",
  },

  previewText: {
    margin: "0 0 10px",

    color: "#334155",

    fontSize: "14px",

    lineHeight: 1.75,

    whiteSpace: "pre-wrap",
  },

  previewNote: {
    margin: "12px 0 0",

    color: "#94a3b8",

    fontSize: "11px",

    lineHeight: 1.55,

    textAlign: "center",
  },
};
