"use client";

import {
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../lib/supabase";


/* =========================================================
   TYPES
========================================================= */

type LogStatus =
  | "draft"
  | "submitted";

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


/* =========================================================
   ACTIVITIES
========================================================= */

const ACTIVITY_OPTIONS = [
  "Resume or Cover Letter Development",

  "Career or Industry Research",

  "Company Research",

  "Certification, Training, or Education Research",

  "Professional Skills Development",

  "Career Goal Planning",

  "HireMinds Career Development Activity",
];


/* =========================================================
   PAGE
========================================================= */

export default function CareerDevelopmentGeneratorPage() {
  const router =
    useRouter();


  /* =======================================================
     USER
  ======================================================= */

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    userId,
    setUserId,
  ] =
    useState("");

  const [
    participantName,
    setParticipantName,
  ] =
    useState("");

  const [
    participantEmail,
    setParticipantEmail,
  ] =
    useState("");

  const [
    referralCode,
    setReferralCode,
  ] =
    useState("");


  /* =======================================================
     FORM
  ======================================================= */

  const [
    weekEnding,
    setWeekEnding,
  ] =
    useState("");

  const [
    activityType,
    setActivityType,
  ] =
    useState("");

  const [
    completed,
    setCompleted,
  ] =
    useState("");

  const [
    learnedAccomplished,
    setLearnedAccomplished,
  ] =
    useState("");

  const [
    nextStep,
    setNextStep,
  ] =
    useState("");


  /* =======================================================
     SAVE / SUBMIT
  ======================================================= */

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    submitting,
    setSubmitting,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    currentLogId,
    setCurrentLogId,
  ] =
    useState<
      string | null
    >(null);

  const [
    currentStatus,
    setCurrentStatus,
  ] =
    useState<LogStatus>(
      "draft"
    );


  /* =======================================================
     HISTORY
  ======================================================= */

  const [
    previousLogs,
    setPreviousLogs,
  ] =
    useState<
      CareerDevelopmentLog[]
    >([]);


  /* =======================================================
     LOAD PAGE
  ======================================================= */

  useEffect(() => {
    loadPage();
  }, []);


  async function loadPage() {
    setLoading(true);

    const {
      data:
        authData,

      error:
        authError,
    } =
      await supabase.auth.getUser();


    if (
      authError ||
      !authData.user
    ) {
      router.push(
        "/sign-in"
      );

      return;
    }


    const user =
      authData.user;


    setUserId(
      user.id
    );


    setParticipantEmail(
      user.email ||
      ""
    );


    const {
      data:
        profile,

      error:
        profileError,
    } =
      await supabase
        .from(
          "candidate_profiles"
        )
        .select(
          "full_name,email,referral_code"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();


    if (
      profileError
    ) {
      console.error(
        profileError
      );
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


    await loadPreviousLogs(
      user.id
    );


    setLoading(false);
  }


  /* =======================================================
     LOAD LOG HISTORY
  ======================================================= */

  async function loadPreviousLogs(
    uid?: string
  ) {
    const id =
      uid ||
      userId;


    if (
      !id
    ) {
      return;
    }


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "career_development_logs"
        )
        .select("*")
        .eq(
          "user_id",
          id
        )
        .order(
          "week_ending",
          {
            ascending:
              false,
          }
        );


    if (
      error
    ) {
      console.error(
        error
      );

      return;
    }


    setPreviousLogs(
      (
        data as CareerDevelopmentLog[]
      ) ||
      []
    );
  }


  /* =======================================================
     VALIDATION
  ======================================================= */

  function basicValidation() {
    if (
      !weekEnding
    ) {
      setMessage(
        "Please select the week ending date."
      );

      return false;
    }


    if (
      !activityType
    ) {
      setMessage(
        "Please choose one career development activity."
      );

      return false;
    }


    return true;
  }


  function submissionValidation() {
    if (
      !basicValidation()
    ) {
      return false;
    }


    if (
      !completed.trim()
    ) {
      setMessage(
        "Please tell us what you completed."
      );

      return false;
    }


    if (
      !learnedAccomplished.trim()
    ) {
      setMessage(
        "Please tell us what you learned or accomplished."
      );

      return false;
    }


    if (
      !nextStep.trim()
    ) {
      setMessage(
        "Please enter your next step."
      );

      return false;
    }


    return true;
  }


  /* =======================================================
     SAVE DRAFT
  ======================================================= */

  async function saveDraft() {
    if (
      !basicValidation()
    ) {
      return;
    }


    setSaving(true);

    setMessage("");


    const payload = {
      user_id:
        userId,

      participant_name:
        participantName,

      participant_email:
        participantEmail,

      referral_code:
        referralCode ||
        null,

      week_ending:
        weekEnding,

      activity_type:
        activityType,

      completed:
        completed.trim() ||
        null,

      learned_accomplished:
        learnedAccomplished.trim() ||
        null,

      next_step:
        nextStep.trim() ||
        null,

      status:
        "draft",

      submitted_at:
        null,

      updated_at:
        new Date().toISOString(),
    };


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "career_development_logs"
        )
        .upsert(
          payload,
          {
            onConflict:
              "user_id,week_ending",
          }
        )
        .select("*")
        .single();


    if (
      error
    ) {
      setMessage(
        error.message
      );

      setSaving(false);

      return;
    }


    setCurrentLogId(
      data.id
    );

    setCurrentStatus(
      "draft"
    );


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
    if (
      !submissionValidation()
    ) {
      return;
    }


    setSubmitting(true);

    setMessage("");


    const submittedAt =
      new Date().toISOString();


    const payload = {
      user_id:
        userId,

      participant_name:
        participantName,

      participant_email:
        participantEmail,

      referral_code:
        referralCode ||
        null,

      week_ending:
        weekEnding,

      activity_type:
        activityType,

      completed:
        completed.trim(),

      learned_accomplished:
        learnedAccomplished.trim(),

      next_step:
        nextStep.trim(),

      status:
        "submitted",

      submitted_at:
        submittedAt,

      updated_at:
        submittedAt,
    };


    const {
      data,
      error,
    } =
      await supabase
        .from(
          "career_development_logs"
        )
        .upsert(
          payload,
          {
            onConflict:
              "user_id,week_ending",
          }
        )
        .select("*")
        .single();


    if (
      error
    ) {
      setMessage(
        error.message
      );

      setSubmitting(false);

      return;
    }


    /*
     TRACK ACTIVITY FOR REPORTING
    */

    await supabase
      .from(
        "user_activity"
      )
      .insert({
        user_id:
          userId,

        full_name:
          participantName,

        email:
          participantEmail,

        referral_code:
          referralCode ||
          null,

        event_type:
          "career_development_log_submitted",

        tool_name:
          "Career Development Generator",

        page_name:
          "career-development-generator",
      });


    setCurrentLogId(
      data.id
    );

    setCurrentStatus(
      "submitted"
    );


    setMessage(
      "✓ Weekly Career Development Log submitted successfully."
    );


    await loadPreviousLogs();


    setSubmitting(false);
  }


  /* =======================================================
     OPEN PREVIOUS LOG
  ======================================================= */

  function openLog(
    log:
      CareerDevelopmentLog
  ) {
    setCurrentLogId(
      log.id
    );

    setCurrentStatus(
      log.status
    );

    setWeekEnding(
      log.week_ending
    );

    setActivityType(
      log.activity_type
    );

    setCompleted(
      log.completed ||
      ""
    );

    setLearnedAccomplished(
      log.learned_accomplished ||
      ""
    );

    setNextStep(
      log.next_step ||
      ""
    );

    setMessage("");


    window.scrollTo({
      top: 0,

      behavior:
        "smooth",
    });
  }


  /* =======================================================
     NEW LOG
  ======================================================= */

  function startNewLog() {
    setCurrentLogId(
      null
    );

    setCurrentStatus(
      "draft"
    );

    setWeekEnding("");

    setActivityType("");

    setCompleted("");

    setLearnedAccomplished("");

    setNextStep("");

    setMessage("");
  }


  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <main
        className="loadingPage"
      >
        Loading Career Development Generator...

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;

            display: flex;

            align-items: center;
            justify-content: center;

            background:
              #050814;

            color:
              white;

            font-family:
              system-ui,
              sans-serif;
          }
        `}</style>
      </main>
    );
  }


  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <main
      className="page"
    >
      {/* =================================================
          TOP
      ================================================= */}

      <header
        className="topBar"
      >
        <button
          type="button"
          className="backBtn"
          onClick={() =>
            router.push(
              "/profile"
            )
          }
        >
          ← Return to Profile
        </button>

        <span
          className="brand"
        >
          HIREMINDS™
        </span>
      </header>


      {/* =================================================
          HERO
      ================================================= */}

      <section
        className="hero"
      >
        <div>
          <p
            className="eyebrow"
          >
            WEEKLY CAREER DEVELOPMENT
          </p>

          <h1>
            Career Development Generator
          </h1>

          <p
            className="intro"
          >
            Not currently seeking employment? Complete one
            career development activity each week to continue
            strengthening your skills, planning your goals,
            and preparing for future opportunities.
          </p>
        </div>

        <div
          className="fridayBadge"
        >
          <span>
            WEEKLY SUBMISSION
          </span>

          <strong>
            Due Every Friday
          </strong>
        </div>
      </section>


      {/* =================================================
          PARTICIPANT
      ================================================= */}

      <section
        className="participantPanel"
      >
        <div>
          <span>
            PARTICIPANT
          </span>

          <strong>
            {participantName}
          </strong>
        </div>

        <div>
          <span>
            PROGRAM / REFERRAL CODE
          </span>

          <strong>
            {referralCode ||
              "Not Assigned"}
          </strong>
        </div>

        <div>
          <span>
            LOG STATUS
          </span>

          <strong
            className={
              currentStatus ===
              "submitted"
                ? "submittedStatus"
                : "draftStatus"
            }
          >
            {currentStatus ===
            "submitted"
              ? "✓ Submitted"
              : "Draft"}
          </strong>
        </div>
      </section>


      {/* =================================================
          MAIN FORM
      ================================================= */}

      <section
        className="formPanel"
      >
        <div
          className="sectionHeader"
        >
          <div>
            <p
              className="eyebrow"
            >
              STEP 1
            </p>

            <h2>
              Choose Your Week
            </h2>

            <p>
              Enter the Friday date for the week you are documenting.
            </p>
          </div>
        </div>


        <div
          className="weekField"
        >
          <label>
            Week Ending
          </label>

          <input
            type="date"
            value={
              weekEnding
            }
            onChange={
              (
                e
              ) =>
                setWeekEnding(
                  e.target.value
                )
            }
          />
        </div>


        {/* ===============================================
            ACTIVITY
        =============================================== */}

        <div
          className="sectionDivider"
        />


        <div
          className="sectionHeader"
        >
          <div>
            <p
              className="eyebrow"
            >
              STEP 2
            </p>

            <h2>
              Choose ONE Activity
            </h2>

            <p>
              Select the career development activity you completed this week.
            </p>
          </div>
        </div>


        <div
          className="activityGrid"
        >
          {ACTIVITY_OPTIONS.map(
            (
              activity
            ) => {
              const selected =
                activityType ===
                activity;

              return (
                <button
                  type="button"
                  key={
                    activity
                  }
                  className={`activityCard ${
                    selected
                      ? "activitySelected"
                      : ""
                  }`}
                  onClick={() =>
                    setActivityType(
                      activity
                    )
                  }
                >
                  <span
                    className="activityCheck"
                  >
                    {selected
                      ? "✓"
                      : ""}
                  </span>

                  <strong>
                    {activity}
                  </strong>
                </button>
              );
            }
          )}
        </div>


        {/* ===============================================
            REFLECTION
        =============================================== */}

        <div
          className="sectionDivider"
        />


        <div
          className="sectionHeader"
        >
          <div>
            <p
              className="eyebrow"
            >
              STEP 3
            </p>

            <h2>
              Document Your Progress
            </h2>

            <p>
              Tell us what you worked on and what comes next.
            </p>
          </div>
        </div>


        <div
          className="questionBox"
        >
          <div
            className="questionNumber"
          >
            1
          </div>

          <div
            className="questionContent"
          >
            <label>
              What did you complete?
            </label>

            <textarea
              value={
                completed
              }
              onChange={
                (
                  e
                ) =>
                  setCompleted(
                    e.target.value
                  )
              }
              placeholder="Describe the career development activity you completed this week."
            />
          </div>
        </div>


        <div
          className="questionBox"
        >
          <div
            className="questionNumber"
          >
            2
          </div>

          <div
            className="questionContent"
          >
            <label>
              What did you learn or accomplish?
            </label>

            <textarea
              value={
                learnedAccomplished
              }
              onChange={
                (
                  e
                ) =>
                  setLearnedAccomplished(
                    e.target.value
                  )
              }
              placeholder="Share what you learned, improved, discovered, or accomplished."
            />
          </div>
        </div>


        <div
          className="questionBox"
        >
          <div
            className="questionNumber"
          >
            3
          </div>

          <div
            className="questionContent"
          >
            <label>
              What is your next step?
            </label>

            <textarea
              value={
                nextStep
              }
              onChange={
                (
                  e
                ) =>
                  setNextStep(
                    e.target.value
                  )
              }
              placeholder="What will you do next to continue making progress?"
            />
          </div>
        </div>


        {/* ===============================================
            MESSAGE
        =============================================== */}

        {message ? (
          <div
            className={
              message.startsWith(
                "✓"
              )
                ? "successMessage"
                : "message"
            }
          >
            {message}
          </div>
        ) : null}


        {/* ===============================================
            ACTIONS
        =============================================== */}

        <div
          className="actions"
        >
          <button
            type="button"
            className="newBtn"
            onClick={
              startNewLog
            }
          >
            + New Log
          </button>

          <div
            className="rightActions"
          >
            <button
              type="button"
              className="draftBtn"
              disabled={
                saving
              }
              onClick={
                saveDraft
              }
            >
              {saving
                ? "Saving..."
                : "Save Draft"}
            </button>

            <button
              type="button"
              className="submitBtn"
              disabled={
                submitting
              }
              onClick={
                submitLog
              }
            >
              {submitting
                ? "Submitting..."
                : "Submit Weekly Log →"}
            </button>
          </div>
        </div>
      </section>


      {/* =================================================
          HISTORY
      ================================================= */}

      <section
        className="historyPanel"
      >
        <div
          className="historyHeader"
        >
          <div>
            <p
              className="eyebrow"
            >
              YOUR PROGRESS
            </p>

            <h2>
              Career Development History
            </h2>

            <p>
              Open a previous log to review or continue working on it.
            </p>
          </div>

          <div
            className="historyCount"
          >
            {previousLogs.length}
          </div>
        </div>


        {previousLogs.length ===
        0 ? (
          <div
            className="emptyHistory"
          >
            Your saved and submitted weekly logs will appear here.
          </div>
        ) : (
          <div
            className="historyList"
          >
            {previousLogs.map(
              (
                log
              ) => (
                <button
                  type="button"
                  key={
                    log.id
                  }
                  className="historyCard"
                  onClick={() =>
                    openLog(
                      log
                    )
                  }
                >
                  <div
                    className="historyTop"
                  >
                    <div>
                      <span
                        className="historyWeek"
                      >
                        WEEK ENDING
                      </span>

                      <strong>
                        {new Date(
                          `${log.week_ending}T00:00:00`
                        ).toLocaleDateString(
                          [],
                          {
                            month:
                              "long",

                            day:
                              "numeric",

                            year:
                              "numeric",
                          }
                        )}
                      </strong>
                    </div>

                    <span
                      className={`historyStatus ${
                        log.status ===
                        "submitted"
                          ? "historySubmitted"
                          : "historyDraft"
                      }`}
                    >
                      {log.status ===
                      "submitted"
                        ? "✓ Submitted"
                        : "Draft"}
                    </span>
                  </div>

                  <div
                    className="historyActivity"
                  >
                    {log.activity_type}
                  </div>

                  {log.next_step ? (
                    <p>
                      <b>
                        Next Step:
                      </b>{" "}
                      {log.next_step}
                    </p>
                  ) : null}
                </button>
              )
            )}
          </div>
        )}
      </section>


      {/* =================================================
          STYLES
      ================================================= */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;

          padding: 28px;

          background:
            radial-gradient(
              circle at top right,
              rgba(0,229,255,.12),
              transparent 30%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(255,210,73,.05),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #050814,
              #0b1220,
              #05060d
            );

          color: white;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .topBar {
          max-width: 1200px;

          margin: 0 auto 28px;

          display: flex;

          justify-content: space-between;

          align-items: center;
        }

        .backBtn {
          padding: 10px 15px;

          border-radius: 999px;

          border:
            1px solid rgba(255,255,255,.12);

          background:
            rgba(255,255,255,.04);

          color: white;

          cursor: pointer;

          font-weight: 800;
        }

        .brand {
          color: #10f3ff;

          font-size: 11px;

          font-weight: 950;

          letter-spacing: .12em;
        }

        .hero {
          max-width: 1200px;

          margin: auto;

          padding: 34px;

          border-radius: 27px;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 30px;

          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.10),
              rgba(255,210,73,.04)
            );

          border:
            1px solid rgba(16,243,255,.18);
        }

        .eyebrow {
          margin: 0 0 7px;

          color: #10f3ff;

          font-size: 10px;

          font-weight: 950;

          letter-spacing: .14em;

          text-transform: uppercase;
        }

        h1 {
          margin: 0;

          color: white;

          font-size:
            clamp(
              2.3rem,
              5vw,
              4.5rem
            );

          line-height: 1;

          letter-spacing: -.04em;
        }

        .intro {
          max-width: 760px;

          margin: 18px 0 0;

          color:
            rgba(255,255,255,.7);

          line-height: 1.7;

          font-size: 14px;
        }

        .fridayBadge {
          min-width: 190px;

          padding: 18px;

          display: grid;

          gap: 4px;

          border-radius: 18px;

          background:
            rgba(255,210,73,.08);

          border:
            1px solid rgba(255,210,73,.2);
        }

        .fridayBadge span {
          color: #ffd249;

          font-size: 8px;

          font-weight: 950;

          letter-spacing: .12em;
        }

        .fridayBadge strong {
          font-size: 16px;
        }

        .participantPanel {
          max-width: 1200px;

          margin: 18px auto;

          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );

          gap: 10px;
        }

        .participantPanel div {
          padding: 14px;

          display: grid;

          gap: 4px;

          border-radius: 14px;

          background:
            rgba(255,255,255,.04);

          border:
            1px solid rgba(255,255,255,.08);
        }

        .participantPanel span {
          color:
            rgba(255,255,255,.46);

          font-size: 8px;

          font-weight: 900;

          letter-spacing: .1em;
        }

        .participantPanel strong {
          font-size: 12px;
        }

        .submittedStatus {
          color: #86efac;
        }

        .draftStatus {
          color: #ffd249;
        }

        .formPanel,
        .historyPanel {
          max-width: 1200px;

          margin:
            18px auto 0;

          padding: 30px;

          border-radius: 25px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.09);
        }

        .sectionHeader h2,
        .historyHeader h2 {
          margin: 3px 0 6px;

          font-size: 25px;
        }

        .sectionHeader p:not(.eyebrow),
        .historyHeader p:not(.eyebrow) {
          margin: 0;

          color:
            rgba(255,255,255,.6);

          font-size: 11px;

          line-height: 1.55;
        }

        .weekField {
          margin-top: 18px;

          display: grid;

          gap: 7px;
        }

        label {
          color: #dce4ee;

          font-size: 11px;

          font-weight: 850;
        }

        input,
        textarea {
          width: 100%;

          padding: 13px;

          border-radius: 13px;

          border:
            1px solid rgba(255,255,255,.12);

          background: #070b13;

          color: white;

          font-family: inherit;

          outline: none;
        }

        textarea {
          min-height: 120px;

          resize: vertical;

          line-height: 1.6;
        }

        .sectionDivider {
          height: 1px;

          margin: 30px 0;

          background:
            rgba(255,255,255,.08);
        }

        .activityGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 11px;

          margin-top: 18px;
        }

        .activityCard {
          min-height: 72px;

          padding: 15px;

          display: flex;

          align-items: center;

          gap: 12px;

          border-radius: 15px;

          border:
            1px solid rgba(255,255,255,.09);

          background:
            rgba(0,0,0,.16);

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .activitySelected {
          border-color:
            rgba(16,243,255,.48);

          background:
            rgba(16,243,255,.075);
        }

        .activityCheck {
          width: 30px;

          height: 30px;

          min-width: 30px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          border:
            1px solid rgba(16,243,255,.28);

          color: #06111f;

          font-weight: 950;
        }

        .activitySelected .activityCheck {
          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          border-color: transparent;
        }

        .activityCard strong {
          font-size: 11px;

          line-height: 1.4;
        }

        .questionBox {
          display: flex;

          gap: 14px;

          margin-top: 18px;
        }

        .questionNumber {
          width: 39px;

          height: 39px;

          min-width: 39px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            rgba(16,243,255,.08);

          border:
            1px solid rgba(16,243,255,.18);

          color: #10f3ff;

          font-weight: 950;
        }

        .questionContent {
          flex: 1;

          display: grid;

          gap: 7px;
        }

        .message,
        .successMessage {
          margin-top: 18px;

          padding: 13px;

          border-radius: 12px;

          font-size: 10px;

          line-height: 1.5;
        }

        .message {
          color: #fde68a;

          background:
            rgba(250,204,21,.06);

          border:
            1px solid rgba(250,204,21,.15);
        }

        .successMessage {
          color: #9df3b7;

          background:
            rgba(34,197,94,.06);

          border:
            1px solid rgba(34,197,94,.16);
        }

        .actions {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 14px;

          flex-wrap: wrap;

          margin-top: 24px;

          padding-top: 20px;

          border-top:
            1px solid rgba(255,255,255,.08);
        }

        .rightActions {
          display: flex;

          gap: 10px;

          flex-wrap: wrap;
        }

        .newBtn,
        .draftBtn,
        .submitBtn {
          padding: 12px 17px;

          border-radius: 999px;

          font-weight: 900;

          cursor: pointer;
        }

        .newBtn {
          border:
            1px solid rgba(255,255,255,.13);

          background:
            rgba(255,255,255,.04);

          color: white;
        }

        .draftBtn {
          border:
            1px solid rgba(16,243,255,.2);

          background:
            rgba(16,243,255,.06);

          color: #c7fbff;
        }

        .submitBtn {
          border: none;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color: #06111f;
        }

        .draftBtn:disabled,
        .submitBtn:disabled {
          opacity: .45;

          cursor: not-allowed;
        }

        .historyHeader {
          display: flex;

          align-items: flex-start;

          justify-content: space-between;

          gap: 20px;
        }

        .historyCount {
          width: 43px;

          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 50%;

          background:
            rgba(16,243,255,.08);

          border:
            1px solid rgba(16,243,255,.17);

          color: #10f3ff;

          font-weight: 950;
        }

        .historyList {
          display: grid;

          gap: 10px;

          margin-top: 19px;
        }

        .historyCard {
          width: 100%;

          padding: 16px;

          border-radius: 15px;

          border:
            1px solid rgba(255,255,255,.08);

          background:
            rgba(0,0,0,.15);

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .historyCard:hover {
          border-color:
            rgba(16,243,255,.2);
        }

        .historyTop {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 12px;
        }

        .historyTop > div {
          display: grid;

          gap: 3px;
        }

        .historyWeek {
          color: #8c98a8;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .1em;
        }

        .historyTop strong {
          font-size: 12px;
        }

        .historyStatus {
          padding: 6px 9px;

          border-radius: 999px;

          font-size: 8px;

          font-weight: 900;
        }

        .historySubmitted {
          color: #86efac;

          background:
            rgba(34,197,94,.06);

          border:
            1px solid rgba(34,197,94,.15);
        }

        .historyDraft {
          color: #fde68a;

          background:
            rgba(250,204,21,.06);

          border:
            1px solid rgba(250,204,21,.15);
        }

        .historyActivity {
          margin-top: 9px;

          color: #10f3ff;

          font-size: 10px;

          font-weight: 850;
        }

        .historyCard p {
          margin: 7px 0 0;

          color: #9ca7b5;

          font-size: 9px;

          line-height: 1.5;
        }

        .emptyHistory {
          margin-top: 18px;

          padding: 25px;

          border-radius: 14px;

          border:
            1px dashed rgba(255,255,255,.12);

          color: #8c97a6;

          text-align: center;

          font-size: 10px;
        }

        @media(max-width:800px) {

          .page {
            padding: 14px;
          }

          .hero {
            flex-direction: column;

            align-items: stretch;

            padding: 24px;
          }

          .fridayBadge {
            min-width: 0;
          }

          .participantPanel {
            grid-template-columns:
              1fr;
          }

          .activityGrid {
            grid-template-columns:
              1fr;
          }

          .formPanel,
          .historyPanel {
            padding: 20px;
          }

          .actions,
          .historyHeader {
            flex-direction: column;

            align-items: stretch;
          }

          .rightActions {
            flex-direction: column;
          }

          .newBtn,
          .draftBtn,
          .submitBtn {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}
