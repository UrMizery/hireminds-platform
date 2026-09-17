"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type LogStatus = "draft" | "submitted";

type CareerDevelopmentLog = {
  id: string;
  user_id: string;
  participant_name: string | null;
  participant_email: string | null;
  referral_code: string | null;
  week_ending: string;
  activity_type: string;
  completed: string | null;
  learned_accomplished: string | null;
  next_step: string | null;
  status: LogStatus;
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityOption = {
  title: string;
  label: string;
  description: string;
};

/* =========================================================
   ACTIVITIES
========================================================= */

const ACTIVITY_OPTIONS: ActivityOption[] = [
  {
    title: "Resume or Cover Letter Development",
    label: "BUILD",
    description:
      "Strengthen a resume, cover letter, professional summary, or application material.",
  },
  {
    title: "Career or Industry Research",
    label: "EXPLORE",
    description:
      "Learn more about a career path, job family, industry, or future opportunity.",
  },
  {
    title: "Company Research",
    label: "RESEARCH",
    description:
      "Dig into an employer, its culture, roles, requirements, or hiring process.",
  },
  {
    title: "Certification, Training, or Education Research",
    label: "LEARN",
    description:
      "Explore a certification, class, credential, training program, or education option.",
  },
  {
    title: "Professional Skills Development",
    label: "GROW",
    description:
      "Practice or build a skill that can strengthen your professional foundation.",
  },
  {
    title: "Career Goal Planning",
    label: "PLAN",
    description:
      "Clarify a goal, map your next move, or create a realistic career action step.",
  },
  {
    title: "HireMinds Career Development Activity",
    label: "HM",
    description:
      "Complete another HireMinds career-development activity that supports your progress.",
  },
];

/* =========================================================
   PAGE
========================================================= */

export default function CareerDevelopmentGeneratorPage() {
  const router = useRouter();

  /* =======================================================
     USER
  ======================================================= */

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  /* =======================================================
     FORM
  ======================================================= */

  const [weekEnding, setWeekEnding] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [completed, setCompleted] = useState("");
  const [learnedAccomplished, setLearnedAccomplished] = useState("");
  const [nextStep, setNextStep] = useState("");

  /* =======================================================
     SAVE / SUBMIT
  ======================================================= */

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [currentLogId, setCurrentLogId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] =
    useState<LogStatus>("draft");

  /* =======================================================
     HISTORY
  ======================================================= */

  const [previousLogs, setPreviousLogs] = useState<
    CareerDevelopmentLog[]
  >([]);

  const [showSavedActivities, setShowSavedActivities] =
    useState(false);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/sign-in");
      return;
    }

    const user = authData.user;

    setUserId(user.id);
    setParticipantEmail(user.email || "");

    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("candidate_profiles")
      .select("full_name,email,referral_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error(profileError);
    }

    setParticipantName(
      profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "Participant"
    );

    setParticipantEmail(
      profile?.email ||
        user.email ||
        ""
    );

    setReferralCode(
      profile?.referral_code ||
        user.user_metadata?.referral_code ||
        ""
    );

    await loadPreviousLogs(user.id);

    setLoading(false);
  }

  /* =======================================================
     LOAD SAVED ACTIVITIES
  ======================================================= */

  async function loadPreviousLogs(uid?: string) {
    const id = uid || userId;

    if (!id) {
      return;
    }

    const { data, error } = await supabase
      .from("career_development_logs")
      .select("*")
      .eq("user_id", id)
      .order("week_ending", {
        ascending: false,
      });

    if (error) {
      console.error(error);
      return;
    }

    setPreviousLogs(
      (data as CareerDevelopmentLog[]) || []
    );
  }

  /* =======================================================
     VALIDATION
  ======================================================= */

  function basicValidation() {
    if (!weekEnding) {
      setMessage("Please select the activity date.");
      return false;
    }

    if (selectedActivities.length === 0) {
      setMessage(
        "Please choose at least one career development activity."
      );
      return false;
    }

    return true;
  }

  function submissionValidation() {
    if (!basicValidation()) {
      return false;
    }

    if (!completed.trim()) {
      setMessage("Please tell us what you completed.");
      return false;
    }

    if (!learnedAccomplished.trim()) {
      setMessage(
        "Please tell us what you learned or accomplished."
      );
      return false;
    }

    if (!nextStep.trim()) {
      setMessage("Please enter your next step.");
      return false;
    }

    return true;
  }

  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  async function saveDraft() {
    if (!basicValidation()) {
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      user_id: userId,
      participant_name: participantName,
      participant_email: participantEmail,
      referral_code: referralCode || null,
      week_ending: weekEnding,
      activity_type: selectedActivities.join(" | "),
      completed: completed.trim() || null,
      learned_accomplished:
        learnedAccomplished.trim() || null,
      next_step: nextStep.trim() || null,
      status: "draft",
      submitted_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("career_development_logs")
      .upsert(payload, {
        onConflict: "user_id,week_ending",
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setCurrentLogId(data.id);
    setCurrentStatus("draft");

    setMessage(
      "✓ Draft saved. You can reopen it anytime from Saved Activities."
    );

    await loadPreviousLogs();

    setSaving(false);
  }

  /* =======================================================
     SUBMIT ACTIVITY
  ======================================================= */

  async function submitLog() {
    if (!submissionValidation()) {
      return;
    }

    setSubmitting(true);
    setMessage("");

    const submittedAt = new Date().toISOString();

    const payload = {
      user_id: userId,
      participant_name: participantName,
      participant_email: participantEmail,
      referral_code: referralCode || null,
      week_ending: weekEnding,
      activity_type: selectedActivities.join(" | "),
      completed: completed.trim(),
      learned_accomplished:
        learnedAccomplished.trim(),
      next_step: nextStep.trim(),
      status: "submitted",
      submitted_at: submittedAt,
      updated_at: submittedAt,
    };

    const { data, error } = await supabase
      .from("career_development_logs")
      .upsert(payload, {
        onConflict: "user_id,week_ending",
      })
      .select("*")
      .single();

    if (error) {
      setMessage(error.message);
      setSubmitting(false);
      return;
    }

    await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: participantName,
        email: participantEmail,
        referral_code: referralCode || null,
        event_type:
          "career_development_log_submitted",
        tool_name:
          "Career Development Generator",
        page_name:
          "career-development-generator",
      });

    setCurrentLogId(data.id);
    setCurrentStatus("submitted");

    setMessage(
      "✓ Career development activity submitted to HireMinds. It is saved with your participant record for reporting."
    );

    await loadPreviousLogs();

    setSubmitting(false);
  }

  /* =======================================================
     OPEN SAVED ACTIVITY
  ======================================================= */

  function openLog(log: CareerDevelopmentLog) {
    setCurrentLogId(log.id);
    setCurrentStatus(log.status);
    setWeekEnding(log.week_ending);
    setSelectedActivities(
      log.activity_type
        ? log.activity_type.split(" | ").filter(Boolean)
        : []
    );
    setCompleted(log.completed || "");
    setLearnedAccomplished(
      log.learned_accomplished || ""
    );
    setNextStep(log.next_step || "");
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("career-development-workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  /* =======================================================
     NEW ACTIVITY
  ======================================================= */

  function startNewLog() {
    setCurrentLogId(null);
    setCurrentStatus("draft");
    setWeekEnding("");
    setSelectedActivities([]);
    setCompleted("");
    setLearnedAccomplished("");
    setNextStep("");
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("career-development-workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  /* =======================================================
     UI HELPERS
  ======================================================= */

  const progress = useMemo(() => {
    const checks = [
      Boolean(weekEnding),
      selectedActivities.length > 0,
      Boolean(completed.trim()),
      Boolean(learnedAccomplished.trim()),
      Boolean(nextStep.trim()),
    ];

    return Math.round(
      (checks.filter(Boolean).length / checks.length) *
        100
    );
  }, [
    weekEnding,
    selectedActivities,
    completed,
    learnedAccomplished,
    nextStep,
  ]);


  const draftCount = previousLogs.filter(
    (log) => log.status === "draft"
  ).length;

  const submittedCount = previousLogs.filter(
    (log) => log.status === "submitted"
  ).length;

  function toggleActivity(title: string) {
    setSelectedActivities((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    );
    setMessage("");
  }

  function formatActivityDate(value: string) {
    if (!value) return "Not selected";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString([], {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingMark">HM</div>
        <strong>Loading Career Development...</strong>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 14px;
            align-items: center;
            justify-content: center;
            background: #eef3f6;
            color: #112330;
            font-family: Inter, Arial, sans-serif;
          }

          .loadingMark {
            width: 54px;
            height: 54px;
            display: grid;
            place-items: center;
            border-radius: 16px;
            background: #123a52;
            color: white;
            font-weight: 950;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main className="page">
      <div className="shell">
        <button
          type="button"
          className="backBtn"
          onClick={() => router.push("/profile")}
        >
          ← My Profile
        </button>

        <section className="hero compactHero">
          <div className="heroCopy">
            <p className="eyebrow heroEyebrow">
              CAREER DEVELOPMENT
            </p>

            <h1>Career Development Generator</h1>

            <p className="intro">
              Track a career-development activity, reflect on what you gained,
              and identify your next move. Complete this when you finish an
              activity — there is no Friday deadline.
            </p>
          </div>

          <div className="heroQuick">
            <div className="quickItem">
              <span>PARTICIPANT</span>
              <strong>{participantName}</strong>
            </div>

            <div className="quickItem">
              <span>PROGRAM / CODE</span>
              <strong>{referralCode || "Not Assigned"}</strong>
            </div>

            <div className="quickProgress">
              <div>
                <span>THIS ACTIVITY</span>
                <strong>{progress}%</strong>
              </div>

              <div className="progressTrack">
                <span style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </section>

        <section
          className="workspace"
          id="career-development-workspace"
        >
          <div className="workspaceMain">
            <div className="workspaceIntro">
              <div>
                <p className="eyebrow">
                  CAREER DEVELOPMENT ACTIVITY
                </p>

                <h2>
                  What are you working on?
                </h2>

                <p>
                  Choose the date, select everything you worked on, then answer the three short reflection questions.
                </p>
              </div>

              <div
                className={`statusPill ${
                  currentStatus === "submitted"
                    ? "statusSubmitted"
                    : "statusDraft"
                }`}
              >
                {currentStatus === "submitted"
                  ? "✓ Submitted"
                  : currentLogId
                    ? "Saved Draft"
                    : "New Draft"}
              </div>
            </div>

            <div className="startRow">
              <label className="dateField">
                <span>ACTIVITY DATE</span>
                <strong>When did you work on this?</strong>

                <input
                  type="date"
                  value={weekEnding}
                  onChange={(e) =>
                    setWeekEnding(e.target.value)
                  }
                />
              </label>

              <div className="currentFocus">
                <span>CURRENT FOCUS</span>
                <strong>
                  {selectedActivities.length > 0
                    ? `${selectedActivities.length} selected`
                    : "Choose one or more activities below"}
                </strong>
                <p>
                  {selectedActivities.length > 0
                    ? selectedActivities.join(" • ")
                    : "Select everything that represents what you worked on for this activity."}
                </p>
              </div>
            </div>

            <div className="flowDivider" />

            <div className="activityHeading">
              <div>
                <p className="eyebrow">
                  YOUR ACTIVITY
                </p>

                <h3>
                  What did you work on?
                </h3>
              </div>

              <span>Select all that apply</span>
            </div>

            <div className="activityGrid">
              {ACTIVITY_OPTIONS.map(
                (activity) => {
                  const selected =
                    selectedActivities.includes(activity.title);

                  return (
                    <button
                      type="button"
                      key={activity.title}
                      className={`activityCard ${
                        selected
                          ? "activitySelected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleActivity(
                          activity.title
                        )
                      }
                    >
                      <span className="activityTag">
                        {activity.label}
                      </span>

                      <div>
                        <strong>
                          {activity.title}
                        </strong>

                        <p>
                          {activity.description}
                        </p>
                      </div>

                      <span className="activityCheck">
                        {selected ? "✓" : ""}
                      </span>
                    </button>
                  );
                }
              )}
            </div>

            <div className="flowDivider" />

            <div className="reflectionHeading">
              <p className="eyebrow">
                REFLECT + MOVE
              </p>

              <h3>
                Tell us what happened and what comes next.
              </h3>

              <p>
                This does not have to sound formal. Write it
                in your own words.
              </p>
            </div>

            <div className="reflectionList">
              <label className="reflectionRow">
                <div className="reflectionPrompt">
                  <span>DONE</span>
                  <strong>
                    What did you complete?
                  </strong>
                  <p>
                    What did you actually work on, research,
                    practice, create, or finish?
                  </p>
                </div>

                <textarea
                  value={completed}
                  onChange={(e) =>
                    setCompleted(e.target.value)
                  }
                  placeholder="Example: I compared two certification programs and reviewed the requirements, schedule, and cost for each."
                />
              </label>

              <label className="reflectionRow">
                <div className="reflectionPrompt">
                  <span>LEARNED</span>
                  <strong>
                    What did you learn or accomplish?
                  </strong>
                  <p>
                    What became clearer? What improved? What
                    did you discover?
                  </p>
                </div>

                <textarea
                  value={learnedAccomplished}
                  onChange={(e) =>
                    setLearnedAccomplished(
                      e.target.value
                    )
                  }
                  placeholder="Example: I learned which program fits my schedule and which credential employers in my target field request most often."
                />
              </label>

              <label className="reflectionRow">
                <div className="reflectionPrompt">
                  <span>NEXT</span>
                  <strong>
                    What is your next move?
                  </strong>
                  <p>
                    Keep it specific enough that you know what
                    to do after this.
                  </p>
                </div>

                <textarea
                  value={nextStep}
                  onChange={(e) =>
                    setNextStep(e.target.value)
                  }
                  placeholder="Example: Contact the training provider on Monday and confirm the next enrollment date."
                />
              </label>
            </div>

            {message ? (
              <div
                className={
                  message.startsWith("✓")
                    ? "successMessage"
                    : "message"
                }
              >
                {message}
              </div>
            ) : null}

            <div className="actions">
              <button
                type="button"
                className="newBtn"
                onClick={startNewLog}
              >
                + Start New Activity
              </button>

              <div className="rightActions">
                <button
                  type="button"
                  className="draftBtn"
                  disabled={saving}
                  onClick={saveDraft}
                >
                  {saving
                    ? "Saving..."
                    : "Save Draft"}
                </button>

                <button
                  type="button"
                  className="submitBtn"
                  disabled={submitting}
                  onClick={submitLog}
                >
                  {submitting
                    ? "Submitting..."
                    : "Submit Activity →"}
                </button>
              </div>
            </div>
          </div>

          <aside className="snapshot">
            <p className="snapshotEyebrow">
              THIS ACTIVITY
            </p>

            <h3>Your progress at a glance</h3>

            <div className="snapshotItem">
              <span>Activity date</span>
              <strong>
                {formatActivityDate(weekEnding)}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>Activities</span>
              <strong>
                {selectedActivities.length > 0
                  ? selectedActivities.join(", ")
                  : "Not selected"}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>Reflection</span>
              <strong>
                {progress === 100
                  ? "Complete"
                  : `${progress}% complete`}
              </strong>
            </div>

            <div className="snapshotRule" />

            <div className="momentumNote">
              <span>KEEP IT MOVING</span>
              <strong>
                Progress does not have to be dramatic to
                matter.
              </strong>
              <p>
                Researching, practicing, planning, revising,
                and making one clear decision all count as
                career development.
              </p>
            </div>
          </aside>
        </section>

        <section className="savedPanel">
          <button
            type="button"
            className="savedToggle"
            onClick={() =>
              setShowSavedActivities((value) => !value)
            }
          >
            <div>
              <span className="savedLabel">SAVED ACTIVITIES</span>
              <strong>
                {previousLogs.length === 0
                  ? "No saved activities yet"
                  : `${previousLogs.length} saved ${
                      previousLogs.length === 1 ? "activity" : "activities"
                    }`}
              </strong>
            </div>

            <div className="savedSummary">
              <span>{submittedCount} submitted</span>
              <span>{draftCount} drafts</span>
              <b>{showSavedActivities ? "Hide ↑" : "View ↓"}</b>
            </div>
          </button>

          {showSavedActivities ? (
            <div className="savedList">
              {previousLogs.length === 0 ? (
                <div className="emptySaved">
                  Saved drafts and submitted activities will appear here.
                </div>
              ) : (
                previousLogs.map((log) => (
                  <button
                    type="button"
                    key={log.id}
                    className="savedRow"
                    onClick={() => openLog(log)}
                  >
                    <div className="savedDate">
                      <span>DATE</span>
                      <strong>
                        {new Date(
                          `${log.week_ending}T00:00:00`
                        ).toLocaleDateString([], {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </strong>
                    </div>

                    <div className="savedActivity">
                      <span>ACTIVITY</span>
                      <strong>{log.activity_type}</strong>
                    </div>

                    <span
                      className={`savedStatus ${
                        log.status === "submitted"
                          ? "savedSubmitted"
                          : "savedDraft"
                      }`}
                    >
                      {log.status === "submitted"
                        ? "✓ Submitted"
                        : "Draft"}
                    </span>

                    <span className="savedArrow">→</span>
                  </button>
                ))
              )}
            </div>
          ) : null}
        </section>
      </div>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          padding: 24px 18px 56px;
          background:
            radial-gradient(
              circle at 88% 5%,
              rgba(31, 130, 188, 0.12),
              transparent 24%
            ),
            linear-gradient(
              180deg,
              #edf2f5 0%,
              #f8fafb 45%,
              #ffffff 100%
            );
          color: #101820;
          font-family:
            Inter,
            Arial,
            Helvetica,
            sans-serif;
        }

        .shell {
          width: min(1240px, 100%);
          margin: 0 auto;
        }

        .backBtn {
          margin-bottom: 16px;
          padding: 8px 0;
          border: none;
          background: transparent;
          color: #385466;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .backBtn:hover {
          color: #176fa8;
        }

        .hero {
          position: relative;
          overflow: hidden;
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(250px, 340px);
          gap: 38px;
          align-items: center;
          padding: 48px;
          border-radius: 30px;
          background:
            radial-gradient(
              circle at 82% 8%,
              rgba(91, 184, 232, 0.24),
              transparent 25%
            ),
            linear-gradient(
              135deg,
              #0d1c27 0%,
              #123b54 64%,
              #176f9f 138%
            );
          color: white;
          box-shadow:
            0 24px 60px
            rgba(17, 45, 62, 0.19);
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 330px;
          height: 330px;
          right: -125px;
          bottom: -205px;
          border: 1px solid
            rgba(255, 255, 255, 0.13);
          border-radius: 50%;
          box-shadow:
            0 0 0 42px
              rgba(255, 255, 255, 0.018),
            0 0 0 84px
              rgba(255, 255, 255, 0.012);
          pointer-events: none;
        }

        .heroCopy,
        .heroSide {
          position: relative;
          z-index: 1;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #1679b7;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.15em;
        }

        .heroEyebrow {
          color: #78c2ea;
        }

        h1 {
          max-width: 760px;
          margin: 0;
          font-size:
            clamp(
              48px,
              6.5vw,
              82px
            );
          line-height: 0.9;
          font-weight: 950;
          letter-spacing: -0.06em;
        }

        h1 span {
          display: block;
          margin-top: 7px;
          color: #6ab7e2;
        }

        .intro {
          max-width: 660px;
          margin: 22px 0 0;
          color: #d0dce3;
          font-size: 15px;
          line-height: 1.7;
        }

        .heroMeta {
          display: flex;
          flex-wrap: wrap;
          gap: 10px 28px;
          margin-top: 29px;
          padding-top: 20px;
          border-top:
            1px solid
            rgba(255, 255, 255, 0.12);
        }

        .heroMeta div {
          display: grid;
          gap: 4px;
        }

        .heroMeta span {
          color: #7dbddd;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.11em;
        }

        .heroMeta strong {
          color: white;
          font-size: 11px;
        }

        .heroSide {
          display: grid;
          gap: 12px;
        }

        .weekCard,
        .progressCard {
          padding: 18px;
          border-radius: 18px;
          background:
            rgba(255, 255, 255, 0.085);
          border:
            1px solid
            rgba(255, 255, 255, 0.13);
          backdrop-filter: blur(8px);
        }

        .weekCard span,
        .progressTop span {
          color: #78c2ea;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .weekCard strong {
          display: block;
          margin-top: 6px;
          font-size: 18px;
        }

        .weekCard p,
        .progressCard p {
          margin: 6px 0 0;
          color: #c6d4dc;
          font-size: 10px;
          line-height: 1.55;
        }

        .progressTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .progressTop strong {
          font-size: 21px;
        }

        .progressTrack {
          height: 8px;
          overflow: hidden;
          margin-top: 12px;
          border-radius: 999px;
          background:
            rgba(255, 255, 255, 0.11);
        }

        .progressTrack span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #64b9e6,
              #ffffff
            );
          transition:
            width 0.25s ease;
        }

        .workspace {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            280px;
          gap: 22px;
          align-items: start;
          margin-top: 24px;
        }

        .workspaceMain,
        .snapshot,
        .historyPanel {
          border-radius: 25px;
          background:
            rgba(255, 255, 255, 0.94);
          border:
            1px solid #ccd8e0;
          box-shadow:
            0 14px 36px
            rgba(23, 51, 68, 0.065);
        }

        .workspaceMain {
          padding: 32px;
        }

        .workspaceIntro {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .workspaceIntro h2,
        .historyHeader h2 {
          margin: 4px 0 0;
          font-size:
            clamp(
              28px,
              4vw,
              39px
            );
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .workspaceIntro > div > p:last-child,
        .historyHeader > div > p:last-child {
          max-width: 650px;
          margin: 9px 0 0;
          color: #6d7982;
          font-size: 12px;
          line-height: 1.6;
        }

        .statusPill {
          flex: 0 0 auto;
          padding: 8px 11px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
        }

        .statusDraft {
          background: #fff5d9;
          border: 1px solid #efd690;
          color: #765b13;
        }

        .statusSubmitted {
          background: #e8f6ed;
          border: 1px solid #b8dcc5;
          color: #246d46;
        }

        .startRow {
          display: grid;
          grid-template-columns:
            minmax(220px, 0.72fr)
            minmax(0, 1.28fr);
          gap: 16px;
          margin-top: 28px;
        }

        .dateField,
        .currentFocus {
          min-height: 140px;
          padding: 18px;
          border-radius: 17px;
          background: #f3f6f8;
          border: 1px solid #d4dee5;
        }

        .dateField {
          display: flex;
          flex-direction: column;
        }

        .dateField span,
        .currentFocus > span {
          color: #1679b7;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .dateField strong,
        .currentFocus strong {
          display: block;
          margin-top: 5px;
          color: #172832;
          font-size: 12px;
        }

        .dateField input {
          width: 100%;
          margin-top: auto;
          padding: 11px 12px;
          border: 1px solid #b8c7d1;
          border-radius: 10px;
          background: white;
          color: #162731;
          font-family: inherit;
          outline: none;
        }

        .currentFocus p {
          margin: 9px 0 0;
          color: #6f7d86;
          font-size: 11px;
          line-height: 1.55;
        }

        .flowDivider {
          height: 1px;
          margin: 31px 0;
          background: #d8e1e7;
        }

        .activityHeading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .activityHeading h3,
        .reflectionHeading h3 {
          margin: 4px 0 0;
          font-size: 24px;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .activityHeading > span {
          color: #75828c;
          font-size: 10px;
          font-weight: 800;
        }

        .activityGrid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 10px;
          margin-top: 17px;
        }

        .activityCard {
          position: relative;
          min-height: 126px;
          display: grid;
          grid-template-columns:
            auto
            minmax(0, 1fr)
            25px;
          gap: 12px;
          align-items: start;
          padding: 16px;
          border-radius: 15px;
          border: 1px solid #d2dce3;
          background:
            linear-gradient(
              145deg,
              #ffffff,
              #f7f9fa
            );
          color: #152630;
          text-align: left;
          cursor: pointer;
          transition:
            border-color 0.18s ease,
            transform 0.18s ease,
            box-shadow 0.18s ease;
        }

        .activityCard:hover,
        .activitySelected {
          transform: translateY(-2px);
          border-color: #56a7d3;
          box-shadow:
            0 10px 24px
            rgba(25, 114, 165, 0.09);
        }

        .activitySelected {
          background:
            linear-gradient(
              145deg,
              #f7fcff,
              #eaf5fb
            );
        }

        .activityTag {
          padding: 5px 6px;
          border-radius: 7px;
          background: #e6f1f7;
          color: #176fa8;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: 0.07em;
        }

        .activityCard strong {
          display: block;
          font-size: 11px;
          line-height: 1.35;
        }

        .activityCard p {
          margin: 6px 0 0;
          color: #73808a;
          font-size: 9px;
          line-height: 1.45;
        }

        .activityCheck {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          border: 1px solid #a9becb;
          color: #176fa8;
          font-size: 11px;
          font-weight: 950;
        }

        .activitySelected
          .activityCheck {
          background: #176fa8;
          border-color: #176fa8;
          color: white;
        }

        .reflectionHeading > p:last-child {
          margin: 8px 0 0;
          color: #76828b;
          font-size: 11px;
        }

        .reflectionList {
          margin-top: 18px;
          border-top: 1px solid #d8e1e7;
        }

        .reflectionRow {
          display: grid;
          grid-template-columns:
            minmax(180px, 0.55fr)
            minmax(0, 1.45fr);
          gap: 24px;
          padding: 24px 0;
          border-bottom:
            1px solid #d8e1e7;
        }

        .reflectionPrompt span {
          color: #176fa8;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .reflectionPrompt strong {
          display: block;
          margin-top: 6px;
          color: #172832;
          font-size: 14px;
        }

        .reflectionPrompt p {
          margin: 6px 0 0;
          color: #75818a;
          font-size: 10px;
          line-height: 1.5;
        }

        .reflectionRow textarea {
          width: 100%;
          min-height: 118px;
          padding: 14px;
          resize: vertical;
          border-radius: 13px;
          border: 1px solid #bac9d2;
          background: #fbfcfd;
          color: #14232d;
          font-family: inherit;
          font-size: 12px;
          line-height: 1.6;
          outline: none;
        }

        .reflectionRow
          textarea:focus {
          border-color: #4c9ec9;
          box-shadow:
            0 0 0 3px
            rgba(76, 158, 201, 0.08);
        }

        .message,
        .successMessage {
          margin-top: 19px;
          padding: 13px 15px;
          border-radius: 12px;
          font-size: 11px;
          line-height: 1.5;
        }

        .message {
          border: 1px solid #e4c687;
          background: #fff8e6;
          color: #70571c;
        }

        .successMessage {
          border: 1px solid #add3ba;
          background: #edf8f1;
          color: #286847;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 23px;
        }

        .rightActions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .newBtn,
        .draftBtn,
        .submitBtn {
          padding: 12px 16px;
          border-radius: 11px;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        .newBtn {
          border: 1px solid #becbd4;
          background: white;
          color: #344d5c;
        }

        .draftBtn {
          border: 1px solid #86b7d2;
          background: #eef7fb;
          color: #176fa8;
        }

        .submitBtn {
          border: none;
          background:
            linear-gradient(
              90deg,
              #123a52,
              #1779ae
            );
          color: white;
          box-shadow:
            0 8px 20px
            rgba(23, 111, 168, 0.16);
        }

        .draftBtn:disabled,
        .submitBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .snapshot {
          position: sticky;
          top: 18px;
          padding: 22px;
          background:
            linear-gradient(
              180deg,
              #f6f9fa,
              #eef4f7
            );
        }

        .snapshotEyebrow {
          margin: 0;
          color: #176fa8;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .snapshot h3 {
          margin: 6px 0 20px;
          font-size: 21px;
          line-height: 1.08;
          letter-spacing: -0.03em;
        }

        .snapshotItem {
          padding: 13px 0;
          border-top: 1px solid #d3dee5;
        }

        .snapshotItem span {
          display: block;
          color: #7a8790;
          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .snapshotItem strong {
          display: block;
          margin-top: 5px;
          color: #1b2d37;
          font-size: 11px;
          line-height: 1.45;
        }

        .snapshotRule {
          height: 1px;
          margin: 16px 0;
          background: #d3dee5;
        }

        .momentumNote {
          padding: 16px;
          border-radius: 14px;
          background:
            linear-gradient(
              145deg,
              #12394f,
              #176c9c
            );
          color: white;
        }

        .momentumNote span {
          color: #7fc5e9;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.1em;
        }

        .momentumNote strong {
          display: block;
          margin-top: 7px;
          font-size: 14px;
          line-height: 1.25;
        }

        .momentumNote p {
          margin: 8px 0 0;
          color: #d3e0e7;
          font-size: 9px;
          line-height: 1.55;
        }

        .historyPanel {
          margin-top: 24px;
          padding: 30px;
        }

        .historyHeader {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
        }

        .historyStats {
          display: flex;
          gap: 8px;
        }

        .historyStats div {
          min-width: 73px;
          padding: 10px;
          border-radius: 12px;
          background: #f2f6f8;
          border: 1px solid #d4dfe6;
          text-align: center;
        }

        .historyStats strong {
          display: block;
          color: #183344;
          font-size: 17px;
        }

        .historyStats span {
          display: block;
          margin-top: 2px;
          color: #78848d;
          font-size: 8px;
          font-weight: 800;
        }

        .historyFilters {
          display: flex;
          gap: 7px;
          margin-top: 21px;
          padding-bottom: 15px;
          border-bottom: 1px solid #d7e0e6;
        }

        .historyFilters button {
          padding: 8px 11px;
          border-radius: 999px;
          border: 1px solid #c3d0d8;
          background: white;
          color: #506573;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .historyFilters
          .filterActive {
          border-color: #176fa8;
          background: #176fa8;
          color: white;
        }

        .historyList {
          margin-top: 2px;
        }

        .historyRow {
          width: 100%;
          display: grid;
          grid-template-columns:
            150px
            minmax(180px, 1.05fr)
            minmax(200px, 1.25fr)
            auto
            20px;
          gap: 18px;
          align-items: center;
          padding: 16px 2px;
          border: none;
          border-bottom:
            1px solid #d7e0e6;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .historyRow:hover {
          background:
            linear-gradient(
              90deg,
              rgba(23, 111, 168, 0.035),
              transparent
            );
        }

        .historyDate,
        .historyActivity,
        .historyNext {
          display: grid;
          gap: 4px;
        }

        .historyDate span,
        .historyActivity span,
        .historyNext span {
          color: #82909a;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: 0.09em;
        }

        .historyDate strong,
        .historyActivity strong,
        .historyNext strong {
          font-size: 10px;
          line-height: 1.35;
        }

        .historyNext strong {
          color: #596b77;
          font-weight: 650;
        }

        .historyStatus {
          padding: 6px 9px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 8px;
          font-weight: 900;
        }

        .historySubmitted {
          background: #e8f6ed;
          border: 1px solid #b8dcc5;
          color: #246d46;
        }

        .historyDraft {
          background: #fff5d9;
          border: 1px solid #efd690;
          color: #765b13;
        }

        .openArrow {
          color: #176fa8;
          font-size: 17px;
        }

        .emptyHistory {
          margin-top: 18px;
          padding: 24px;
          border-radius: 14px;
          background: #f5f7f8;
          border: 1px dashed #c9d4dc;
          color: #73808a;
          text-align: center;
          font-size: 10px;
        }



        /* COMPACT PAGE HEADER */
        .compactHero {
          grid-template-columns: minmax(0, 1fr) minmax(360px, 0.72fr);
          gap: 26px;
          padding: 28px 32px;
          border-radius: 22px;
        }

        .compactHero h1 {
          max-width: none;
          font-size: clamp(34px, 4.4vw, 54px);
          line-height: 0.98;
          letter-spacing: -0.045em;
        }

        .compactHero .intro {
          max-width: 720px;
          margin-top: 13px;
          font-size: 13px;
          line-height: 1.6;
        }

        .heroQuick {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }

        .quickItem,
        .quickProgress {
          min-height: 72px;
          padding: 13px 14px;
          border-radius: 13px;
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.12);
        }

        .quickItem span,
        .quickProgress span {
          display: block;
          color: #7fc5e9;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .11em;
        }

        .quickItem strong {
          display: block;
          margin-top: 5px;
          color: #fff;
          font-size: 10px;
          line-height: 1.35;
        }

        .quickProgress {
          grid-column: 1 / -1;
          min-height: 58px;
        }

        .quickProgress > div:first-child {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .quickProgress strong {
          color: #fff;
          font-size: 14px;
        }

        /* COMPACT SAVED ACTIVITIES */
        .savedPanel {
          margin-top: 18px;
          border-radius: 16px;
          background: #fff;
          border: 1px solid #cfd9e0;
          box-shadow: 0 10px 24px rgba(23,51,68,.045);
          overflow: hidden;
        }

        .savedToggle {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 15px 18px;
          border: none;
          background: #fff;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedLabel {
          display: block;
          color: #176fa8;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .11em;
        }

        .savedToggle strong {
          display: block;
          margin-top: 3px;
          font-size: 12px;
        }

        .savedSummary {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #75838c;
          font-size: 9px;
          white-space: nowrap;
        }

        .savedSummary b {
          color: #176fa8;
        }

        .savedList {
          border-top: 1px solid #d8e1e7;
          padding: 0 18px;
        }

        .savedRow {
          width: 100%;
          display: grid;
          grid-template-columns: 125px minmax(0,1fr) auto 18px;
          gap: 16px;
          align-items: center;
          padding: 13px 0;
          border: none;
          border-bottom: 1px solid #e0e6ea;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedRow:last-child {
          border-bottom: none;
        }

        .savedDate,
        .savedActivity {
          display: grid;
          gap: 3px;
        }

        .savedDate span,
        .savedActivity span {
          color: #85919a;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: .08em;
        }

        .savedDate strong,
        .savedActivity strong {
          font-size: 9px;
          line-height: 1.35;
        }

        .savedStatus {
          padding: 5px 8px;
          border-radius: 999px;
          font-size: 8px;
          font-weight: 900;
          white-space: nowrap;
        }

        .savedSubmitted {
          background: #e8f6ed;
          border: 1px solid #b8dcc5;
          color: #246d46;
        }

        .savedDraft {
          background: #fff5d9;
          border: 1px solid #efd690;
          color: #765b13;
        }

        .savedArrow {
          color: #176fa8;
          font-size: 15px;
        }

        .emptySaved {
          padding: 18px 0;
          color: #76838c;
          text-align: center;
          font-size: 10px;
        }

        @media (max-width: 1000px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .compactHero {
            grid-template-columns: 1fr;
          }

          .heroQuick {
            grid-template-columns: 1fr 1fr;
          }

          .heroSide {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .workspace {
            grid-template-columns: 1fr;
          }

          .snapshot {
            position: static;
          }

          .snapshot {
            display: grid;
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
            gap: 0 18px;
          }

          .snapshotEyebrow,
          .snapshot h3,
          .snapshotRule,
          .momentumNote {
            grid-column: 1 / -1;
          }

          .historyRow {
            grid-template-columns:
              130px
              1fr
              auto
              20px;
          }

          .historyNext {
            display: none;
          }
        }

        @media (max-width: 720px) {
          .page {
            padding: 15px 12px 40px;
          }

          .hero {
            padding: 29px 23px;
            border-radius: 23px;
          }

          .compactHero {
            padding: 22px 20px;
          }

          .heroQuick {
            grid-template-columns: 1fr;
          }

          .quickProgress {
            grid-column: auto;
          }

          .savedToggle {
            align-items: flex-start;
            flex-direction: column;
          }

          .savedSummary {
            flex-wrap: wrap;
          }

          .savedRow {
            grid-template-columns: 1fr auto;
            gap: 8px;
          }

          .savedActivity {
            grid-column: 1 / -1;
          }

          .savedArrow {
            display: none;
          }

          h1 {
            font-size:
              clamp(
                44px,
                15vw,
                66px
              );
          }

          .heroSide {
            grid-template-columns: 1fr;
          }

          .workspaceMain,
          .historyPanel {
            padding: 21px;
          }

          .workspaceIntro,
          .historyHeader,
          .activityHeading,
          .actions {
            flex-direction: column;
            align-items: stretch;
          }

          .startRow,
          .activityGrid,
          .reflectionRow {
            grid-template-columns: 1fr;
          }

          .reflectionRow {
            gap: 12px;
          }

          .snapshot {
            grid-template-columns: 1fr;
          }

          .snapshotEyebrow,
          .snapshot h3,
          .snapshotRule,
          .momentumNote {
            grid-column: auto;
          }

          .historyStats {
            width: 100%;
          }

          .historyStats div {
            flex: 1;
          }

          .historyRow {
            grid-template-columns:
              1fr
              auto;
            gap: 9px;
            padding: 16px 0;
          }

          .historyActivity {
            grid-column: 1 / -1;
          }

          .historyNext {
            display: none;
          }

          .historyStatus {
            grid-row: 1;
            grid-column: 2;
          }

          .openArrow {
            display: none;
          }

          .rightActions {
            width: 100%;
          }

          .newBtn,
          .draftBtn,
          .submitBtn {
            flex: 1;
          }
        }
      `}</style>
    </main>
  );
}
