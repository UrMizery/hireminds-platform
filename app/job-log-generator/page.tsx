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

function createThreeEntries() {
  return [blankEntry(), blankEntry(), blankEntry()];
}

export default function JobLogGeneratorPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [participantName, setParticipantName] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [logDate, setLogDate] = useState("");
  const [entries, setEntries] =
    useState<JobEntry[]>(createThreeEntries());

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
    (completedCount / 3) * 100
  );

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
      "✓ Draft saved. You can return and continue later."
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
      "✓ Job Log submitted to HireMinds and saved with your participant record."
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

    while (loaded.length < 3) {
      loaded.push(blankEntry());
    }

    setEntries(loaded.slice(0, 3));
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

  function startNewLog() {
    setCurrentLogId(null);
    setCurrentStatus("draft");
    setLogDate("");
    setEntries(createThreeEntries());
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
            font-family:
              Inter,
              Arial,
              sans-serif;
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
          My Profile
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
                {completedCount}/3
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
              Track up to three opportunities in one log.
            </p>
          </div>
        </section>

        <section
          className="workspace"
          id="job-log-workspace"
        >
          <div className="workspaceHeader">
            <div>
              <p className="eyebrow">
                YOUR JOB SEARCH
              </p>

              <h2>
                Track the opportunities that matter.
              </h2>

              <p>
                Add one, two, or three positions. You do not
                have to complete every opportunity.
              </p>
            </div>

            <label className="dateField">
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

          <div className="interestLine">
            <span>★</span>

            <p>
              Star a company or job title when it is one of
              your strongest interests.
            </p>
          </div>

          <div className="opportunities">
            {entries.map((entry, index) => (
              <section
                className="opportunitySection"
                key={index}
              >
                <div className="opportunityTitle">
                  <div>
                    <span>
                      OPPORTUNITY {index + 1}
                    </span>

                    <h3>
                      {entry.job_title ||
                        entry.company_name ||
                        `Opportunity ${index + 1}`}
                    </h3>
                  </div>

                  {(entry.company_starred ||
                    entry.job_title_starred) ? (
                    <strong className="highInterest">
                      ★ High Interest
                    </strong>
                  ) : null}
                </div>

                <div className="fieldGrid">
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
                        onClick={() =>
                          updateEntry(
                            index,
                            "company_starred",
                            !entry.company_starred
                          )
                        }
                        title="Mark company as high interest"
                      >
                        {entry.company_starred
                          ? "★"
                          : "☆"}
                      </button>
                    </span>

                    <input
                      type="text"
                      value={
                        entry.company_name
                      }
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
                        onClick={() =>
                          updateEntry(
                            index,
                            "job_title_starred",
                            !entry.job_title_starred
                          )
                        }
                        title="Mark job title as high interest"
                      >
                        {entry.job_title_starred
                          ? "★"
                          : "☆"}
                      </button>
                    </span>

                    <input
                      type="text"
                      value={
                        entry.job_title
                      }
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
                    <span>
                      Opportunity Date
                    </span>

                    <input
                      type="date"
                      value={
                        entry.date
                      }
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
                    <span>
                      City, State
                    </span>

                    <input
                      type="text"
                      value={
                        entry.city_state
                      }
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

                  <label className="field">
                    <span>
                      Current Outcome
                    </span>

                    <select
                      value={
                        entry.outcome
                      }
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
                  </label>

                  <label className="field">
                    <span>
                      Job Posting / Company Link
                    </span>

                    <input
                      type="text"
                      value={
                        entry.website
                      }
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
                </div>

                <label className="summaryField">
                  <span>
                    Quick Job Summary
                  </span>

                  <textarea
                    value={
                      entry.job_description_summary
                    }
                    placeholder="Responsibilities, qualifications, schedule, pay, requirements, or anything important about this position."
                    onChange={(e) =>
                      updateEntry(
                        index,
                        "job_description_summary",
                        e.target.value
                      )
                    }
                  />
                </label>
              </section>
            ))}
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
              Start New Log
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
                  : "Submit Job Log"}
              </button>
            </div>
          </div>
        </section>

        <section className="savedPanel">
          <div className="savedHeader">
            <div>
              <p className="eyebrow">
                SAVED JOB LOGS
              </p>

              <h2>
                Previous Logs
              </h2>
            </div>

            <span>
              {previousLogs.length}
            </span>
          </div>

          {previousLogs.length === 0 ? (
            <div className="emptySaved">
              Saved drafts and submitted Job Logs will appear here.
            </div>
          ) : (
            <div className="savedList">
              {previousLogs.map((log) => {
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
                      <span>DATE</span>

                      <strong>
                        {formatDate(
                          log.week_ending
                        )}
                      </strong>
                    </div>

                    <div>
                      <span>
                        OPPORTUNITIES
                      </span>

                      <strong>
                        {logEntries.length}
                      </strong>
                    </div>

                    <div>
                      <span>
                        HIGH INTEREST
                      </span>

                      <strong>
                        {logStars}
                      </strong>
                    </div>

                    <strong
                      className={`savedStatus ${
                        log.status ===
                        "submitted"
                          ? "savedSubmitted"
                          : "savedDraft"
                      }`}
                    >
                      {log.status ===
                      "submitted"
                        ? "Submitted"
                        : "Draft"}
                    </strong>
                  </button>
                );
              })}
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

        .hero {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr)
            minmax(240px, 320px);
          gap: 34px;
          align-items: center;
          padding: 30px 38px;
          border-radius: 28px;
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
              46px,
              6vw,
              76px
            );
          line-height: 0.94;
          font-weight: 950;
          letter-spacing: -0.055em;
        }

        .heroProgress {
          padding: 17px;
          border-radius: 17px;
          background:
            rgba(255, 255, 255, 0.085);
          border:
            1px solid
            rgba(255, 255, 255, 0.13);
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
          font-size: 20px;
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
        }

        .heroProgress p {
          margin: 7px 0 0;
          color: #c6d4dc;
          font-size: 10px;
        }

        .workspace,
        .savedPanel {
          margin-top: 22px;
          padding: 30px;
          border-radius: 24px;
          background:
            rgba(255, 255, 255, 0.94);
          border:
            1px solid #ccd8e0;
          box-shadow:
            0 14px 36px
            rgba(23, 51, 68, 0.065);
        }

        .workspaceHeader {
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: flex-end;
        }

        .workspaceHeader h2,
        .savedHeader h2 {
          margin: 4px 0 0;
          font-size:
            clamp(
              28px,
              4vw,
              38px
            );
          line-height: 1;
          letter-spacing: -0.04em;
        }

        .workspaceHeader > div > p:last-child {
          margin: 8px 0 0;
          color: #6d7982;
          font-size: 12px;
        }

        .dateField {
          width: 220px;
          flex: 0 0 220px;
        }

        .dateField span,
        .field > span,
        .summaryField > span {
          display: block;
          margin-bottom: 7px;
          color: #314a59;
          font-size: 9px;
          font-weight: 900;
        }

        .dateField input,
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

        .interestLine {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 19px;
          padding: 12px 0 14px;
          border-top: 1px solid #d8e1e7;
          border-bottom: 1px solid #d8e1e7;
        }

        .interestLine span {
          color: #c89420;
          font-size: 17px;
        }

        .interestLine p {
          margin: 0;
          color: #707d86;
          font-size: 10px;
        }

        .opportunitySection {
          padding: 28px 0;
          border-bottom: 1px solid #d8e1e7;
        }

        .opportunitySection:last-child {
          border-bottom: none;
          padding-bottom: 10px;
        }

        .opportunityTitle {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 17px;
        }

        .opportunityTitle span {
          color: #176fa8;
          font-size: 8px;
          font-weight: 950;
          letter-spacing: 0.11em;
        }

        .opportunityTitle h3 {
          margin: 4px 0 0;
          font-size: 23px;
          line-height: 1.05;
          letter-spacing: -0.03em;
        }

        .highInterest {
          padding: 7px 9px;
          border-radius: 999px;
          background: #fff4d7;
          border: 1px solid #e7cc81;
          color: #7b5e18;
          font-size: 8px;
          white-space: nowrap;
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

        .field,
        .summaryField {
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
          line-height: 1;
          cursor: pointer;
        }

        .starSelected {
          color: #cc9821;
        }

        .summaryField {
          display: block;
          margin-top: 13px;
        }

        .summaryField textarea {
          min-height: 95px;
          resize: vertical;
          line-height: 1.55;
        }

        .message,
        .successMessage {
          margin-top: 18px;
          padding: 13px 15px;
          border-radius: 12px;
          font-size: 11px;
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
          margin-top: 22px;
          padding-top: 19px;
          border-top: 1px solid #d8e1e7;
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
        }

        .savedHeader {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 12px;
        }

        .savedHeader > span {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 50%;
          background: #edf5f9;
          color: #176fa8;
          font-weight: 950;
        }

        .savedList {
          border-top: 1px solid #d8e1e7;
        }

        .savedRow {
          width: 100%;
          display: grid;
          grid-template-columns:
            1fr
            0.6fr
            0.6fr
            auto;
          gap: 16px;
          align-items: center;
          padding: 14px 0;
          border: none;
          border-bottom: 1px solid #d8e1e7;
          background: transparent;
          color: #172832;
          text-align: left;
          cursor: pointer;
        }

        .savedRow div {
          display: grid;
          gap: 3px;
        }

        .savedRow span {
          color: #87939b;
          font-size: 7px;
          font-weight: 900;
          letter-spacing: 0.08em;
        }

        .savedRow strong {
          font-size: 10px;
        }

        .savedStatus {
          padding: 6px 9px;
          border-radius: 999px;
          white-space: nowrap;
          font-size: 8px !important;
        }

        .savedSubmitted {
          background: #e9f6ed;
          border: 1px solid #b8dcc5;
          color: #246d46 !important;
        }

        .savedDraft {
          background: #fff5d9;
          border: 1px solid #efd690;
          color: #765b13 !important;
        }

        .emptySaved {
          padding: 18px 0 3px;
          color: #7e8a92;
          font-size: 10px;
        }

        @media (max-width: 800px) {
          .hero {
            grid-template-columns: 1fr;
          }

          .workspaceHeader {
            flex-direction: column;
            align-items: stretch;
          }

          .dateField {
            width: 100%;
            flex: auto;
          }

          .fieldGrid {
            grid-template-columns: 1fr;
          }

          .savedRow {
            grid-template-columns:
              1fr
              auto;
          }

          .savedRow div:nth-child(2),
          .savedRow div:nth-child(3) {
            display: none;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 15px 12px 38px;
          }

          .hero {
            padding: 26px 22px;
          }

          h1 {
            font-size:
              clamp(
                42px,
                15vw,
                62px
              );
          }

          .workspace,
          .savedPanel {
            padding: 21px;
          }

          .opportunityTitle,
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
