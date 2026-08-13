"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type JobEntry = {
  date?: string;
  company_name?: string;
  job_title?: string;
  city_state?: string;
  website?: string;
  job_description_summary?: string;
  outcome?: string;
  company_starred?: boolean;
  job_title_starred?: boolean;
};

type WeeklyJobLog = {
  id: string;
  user_id: string;

  participant_name: string | null;
  participant_email: string | null;
  referral_code: string | null;

  week_ending: string;

  entries: JobEntry[] | null;

  total_entries?: number | null;
  starred_entries?: number | null;

  status: string;

  submitted_at: string | null;
  created_at: string;
  updated_at: string;
};

type CareerDevelopmentLog = {
  id: string;
  user_id: string;

  participant_name?: string | null;
  participant_email?: string | null;
  referral_code?: string | null;

  week_ending?: string | null;

  activity_type?: string | null;
  activity?: string | null;
  activity_title?: string | null;

  what_completed?: string | null;
  completed?: string | null;

  what_learned?: string | null;
  learned?: string | null;

  accomplishment?: string | null;
  accomplishments?: string | null;

  next_step?: string | null;
  next_steps?: string | null;

  notes?: string | null;

  status?: string | null;

  submitted_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  [key: string]: any;
};

type TabType =
  | "job-logs"
  | "career-development";

/* =========================================================
   HELPERS
========================================================= */

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(
    value.includes("T")
      ? value
      : `${value}T00:00:00`
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function hasJobEntry(entry?: JobEntry) {
  if (!entry) return false;

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

function getCareerActivity(
  log: CareerDevelopmentLog
) {
  return (
    log.activity_type ||
    log.activity_title ||
    log.activity ||
    "Career Development Activity"
  );
}

function getCareerCompleted(
  log: CareerDevelopmentLog
) {
  return (
    log.what_completed ||
    log.completed ||
    ""
  );
}

function getCareerLearned(
  log: CareerDevelopmentLog
) {
  return (
    log.what_learned ||
    log.learned ||
    log.accomplishment ||
    log.accomplishments ||
    ""
  );
}

function getCareerNextStep(
  log: CareerDevelopmentLog
) {
  return (
    log.next_step ||
    log.next_steps ||
    ""
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function PartnerWeeklyLogsPage() {
  const router = useRouter();

  /* =======================================================
     PAGE STATE
  ======================================================= */

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<TabType>("job-logs");

  const [jobLogs, setJobLogs] =
    useState<WeeklyJobLog[]>([]);

  const [
    careerLogs,
    setCareerLogs,
  ] = useState<CareerDevelopmentLog[]>(
    []
  );

  /* =======================================================
     FILTERS
  ======================================================= */

  const [search, setSearch] =
    useState("");

  const [
    referralFilter,
    setReferralFilter,
  ] = useState("all");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("submitted");

  const [weekFilter, setWeekFilter] =
    useState("");

  /* =======================================================
     EXPANDED RECORD
  ======================================================= */

  const [
    expandedJobId,
    setExpandedJobId,
  ] = useState<string | null>(null);

  const [
    expandedCareerId,
    setExpandedCareerId,
  ] = useState<string | null>(null);

  /* =======================================================
     LOAD PAGE
  ======================================================= */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);
    setError("");

    /* -----------------------------------------------------
       AUTH
    ----------------------------------------------------- */

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (
      authError ||
      !authData.user
    ) {
      router.push("/sign-in");
      return;
    }

    /* -----------------------------------------------------
       JOB LOGS
    ----------------------------------------------------- */

    const {
      data: jobData,
      error: jobError,
    } = await supabase
      .from("weekly_job_logs")
      .select("*")
      .order("week_ending", {
        ascending: false,
      })
      .order("created_at", {
        ascending: false,
      });

    if (jobError) {
      console.error(
        "Weekly job logs error:",
        jobError
      );
    } else {
      setJobLogs(
        (jobData as WeeklyJobLog[]) ||
          []
      );
    }

    /* -----------------------------------------------------
       CAREER DEVELOPMENT LOGS
    ----------------------------------------------------- */

    const {
      data: careerData,
      error: careerError,
    } = await supabase
      .from(
        "career_development_logs"
      )
      .select("*")
      .order("created_at", {
        ascending: false,
      });

    if (careerError) {
      console.error(
        "Career development logs error:",
        careerError
      );
    } else {
      setCareerLogs(
        (careerData as CareerDevelopmentLog[]) ||
          []
      );
    }

    /* -----------------------------------------------------
       DISPLAY ERROR
    ----------------------------------------------------- */

    if (
      jobError &&
      careerError
    ) {
      setError(
        `Could not load participant logs. Job Logs: ${jobError.message}. Career Development Logs: ${careerError.message}`
      );
    } else if (jobError) {
      setError(
        `Career Development Logs loaded, but Weekly Job Logs could not be loaded: ${jobError.message}`
      );
    } else if (careerError) {
      setError(
        `Weekly Job Logs loaded, but Career Development Logs could not be loaded: ${careerError.message}`
      );
    }

    setLoading(false);
  }

  /* =======================================================
     REFERRAL CODES
  ======================================================= */

  const referralCodes =
    useMemo(() => {
      const codes = [
        ...jobLogs.map(
          (log) => log.referral_code
        ),

        ...careerLogs.map(
          (log) => log.referral_code
        ),
      ]
        .filter(
          (
            code
          ): code is string =>
            Boolean(code)
        )
        .map((code) =>
          code.trim()
        );

      return Array.from(
        new Set(codes)
      ).sort();
    }, [jobLogs, careerLogs]);

  /* =======================================================
     JOB LOG FILTER
  ======================================================= */

  const filteredJobLogs =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return jobLogs.filter(
        (log) => {
          if (
            statusFilter !== "all" &&
            log.status !==
              statusFilter
          ) {
            return false;
          }

          if (
            referralFilter !==
              "all" &&
            log.referral_code !==
              referralFilter
          ) {
            return false;
          }

          if (
            weekFilter &&
            log.week_ending !==
              weekFilter
          ) {
            return false;
          }

          if (query) {
            const entries =
              Array.isArray(
                log.entries
              )
                ? log.entries
                : [];

            const searchable = [
              log.participant_name,
              log.participant_email,
              log.referral_code,
              log.week_ending,

              ...entries.flatMap(
                (entry) => [
                  entry.company_name,
                  entry.job_title,
                  entry.city_state,
                  entry.outcome,
                ]
              ),
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchable.includes(
                query
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      jobLogs,
      search,
      referralFilter,
      statusFilter,
      weekFilter,
    ]);

  /* =======================================================
     CAREER LOG FILTER
  ======================================================= */

  const filteredCareerLogs =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      return careerLogs.filter(
        (log) => {
          const status =
            log.status ||
            "submitted";

          if (
            statusFilter !== "all" &&
            status !== statusFilter
          ) {
            return false;
          }

          if (
            referralFilter !==
              "all" &&
            log.referral_code !==
              referralFilter
          ) {
            return false;
          }

          if (
            weekFilter &&
            log.week_ending !==
              weekFilter
          ) {
            return false;
          }

          if (query) {
            const searchable = [
              log.participant_name,
              log.participant_email,
              log.referral_code,
              log.week_ending,

              getCareerActivity(log),
              getCareerCompleted(log),
              getCareerLearned(log),
              getCareerNextStep(log),

              log.notes,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

            if (
              !searchable.includes(
                query
              )
            ) {
              return false;
            }
          }

          return true;
        }
      );
    }, [
      careerLogs,
      search,
      referralFilter,
      statusFilter,
      weekFilter,
    ]);

  /* =======================================================
     REPORTING
  ======================================================= */

  const submittedJobLogs =
    jobLogs.filter(
      (log) =>
        log.status ===
        "submitted"
    );

  const submittedCareerLogs =
    careerLogs.filter(
      (log) =>
        !log.status ||
        log.status ===
          "submitted"
    );

  const totalSubmissions =
    submittedJobLogs.length +
    submittedCareerLogs.length;

  const participantIds =
    new Set([
      ...submittedJobLogs.map(
        (log) => log.user_id
      ),

      ...submittedCareerLogs.map(
        (log) => log.user_id
      ),
    ]);

  const totalParticipants =
    participantIds.size;

  const totalJobEntries =
    submittedJobLogs.reduce(
      (total, log) => {
        const entries =
          Array.isArray(
            log.entries
          )
            ? log.entries.filter(
                hasJobEntry
              )
            : [];

        return (
          total +
          entries.length
        );
      },
      0
    );

  const highInterestJobs =
    submittedJobLogs.reduce(
      (total, log) => {
        const entries =
          Array.isArray(
            log.entries
          )
            ? log.entries
            : [];

        return (
          total +
          entries.filter(
            (entry) =>
              entry.company_starred ||
              entry.job_title_starred
          ).length
        );
      },
      0
    );

  /* =======================================================
     CURRENT VIEW COUNT
  ======================================================= */

  const currentResults =
    activeTab === "job-logs"
      ? filteredJobLogs.length
      : filteredCareerLogs.length;

  /* =======================================================
     RESET FILTERS
  ======================================================= */

  function resetFilters() {
    setSearch("");
    setReferralFilter("all");
    setStatusFilter("submitted");
    setWeekFilter("");
  }

  /* =======================================================
     CHANGE TAB
  ======================================================= */

  function changeTab(
    tab: TabType
  ) {
    setActiveTab(tab);

    setExpandedJobId(null);
    setExpandedCareerId(null);

    setSearch("");
    setWeekFilter("");
    setStatusFilter("submitted");
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingLogo">
          HM
        </div>

        <strong>
          Loading Participant Logs
        </strong>

        <span>
          Retrieving weekly
          submissions...
        </span>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;

            display: flex;
            flex-direction: column;

            align-items: center;
            justify-content: center;

            gap: 10px;

            background: #060914;

            color: white;

            font-family:
              Inter,
              system-ui,
              sans-serif;
          }

          .loadingLogo {
            width: 60px;
            height: 60px;

            display: flex;
            align-items: center;
            justify-content: center;

            margin-bottom: 7px;

            border-radius: 18px;

            background:
              rgba(
                23,
                232,
                255,
                0.08
              );

            border:
              1px solid
              rgba(
                23,
                232,
                255,
                0.2
              );

            color: #17e8ff;

            font-weight: 950;
          }

          .loadingPage span {
            color: #778393;

            font-size: 11px;
          }
        `}</style>
      </main>
    );
  }

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main className="page">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <div className="shell">
        {/* =================================================
            TOP NAV
        ================================================= */}

        <header className="topBar">
          <div className="brandArea">
            <div className="brandLogo">
              HM
            </div>

            <div>
              <strong>
                HireMinds™
              </strong>

              <span>
                Partner Dashboard
              </span>
            </div>
          </div>

          <button
            type="button"
            className="backButton"
            onClick={() =>
              router.push(
                "/partner-dashboard"
              )
            }
          >
            ← Partner Dashboard
          </button>
        </header>

        {/* =================================================
            HERO
        ================================================= */}

        <section className="hero">
          <div className="heroCopy">
            <p className="eyebrow">
              PARTICIPANT ACTIVITY
            </p>

            <h1>
              Weekly Logs
            </h1>

            <p>
              Review participant
              Weekly Job Logs and
              Career Development Logs
              in one place.
            </p>
          </div>

          <button
            type="button"
            className="refreshButton"
            onClick={loadPage}
          >
            ↻ Refresh
          </button>
        </section>

        {/* =================================================
            METRICS
        ================================================= */}

        <section className="metrics">
          <div className="metric">
            <span>
              TOTAL SUBMISSIONS
            </span>

            <strong>
              {totalSubmissions}
            </strong>

            <small>
              Submitted weekly logs
            </small>
          </div>

          <div className="metric">
            <span>
              JOB LOGS
            </span>

            <strong>
              {
                submittedJobLogs.length
              }
            </strong>

            <small>
              Job-search logs
            </small>
          </div>

          <div className="metric">
            <span>
              CAREER DEVELOPMENT
            </span>

            <strong>
              {
                submittedCareerLogs.length
              }
            </strong>

            <small>
              Development logs
            </small>
          </div>

          <div className="metric">
            <span>
              PARTICIPANTS
            </span>

            <strong>
              {totalParticipants}
            </strong>

            <small>
              Unique participants
            </small>
          </div>

          <div className="metric">
            <span>
              JOB OPPORTUNITIES
            </span>

            <strong>
              {totalJobEntries}
            </strong>

            <small>
              Logged opportunities
            </small>
          </div>

          <div className="metric interestMetric">
            <span>
              ★ HIGH INTEREST
            </span>

            <strong>
              {highInterestJobs}
            </strong>

            <small>
              Priority opportunities
            </small>
          </div>
        </section>

        {/* =================================================
            LOG NAVIGATION
        ================================================= */}

        <section className="workspace">
          <div className="workspaceHeader">
            <div>
              <p className="eyebrow">
                WEEKLY PARTICIPANT
                SUBMISSIONS
              </p>

              <h2>
                Participant Logs
              </h2>

              <p>
                Choose which type of
                weekly activity you want
                to review.
              </p>
            </div>
          </div>

          <div className="tabs">
            <button
              type="button"
              className={
                activeTab ===
                "job-logs"
                  ? "tab activeJobTab"
                  : "tab"
              }
              onClick={() =>
                changeTab(
                  "job-logs"
                )
              }
            >
              <div className="tabIcon">
                ↗
              </div>

              <div>
                <span>
                  WEEKLY JOB SEARCH
                </span>

                <strong>
                  Job Logs
                </strong>

                <small>
                  {
                    submittedJobLogs.length
                  }{" "}
                  submitted
                </small>
              </div>
            </button>

            <button
              type="button"
              className={
                activeTab ===
                "career-development"
                  ? "tab activeCareerTab"
                  : "tab"
              }
              onClick={() =>
                changeTab(
                  "career-development"
                )
              }
            >
              <div className="tabIcon careerIcon">
                ✦
              </div>

              <div>
                <span>
                  WEEKLY DEVELOPMENT
                </span>

                <strong>
                  Career Development
                  Logs
                </strong>

                <small>
                  {
                    submittedCareerLogs.length
                  }{" "}
                  submitted
                </small>
              </div>
            </button>
          </div>

          {/* ===============================================
              FILTERS
          =============================================== */}

          <div className="filterArea">
            <div className="filterHeading">
              <div>
                <span>
                  {activeTab ===
                  "job-logs"
                    ? "JOB LOG SUBMISSIONS"
                    : "CAREER DEVELOPMENT SUBMISSIONS"}
                </span>

                <strong>
                  {currentResults}{" "}
                  {currentResults === 1
                    ? "Result"
                    : "Results"}
                </strong>
              </div>

              <button
                type="button"
                onClick={
                  resetFilters
                }
                className="resetButton"
              >
                Reset Filters
              </button>
            </div>

            <div className="filters">
              <div className="field searchField">
                <label>
                  Search Participant
                </label>

                <input
                  type="text"
                  value={search}
                  placeholder={
                    activeTab ===
                    "job-logs"
                      ? "Name, email, company, job title..."
                      : "Name, email, activity..."
                  }
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                />
              </div>

              <div className="field">
                <label>
                  Referral Code
                </label>

                <select
                  value={
                    referralFilter
                  }
                  onChange={(e) =>
                    setReferralFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="all">
                    All Cohorts
                  </option>

                  {referralCodes.map(
                    (code) => (
                      <option
                        key={code}
                        value={code}
                      >
                        {code}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="field">
                <label>
                  Status
                </label>

                <select
                  value={
                    statusFilter
                  }
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }
                >
                  <option value="submitted">
                    Submitted
                  </option>

                  <option value="draft">
                    Draft
                  </option>

                  <option value="all">
                    All
                  </option>
                </select>
              </div>

              <div className="field">
                <label>
                  Week Ending
                </label>

                <input
                  type="date"
                  value={weekFilter}
                  onChange={(e) =>
                    setWeekFilter(
                      e.target.value
                    )
                  }
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================================
            ERROR
        ================================================= */}

        {error ? (
          <div className="errorNotice">
            <strong>
              Data Notice
            </strong>

            <span>
              {error}
            </span>
          </div>
        ) : null}

        {/* =================================================
            JOB LOGS
        ================================================= */}

        {activeTab ===
        "job-logs" ? (
          <section className="records">
            {filteredJobLogs.length ===
            0 ? (
              <EmptyState
                title="No Job Logs Found"
                description="No Weekly Job Logs match the current filters."
              />
            ) : (
              filteredJobLogs.map(
                (log) => {
                  const entries =
                    Array.isArray(
                      log.entries
                    )
                      ? log.entries.filter(
                          hasJobEntry
                        )
                      : [];

                  const starred =
                    entries.filter(
                      (entry) =>
                        entry.company_starred ||
                        entry.job_title_starred
                    ).length;

                  const expanded =
                    expandedJobId ===
                    log.id;

                  return (
                    <article
                      className="recordCard"
                      key={log.id}
                    >
                      <div className="recordHeader">
                        <div className="identity">
                          <div className="avatar">
                            {(
                              log.participant_name ||
                              log.participant_email ||
                              "P"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="nameLine">
                              <h3>
                                {log.participant_name ||
                                  "Participant"}
                              </h3>

                              <StatusBadge
                                status={
                                  log.status
                                }
                              />
                            </div>

                            <p>
                              {log.participant_email ||
                                "No email available"}
                            </p>

                            {log.referral_code ? (
                              <span className="referralBadge">
                                {
                                  log.referral_code
                                }
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="recordDate">
                          <span>
                            WEEK ENDING
                          </span>

                          <strong>
                            {formatDate(
                              log.week_ending
                            )}
                          </strong>

                          <small>
                            {log.submitted_at
                              ? `Submitted ${formatDateTime(
                                  log.submitted_at
                                )}`
                              : `Updated ${formatDateTime(
                                  log.updated_at
                                )}`}
                          </small>
                        </div>
                      </div>

                      <div className="recordStats">
                        <div>
                          <span>
                            JOB ENTRIES
                          </span>

                          <strong>
                            {
                              entries.length
                            }
                            /5
                          </strong>
                        </div>

                        <div>
                          <span>
                            HIGH INTEREST
                          </span>

                          <strong>
                            {starred}
                          </strong>
                        </div>

                        <div>
                          <span>
                            LOG TYPE
                          </span>

                          <strong>
                            Job Search
                          </strong>
                        </div>
                      </div>

                      <div className="recordAction">
                        <button
                          type="button"
                          className="viewButton"
                          onClick={() =>
                            setExpandedJobId(
                              expanded
                                ? null
                                : log.id
                            )
                          }
                        >
                          {expanded
                            ? "Hide Full Job Log ↑"
                            : "View Complete Job Log →"}
                        </button>
                      </div>

                      {expanded ? (
                        <div className="expanded">
                          <div className="expandedTitle">
                            <div>
                              <p className="eyebrow">
                                WEEKLY JOB
                                ACTIVITY
                              </p>

                              <h3>
                                Job Opportunities
                              </h3>
                            </div>

                            <span>
                              {
                                entries.length
                              }{" "}
                              of 5 completed
                            </span>
                          </div>

                          {entries.length ===
                          0 ? (
                            <div className="emptyInner">
                              No job entries
                              were completed.
                            </div>
                          ) : (
                            <div className="jobEntryList">
                              {entries.map(
                                (
                                  entry,
                                  index
                                ) => {
                                  const highInterest =
                                    entry.company_starred ||
                                    entry.job_title_starred;

                                  return (
                                    <div
                                      className={
                                        highInterest
                                          ? "jobEntry highInterestEntry"
                                          : "jobEntry"
                                      }
                                      key={
                                        index
                                      }
                                    >
                                      <div className="entryTop">
                                        <div className="entryNumber">
                                          {index +
                                            1}
                                        </div>

                                        <div>
                                          <span>
                                            JOB
                                            ENTRY
                                          </span>

                                          <h4>
                                            {entry.job_title ||
                                              "Job Opportunity"}
                                          </h4>
                                        </div>

                                        {highInterest ? (
                                          <div className="interestBadge">
                                            ★ HIGH
                                            INTEREST
                                          </div>
                                        ) : null}
                                      </div>

                                      <div className="entryGrid">
                                        <InfoField
                                          label="Company"
                                          value={`${
                                            entry.company_starred
                                              ? "★ "
                                              : ""
                                          }${
                                            entry.company_name ||
                                            "—"
                                          }`}
                                        />

                                        <InfoField
                                          label="Job Title"
                                          value={`${
                                            entry.job_title_starred
                                              ? "★ "
                                              : ""
                                          }${
                                            entry.job_title ||
                                            "—"
                                          }`}
                                        />

                                        <InfoField
                                          label="Date"
                                          value={formatDate(
                                            entry.date
                                          )}
                                        />

                                        <InfoField
                                          label="City, State"
                                          value={
                                            entry.city_state ||
                                            "—"
                                          }
                                        />
                                      </div>

                                      <div className="wideInfo">
                                        <span>
                                          WEBSITE
                                        </span>

                                        {entry.website ? (
                                          <a
                                            href={
                                              entry.website.startsWith(
                                                "http"
                                              )
                                                ? entry.website
                                                : `https://${entry.website}`
                                            }
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            {
                                              entry.website
                                            }{" "}
                                            ↗
                                          </a>
                                        ) : (
                                          <strong>
                                            —
                                          </strong>
                                        )}
                                      </div>

                                      <div className="wideInfo">
                                        <span>
                                          SUMMARY OF
                                          JOB
                                          DESCRIPTION
                                        </span>

                                        <p>
                                          {entry.job_description_summary ||
                                            "No description summary provided."}
                                        </p>
                                      </div>

                                      <div className="outcome">
                                        <span>
                                          OUTCOME
                                        </span>

                                        <strong>
                                          {entry.outcome ||
                                            "No outcome recorded"}
                                        </strong>
                                      </div>
                                    </div>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </article>
                  );
                }
              )
            )}
          </section>
        ) : null}

        {/* =================================================
            CAREER DEVELOPMENT LOGS
        ================================================= */}

        {activeTab ===
        "career-development" ? (
          <section className="records">
            {filteredCareerLogs.length ===
            0 ? (
              <EmptyState
                title="No Career Development Logs Found"
                description="No Career Development Logs match the current filters."
              />
            ) : (
              filteredCareerLogs.map(
                (log) => {
                  const expanded =
                    expandedCareerId ===
                    log.id;

                  const status =
                    log.status ||
                    "submitted";

                  const activity =
                    getCareerActivity(
                      log
                    );

                  const completed =
                    getCareerCompleted(
                      log
                    );

                  const learned =
                    getCareerLearned(
                      log
                    );

                  const nextStep =
                    getCareerNextStep(
                      log
                    );

                  return (
                    <article
                      className="recordCard careerCard"
                      key={log.id}
                    >
                      <div className="recordHeader">
                        <div className="identity">
                          <div className="avatar careerAvatar">
                            {(
                              log.participant_name ||
                              log.participant_email ||
                              "P"
                            )
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div>
                            <div className="nameLine">
                              <h3>
                                {log.participant_name ||
                                  "Participant"}
                              </h3>

                              <StatusBadge
                                status={
                                  status
                                }
                              />
                            </div>

                            <p>
                              {log.participant_email ||
                                "No email available"}
                            </p>

                            {log.referral_code ? (
                              <span className="referralBadge">
                                {
                                  log.referral_code
                                }
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="recordDate">
                          <span>
                            WEEK ENDING
                          </span>

                          <strong>
                            {formatDate(
                              log.week_ending
                            )}
                          </strong>

                          <small>
                            {log.submitted_at
                              ? `Submitted ${formatDateTime(
                                  log.submitted_at
                                )}`
                              : `Updated ${formatDateTime(
                                  log.updated_at ||
                                    log.created_at
                                )}`}
                          </small>
                        </div>
                      </div>

                      <div className="careerSummary">
                        <span>
                          CAREER DEVELOPMENT
                          ACTIVITY
                        </span>

                        <strong>
                          {activity}
                        </strong>
                      </div>

                      <div className="recordStats careerStats">
                        <div>
                          <span>
                            LOG TYPE
                          </span>

                          <strong>
                            Career
                            Development
                          </strong>
                        </div>

                        <div>
                          <span>
                            WEEK
                          </span>

                          <strong>
                            {formatDate(
                              log.week_ending
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>
                            STATUS
                          </span>

                          <strong>
                            {status ===
                            "submitted"
                              ? "Complete"
                              : "In Progress"}
                          </strong>
                        </div>
                      </div>

                      <div className="recordAction">
                        <button
                          type="button"
                          className="viewButton careerViewButton"
                          onClick={() =>
                            setExpandedCareerId(
                              expanded
                                ? null
                                : log.id
                            )
                          }
                        >
                          {expanded
                            ? "Hide Full Career Development Log ↑"
                            : "View Complete Career Development Log →"}
                        </button>
                      </div>

                      {expanded ? (
                        <div className="expanded careerExpanded">
                          <div className="expandedTitle">
                            <div>
                              <p className="eyebrow">
                                WEEKLY CAREER
                                DEVELOPMENT
                              </p>

                              <h3>
                                {
                                  activity
                                }
                              </h3>
                            </div>
                          </div>

                          <div className="careerResponses">
                            <div className="responseBox">
                              <span>
                                WHAT DID YOU
                                COMPLETE?
                              </span>

                              <p>
                                {completed ||
                                  "No response provided."}
                              </p>
                            </div>

                            <div className="responseBox">
                              <span>
                                WHAT DID YOU
                                LEARN OR
                                ACCOMPLISH?
                              </span>

                              <p>
                                {learned ||
                                  "No response provided."}
                              </p>
                            </div>

                            <div className="responseBox nextStepBox">
                              <span>
                                NEXT STEP
                              </span>

                              <p>
                                {nextStep ||
                                  "No next step provided."}
                              </p>
                            </div>

                            {log.notes ? (
                              <div className="responseBox">
                                <span>
                                  ADDITIONAL
                                  NOTES
                                </span>

                                <p>
                                  {
                                    log.notes
                                  }
                                </p>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                }
              )
            )}
          </section>
        ) : null}

        {/* =================================================
            FOOTER
        ================================================= */}

        <footer>
          <div>
            <strong>
              HireMinds™
            </strong>

            <span>
              Partner Reporting
            </span>
          </div>

          <p>
            Prepare with Confidence.
            Build with Purpose.
          </p>
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
              circle at top left,
              rgba(
                14,
                196,
                220,
                0.075
              ),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(
                120,
                98,
                255,
                0.055
              ),
              transparent 28%
            ),
            #070b14;

          color: white;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .ambient {
          position: fixed;

          border-radius: 50%;

          filter: blur(120px);

          pointer-events: none;
        }

        .ambientOne {
          width: 400px;
          height: 400px;

          top: -220px;
          right: -120px;

          background:
            rgba(
              23,
              232,
              255,
              0.05
            );
        }

        .ambientTwo {
          width: 450px;
          height: 450px;

          bottom: -260px;
          left: -160px;

          background:
            rgba(
              116,
              92,
              255,
              0.035
            );
        }

        .shell {
          position: relative;

          z-index: 2;

          max-width: 1420px;

          margin: 0 auto;
        }

        /* ===============================================
           TOP BAR
        =============================================== */

        .topBar {
          display: flex;

          justify-content: space-between;
          align-items: center;

          gap: 20px;

          margin-bottom: 25px;
        }

        .brandArea {
          display: flex;

          align-items: center;

          gap: 10px;
        }

        .brandLogo {
          width: 37px;
          height: 37px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 11px;

          background:
            rgba(
              23,
              232,
              255,
              0.07
            );

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.19
            );

          color: #17e8ff;

          font-size: 10px;

          font-weight: 950;
        }

        .brandArea > div:last-child {
          display: grid;

          gap: 2px;
        }

        .brandArea strong {
          font-size: 11px;
        }

        .brandArea span {
          color: #657383;

          font-size: 8px;
        }

        button {
          font-family: inherit;
        }

        .backButton {
          padding: 10px 15px;

          border-radius: 999px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.1
            );

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          color: white;

          cursor: pointer;

          font-size: 9px;

          font-weight: 850;
        }

        /* ===============================================
           HERO
        =============================================== */

        .hero {
          padding: 31px;

          display: flex;

          justify-content: space-between;
          align-items: center;

          gap: 25px;

          border-radius: 26px;

          background:
            linear-gradient(
              135deg,
              rgba(
                15,
                194,
                215,
                0.065
              ),
              rgba(
                255,
                255,
                255,
                0.02
              )
            );

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.13
            );
        }

        .eyebrow {
          margin: 0 0 7px;

          color: #17e8ff;

          font-size: 8px;

          font-weight: 950;

          letter-spacing: 0.14em;
        }

        .hero h1 {
          margin: 0;

          font-size:
            clamp(
              2.4rem,
              5vw,
              4.6rem
            );

          line-height: 0.98;

          letter-spacing: -0.045em;
        }

        .hero p:not(.eyebrow) {
          max-width: 650px;

          margin: 14px 0 0;

          color:
            rgba(
              255,
              255,
              255,
              0.59
            );

          font-size: 12px;

          line-height: 1.65;
        }

        .refreshButton {
          flex-shrink: 0;

          padding: 12px 18px;

          border-radius: 999px;

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.18
            );

          background:
            rgba(
              23,
              232,
              255,
              0.055
            );

          color: #bdf8ff;

          cursor: pointer;

          font-size: 9px;

          font-weight: 900;
        }

        /* ===============================================
           METRICS
        =============================================== */

        .metrics {
          display: grid;

          grid-template-columns:
            repeat(
              6,
              minmax(0, 1fr)
            );

          gap: 9px;

          margin-top: 15px;
        }

        .metric {
          min-height: 115px;

          padding: 15px;

          display: flex;
          flex-direction: column;

          justify-content: space-between;

          border-radius: 16px;

          background:
            rgba(
              255,
              255,
              255,
              0.028
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .metric span {
          color: #758293;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: 0.08em;
        }

        .metric strong {
          margin: 5px 0;

          font-size: 28px;
        }

        .metric small {
          color: #667383;

          font-size: 8px;
        }

        .interestMetric {
          border-color:
            rgba(
              245,
              201,
              77,
              0.14
            );
        }

        .interestMetric span,
        .interestMetric strong {
          color: #f5c94d;
        }

        /* ===============================================
           WORKSPACE
        =============================================== */

        .workspace {
          margin-top: 16px;

          padding: 25px;

          border-radius: 23px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );
        }

        .workspaceHeader h2 {
          margin: 0;

          font-size: 23px;
        }

        .workspaceHeader p:not(.eyebrow) {
          margin: 6px 0 0;

          color: #738090;

          font-size: 10px;
        }

        /* ===============================================
           TABS
        =============================================== */

        .tabs {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 11px;

          margin-top: 20px;
        }

        .tab {
          padding: 18px;

          display: flex;

          align-items: center;

          gap: 13px;

          text-align: left;

          border-radius: 17px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );

          background:
            rgba(
              4,
              8,
              15,
              0.42
            );

          color: white;

          cursor: pointer;

          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .tabIcon {
          width: 42px;
          height: 42px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 12px;

          background:
            rgba(
              23,
              232,
              255,
              0.07
            );

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.16
            );

          color: #17e8ff;

          font-weight: 950;
        }

        .careerIcon {
          background:
            rgba(
              126,
              106,
              255,
              0.075
            );

          border-color:
            rgba(
              126,
              106,
              255,
              0.18
            );

          color: #b6aaff;
        }

        .tab > div:last-child {
          display: grid;

          gap: 3px;
        }

        .tab span {
          color: #687586;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: 0.09em;
        }

        .tab strong {
          font-size: 14px;
        }

        .tab small {
          color: #647181;

          font-size: 8px;
        }

        .activeJobTab {
          border-color:
            rgba(
              23,
              232,
              255,
              0.25
            );

          background:
            rgba(
              23,
              232,
              255,
              0.045
            );
        }

        .activeCareerTab {
          border-color:
            rgba(
              126,
              106,
              255,
              0.26
            );

          background:
            rgba(
              126,
              106,
              255,
              0.045
            );
        }

        /* ===============================================
           FILTERS
        =============================================== */

        .filterArea {
          margin-top: 22px;

          padding-top: 20px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.065
            );
        }

        .filterHeading {
          display: flex;

          justify-content: space-between;
          align-items: center;

          gap: 15px;
        }

        .filterHeading > div {
          display: grid;

          gap: 3px;
        }

        .filterHeading span {
          color: #6f7c8c;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: 0.09em;
        }

        .filterHeading strong {
          font-size: 12px;
        }

        .resetButton {
          padding: 7px 10px;

          border-radius: 999px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.08
            );

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          color: #a4afbc;

          cursor: pointer;

          font-size: 8px;

          font-weight: 800;
        }

        .filters {
          display: grid;

          grid-template-columns:
            1.5fr 0.8fr 0.7fr 0.8fr;

          gap: 10px;

          margin-top: 14px;
        }

        .field {
          display: grid;

          gap: 6px;
        }

        .field label {
          color: #9ba6b4;

          font-size: 8px;

          font-weight: 800;
        }

        input,
        select {
          width: 100%;

          padding: 11px 12px;

          border-radius: 10px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.09
            );

          background: #080d16;

          color: white;

          outline: none;

          font-family: inherit;
        }

        select option {
          background: #080d16;
        }

        /* ===============================================
           ERROR
        =============================================== */

        .errorNotice {
          margin-top: 14px;

          padding: 13px;

          display: grid;

          gap: 4px;

          border-radius: 12px;

          background:
            rgba(
              239,
              68,
              68,
              0.06
            );

          border:
            1px solid
            rgba(
              239,
              68,
              68,
              0.17
            );

          color: #ffb0b0;

          font-size: 9px;
        }

        /* ===============================================
           RECORDS
        =============================================== */

        .records {
          display: grid;

          gap: 13px;

          margin-top: 17px;
        }

        .recordCard {
          overflow: hidden;

          border-radius: 20px;

          background:
            rgba(
              4,
              8,
              15,
              0.66
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.075
            );
        }

        .careerCard {
          border-color:
            rgba(
              126,
              106,
              255,
              0.12
            );
        }

        .recordHeader {
          padding: 20px;

          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 20px;
        }

        .identity {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .avatar {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 14px;

          background:
            rgba(
              23,
              232,
              255,
              0.065
            );

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.15
            );

          color: #17e8ff;

          font-weight: 950;
        }

        .careerAvatar {
          background:
            rgba(
              126,
              106,
              255,
              0.07
            );

          border-color:
            rgba(
              126,
              106,
              255,
              0.16
            );

          color: #b8adff;
        }

        .nameLine {
          display: flex;

          align-items: center;

          gap: 8px;

          flex-wrap: wrap;
        }

        .nameLine h3 {
          margin: 0;

          font-size: 17px;
        }

        .identity p {
          margin: 4px 0 6px;

          color: #758292;

          font-size: 9px;
        }

        .referralBadge {
          display: inline-block;

          padding: 4px 7px;

          border-radius: 999px;

          background:
            rgba(
              23,
              232,
              255,
              0.045
            );

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.1
            );

          color: #9eeef7;

          font-size: 7px;

          font-weight: 900;
        }

        .recordDate {
          display: grid;

          gap: 3px;

          text-align: right;
        }

        .recordDate span {
          color: #697687;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .recordDate strong {
          font-size: 11px;
        }

        .recordDate small {
          color: #657181;

          font-size: 7px;
        }

        /* ===============================================
           RECORD STATS
        =============================================== */

        .recordStats {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0, 1fr)
            );

          gap: 8px;

          padding:
            0 20px 18px;
        }

        .recordStats div {
          padding: 11px;

          display: grid;

          gap: 4px;

          border-radius: 11px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );
        }

        .recordStats span {
          color: #667383;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .recordStats strong {
          font-size: 10px;
        }

        .careerSummary {
          margin:
            0 20px 13px;

          padding: 13px;

          display: grid;

          gap: 5px;

          border-radius: 12px;

          background:
            rgba(
              126,
              106,
              255,
              0.045
            );

          border:
            1px solid
            rgba(
              126,
              106,
              255,
              0.11
            );
        }

        .careerSummary span {
          color: #8f82e9;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: 0.08em;
        }

        .careerSummary strong {
          font-size: 12px;
        }

        /* ===============================================
           RECORD ACTION
        =============================================== */

        .recordAction {
          padding: 18px 20px 20px;

          display: flex;

          justify-content: flex-end;
          align-items: center;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.055
            );

          background:
            rgba(
              255,
              255,
              255,
              0.012
            );
        }

        .viewButton {
          min-width: 220px;

          padding: 13px 18px;

          border-radius: 999px;

          border:
            1px solid
            rgba(
              23,
              232,
              255,
              0.28
            );

          background:
            rgba(
              23,
              232,
              255,
              0.085
            );

          color: #d8fbff;

          cursor: pointer;

          font-size: 10px;

          font-weight: 950;

          transition:
            transform 0.2s ease,
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .viewButton:hover {
          transform: translateY(-1px);

          border-color:
            rgba(
              23,
              232,
              255,
              0.46
            );

          background:
            rgba(
              23,
              232,
              255,
              0.13
            );
        }

        .careerViewButton {
          min-width: 300px;

          border-color:
            rgba(
              126,
              106,
              255,
              0.32
            );

          background:
            rgba(
              126,
              106,
              255,
              0.1
            );

          color: #e2ddff;
        }

        .careerViewButton:hover {
          border-color:
            rgba(
              126,
              106,
              255,
              0.5
            );

          background:
            rgba(
              126,
              106,
              255,
              0.15
            );
        }

        /* ===============================================
           EXPANDED
        =============================================== */

        .expanded {
          padding: 20px;

          border-top:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );

          background:
            rgba(
              255,
              255,
              255,
              0.014
            );
        }

        .expandedTitle {
          display: flex;

          justify-content: space-between;
          align-items: flex-start;

          gap: 15px;

          margin-bottom: 15px;
        }

        .expandedTitle h3 {
          margin: 0;

          font-size: 19px;
        }

        .expandedTitle > span {
          color: #778493;

          font-size: 8px;
        }

        /* ===============================================
           JOB ENTRIES
        =============================================== */

        .jobEntryList {
          display: grid;

          gap: 11px;
        }

        .jobEntry {
          padding: 17px;

          border-radius: 15px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.065
            );
        }

        .highInterestEntry {
          border-color:
            rgba(
              245,
              201,
              77,
              0.17
            );

          background:
            rgba(
              245,
              201,
              77,
              0.025
            );
        }

        .entryTop {
          display: flex;

          align-items: center;

          gap: 10px;

          margin-bottom: 13px;
        }

        .entryNumber {
          width: 35px;
          height: 35px;

          display: flex;
          align-items: center;
          justify-content: center;

          flex-shrink: 0;

          border-radius: 10px;

          background:
            rgba(
              23,
              232,
              255,
              0.06
            );

          color: #17e8ff;

          font-size: 9px;

          font-weight: 950;
        }

        .entryTop > div:nth-child(2) {
          display: grid;

          gap: 2px;
        }

        .entryTop span {
          color: #687586;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 0.08em;
        }

        .entryTop h4 {
          margin: 0;

          font-size: 13px;
        }

        .interestBadge {
          margin-left: auto;

          padding: 5px 8px;

          border-radius: 999px;

          background:
            rgba(
              245,
              201,
              77,
              0.055
            );

          border:
            1px solid
            rgba(
              245,
              201,
              77,
              0.15
            );

          color: #f5c94d;

          font-size: 7px;

          font-weight: 950;
        }

        .entryGrid {
          display: grid;

          grid-template-columns:
            repeat(
              4,
              minmax(0, 1fr)
            );

          gap: 8px;
        }

        .wideInfo,
        .outcome {
          margin-top: 8px;

          padding: 11px;

          display: grid;

          gap: 5px;

          border-radius: 10px;

          background:
            rgba(
              0,
              0,
              0,
              0.14
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.05
            );
        }

        .wideInfo span,
        .outcome span {
          color: #667383;

          font-size: 7px;

          font-weight: 900;

          letter-spacing: 0.07em;
        }

        .wideInfo p {
          margin: 0;

          color: #bdc5cf;

          font-size: 9px;

          line-height: 1.55;
        }

        .wideInfo a {
          color: #72e9f5;

          font-size: 9px;

          overflow-wrap: anywhere;

          text-decoration: none;
        }

        .outcome {
          border-color:
            rgba(
              23,
              232,
              255,
              0.09
            );
        }

        .outcome strong {
          color: #c7f7fc;

          font-size: 10px;
        }

        .emptyInner {
          padding: 20px;

          border-radius: 12px;

          border:
            1px dashed
            rgba(
              255,
              255,
              255,
              0.1
            );

          color: #778392;

          text-align: center;

          font-size: 9px;
        }

        /* ===============================================
           CAREER DEVELOPMENT
        =============================================== */

        .careerExpanded {
          background:
            rgba(
              126,
              106,
              255,
              0.012
            );
        }

        .careerResponses {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );

          gap: 10px;
        }

        .responseBox {
          min-height: 130px;

          padding: 16px;

          border-radius: 14px;

          background:
            rgba(
              255,
              255,
              255,
              0.025
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.06
            );
        }

        .responseBox span {
          color: #9286e9;

          font-size: 7px;

          font-weight: 950;

          letter-spacing: 0.08em;
        }

        .responseBox p {
          margin: 10px 0 0;

          color: #c2c8d1;

          font-size: 10px;

          line-height: 1.65;

          white-space: pre-wrap;
        }

        .nextStepBox {
          border-color:
            rgba(
              23,
              232,
              255,
              0.1
            );
        }

        /* ===============================================
           FOOTER
        =============================================== */

        footer {
          padding:
            26px 4px 5px;

          display: flex;

          justify-content: space-between;

          align-items: flex-end;

          gap: 20px;

          color: #596675;

          font-size: 8px;
        }

        footer > div {
          display: grid;

          gap: 2px;
        }

        footer strong {
          color: #788595;
        }

        footer p {
          margin: 0;
        }

        /* ===============================================
           MOBILE
        =============================================== */

        @media (
          max-width: 1050px
        ) {
          .metrics {
            grid-template-columns:
              repeat(
                3,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .filters {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .entryGrid {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }
        }

        @media (
          max-width: 700px
        ) {
          .page {
            padding: 14px;
          }

          .hero {
            padding: 23px;

            flex-direction: column;

            align-items: stretch;
          }

          .refreshButton {
            align-self: flex-start;
          }

          .metrics {
            grid-template-columns:
              repeat(
                2,
                minmax(
                  0,
                  1fr
                )
              );
          }

          .workspace {
            padding: 18px;
          }

          .tabs,
          .filters,
          .entryGrid,
          .careerResponses {
            grid-template-columns:
              1fr;
          }

          .recordHeader {
            flex-direction: column;
          }

          .recordDate {
            text-align: left;
          }

          .recordStats {
            grid-template-columns:
              1fr;
          }

          .expandedTitle {
            flex-direction: column;
          }

          .interestBadge {
            margin-left: 0;
          }

          .entryTop {
            flex-wrap: wrap;
          }

          footer {
            flex-direction: column;

            align-items: flex-start;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   STATUS BADGE
========================================================= */

function StatusBadge({
  status,
}: {
  status?: string | null;
}) {
  const submitted =
    !status ||
    status === "submitted";

  return (
    <>
      <span
        className={
          submitted
            ? "statusBadge submittedBadge"
            : "statusBadge draftBadge"
        }
      >
        {submitted
          ? "✓ SUBMITTED"
          : "DRAFT"}
      </span>

      <style jsx>{`
        .statusBadge {
          display: inline-flex;

          padding: 4px 7px;

          border-radius: 999px;

          font-size: 6px;

          font-weight: 950;

          letter-spacing: 0.06em;
        }

        .submittedBadge {
          color: #8df0ad;

          background:
            rgba(
              34,
              197,
              94,
              0.055
            );

          border:
            1px solid
            rgba(
              34,
              197,
              94,
              0.15
            );
        }

        .draftBadge {
          color: #f4d57a;

          background:
            rgba(
              245,
              201,
              77,
              0.055
            );

          border:
            1px solid
            rgba(
              245,
              201,
              77,
              0.15
            );
        }
      `}</style>
    </>
  );
}

/* =========================================================
   INFO FIELD
========================================================= */

function InfoField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <>
      <div className="infoField">
        <span>
          {label}
        </span>

        <strong>
          {value}
        </strong>
      </div>

      <style jsx>{`
        .infoField {
          min-height: 65px;

          padding: 10px;

          display: grid;

          align-content: start;

          gap: 5px;

          border-radius: 10px;

          background:
            rgba(
              0,
              0,
              0,
              0.14
            );

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.05
            );
        }

        span {
          color: #667383;

          font-size: 6px;

          font-weight: 900;

          letter-spacing: 0.07em;

          text-transform: uppercase;
        }

        strong {
          color: #d5dbe3;

          font-size: 9px;

          line-height: 1.45;
        }
      `}</style>
    </>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <>
      <div className="emptyState">
        <div className="emptyIcon">
          ◇
        </div>

        <h3>
          {title}
        </h3>

        <p>
          {description}
        </p>
      </div>

      <style jsx>{`
        .emptyState {
          padding: 55px 20px;

          border-radius: 20px;

          border:
            1px dashed
            rgba(
              255,
              255,
              255,
              0.1
            );

          background:
            rgba(
              255,
              255,
              255,
              0.018
            );

          text-align: center;
        }

        .emptyIcon {
          width: 45px;
          height: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          margin:
            0 auto 12px;

          border-radius: 13px;

          background:
            rgba(
              23,
              232,
              255,
              0.05
            );

          color: #17e8ff;
        }

        h3 {
          margin: 0;

          color: white;

          font-size: 16px;
        }

        p {
          margin:
            6px 0 0;

          color: #6e7a89;

          font-size: 9px;
        }
      `}</style>
    </>
  );
}
