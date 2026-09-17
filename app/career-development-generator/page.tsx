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

type HistoryFilter = "all" | "draft" | "submitted";

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
  const [activityType, setActivityType] = useState("");
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

  const [historyFilter, setHistoryFilter] =
    useState<HistoryFilter>("all");

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
     LOAD LOG HISTORY
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
      setMessage("Please select the week ending date.");
      return false;
    }

    if (!activityType) {
      setMessage(
        "Please choose one career development activity."
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
      activity_type: activityType,
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
      "✓ Draft saved. You can return and finish this log later."
    );

    await loadPreviousLogs();

    setSaving(false);
  }

  /* =======================================================
     SUBMIT WEEKLY LOG
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
      activity_type: activityType,
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
      "✓ Weekly Career Development Log submitted successfully."
    );

    await loadPreviousLogs();

    setSubmitting(false);
  }

  /* =======================================================
     OPEN PREVIOUS LOG
  ======================================================= */

  function openLog(log: CareerDevelopmentLog) {
    setCurrentLogId(log.id);
    setCurrentStatus(log.status);
    setWeekEnding(log.week_ending);
    setActivityType(log.activity_type);
    setCompleted(log.completed || "");
    setLearnedAccomplished(
      log.learned_accomplished || ""
    );
    setNextStep(log.next_step || "");
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("weekly-workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  /* =======================================================
     NEW LOG
  ======================================================= */

  function startNewLog() {
    setCurrentLogId(null);
    setCurrentStatus("draft");
    setWeekEnding("");
    setActivityType("");
    setCompleted("");
    setLearnedAccomplished("");
    setNextStep("");
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("weekly-workspace")
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
      Boolean(activityType),
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
    activityType,
    completed,
    learnedAccomplished,
    nextStep,
  ]);

  const filteredLogs = useMemo(() => {
    if (historyFilter === "all") {
      return previousLogs;
    }

    return previousLogs.filter(
      (log) => log.status === historyFilter
    );
  }, [previousLogs, historyFilter]);

  const draftCount = previousLogs.filter(
    (log) => log.status === "draft"
  ).length;

  const submittedCount = previousLogs.filter(
    (log) => log.status === "submitted"
  ).length;

  const selectedActivity = ACTIVITY_OPTIONS.find(
    (activity) => activity.title === activityType
  );

  function formatWeekEnding(value: string) {
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

        <section className="hero">
          <div className="heroCopy">
            <p className="eyebrow heroEyebrow">
              WEEKLY CAREER DEVELOPMENT
            </p>

            <h1>
              Build momentum.
              <span>One week at a time.</span>
            </h1>

            <p className="intro">
              Use this space to document what you worked on,
              what you learned, and the next move you want to
              make. Small progress still counts.
            </p>

            <div className="heroMeta">
              <div>
                <span>PARTICIPANT</span>
                <strong>{participantName}</strong>
              </div>

              <div>
                <span>PROGRAM / CODE</span>
                <strong>
                  {referralCode || "Not Assigned"}
                </strong>
              </div>
            </div>
          </div>

          <div className="heroSide">
            <div className="weekCard">
              <span>WEEKLY SUBMISSION</span>
              <strong>Due Every Friday</strong>
              <p>
                Save a draft anytime. Submit when your
                reflection is complete.
              </p>
            </div>

            <div className="progressCard">
              <div className="progressTop">
                <span>THIS LOG</span>
                <strong>{progress}%</strong>
              </div>

              <div className="progressTrack">
                <span
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>

              <p>
                {progress === 100
                  ? "Ready to submit."
                  : "Keep going — your progress saves when you choose Save Draft."}
              </p>
            </div>
          </div>
        </section>

        <section
          className="workspace"
          id="weekly-workspace"
        >
          <div className="workspaceMain">
            <div className="workspaceIntro">
              <div>
                <p className="eyebrow">
                  YOUR WEEKLY REFLECTION
                </p>

                <h2>
                  What did you move forward this week?
                </h2>

                <p>
                  Choose a week, select one activity, then
                  capture what happened and what comes next.
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
                <span>WEEK ENDING</span>
                <strong>Choose the Friday for this log</strong>

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
                  {selectedActivity?.title ||
                    "Choose an activity below"}
                </strong>
                <p>
                  {selectedActivity?.description ||
                    "Pick the career-development activity that best represents what you worked on this week."}
                </p>
              </div>
            </div>

            <div className="flowDivider" />

            <div className="activityHeading">
              <div>
                <p className="eyebrow">
                  CHOOSE YOUR FOCUS
                </p>

                <h3>
                  What did you work on?
                </h3>
              </div>

              <span>Choose one</span>
            </div>

            <div className="activityGrid">
              {ACTIVITY_OPTIONS.map(
                (activity) => {
                  const selected =
                    activityType === activity.title;

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
                        setActivityType(
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
                Turn the activity into a next step.
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
                + New Log
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
                    : "Submit Weekly Log →"}
                </button>
              </div>
            </div>
          </div>

          <aside className="snapshot">
            <p className="snapshotEyebrow">
              THIS WEEK
            </p>

            <h3>Your progress at a glance</h3>

            <div className="snapshotItem">
              <span>Week ending</span>
              <strong>
                {formatWeekEnding(weekEnding)}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>Activity</span>
              <strong>
                {selectedActivity?.title ||
                  "Not selected"}
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

        <section className="historyPanel">
          <div className="historyHeader">
            <div>
              <p className="eyebrow">
                YOUR PROGRESS
              </p>

              <h2>
                Career Development History
              </h2>

              <p>
                Open a previous log to review it or continue
                working on a draft.
              </p>
            </div>

            <div className="historyStats">
              <div>
                <strong>{previousLogs.length}</strong>
                <span>Total</span>
              </div>

              <div>
                <strong>{submittedCount}</strong>
                <span>Submitted</span>
              </div>

              <div>
                <strong>{draftCount}</strong>
                <span>Drafts</span>
              </div>
            </div>
          </div>

          <div className="historyFilters">
            <button
              type="button"
              className={
                historyFilter === "all"
                  ? "filterActive"
                  : ""
              }
              onClick={() =>
                setHistoryFilter("all")
              }
            >
              All
            </button>

            <button
              type="button"
              className={
                historyFilter === "submitted"
                  ? "filterActive"
                  : ""
              }
              onClick={() =>
                setHistoryFilter("submitted")
              }
            >
              Submitted
            </button>

            <button
              type="button"
              className={
                historyFilter === "draft"
                  ? "filterActive"
                  : ""
              }
              onClick={() =>
                setHistoryFilter("draft")
              }
            >
              Drafts
            </button>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="emptyHistory">
              {previousLogs.length === 0
                ? "Your saved and submitted weekly logs will appear here."
                : "No logs match this filter."}
            </div>
          ) : (
            <div className="historyList">
              {filteredLogs.map((log) => (
                <button
                  type="button"
                  key={log.id}
                  className="historyRow"
                  onClick={() =>
                    openLog(log)
                  }
                >
                  <div className="historyDate">
                    <span>WEEK ENDING</span>

                    <strong>
                      {new Date(
                        `${log.week_ending}T00:00:00`
                      ).toLocaleDateString(
                        [],
                        {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }
                      )}
                    </strong>
                  </div>

                  <div className="historyActivity">
                    <span>ACTIVITY</span>
                    <strong>
                      {log.activity_type}
                    </strong>
                  </div>

                  <div className="historyNext">
                    <span>NEXT MOVE</span>
                    <strong>
                      {log.next_step ||
                        "No next step added yet"}
                    </strong>
                  </div>

                  <span
                    className={`historyStatus ${
                      log.status === "submitted"
                        ? "historySubmitted"
                        : "historyDraft"
                    }`}
                  >
                    {log.status === "submitted"
                      ? "✓ Submitted"
                      : "Draft"}
                  </span>

                  <span className="openArrow">→</span>
                </button>
              ))}
            </div>
          )}
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

        @media (max-width: 1000px) {
          .hero {
            grid-template-columns: 1fr;
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
