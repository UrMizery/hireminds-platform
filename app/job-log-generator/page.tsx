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

type JobEntry = {
  date: string;
  company_name: string;
  job_title: string;
  city_state: string;
  website: string;
  job_description_summary: string;
  outcome: string;
  company_starred: boolean;
  job_title_starred: boolean;
};

type WeeklyJobLog = {
  id: string;
  user_id: string;

  participant_name: string | null;
  participant_email: string | null;
  referral_code: string | null;

  week_ending: string;

  entries: JobEntry[];

  status:
    | "draft"
    | "submitted";

  submitted_at:
    | string
    | null;

  created_at: string;
  updated_at: string;
};

/* =========================================================
   HELPERS
========================================================= */

function blankEntry(): JobEntry {
  return {
    date: "",
    company_name: "",
    job_title: "",
    city_state: "",
    website: "",
    job_description_summary: "",
    outcome: "",
    company_starred: false,
    job_title_starred: false,
  };
}

function createFiveEntries() {
  return [
    blankEntry(),
    blankEntry(),
    blankEntry(),
    blankEntry(),
    blankEntry(),
  ];
}

/* =========================================================
   OUTCOMES
========================================================= */

const OUTCOME_OPTIONS = [
  "Interested",
  "Planning to Apply",
  "Applied",
  "Application Submitted",
  "Follow-Up Needed",
  "Interview Scheduled",
  "Interview Completed",
  "Offer Received",
  "Hired",
  "Not Selected",
  "No Longer Interested",
];

/* =========================================================
   PAGE
========================================================= */

export default function JobLogGeneratorPage() {
  const router =
    useRouter();

  /* =======================================================
     USER
  ======================================================= */

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    userId,
    setUserId,
  ] = useState("");

  const [
    participantName,
    setParticipantName,
  ] = useState("");

  const [
    participantEmail,
    setParticipantEmail,
  ] = useState("");

  const [
    referralCode,
    setReferralCode,
  ] = useState("");

  /* =======================================================
     LOG
  ======================================================= */

  const [
    weekEnding,
    setWeekEnding,
  ] = useState("");

  const [
    entries,
    setEntries,
  ] =
    useState<JobEntry[]>(
      createFiveEntries()
    );

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
    useState<
      "draft" | "submitted"
    >("draft");

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

  /* =======================================================
     HISTORY
  ======================================================= */

  const [
    previousLogs,
    setPreviousLogs,
  ] =
    useState<
      WeeklyJobLog[]
    >([]);

  /* =======================================================
     LOAD
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
        "Profile error:",
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
     LOAD HISTORY
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
          "weekly_job_logs"
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
        "Job log history error:",
        error
      );

      return;
    }

    setPreviousLogs(
      (
        data as WeeklyJobLog[]
      ) ||
        []
    );
  }

  /* =======================================================
     UPDATE ENTRY
  ======================================================= */

  function updateEntry(
    index: number,
    field:
      keyof JobEntry,
    value:
      string | boolean
  ) {
    setEntries(
      (
        previous
      ) =>
        previous.map(
          (
            entry,
            entryIndex
          ) =>
            entryIndex ===
            index
              ? {
                  ...entry,
                  [field]:
                    value,
                }
              : entry
        )
    );

    setMessage("");
  }

  /* =======================================================
     COUNTS
  ======================================================= */

  function hasEntryContent(
    entry:
      JobEntry
  ) {
    return Boolean(
      entry.date ||
        entry.company_name ||
        entry.job_title ||
        entry.city_state ||
        entry.website ||
        entry.job_description_summary ||
        entry.outcome
    );
  }

  const completedCount =
    entries.filter(
      hasEntryContent
    ).length;

  const starredCount =
    entries.filter(
      (
        entry
      ) =>
        entry.company_starred ||
        entry.job_title_starred
    ).length;

  /* =======================================================
     VALIDATE
  ======================================================= */

  function validateDraft() {
    if (
      !weekEnding
    ) {
      setMessage(
        "Please select the week ending date before saving your draft."
      );

      return false;
    }

    return true;
  }

  function validateSubmission() {
    if (
      !weekEnding
    ) {
      setMessage(
        "Please select the week ending date."
      );

      return false;
    }

    if (
      completedCount ===
      0
    ) {
      setMessage(
        "Please complete at least one job entry before submitting your Weekly Job Log."
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
      !validateDraft()
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

      entries,

      total_entries:
        completedCount,

      starred_entries:
        starredCount,

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
          "weekly_job_logs"
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
          "weekly_job_log_draft_saved",

        tool_name:
          "Weekly Job Log Generator",

        page_name:
          "job-log-generator",
      });

    setMessage(
      "✓ Draft saved. You can return and continue working on this Weekly Job Log."
    );

    await loadPreviousLogs();

    setSaving(false);
  }

  /* =======================================================
     SUBMIT
  ======================================================= */

  async function submitLog() {
    if (
      !validateSubmission()
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

      entries,

      total_entries:
        completedCount,

      starred_entries:
        starredCount,

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
          "weekly_job_logs"
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

    setCurrentLogId(
      data.id
    );

    setCurrentStatus(
      "submitted"
    );

    /* =====================================================
       REPORTING ACTIVITY
    ===================================================== */

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
          "weekly_job_log_submitted",

        tool_name:
          "Weekly Job Log Generator",

        page_name:
          "job-log-generator",
      });

    setMessage(
      "✓ Weekly Job Log submitted successfully."
    );

    await loadPreviousLogs();

    setSubmitting(false);
  }

  /* =======================================================
     OPEN HISTORY
  ======================================================= */

  function openPreviousLog(
    log:
      WeeklyJobLog
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

    const loaded =
      Array.isArray(
        log.entries
      )
        ? [
            ...log.entries,
          ]
        : [];

    while (
      loaded.length <
      5
    ) {
      loaded.push(
        blankEntry()
      );
    }

    setEntries(
      loaded.slice(
        0,
        5
      )
    );

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
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

    setEntries(
      createFiveEntries()
    );

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
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
        <div
          className="loadingOrb"
        >
          HM
        </div>

        <p>
          Loading Weekly Job Log...
        </p>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 14px;
            background: #050814;
            color: white;
            font-family: system-ui, sans-serif;
          }

          .loadingOrb {
            width: 58px;
            height: 58px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            border: 1px solid rgba(16,243,255,.28);
            background: rgba(16,243,255,.07);
            color: #10f3ff;
            font-weight: 950;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="page"
    >
      <div
        className="gridBackground"
      />

      <div
        className="glow glowOne"
      />

      <div
        className="glow glowTwo"
      />

      <div
        className="shell"
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <header
          className="topBar"
        >
          <div>
            <p
              className="brand"
            >
              HIREMINDS™
            </p>

            <span
              className="brandSub"
            >
              Career Passport
            </span>
          </div>

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
              WEEKLY JOB SEARCH ACTIVITY
            </p>

            <h1>
              Weekly Job Log
            </h1>

            <p
              className="intro"
            >
              Track the jobs you are researching and applying for each
              week. Keep your opportunities organized, document your
              progress, and record what happens next.
            </p>
          </div>

          <div
            className="weekBadge"
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
            WEEK
        ================================================= */}

        <section
          className="mainPanel"
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
                Select Your Week
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
              onChange={(
                e
              ) =>
                setWeekEnding(
                  e.target.value
                )
              }
            />
          </div>

          <div
            className="sectionDivider"
          />

          {/* ===============================================
              INSTRUCTIONS
          =============================================== */}

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
                Add Your Job Opportunities
              </h2>

              <p>
                You can document up to five job opportunities for the week.
              </p>
            </div>

            <div
              className="counter"
            >
              {completedCount}/5 Entries
            </div>
          </div>

          <div
            className="starNotice"
          >
            <div
              className="starNoticeIcon"
            >
              ☆
            </div>

            <div>
              <strong>
                Mark the opportunities you are most interested in.
              </strong>

              <p>
                Select the star beside the COMPANY and/or JOB TITLE that
                you would especially like to pursue.
              </p>
            </div>
          </div>

          {/* ===============================================
              FIVE JOB ENTRIES
          =============================================== */}

          <div
            className="jobEntries"
          >
            {entries.map(
              (
                entry,
                index
              ) => (
                <article
                  key={
                    index
                  }
                  className={`jobCard ${
                    entry.company_starred ||
                    entry.job_title_starred
                      ? "jobCardStarred"
                      : ""
                  }`}
                >
                  <div
                    className="jobCardHeader"
                  >
                    <div
                      className="entryHeading"
                    >
                      <div
                        className="entryNumber"
                      >
                        {index +
                          1}
                      </div>

                      <div>
                        <p>
                          JOB ENTRY
                        </p>

                        <h3>
                          Opportunity{" "}
                          {index +
                            1}
                        </h3>
                      </div>
                    </div>

                    {entry.company_starred ||
                    entry.job_title_starred ? (
                      <div
                        className="highInterestBadge"
                      >
                        ★ HIGH INTEREST
                      </div>
                    ) : null}
                  </div>

                  <div
                    className="fieldGrid"
                  >
                    {/* DATE */}

                    <div
                      className="field"
                    >
                      <label>
                        Date
                      </label>

                      <input
                        type="date"
                        value={
                          entry.date
                        }
                        onChange={(
                          e
                        ) =>
                          updateEntry(
                            index,
                            "date",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* COMPANY */}

                    <div
                      className="field"
                    >
                      <label
                        className="starFieldLabel"
                      >
                        Company Name

                        <button
                          type="button"
                          className={`starButton ${
                            entry.company_starred
                              ? "starSelected"
                              : ""
                          }`}
                          onClick={() =>
                            updateEntry(
                              index,
                              "company_starred",
                              !entry.company_starred
                            )
                          }
                          title="Mark this company as high interest"
                        >
                          {entry.company_starred
                            ? "★"
                            : "☆"}
                        </button>
                      </label>

                      <input
                        type="text"
                        value={
                          entry.company_name
                        }
                        placeholder="Company name"
                        onChange={(
                          e
                        ) =>
                          updateEntry(
                            index,
                            "company_name",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* JOB TITLE */}

                    <div
                      className="field"
                    >
                      <label
                        className="starFieldLabel"
                      >
                        Job Title

                        <button
                          type="button"
                          className={`starButton ${
                            entry.job_title_starred
                              ? "starSelected"
                              : ""
                          }`}
                          onClick={() =>
                            updateEntry(
                              index,
                              "job_title_starred",
                              !entry.job_title_starred
                            )
                          }
                          title="Mark this job title as high interest"
                        >
                          {entry.job_title_starred
                            ? "★"
                            : "☆"}
                        </button>
                      </label>

                      <input
                        type="text"
                        value={
                          entry.job_title
                        }
                        placeholder="Job title"
                        onChange={(
                          e
                        ) =>
                          updateEntry(
                            index,
                            "job_title",
                            e.target.value
                          )
                        }
                      />
                    </div>

                    {/* CITY STATE */}

                    <div
                      className="field"
                    >
                      <label>
                        City, State
                      </label>

                      <input
                        type="text"
                        value={
                          entry.city_state
                        }
                        placeholder="Hartford, CT"
                        onChange={(
                          e
                        ) =>
                          updateEntry(
                            index,
                            "city_state",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>

                  {/* WEBSITE */}

                  <div
                    className="field fullField"
                  >
                    <label>
                      Website
                    </label>

                    <input
                      type="text"
                      value={
                        entry.website
                      }
                      placeholder="Paste the job posting or company website"
                      onChange={(
                        e
                      ) =>
                        updateEntry(
                          index,
                          "website",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* DESCRIPTION */}

                  <div
                    className="field fullField"
                  >
                    <label>
                      Summary of Job Description
                    </label>

                    <textarea
                      value={
                        entry.job_description_summary
                      }
                      placeholder="Briefly summarize the position, responsibilities, qualifications, and other important information from the job posting."
                      onChange={(
                        e
                      ) =>
                        updateEntry(
                          index,
                          "job_description_summary",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  {/* OUTCOME */}

                  <div
                    className="field fullField"
                  >
                    <label>
                      Outcome
                    </label>

                    <select
                      value={
                        entry.outcome
                      }
                      onChange={(
                        e
                      ) =>
                        updateEntry(
                          index,
                          "outcome",
                          e.target.value
                        )
                      }
                    >
                      <option
                        value=""
                      >
                        Select outcome
                      </option>

                      {OUTCOME_OPTIONS.map(
                        (
                          outcome
                        ) => (
                          <option
                            key={
                              outcome
                            }
                            value={
                              outcome
                            }
                          >
                            {outcome}
                          </option>
                        )
                      )}
                    </select>
                  </div>
                </article>
              )
            )}
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
                  : "Submit Weekly Job Log →"}
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
                Weekly Job Log History
              </h2>

              <p>
                View your saved drafts and previously submitted weekly logs.
              </p>
            </div>

            <div
              className="historyCount"
            >
              {
                previousLogs.length
              }
            </div>
          </div>

          {previousLogs.length ===
          0 ? (
            <div
              className="emptyHistory"
            >
              Your saved and submitted Weekly Job Logs will appear here.
            </div>
          ) : (
            <div
              className="historyList"
            >
              {previousLogs.map(
                (
                  log
                ) => {
                  const logEntries =
                    Array.isArray(
                      log.entries
                    )
                      ? log.entries.filter(
                          hasEntryContent
                        )
                      : [];

                  const logStars =
                    Array.isArray(
                      log.entries
                    )
                      ? log.entries.filter(
                          (
                            entry
                          ) =>
                            entry.company_starred ||
                            entry.job_title_starred
                        ).length
                      : 0;

                  return (
                    <button
                      type="button"
                      key={
                        log.id
                      }
                      className="historyCard"
                      onClick={() =>
                        openPreviousLog(
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
                        className="historyStats"
                      >
                        <div>
                          <span>
                            JOB ENTRIES
                          </span>

                          <strong>
                            {
                              logEntries.length
                            }
                          </strong>
                        </div>

                        <div>
                          <span>
                            HIGH INTEREST
                          </span>

                          <strong>
                            {
                              logStars
                            }
                          </strong>
                        </div>
                      </div>
                    </button>
                  );
                }
              )}
            </div>
          )}
        </section>

        <footer>
          <strong>
            HireMinds™
          </strong>

          <span>
            Prepare with Confidence. Build with Purpose.
          </span>
        </footer>
      </div>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          position: relative;

          min-height: 100vh;

          padding: 28px;

          overflow: hidden;

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

        .gridBackground {
          position: fixed;

          inset: 0;

          pointer-events: none;

          opacity: .045;

          background-image:
            linear-gradient(
              rgba(255,255,255,.045) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255,255,255,.045) 1px,
              transparent 1px
            );

          background-size:
            70px 70px;
        }

        .glow {
          position: fixed;

          border-radius: 50%;

          filter: blur(110px);

          pointer-events: none;
        }

        .glowOne {
          width: 420px;
          height: 420px;

          top: -180px;
          right: -120px;

          background:
            rgba(0,229,255,.07);
        }

        .glowTwo {
          width: 500px;
          height: 500px;

          bottom: -260px;
          left: -220px;

          background:
            rgba(255,210,73,.035);
        }

        .shell {
          position: relative;

          z-index: 2;

          max-width: 1200px;

          margin: 0 auto;
        }

        /* ===============================================
           TOP
        =============================================== */

        .topBar {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 20px;

          margin-bottom: 28px;
        }

        .brand {
          margin: 0;

          color: #10f3ff;

          font-size: 11px;

          font-weight: 950;

          letter-spacing: .13em;
        }

        .brandSub {
          display: block;

          margin-top: 3px;

          color:
            rgba(255,255,255,.42);

          font-size: 8px;
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

          font-size: 10px;

          font-weight: 850;
        }

        /* ===============================================
           HERO
        =============================================== */

        .hero {
          padding: 34px;

          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 28px;

          border-radius: 27px;

          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.09),
              rgba(255,210,73,.035)
            );

          border:
            1px solid rgba(16,243,255,.17);
        }

        .eyebrow {
          margin: 0 0 7px;

          color: #10f3ff;

          font-size: 9px;

          font-weight: 950;

          letter-spacing: .14em;

          text-transform: uppercase;
        }

        h1 {
          margin: 0;

          color: white;

          font-size:
            clamp(
              2.5rem,
              5vw,
              4.8rem
            );

          line-height: 1;

          letter-spacing: -.04em;
        }

        .intro {
          max-width: 730px;

          margin: 17px 0 0;

          color:
            rgba(255,255,255,.68);

          line-height: 1.7;

          font-size: 13px;
        }

        .weekBadge {
          min-width: 190px;

          padding: 17px;

          display: grid;

          gap: 4px;

          border-radius: 17px;

          background:
            rgba(255,210,73,.07);

          border:
            1px solid rgba(255,210,73,.18);
        }

        .weekBadge span {
          color: #ffd249;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: .12em;
        }

        .weekBadge strong {
          font-size: 15px;
        }

        /* ===============================================
           PARTICIPANT
        =============================================== */

        .participantPanel {
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
            rgba(255,255,255,.45);

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .1em;
        }

        .participantPanel strong {
          font-size: 11px;
        }

        .submittedStatus {
          color: #86efac;
        }

        .draftStatus {
          color: #ffd249;
        }

        /* ===============================================
           MAIN PANEL
        =============================================== */

        .mainPanel,
        .historyPanel {
          margin-top: 18px;

          padding: 30px;

          border-radius: 25px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.09);
        }

        .sectionHeader {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 20px;
        }

        .sectionHeader h2,
        .historyHeader h2 {
          margin: 3px 0 6px;

          font-size: 24px;
        }

        .sectionHeader p:not(.eyebrow),
        .historyHeader p:not(.eyebrow) {
          margin: 0;

          color:
            rgba(255,255,255,.59);

          font-size: 10px;

          line-height: 1.55;
        }

        .weekField {
          max-width: 380px;

          margin-top: 18px;

          display: grid;

          gap: 7px;
        }

        .weekField label,
        .field label {
          color: #dce4ee;

          font-size: 10px;

          font-weight: 850;
        }

        input,
        textarea,
        select {
          width: 100%;

          padding: 13px;

          border-radius: 12px;

          border:
            1px solid rgba(255,255,255,.11);

          background: #070b13;

          color: white;

          outline: none;

          font-family: inherit;
        }

        select option {
          background: #070b13;

          color: white;
        }

        textarea {
          min-height: 105px;

          resize: vertical;

          line-height: 1.6;
        }

        .sectionDivider {
          height: 1px;

          margin: 29px 0;

          background:
            rgba(255,255,255,.08);
        }

        .counter {
          padding: 7px 10px;

          border-radius: 999px;

          background:
            rgba(16,243,255,.07);

          border:
            1px solid rgba(16,243,255,.16);

          color: #10f3ff;

          font-size: 9px;

          font-weight: 900;
        }

        /* ===============================================
           STAR NOTICE
        =============================================== */

        .starNotice {
          margin-top: 18px;

          padding: 16px;

          display: flex;

          gap: 13px;

          align-items: center;

          border-radius: 15px;

          background:
            linear-gradient(
              135deg,
              rgba(255,210,73,.07),
              rgba(16,243,255,.02)
            );

          border:
            1px solid rgba(255,210,73,.16);
        }

        .starNoticeIcon {
          color: #ffd249;

          font-size: 31px;
        }

        .starNotice strong {
          color: #ffe486;

          font-size: 11px;
        }

        .starNotice p {
          margin: 4px 0 0;

          color:
            rgba(255,255,255,.58);

          font-size: 9px;
        }

        /* ===============================================
           JOB CARDS
        =============================================== */

        .jobEntries {
          display: grid;

          gap: 15px;

          margin-top: 18px;
        }

        .jobCard {
          padding: 22px;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.045),
              rgba(0,0,0,.13)
            );

          border:
            1px solid rgba(255,255,255,.08);

          transition:
            border-color .2s ease,
            box-shadow .2s ease;
        }

        .jobCardStarred {
          border-color:
            rgba(255,210,73,.27);

          box-shadow:
            0 0 35px rgba(255,210,73,.035);
        }

        .jobCardHeader {
          display: flex;

          justify-content: space-between;

          align-items: center;

          gap: 15px;

          flex-wrap: wrap;

          margin-bottom: 18px;
        }

        .entryHeading {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .entryNumber {
          width: 43px;
          height: 43px;

          display: flex;

          align-items: center;

          justify-content: center;

          border-radius: 13px;

          background:
            rgba(16,243,255,.07);

          border:
            1px solid rgba(16,243,255,.16);

          color: #10f3ff;

          font-size: 12px;

          font-weight: 950;
        }

        .entryHeading p {
          margin: 0;

          color:
            rgba(255,255,255,.38);

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .12em;
        }

        .entryHeading h3 {
          margin: 3px 0 0;

          font-size: 18px;
        }

        .highInterestBadge {
          padding: 7px 10px;

          border-radius: 999px;

          background:
            rgba(255,210,73,.07);

          border:
            1px solid rgba(255,210,73,.18);

          color: #ffd249;

          font-size: 8px;

          font-weight: 950;

          letter-spacing: .07em;
        }

        .fieldGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 12px;
        }

        .field {
          display: grid;

          gap: 7px;
        }

        .fullField {
          margin-top: 12px;
        }

        .starFieldLabel {
          display: flex;

          align-items: center;

          gap: 7px;
        }

        .starButton {
          padding: 0;

          border: none;

          background: transparent;

          color:
            rgba(255,255,255,.34);

          font-size: 21px;

          line-height: 1;

          cursor: pointer;
        }

        .starSelected {
          color: #ffd249;

          text-shadow:
            0 0 14px rgba(255,210,73,.3);
        }

        /* ===============================================
           ACTIONS
        =============================================== */

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

        /* ===============================================
           HISTORY
        =============================================== */

        .historyHeader {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

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

        .historyStats {
          display: flex;

          gap: 9px;

          margin-top: 12px;
        }

        .historyStats div {
          min-width: 110px;

          padding: 9px 10px;

          display: grid;

          gap: 3px;

          border-radius: 10px;

          background:
            rgba(255,255,255,.03);

          border:
            1px solid rgba(255,255,255,.055);
        }

        .historyStats span {
          color: #778696;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: .08em;
        }

        .historyStats strong {
          font-size: 11px;
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

        footer {
          display: flex;

          justify-content: space-between;

          gap: 20px;

          padding: 27px 5px 4px;

          color: #607080;

          font-size: 9px;
        }

        /* ===============================================
           MOBILE
        =============================================== */

        @media(max-width:800px) {
          .page {
            padding: 14px;
          }

          .hero {
            flex-direction: column;

            align-items: stretch;

            padding: 24px;
          }

          .weekBadge {
            min-width: 0;
          }

          .participantPanel {
            grid-template-columns: 1fr;
          }

          .mainPanel,
          .historyPanel {
            padding: 20px;
          }

          .fieldGrid {
            grid-template-columns: 1fr;
          }

          .sectionHeader,
          .historyHeader {
            flex-direction: column;
          }

          .actions {
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

          footer {
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
