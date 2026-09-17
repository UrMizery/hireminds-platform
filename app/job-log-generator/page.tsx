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
  const [historyOpen, setHistoryOpen] = useState(false);
  const [expandedIndexes, setExpandedIndexes] =
    useState<number[]>([0]);

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
    if (!id) return;

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
          ? { ...entry, [field]: value }
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

  function toggleEntry(index: number) {
    setExpandedIndexes((current) =>
      current.includes(index)
        ? current.filter((item) => item !== index)
        : [...current, index]
    );
  }

  function expandEntry(index: number) {
    setExpandedIndexes((current) =>
      current.includes(index)
        ? current
        : [...current, index]
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
    if (!validateDraft()) return;

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
    if (!validateSubmission()) return;

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

    const normalized = loaded.slice(0, 5);
    setEntries(normalized);

    const contentIndexes = normalized
      .map((entry, index) =>
        hasEntryContent(entry) ? index : -1
      )
      .filter((index) => index >= 0);

    setExpandedIndexes(
      contentIndexes.length > 0
        ? contentIndexes
        : [0]
    );

    setMessage("");
    setHistoryOpen(false);

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
    setExpandedIndexes([0]);
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
    if (!value) return "";

    return new Date(
      `${value}T00:00:00`
    ).toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  function entrySummary(
    entry: JobEntry,
    index: number
  ) {
    const title =
      entry.job_title ||
      entry.company_name ||
      `Opportunity ${index + 1}`;

    const details = [
      entry.company_name &&
      entry.job_title
        ? entry.company_name
        : "",
      entry.city_state,
      entry.outcome,
    ]
      .filter(Boolean)
      .join(" • ");

    return {
      title,
      details:
        details ||
        "Add company, title, location, link, and outcome.",
    };
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingMark">HM</div>
        <strong>Loading Job Log...</strong>

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
          onClick={() => router.push("/profile")}
        >
          ← My Profile
        </button>

        <section className="titleArea">
          <div>
            <p className="eyebrow">
              JOB SEARCH TRACKING
            </p>

            <h1>
              Job Log Generator
            </h1>

            <p className="intro">
              Keep the opportunities you are researching,
              applying to, and following up on in one place.
              Add up to five positions to each log and update
              the outcome as things change.
            </p>
          </div>

          <div className="titleStats">
            <div>
              <strong>{completedCount}</strong>
              <span>Opportunities Added</span>
            </div>

            <div>
              <strong>{starredCount}</strong>
              <span>High Interest</span>
            </div>

            <div>
              <strong>
                {currentStatus === "submitted"
                  ? "Submitted"
                  : currentLogId
                    ? "Saved"
                    : "New"}
              </strong>
              <span>Log Status</span>
            </div>
          </div>
        </section>

        <section
          className="workspace"
          id="job-log-workspace"
        >
          <div className="logTop">
            <div>
              <p className="eyebrow">
                YOUR JOB SEARCH
              </p>

              <h2>
                Add the opportunities you want to track.
              </h2>

              <p>
                You do not have to fill all five. Use only
                the rows you need.
              </p>
            </div>

            <label className="logDateField">
              <span>LOG DATE</span>

              <input
                type="date"
                value={logDate}
                onChange={(e) =>
                  setLogDate(e.target.value)
                }
              />
            </label>
          </div>

          <div className="starHelp">
            <span className="starHelpIcon">★</span>
            <p>
              Use the star beside a company or job title
              when it is one of your strongest interests.
            </p>
          </div>

          <div className="opportunityList">
            {entries.map((entry, index) => {
              const expanded =
                expandedIndexes.includes(index);

              const summary =
                entrySummary(entry, index);

              const hasContent =
                hasEntryContent(entry);

              const highInterest =
                entry.company_starred ||
                entry.job_title_starred;

              return (
                <article
                  className={`opportunityRow ${
                    highInterest
                      ? "opportunityStarred"
                      : ""
                  }`}
                  key={index}
                >
                  <button
                    type="button"
                    className="opportunityHeader"
                    onClick={() =>
                      toggleEntry(index)
                    }
                  >
                    <span className="opportunityNumber">
                      {index + 1}
                    </span>

                    <div className="opportunitySummary">
                      <strong>
                        {summary.title}
                      </strong>

                      <span>
                        {summary.details}
                      </span>
                    </div>

                    {highInterest ? (
                      <span className="interestBadge">
                        ★ High Interest
                      </span>
                    ) : hasContent ? (
                      <span className="entryBadge">
                        Added
                      </span>
                    ) : null}

                    <span className="expandIcon">
                      {expanded ? "−" : "+"}
                    </span>
                  </button>

                  {expanded ? (
                    <div className="entryBody">
                      <div className="fieldGrid">
                        <label className="field">
                          <span>Date</span>

                          <input
                            type="date"
                            value={entry.date}
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "date",
                                e.target.value
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span className="labelWithStar">
                            Company Name

                            <button
                              type="button"
                              className={`starButton ${
                                entry.company_starred
                                  ? "starSelected"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                updateEntry(
                                  index,
                                  "company_starred",
                                  !entry.company_starred
                                );
                              }}
                            >
                              {entry.company_starred
                                ? "★"
                                : "☆"}
                            </button>
                          </span>

                          <input
                            type="text"
                            value={entry.company_name}
                            placeholder="Company name"
                            onChange={(e) =>
                              updateEntry(
                                index,
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
                                entry.job_title_starred
                                  ? "starSelected"
                                  : ""
                              }`}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();

                                updateEntry(
                                  index,
                                  "job_title_starred",
                                  !entry.job_title_starred
                                );
                              }}
                            >
                              {entry.job_title_starred
                                ? "★"
                                : "☆"}
                            </button>
                          </span>

                          <input
                            type="text"
                            value={entry.job_title}
                            placeholder="Job title"
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "job_title",
                                e.target.value
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>City, State</span>

                          <input
                            type="text"
                            value={entry.city_state}
                            placeholder="Hartford, CT"
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "city_state",
                                e.target.value
                              )
                            }
                          />
                        </label>
                      </div>

                      <label className="field fullField">
                        <span>
                          Job Posting / Company Link
                        </span>

                        <input
                          type="text"
                          value={entry.website}
                          placeholder="Paste the job posting or company website"
                          onChange={(e) =>
                            updateEntry(
                              index,
                              "website",
                              e.target.value
                            )
                          }
                        />
                      </label>

                      <div className="detailGrid">
                        <label className="field">
                          <span>
                            Quick Job Summary
                          </span>

                          <textarea
                            value={
                              entry.job_description_summary
                            }
                            placeholder="Briefly note the responsibilities, qualifications, pay, schedule, or anything important from the posting."
                            onChange={(e) =>
                              updateEntry(
                                index,
                                "job_description_summary",
                                e.target.value
                              )
                            }
                          />
                        </label>

                        <label className="field">
                          <span>
                            Current Outcome
                          </span>

                          <select
                            value={entry.outcome}
                            onChange={(e) =>
                              updateEntry(
                                index,
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

                          <p className="fieldHint">
                            You can reopen this log later and change the outcome.
                          </p>
                        </label>
                      </div>

                      {index < entries.length - 1 ? (
                        <button
                          type="button"
                          className="nextOpportunity"
                          onClick={() =>
                            expandEntry(index + 1)
                          }
                        >
                          Open Opportunity {index + 2} →
                        </button>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              );
            })}
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
              + Start New Log
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
                  : "Submit Job Log →"}
              </button>
            </div>
          </div>
        </section>

        <section className="savedSection">
          <button
            type="button"
            className="savedToggle"
            onClick={() =>
              setHistoryOpen(!historyOpen)
            }
          >
            <div>
              <span className="eyebrow">
                SAVED JOB LOGS
              </span>

              <strong>
                {previousLogs.length === 0
                  ? "No saved logs yet"
                  : `${previousLogs.length} saved log${
                      previousLogs.length === 1
                        ? ""
                        : "s"
                    }`}
              </strong>

              <small>
                {submittedCount} submitted
                {" • "}
                {draftCount} draft
              </small>
            </div>

            <span className="savedArrow">
              {historyOpen ? "−" : "+"}
            </span>
          </button>

          {historyOpen ? (
            <div className="savedList">
              {previousLogs.length === 0 ? (
                <div className="emptySaved">
                  Saved drafts and submitted Job Logs will appear here.
                </div>
              ) : (
                previousLogs.map((log) => {
                  const logEntries =
                    Array.isArray(log.entries)
                      ? log.entries.filter(
                          hasEntryContent
                        )
                      : [];

                  const logStars =
                    Array.isArray(log.entries)
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
                        openPreviousLog(log)
                      }
                    >
                      <div>
                        <span>LOG DATE</span>
                        <strong>
                          {formatDate(
                            log.week_ending
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>OPPORTUNITIES</span>
                        <strong>
                          {logEntries.length}
                        </strong>
                      </div>

                      <div>
                        <span>HIGH INTEREST</span>
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

                      <span className="savedOpen">
                        Open →
                      </span>
                    </button>
                  );
                })
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
          padding: 24px 18px 54px;
          background:
            radial-gradient(
              circle at 88% 5%,
              rgba(31, 130, 188, 0.11),
              transparent 23%
            ),
            linear-gradient(
              180deg,
              #edf2f5 0%,
              #f8fafb 46%,
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
          margin-bottom: 14px;
          padding: 8px 0;
          border: none;
          background: transparent;
          color: #385466;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }

        .eyebrow {
          display: block;
          margin: 0;
          color: #176fa8;
          font-size: 9px;
          font-weight: 950;
          letter-spacing: 0.14em;
        }

        .titleArea {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            auto;
          gap: 34px;
          align-items: end;
          padding: 10px 2px 24px;
          border-bottom:
            1px solid #ccd7df;
        }

        h1 {
          margin: 6px 0 0;
          color: #101820;
          font-size:
            clamp(
              48px,
              6vw,
              76px
            );
          line-height: 0.94;
          font-weight: 950;
          letter-spacing: -0.055em;
        }

        .intro {
          max-width: 760px;
          margin: 16px 0 0;
          color: #65737d;
          font-size: 14px;
          line-height: 1.65;
        }

        .titleStats {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .titleStats div {
          min-width: 112px;
          padding: 11px 12px;
          border-left:
            2px solid #73b6da;
          background:
            rgba(255, 255, 255, 0.6);
        }

        .titleStats strong {
          display: block;
          color: #17384b;
          font-size: 16px;
        }

        .titleStats span {
          display: block;
          margin-top: 3px;
          color: #78858e;
          font-size: 8px;
          font-weight: 800;
        }

        .workspace {
          margin-top: 22px;
          padding: 29px 30px;
          border-radius: 22px;
          background:
            rgba(255, 255, 255, 0.94);
          border: 1px solid #cad6de;
          box-shadow:
            0 13px 32px
            rgba(25, 52, 68, 0.055);
        }

        .logTop {
          display: flex;
          justify-content: space-between;
          gap: 28px;
          align-items: flex-end;
        }

        .logTop h2 {
          margin: 5px 0 0;
          font-size:
            clamp(
              27px,
              4vw,
              38px
            );
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .logTop > div > p:last-child {
          margin: 9px 0 0;
          color: #6f7c85;
          font-size: 12px;
        }

        .logDateField {
          width: 215px;
          flex: 0 0 215px;
        }

        .logDateField span,
        .field > span {
          display: block;
          margin-bottom: 7px;
          color: #314a59;
          font-size: 9px;
          font-weight: 900;
        }

        .logDateField input,
        .field input,
        .field textarea,
        .field select {
          width: 100%;
          padding: 11px 12px;
          border-radius: 10px;
          border: 1px solid #b8c7d1;
          background: #ffffff;
          color: #162731;
          font-family: inherit;
          outline: none;
        }

        .starHelp {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding: 11px 0 13px;
          border-top:
            1px solid #d9e1e7;
          border-bottom:
            1px solid #d9e1e7;
        }

        .starHelpIcon {
          color: #c99622;
          font-size: 17px;
        }

        .starHelp p {
          margin: 0;
          color: #6d7881;
          font-size: 10px;
        }

        .opportunityRow {
          border-bottom:
            1px solid #d6dfe5;
        }

        .opportunityStarred {
          background:
            linear-gradient(
              90deg,
              rgba(219, 170, 54, 0.055),
              transparent 55%
            );
        }

        .opportunityHeader {
          width: 100%;
          min-height: 74px;
          display: grid;
          grid-template-columns:
            34px
            minmax(0, 1fr)
            auto
            26px;
          gap: 13px;
          align-items: center;
          padding: 12px 4px;
          border: none;
          background: transparent;
          text-align: left;
          color: #172832;
          cursor: pointer;
        }

        .opportunityNumber {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: #e9f2f7;
          color: #176fa8;
          font-size: 10px;
          font-weight: 950;
        }

        .opportunitySummary strong {
          display: block;
          font-size: 13px;
        }

        .opportunitySummary span {
          display: block;
          margin-top: 4px;
          color: #79858d;
          font-size: 9px;
        }

        .interestBadge,
        .entryBadge {
          padding: 6px 8px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 7px;
          font-weight: 950;
        }

        .interestBadge {
          background: #fff4d7;
          border: 1px solid #e7cc81;
          color: #7b5e18;
        }

        .entryBadge {
          background: #edf5f9;
          border: 1px solid #c8dae5;
          color: #39708e;
        }

        .expandIcon {
          color: #176fa8;
          font-size: 18px;
          text-align: center;
        }

        .entryBody {
          padding:
            5px
            3px
            22px
            50px;
        }

        .fieldGrid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 13px;
        }

        .field {
          display: block;
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
          cursor: pointer;
        }

        .starSelected {
          color: #cc9821;
        }

        .fullField {
          display: block;
          margin-top: 13px;
        }

        .detailGrid {
          display: grid;
          grid-template-columns:
            minmax(0, 1.45fr)
            minmax(220px, 0.55fr);
          gap: 13px;
          margin-top: 13px;
        }

        .field textarea {
          min-height: 95px;
          resize: vertical;
          line-height: 1.55;
        }

        .fieldHint {
          margin: 7px 0 0;
          color: #89949b;
          font-size: 8px;
        }

        .nextOpportunity {
          margin-top: 14px;
          padding: 8px 0;
          border: none;
          background: transparent;
          color: #176fa8;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .message,
        .successMessage {
          margin-top: 18px;
          padding: 12px 14px;
          border-radius: 11px;
          font-size: 10px;
        }

        .message {
          border: 1px solid #e3c688;
          background: #fff8e7;
          color: #70581c;
        }

        .successMessage {
          border: 1px solid #aed3bb;
          background: #edf8f1;
          color: #286847;
        }

        .actions {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          flex-wrap: wrap;
          margin-top: 22px;
          padding-top: 18px;
          border-top:
            1px solid #d7e0e6;
        }

        .rightActions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .newBtn,
        .draftBtn,
        .submitBtn {
          padding: 11px 15px;
          border-radius: 10px;
          font-size: 9px;
          font-weight: 900;
          cursor: pointer;
        }

        .newBtn {
          border: 1px solid #bdcad2;
          background: white;
          color: #3e5665;
        }

        .draftBtn {
          border: 1px solid #88b8d1;
          background: #eff7fb;
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
        }

        .draftBtn:disabled,
        .submitBtn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .savedSection {
          margin-top: 18px;
          overflow: hidden;
          border-radius: 16px;
          background:
            rgba(255, 255, 255, 0.88);
          border: 1px solid #ccd7df;
        }

        .savedToggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          padding: 16px 18px;
          border: none;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedToggle strong {
          display: block;
          margin-top: 4px;
          font-size: 13px;
        }

        .savedToggle small {
          display: block;
          margin-top: 3px;
          color: #7c8991;
          font-size: 8px;
        }

        .savedArrow {
          color: #176fa8;
          font-size: 18px;
        }

        .savedList {
          padding:
            0
            18px
            8px;
          border-top:
            1px solid #d9e1e7;
        }

        .savedRow {
          width: 100%;
          display: grid;
          grid-template-columns:
            minmax(125px, 0.8fr)
            minmax(85px, 0.45fr)
            minmax(85px, 0.45fr)
            auto
            auto;
          gap: 18px;
          align-items: center;
          padding: 14px 0;
          border: none;
          border-bottom:
            1px solid #d9e1e7;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedRow div {
          display: grid;
          gap: 3px;
        }

        .savedRow div span {
          color: #87939b;
          font-size: 7px;
          font-weight: 900;
        }

        .savedRow div strong {
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

        .savedOpen {
          color: #176fa8;
          font-size: 8px;
          font-weight: 900;
        }

        .emptySaved {
          padding: 18px 0;
          color: #7e8a92;
          font-size: 9px;
        }

        @media (max-width: 850px) {
          .titleArea {
            grid-template-columns: 1fr;
          }

          .titleStats {
            justify-content: flex-start;
          }

          .logTop {
            flex-direction: column;
            align-items: stretch;
          }

          .logDateField {
            width: 100%;
            flex: auto;
          }

          .detailGrid {
            grid-template-columns: 1fr;
          }

          .savedRow {
            grid-template-columns:
              1fr
              auto;
          }

          .savedRow div:nth-child(2),
          .savedRow div:nth-child(3),
          .savedOpen {
            display: none;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 15px 12px 38px;
          }

          h1 {
            font-size:
              clamp(
                43px,
                15vw,
                64px
              );
          }

          .titleStats div {
            min-width: 0;
            flex: 1;
          }

          .workspace {
            padding: 22px 19px;
          }

          .fieldGrid {
            grid-template-columns: 1fr;
          }

          .entryBody {
            padding:
              4px
              0
              20px
              0;
          }

          .opportunityHeader {
            grid-template-columns:
              32px
              minmax(0, 1fr)
              22px;
          }

          .interestBadge,
          .entryBadge {
            display: none;
          }

          .actions {
            flex-direction: column;
            align-items: stretch;
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
