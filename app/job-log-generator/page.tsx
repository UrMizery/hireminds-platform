"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

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
  status: "draft" | "submitted";
  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

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

export default function JobLogGeneratorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [logDate, setLogDate] = useState("");
  const [entries, setEntries] = useState<JobEntry[]>(
    createFiveEntries()
  );

  const [currentLogId, setCurrentLogId] =
    useState<string | null>(null);

  const [currentStatus, setCurrentStatus] =
    useState<"draft" | "submitted">("draft");

  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [previousLogs, setPreviousLogs] = useState<
    WeeklyJobLog[]
  >([]);

  const [showSavedLogs, setShowSavedLogs] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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
      console.error("Profile error:", profileError);
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

  async function loadPreviousLogs(uid?: string) {
    const id = uid || userId;

    if (!id) {
      return;
    }

    const { data, error } = await supabase
      .from("weekly_job_logs")
      .select("*")
      .eq("user_id", id)
      .order("week_ending", {
        ascending: false,
      });

    if (error) {
      console.error("Job log history error:", error);
      return;
    }

    setPreviousLogs(
      (data as WeeklyJobLog[]) || []
    );
  }

  function updateEntry(
    index: number,
    field: keyof JobEntry,
    value: string | boolean
  ) {
    setEntries((previous) =>
      previous.map((entry, entryIndex) =>
        entryIndex === index
          ? {
              ...entry,
              [field]: value,
            }
          : entry
      )
    );

    setMessage("");
  }

  function hasEntryContent(entry: JobEntry) {
    return Boolean(
      entry.date ||
        entry.company_name ||
        entry.job_title ||
        entry.city_state ||
        entry.website ||
        entry.job_description_summary ||
        entry.outcome ||
        entry.company_starred ||
        entry.job_title_starred
    );
  }

  const completedCount = useMemo(
    () => entries.filter(hasEntryContent).length,
    [entries]
  );

  const starredCount = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.company_starred ||
          entry.job_title_starred
      ).length,
    [entries]
  );

  const completionPercent = Math.round(
    (completedCount / 5) * 100
  );

  const activeEntry = entries[activeIndex];

  const draftCount = previousLogs.filter(
    (log) => log.status === "draft"
  ).length;

  const submittedCount = previousLogs.filter(
    (log) => log.status === "submitted"
  ).length;

  function validateDraft() {
    if (!logDate) {
      setMessage(
        "Please choose a date for this job log before saving."
      );
      return false;
    }

    return true;
  }

  function validateSubmission() {
    if (!logDate) {
      setMessage(
        "Please choose a date for this job log."
      );
      return false;
    }

    if (completedCount === 0) {
      setMessage(
        "Please add at least one job opportunity before submitting."
      );
      return false;
    }

    return true;
  }

  async function saveDraft() {
    if (!validateDraft()) {
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      user_id: userId,
      participant_name: participantName,
      participant_email: participantEmail,
      referral_code: referralCode || null,
      week_ending: logDate,
      entries,
      total_entries: completedCount,
      starred_entries: starredCount,
      status: "draft",
      submitted_at: null,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("weekly_job_logs")
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

    await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: participantName,
        email: participantEmail,
        referral_code: referralCode || null,
        event_type:
          "weekly_job_log_draft_saved",
        tool_name:
          "Weekly Job Log Generator",
        page_name:
          "job-log-generator",
      });

    setMessage(
      "✓ Draft saved. You can reopen it later from Saved Job Logs."
    );

    await loadPreviousLogs();
    setSaving(false);
  }

  async function submitLog() {
    if (!validateSubmission()) {
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
      week_ending: logDate,
      entries,
      total_entries: completedCount,
      starred_entries: starredCount,
      status: "submitted",
      submitted_at: submittedAt,
      updated_at: submittedAt,
    };

    const { data, error } = await supabase
      .from("weekly_job_logs")
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

    setCurrentLogId(data.id);
    setCurrentStatus("submitted");

    await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: participantName,
        email: participantEmail,
        referral_code: referralCode || null,
        event_type:
          "weekly_job_log_submitted",
        tool_name:
          "Weekly Job Log Generator",
        page_name:
          "job-log-generator",
      });

    setMessage(
      "✓ Job Log submitted to HireMinds. It is saved with your participant record and can be reopened under Saved Job Logs."
    );

    await loadPreviousLogs();
    setSubmitting(false);
  }

  function openPreviousLog(log: WeeklyJobLog) {
    setCurrentLogId(log.id);
    setCurrentStatus(log.status);
    setLogDate(log.week_ending);

    const loaded = Array.isArray(log.entries)
      ? [...log.entries]
      : [];

    while (loaded.length < 5) {
      loaded.push(blankEntry());
    }

    setEntries(loaded.slice(0, 5));

    const firstUsed = loaded.findIndex(
      (entry) => hasEntryContent(entry)
    );

    setActiveIndex(firstUsed >= 0 ? firstUsed : 0);
    setMessage("");
    setShowSavedLogs(false);

    window.setTimeout(() => {
      document
        .getElementById("job-log-workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function startNewLog() {
    setCurrentLogId(null);
    setCurrentStatus("draft");
    setLogDate("");
    setEntries(createFiveEntries());
    setActiveIndex(0);
    setMessage("");

    window.setTimeout(() => {
      document
        .getElementById("job-log-workspace")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  function formatDate(value: string) {
    if (!value) return "Not selected";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function opportunityLabel(
    entry: JobEntry,
    index: number
  ) {
    if (entry.job_title) {
      return entry.job_title;
    }

    if (entry.company_name) {
      return entry.company_name;
    }

    return `Opportunity ${index + 1}`;
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingMark">HM</div>

        <strong>
          Loading Job Log...
        </strong>

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

  return (
    <main className="page">
      <div className="shell">
        <button
          type="button"
          className="backBtn"
          onClick={() =>
            router.push("/profile")
          }
        >
          ← My Profile
        </button>

        <section className="hero">
          <div className="heroCopy">
            <p className="eyebrow heroEyebrow">
              JOB SEARCH TRACKING
            </p>

            <h1>
              Job Log Generator
            </h1>
          </div>

          <div className="heroProgress">
            <div className="progressTop">
              <span>THIS LOG</span>
              <strong>
                {completedCount}/5
              </strong>
            </div>

            <div className="progressTrack">
              <span
                style={{
                  width: `${completionPercent}%`,
                }}
              />
            </div>

            <p>
              Add only the opportunities you want to track.
            </p>
          </div>
        </section>

        <section
          className="workspace"
          id="job-log-workspace"
        >
          <div className="workspaceMain">
            <div className="workspaceIntro">
              <div>
                <p className="eyebrow">
                  YOUR JOB SEARCH
                </p>

                <h2>
                  Track your opportunities.
                </h2>

                <p>
                  Add up to five jobs. You do not have to
                  complete all five.
                </p>
              </div>

              <span
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
                    : "New Log"}
              </span>
            </div>

            <div className="topFields">
              <label className="dateField">
                <span>LOG DATE</span>
                <strong>
                  When are you documenting these opportunities?
                </strong>

                <input
                  type="date"
                  value={logDate}
                  onChange={(e) =>
                    setLogDate(e.target.value)
                  }
                />
              </label>

              <div className="interestNote">
                <span>HIGH INTEREST</span>

                <strong>
                  Use ★ for the companies or job titles you
                  want to prioritize.
                </strong>

                <p>
                  This helps you quickly see which
                  opportunities matter most to you.
                </p>
              </div>
            </div>

            <div className="flowDivider" />

            <div className="selectorHeading">
              <div>
                <p className="eyebrow">
                  OPPORTUNITIES
                </p>

                <h3>
                  Choose the position you want to update.
                </h3>
              </div>

              <span>
                {completedCount} of 5 added
              </span>
            </div>

            <div className="opportunityTabs">
              {entries.map((entry, index) => {
                const used =
                  hasEntryContent(entry);

                const highInterest =
                  entry.company_starred ||
                  entry.job_title_starred;

                return (
                  <button
                    key={index}
                    type="button"
                    className={`opportunityTab ${
                      activeIndex === index
                        ? "opportunityTabActive"
                        : ""
                    }`}
                    onClick={() =>
                      setActiveIndex(index)
                    }
                  >
                    <span>
                      Opportunity {index + 1}
                    </span>

                    <strong>
                      {opportunityLabel(
                        entry,
                        index
                      )}
                    </strong>

                    <small>
                      {highInterest
                        ? "★ High Interest"
                        : used
                          ? "Added"
                          : "Not started"}
                    </small>
                  </button>
                );
              })}
            </div>

            <div className="flowDivider compactDivider" />

            <div className="activeOpportunityHeader">
              <div>
                <p className="eyebrow">
                  OPPORTUNITY {activeIndex + 1}
                </p>

                <h3>
                  {opportunityLabel(
                    activeEntry,
                    activeIndex
                  )}
                </h3>
              </div>

              <span className="positionCounter">
                {activeIndex + 1} / 5
              </span>
            </div>

            <div className="fieldGrid">
              <label className="field">
                <span className="labelWithStar">
                  Company Name

                  <button
                    type="button"
                    className={`starButton ${
                      activeEntry.company_starred
                        ? "starSelected"
                        : ""
                    }`}
                    onClick={() =>
                      updateEntry(
                        activeIndex,
                        "company_starred",
                        !activeEntry.company_starred
                      )
                    }
                    title="Mark company as high interest"
                  >
                    {activeEntry.company_starred
                      ? "★"
                      : "☆"}
                  </button>
                </span>

                <input
                  type="text"
                  value={
                    activeEntry.company_name
                  }
                  placeholder="Company name"
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "company_name",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span className="labelWithStar">
                  Job Title

                  <button
                    type="button"
                    className={`starButton ${
                      activeEntry.job_title_starred
                        ? "starSelected"
                        : ""
                    }`}
                    onClick={() =>
                      updateEntry(
                        activeIndex,
                        "job_title_starred",
                        !activeEntry.job_title_starred
                      )
                    }
                    title="Mark job title as high interest"
                  >
                    {activeEntry.job_title_starred
                      ? "★"
                      : "☆"}
                  </button>
                </span>

                <input
                  type="text"
                  value={
                    activeEntry.job_title
                  }
                  placeholder="Job title"
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "job_title",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Opportunity Date</span>

                <input
                  type="date"
                  value={
                    activeEntry.date
                  }
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "date",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>City, State</span>

                <input
                  type="text"
                  value={
                    activeEntry.city_state
                  }
                  placeholder="Hartford, CT"
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "city_state",
                      e.target.value
                    )
                  }
                />
              </label>

              <label className="field">
                <span>Current Outcome</span>

                <select
                  value={
                    activeEntry.outcome
                  }
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "outcome",
                      e.target.value
                    )
                  }
                >
                  <option value="">
                    Select outcome
                  </option>

                  {OUTCOME_OPTIONS.map(
                    (outcome) => (
                      <option
                        key={outcome}
                        value={outcome}
                      >
                        {outcome}
                      </option>
                    )
                  )}
                </select>
              </label>

              <label className="field">
                <span>
                  Job Posting / Company Link
                </span>

                <input
                  type="text"
                  value={
                    activeEntry.website
                  }
                  placeholder="Paste the job posting or company website"
                  onChange={(e) =>
                    updateEntry(
                      activeIndex,
                      "website",
                      e.target.value
                    )
                  }
                />
              </label>
            </div>

            <label className="summaryField">
              <span>Quick Job Summary</span>

              <p>
                Capture the important parts of the posting
                so you do not have to search for them later.
              </p>

              <textarea
                value={
                  activeEntry.job_description_summary
                }
                placeholder="Responsibilities, qualifications, schedule, pay, requirements, or anything important about this position."
                onChange={(e) =>
                  updateEntry(
                    activeIndex,
                    "job_description_summary",
                    e.target.value
                  )
                }
              />
            </label>

            <div className="opportunityNavigation">
              <button
                type="button"
                className="navButton"
                disabled={activeIndex === 0}
                onClick={() =>
                  setActiveIndex(
                    Math.max(
                      0,
                      activeIndex - 1
                    )
                  )
                }
              >
                ← Previous Opportunity
              </button>

              <button
                type="button"
                className="navButton navButtonNext"
                disabled={activeIndex === 4}
                onClick={() =>
                  setActiveIndex(
                    Math.min(
                      4,
                      activeIndex + 1
                    )
                  )
                }
              >
                Next Opportunity →
              </button>
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
                onClick={
                  startNewLog
                }
              >
                + Start New Log
              </button>

              <div className="rightActions">
                <button
                  type="button"
                  className="draftBtn"
                  disabled={saving}
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
                    : "Submit Job Log →"}
                </button>
              </div>
            </div>
          </div>

          <aside className="snapshot">
            <p className="snapshotEyebrow">
              THIS LOG
            </p>

            <h3>
              Your job search at a glance
            </h3>

            <div className="snapshotItem">
              <span>Log date</span>

              <strong>
                {formatDate(logDate)}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>
                Opportunities added
              </span>

              <strong>
                {completedCount} of 5
              </strong>
            </div>

            <div className="snapshotItem">
              <span>
                High interest
              </span>

              <strong>
                {starredCount}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>
                Current opportunity
              </span>

              <strong>
                {opportunityLabel(
                  activeEntry,
                  activeIndex
                )}
              </strong>
            </div>

            <div className="snapshotItem">
              <span>Status</span>

              <strong>
                {currentStatus ===
                "submitted"
                  ? "Submitted"
                  : currentLogId
                    ? "Saved Draft"
                    : "New Log"}
              </strong>
            </div>
          </aside>
        </section>

        <section className="savedPanel">
          <button
            type="button"
            className="savedToggle"
            onClick={() =>
              setShowSavedLogs(
                (value) => !value
              )
            }
          >
            <div>
              <span className="savedLabel">
                SAVED JOB LOGS
              </span>

              <strong>
                {previousLogs.length === 0
                  ? "No saved logs yet"
                  : `${previousLogs.length} saved ${
                      previousLogs.length === 1
                        ? "log"
                        : "logs"
                    }`}
              </strong>
            </div>

            <div className="savedSummary">
              <span>
                {submittedCount} submitted
              </span>

              <span>
                {draftCount} drafts
              </span>

              <b>
                {showSavedLogs
                  ? "Hide ↑"
                  : "View ↓"}
              </b>
            </div>
          </button>

          {showSavedLogs ? (
            <div className="savedList">
              {previousLogs.length ===
              0 ? (
                <div className="emptySaved">
                  Saved drafts and submitted Job Logs will
                  appear here.
                </div>
              ) : (
                previousLogs.map(
                  (log) => {
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
                            (entry) =>
                              entry.company_starred ||
                              entry.job_title_starred
                          ).length
                        : 0;

                    return (
                      <button
                        type="button"
                        key={log.id}
                        className="savedRow"
                        onClick={() =>
                          openPreviousLog(
                            log
                          )
                        }
                      >
                        <div className="savedDate">
                          <span>
                            DATE
                          </span>

                          <strong>
                            {formatDate(
                              log.week_ending
                            )}
                          </strong>
                        </div>

                        <div className="savedCount">
                          <span>
                            OPPORTUNITIES
                          </span>

                          <strong>
                            {logEntries.length}
                          </strong>
                        </div>

                        <div className="savedCount">
                          <span>
                            HIGH INTEREST
                          </span>

                          <strong>
                            {logStars}
                          </strong>
                        </div>

                        <span
                          className={`savedStatus ${
                            log.status ===
                            "submitted"
                              ? "savedSubmitted"
                              : "savedDraft"
                          }`}
                        >
                          {log.status ===
                          "submitted"
                            ? "✓ Submitted"
                            : "Draft"}
                        </span>

                        <span className="savedArrow">
                          →
                        </span>
                      </button>
                    );
                  }
                )
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
          padding: 34px 40px;
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
        .heroProgress {
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

        .heroProgress {
          padding: 18px;
          border-radius: 18px;
          background:
            rgba(255, 255, 255, 0.085);
          border:
            1px solid
            rgba(255, 255, 255, 0.13);
          backdrop-filter: blur(8px);
        }

        .progressTop {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .progressTop span {
          color: #78c2ea;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
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

        .heroProgress p {
          margin: 7px 0 0;
          color: #c6d4dc;
          font-size: 10px;
          line-height: 1.55;
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
        .savedPanel {
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

        .workspaceIntro h2 {
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

        .workspaceIntro > div > p:last-child {
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

        .topFields {
          display: grid;
          grid-template-columns:
            minmax(220px, 0.72fr)
            minmax(0, 1.28fr);
          gap: 16px;
          margin-top: 28px;
        }

        .dateField,
        .interestNote {
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
        .interestNote > span {
          color: #1679b7;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.12em;
        }

        .dateField strong,
        .interestNote strong {
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

        .interestNote p {
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

        .compactDivider {
          margin: 24px 0;
        }

        .selectorHeading,
        .activeOpportunityHeader {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
        }

        .selectorHeading h3,
        .activeOpportunityHeader h3 {
          margin: 4px 0 0;
          font-size: 24px;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .selectorHeading > span,
        .positionCounter {
          color: #75828c;
          font-size: 10px;
          font-weight: 800;
        }

        .opportunityTabs {
          display: grid;
          grid-template-columns:
            repeat(
              5,
              minmax(0, 1fr)
            );
          gap: 8px;
          margin-top: 17px;
        }

        .opportunityTab {
          min-height: 95px;
          padding: 12px;
          border-radius: 13px;
          border: 1px solid #d2dce3;
          background: #f7f9fa;
          color: #1c2d37;
          text-align: left;
          cursor: pointer;
          transition:
            transform 0.18s ease,
            border-color 0.18s ease,
            background 0.18s ease;
        }

        .opportunityTab:hover,
        .opportunityTabActive {
          transform: translateY(-2px);
          border-color: #56a7d3;
          background:
            linear-gradient(
              145deg,
              #f7fcff,
              #eaf5fb
            );
        }

        .opportunityTab > span {
          color: #176fa8;
          font-size: 7px;
          font-weight: 950;
          letter-spacing: 0.08em;
        }

        .opportunityTab strong {
          display: block;
          margin-top: 6px;
          font-size: 10px;
          line-height: 1.3;
        }

        .opportunityTab small {
          display: block;
          margin-top: 6px;
          color: #7d8991;
          font-size: 8px;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 13px;
          margin-top: 18px;
        }

        .field,
        .summaryField {
          display: block;
        }

        .field > span,
        .summaryField > span {
          display: block;
          margin-bottom: 7px;
          color: #314a59;
          font-size: 9px;
          font-weight: 900;
        }

        .labelWithStar {
          display: flex !important;
          align-items: center;
          gap: 7px;
        }

        .starButton {
          padding: 0;
          border: none;
          background: transparent;
          color: #9ba7ae;
          font-size: 18px;
          line-height: 1;
          cursor: pointer;
        }

        .starSelected {
          color: #cc9821;
        }

        .field input,
        .field select,
        .summaryField textarea {
          width: 100%;
          padding: 12px;
          border-radius: 11px;
          border: 1px solid #bac9d2;
          background: #fbfcfd;
          color: #14232d;
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }

        .field input:focus,
        .field select:focus,
        .summaryField textarea:focus {
          border-color: #4c9ec9;
          box-shadow:
            0 0 0 3px
            rgba(76, 158, 201, 0.08);
        }

        .summaryField {
          margin-top: 17px;
        }

        .summaryField p {
          margin: -1px 0 8px;
          color: #7a868e;
          font-size: 9px;
          line-height: 1.45;
        }

        .summaryField textarea {
          min-height: 115px;
          resize: vertical;
          line-height: 1.6;
        }

        .opportunityNavigation {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 17px;
          padding-top: 15px;
          border-top: 1px solid #d8e1e7;
        }

        .navButton {
          padding: 9px 0;
          border: none;
          background: transparent;
          color: #536975;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .navButtonNext {
          color: #176fa8;
        }

        .navButton:disabled {
          opacity: 0.3;
          cursor: not-allowed;
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

        .savedPanel {
          margin-top: 24px;
          overflow: hidden;
        }

        .savedToggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 16px 18px;
          border: none;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedLabel {
          display: block;
          color: #176fa8;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.11em;
        }

        .savedToggle strong {
          display: block;
          margin-top: 4px;
          font-size: 13px;
        }

        .savedSummary {
          display: flex;
          align-items: center;
          gap: 14px;
          color: #78858d;
          font-size: 8px;
        }

        .savedSummary b {
          color: #176fa8;
        }

        .savedList {
          border-top: 1px solid #d7e0e6;
          padding: 0 18px 8px;
        }

        .savedRow {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(120px, 0.8fr)
            minmax(85px, 0.45fr)
            minmax(85px, 0.45fr)
            auto
            20px;
          gap: 18px;
          align-items: center;
          padding: 14px 0;
          border: none;
          border-bottom: 1px solid #d7e0e6;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedDate,
        .savedCount {
          display: grid;
          gap: 3px;
        }

        .savedDate span,
        .savedCount span {
          color: #87939b;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .savedDate strong,
        .savedCount strong {
          font-size: 10px;
        }

        .savedStatus {
          padding: 6px 8px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 7px;
          font-weight: 900;
        }

        .savedSubmitted {
          background: #e9f6ed;
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
          font-size: 16px;
        }

        .emptySaved {
          padding: 18px 0;
          color: #7e8a92;
          font-size: 9px;
        }

        @media (max-width: 1000px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .workspace {
            grid-template-columns: 1fr;
          }

          .snapshot {
            position: static;
          }

          .opportunityTabs {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
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

          .workspaceMain {
            padding: 21px;
          }

          .workspaceIntro,
          .selectorHeading,
          .activeOpportunityHeader,
          .actions {
            flex-direction: column;
            align-items: stretch;
          }

          .topFields,
          .fieldGrid {
            grid-template-columns: 1fr;
          }

          .opportunityTabs {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .rightActions {
            width: 100%;
          }

          .newBtn,
          .draftBtn,
          .submitBtn {
            flex: 1;
          }

          .savedSummary {
            flex-wrap: wrap;
            justify-content: flex-end;
          }

          .savedRow {
            grid-template-columns:
              1fr
              auto;
          }

          .savedCount {
            display: none;
          }

          .savedStatus {
            grid-column: 2;
            grid-row: 1;
          }

          .savedArrow {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
