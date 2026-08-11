"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { supabase } from "../lib/supabase";

type DashboardTab =
  | "overview"
  | "live"
  | "history"
  | "tools"
  | "reports";

type PeriodKey =
  | "all"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "fiscal"
  | "custom";

type PartnerRow = {
  organization_name?: string | null;
  contact_email?: string | null;
  referral_code?: string | null;
  account_type?: string | null;
  account_holder?: string | null;
};

type ParticipantRow = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  referral_code?: string | null;
  created_at?: string | null;
};

type ActivityRow = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  referral_code?: string | null;
  event_type?: string | null;
  tool_name?: string | null;
  page_name?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString();
}

function toDate(value?: string | null) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfToday() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function startOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;

  const start = new Date(now);

  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);

  return start;
}

function startOfMonth() {
  const now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );
}

function startOfQuarter() {
  const now = new Date();

  const quarterStartMonth =
    Math.floor(now.getMonth() / 3) * 3;

  return new Date(
    now.getFullYear(),
    quarterStartMonth,
    1
  );
}

function startOfFiscalYear() {
  const now = new Date();
  const fiscalStartMonth = 6;

  const year =
    now.getMonth() >= fiscalStartMonth
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return new Date(
    year,
    fiscalStartMonth,
    1
  );
}

function getPeriodStart(period: PeriodKey) {
  switch (period) {
    case "day":
      return startOfToday();

    case "week":
      return startOfWeek();

    case "month":
      return startOfMonth();

    case "quarter":
      return startOfQuarter();

    case "fiscal":
      return startOfFiscalYear();

    default:
      return null;
  }
}

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [partner, setPartner] =
    useState<PartnerRow | null>(null);

  const [participants, setParticipants] =
    useState<ParticipantRow[]>([]);

  const [activity, setActivity] =
    useState<ActivityRow[]>([]);

  const [lastUpdated, setLastUpdated] =
    useState("");

  const [participantSearch, setParticipantSearch] =
    useState("");

  // REPORTS
  const [selectedCodes, setSelectedCodes] =
    useState<string[]>([]);

  const [reportParticipantKey, setReportParticipantKey] =
    useState("all");

  const [reportPeriod, setReportPeriod] =
    useState<PeriodKey>("all");

  const [reportStartDate, setReportStartDate] =
    useState("");

  const [reportEndDate, setReportEndDate] =
    useState("");

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setMessage("");

    const {
      data: authData,
      error: authError,
    } = await supabase.auth.getUser();

    if (
      authError ||
      !authData.user?.email
    ) {
      window.location.href =
        "/employer-partner-login";

      return;
    }

    const email = authData.user.email;

    const {
      data: partnerRow,
      error: partnerError,
    } = await supabase
      .from("partners")
      .select("*")
      .eq("contact_email", email)
      .maybeSingle();

    if (partnerError) {
      setMessage(partnerError.message);
      setLoading(false);
      return;
    }

    if (!partnerRow) {
      setMessage(
        "This account does not have Partner Dashboard access."
      );
      setLoading(false);
      return;
    }

    let participantQuery = supabase
      .from("candidate_profiles")
      .select(
        "id, user_id, full_name, email, phone, referral_code, created_at"
      )
      .order("created_at", {
        ascending: false,
      });

    if (
      partnerRow.account_type !==
      "super_admin"
    ) {
      participantQuery =
        participantQuery.eq(
          "referral_code",
          partnerRow.referral_code
        );
    }

    const {
      data: participantRows,
      error: participantError,
    } = await participantQuery;

    if (participantError) {
      setMessage(
        participantError.message
      );
      setLoading(false);
      return;
    }

    let activityQuery = supabase
      .from("user_activity")
      .select(
        "id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at"
      )
      .order("created_at", {
        ascending: false,
      })
      .limit(10000);

    if (
      partnerRow.account_type !==
      "super_admin"
    ) {
      activityQuery =
        activityQuery.eq(
          "referral_code",
          partnerRow.referral_code
        );
    }

    const {
      data: activityRows,
      error: activityError,
    } = await activityQuery;

    if (activityError) {
      setMessage(activityError.message);
      setLoading(false);
      return;
    }

    if (!mountedRef.current) {
      return;
    }

    setPartner(
      partnerRow as PartnerRow
    );

    setParticipants(
      (participantRows as ParticipantRow[]) ||
        []
    );

    setActivity(
      (activityRows as ActivityRow[]) ||
        []
    );

    setLastUpdated(
      new Date().toLocaleTimeString()
    );

    setLoading(false);
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  async function handleLogout() {
    setLoadingLogout(true);

    await supabase.auth.signOut();

    window.location.href =
      "/employer-partner-login";
  }

  const referralCodes =
    useMemo(() => {
      const codes = new Set<string>();

      participants.forEach((row) => {
        const code =
          row.referral_code?.trim();

        if (code) {
          codes.add(
            code.toUpperCase()
          );
        }
      });

      activity.forEach((row) => {
        const code =
          row.referral_code?.trim();

        if (code) {
          codes.add(
            code.toUpperCase()
          );
        }
      });

      return [...codes].sort();
    }, [participants, activity]);

  useEffect(() => {
    if (
      selectedCodes.length === 0 &&
      referralCodes.length > 0
    ) {
      setSelectedCodes(referralCodes);
    }
  }, [referralCodes, selectedCodes.length]);

  const uniqueParticipants =
    useMemo(() => {
      const map =
        new Map<
          string,
          ParticipantRow
        >();

      participants.forEach((row) => {
        const key =
          row.user_id ||
          row.email ||
          row.phone ||
          row.id ||
          "";

        if (
          key &&
          !map.has(key)
        ) {
          map.set(key, row);
        }
      });

      return [...map.values()];
    }, [participants]);

  const filteredParticipants =
    useMemo(() => {
      const query =
        participantSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return uniqueParticipants;
      }

      return uniqueParticipants.filter(
        (row) => {
          return (
            (
              row.full_name ||
              ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              row.email ||
              ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              row.phone ||
              ""
            )
              .toLowerCase()
              .includes(query) ||
            (
              row.referral_code ||
              ""
            )
              .toLowerCase()
              .includes(query)
          );
        }
      );
    }, [
      participantSearch,
      uniqueParticipants,
    ]);

  const reportParticipantOptions =
    useMemo(() => {
      return uniqueParticipants
        .filter((row) => {
          if (
            selectedCodes.length ===
            0
          ) {
            return false;
          }

          return selectedCodes.includes(
            (
              row.referral_code ||
              ""
            ).toUpperCase()
          );
        })
        .map((row) => ({
          key:
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "",

          name:
            row.full_name ||
            row.email ||
            "Participant",

          referralCode:
            row.referral_code ||
            "",
        }));
    }, [
      uniqueParticipants,
      selectedCodes,
    ]);

  function reportDateMatches(
    value?: string | null
  ) {
    const date = toDate(value);

    if (!date) {
      return false;
    }

    if (reportPeriod === "all") {
      return true;
    }

    if (
      reportPeriod === "custom"
    ) {
      if (
        !reportStartDate ||
        !reportEndDate
      ) {
        return true;
      }

      const start = new Date(
        `${reportStartDate}T00:00:00`
      );

      const end = new Date(
        `${reportEndDate}T23:59:59`
      );

      return (
        date >= start &&
        date <= end
      );
    }

    const start =
      getPeriodStart(
        reportPeriod
      );

    return start
      ? date >= start
      : true;
  }

  const reportParticipants =
    useMemo(() => {
      return uniqueParticipants.filter(
        (row) => {
          const code =
            (
              row.referral_code ||
              ""
            ).toUpperCase();

          if (
            !selectedCodes.includes(
              code
            )
          ) {
            return false;
          }

          if (
            reportParticipantKey !==
            "all"
          ) {
            const rowKey =
              row.user_id ||
              row.email ||
              row.phone ||
              row.id ||
              "";

            if (
              rowKey !==
              reportParticipantKey
            ) {
              return false;
            }
          }

          return reportDateMatches(
            row.created_at
          );
        }
      );
    }, [
      uniqueParticipants,
      selectedCodes,
      reportParticipantKey,
      reportPeriod,
      reportStartDate,
      reportEndDate,
    ]);

  const reportActivity =
    useMemo(() => {
      return activity.filter(
        (row) => {
          const code =
            (
              row.referral_code ||
              ""
            ).toUpperCase();

          if (
            !selectedCodes.includes(
              code
            )
          ) {
            return false;
          }

          if (
            reportParticipantKey !==
            "all"
          ) {
            const rowKey =
              row.user_id ||
              row.email ||
              row.id ||
              "";

            if (
              rowKey !==
              reportParticipantKey
            ) {
              return false;
            }
          }

          return reportDateMatches(
            row.created_at
          );
        }
      );
    }, [
      activity,
      selectedCodes,
      reportParticipantKey,
      reportPeriod,
      reportStartDate,
      reportEndDate,
    ]);

  const reportStats =
    useMemo(() => {
      let logins = 0;
      let pageViews = 0;
      let completions = 0;
      let toolUses = 0;

      const tools:
        Record<string, number> = {};

      reportActivity.forEach(
        (row) => {
          const event =
            (
              row.event_type ||
              ""
            ).toLowerCase();

          const tool =
            (
              row.tool_name ||
              ""
            ).toLowerCase();

          if (
            event.includes("login") ||
            event ===
              "signed_in"
          ) {
            logins += 1;
          }

          if (
            event.includes("page")
          ) {
            pageViews += 1;
          }

          if (
            event.includes(
              "complete"
            )
          ) {
            completions += 1;
          }

          if (tool) {
            toolUses += 1;

            tools[tool] =
              (tools[tool] ||
                0) + 1;
          }
        }
      );

      const topTool =
        Object.entries(tools)
          .sort(
            (a, b) =>
              b[1] - a[1]
          )[0] || null;

      return {
        participants:
          reportParticipants.length,

        activities:
          reportActivity.length,

        logins,
        pageViews,
        completions,
        toolUses,

        topTool:
          topTool
            ? topTool[0]
            : "—",

        topToolUses:
          topTool
            ? topTool[1]
            : 0,
      };
    }, [
      reportParticipants,
      reportActivity,
    ]);

  const codeBreakdown =
    useMemo(() => {
      return selectedCodes.map(
        (code) => {
          const people =
            reportParticipants.filter(
              (row) =>
                (
                  row.referral_code ||
                  ""
                ).toUpperCase() ===
                code
            );

          const acts =
            reportActivity.filter(
              (row) =>
                (
                  row.referral_code ||
                  ""
                ).toUpperCase() ===
                code
            );

          const logins =
            acts.filter((row) => {
              const event =
                (
                  row.event_type ||
                  ""
                ).toLowerCase();

              return (
                event.includes(
                  "login"
                ) ||
                event ===
                  "signed_in"
              );
            }).length;

          return {
            code,
            participants:
              people.length,
            activities:
              acts.length,
            logins,
          };
        }
      );
    }, [
      selectedCodes,
      reportParticipants,
      reportActivity,
    ]);

  const individualParticipant =
    useMemo(() => {
      if (
        reportParticipantKey ===
        "all"
      ) {
        return null;
      }

      return uniqueParticipants.find(
        (row) => {
          const key =
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "";

          return (
            key ===
            reportParticipantKey
          );
        }
      );
    }, [
      uniqueParticipants,
      reportParticipantKey,
    ]);

  function toggleCode(
    code: string
  ) {
    setSelectedCodes(
      (prev) => {
        if (
          prev.includes(code)
        ) {
          return prev.filter(
            (item) =>
              item !== code
          );
        }

        return [
          ...prev,
          code,
        ];
      }
    );

    setReportParticipantKey(
      "all"
    );
  }

  function selectAllCodes() {
    setSelectedCodes(
      referralCodes
    );

    setReportParticipantKey(
      "all"
    );
  }

  function clearAllCodes() {
    setSelectedCodes([]);

    setReportParticipantKey(
      "all"
    );
  }

  const reportSummaryText =
    useMemo(() => {
      if (
        individualParticipant
      ) {
        return `${individualParticipant.full_name || "Participant"} is associated with referral code ${individualParticipant.referral_code || "—"} and has ${reportActivity.length} recorded HireMinds activities during the selected reporting period. Recorded activity includes ${reportStats.logins} login(s), ${reportStats.toolUses} tool use(s), and ${reportStats.completions} completion event(s). The participant's most frequently recorded tool for this period is ${reportStats.topTool}.`;
      }

      return `This HireMinds report includes ${reportStats.participants} participant(s) across ${selectedCodes.length} selected referral code(s). During the selected reporting period, the group generated ${reportStats.activities} recorded activities, including ${reportStats.logins} login(s), ${reportStats.toolUses} tool use(s), and ${reportStats.completions} completion event(s). The most frequently recorded tool was ${reportStats.topTool}.`;
    }, [
      individualParticipant,
      reportActivity.length,
      reportStats,
      selectedCodes.length,
    ]);

  function printReport() {
    window.print();
  }

  function exportCSV() {
    const rows = [
      [
        "Participant",
        "Email",
        "Referral Code",
        "Event",
        "Tool",
        "Page",
        "Date",
      ],

      ...reportActivity.map(
        (row) => [
          row.full_name || "",
          row.email || "",
          row.referral_code || "",
          row.event_type || "",
          row.tool_name || "",
          row.page_name || "",
          row.created_at || "",
        ]
      ),
    ];

    const csv = rows
      .map((row) =>
        row
          .map(
            (value) =>
              `"${String(
                value
              ).replace(
                /"/g,
                '""'
              )}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      "hireminds-report.csv";

    link.click();

    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div
          style={
            styles.centerWrap
          }
        >
          Loading Partner Dashboard...
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }

          #hireminds-report,
          #hireminds-report * {
            visibility: visible !important;
          }

          #hireminds-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={styles.headerCard}>
          <div>
            <p style={styles.kicker}>
              HIREMINDS™ PARTNER DASHBOARD
            </p>

            <h1 style={styles.title}>
              {partner?.organization_name ||
                "Partner Dashboard"}
            </h1>

            <p style={styles.subtitle}>
              Participant engagement,
              referral-code reporting,
              activity tracking, and
              workforce outcomes.
            </p>

            <p style={styles.subtleLine}>
              Account:{" "}
              {partner?.account_holder ||
                partner?.contact_email ||
                "Authorized Partner"}
            </p>

            <p style={styles.subtleLine}>
              Account Type:{" "}
              {partner?.account_type ||
                "partner"}
            </p>

            <p style={styles.subtleLine}>
              Last Updated:{" "}
              {lastUpdated || "—"}
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={loadDashboard}
              style={styles.secondaryButton}
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={handleLogout}
              style={styles.logoutButton}
              disabled={loadingLogout}
            >
              {loadingLogout
                ? "Logging Off..."
                : "Log Off"}
            </button>
          </div>
        </section>

        {message ? (
          <div style={styles.notice}>
            {message}
          </div>
        ) : null}

        <section style={styles.card}>
          <div style={styles.tabRow}>
            {[
              ["overview", "Overview"],
              ["live", "Live Activity"],
              ["history", "History"],
              ["tools", "Tool Usage"],
              ["reports", "Reports"],
            ].map(
              ([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      key as DashboardTab
                    )
                  }
                  style={{
                    ...styles.tabButton,
                    ...(activeTab ===
                    key
                      ? styles.tabButtonActive
                      : {}),
                  }}
                >
                  {label}
                </button>
              )
            )}
          </div>
        </section>

        {activeTab ===
        "overview" ? (
          <>
            <section style={styles.summaryGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Participants
                </p>

                <p style={styles.metricValue}>
                  {
                    uniqueParticipants.length
                  }
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Referral Codes
                </p>

                <p style={styles.metricValue}>
                  {
                    referralCodes.length
                  }
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Activity Records
                </p>

                <p style={styles.metricValue}>
                  {
                    activity.length
                  }
                </p>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Participant List
              </h2>

              <input
                value={
                  participantSearch
                }
                onChange={(e) =>
                  setParticipantSearch(
                    e.target.value
                  )
                }
                placeholder="Search name, email, phone, or referral code"
                style={styles.input}
              />

              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Participant
                      </th>

                      <th style={styles.th}>
                        Email
                      </th>

                      <th style={styles.th}>
                        Referral Code
                      </th>

                      <th style={styles.th}>
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParticipants.map(
                      (row, index) => (
                        <tr
                          key={
                            row.id ||
                            `${row.email}-${index}`
                          }
                        >
                          <td style={styles.td}>
                            {row.full_name ||
                              "Participant"}
                          </td>

                          <td style={styles.td}>
                            {row.email ||
                              "—"}
                          </td>

                          <td style={styles.td}>
                            <span style={styles.codeBadge}>
                              {row.referral_code ||
                                "—"}
                            </span>
                          </td>

                          <td style={styles.td}>
                            {formatShortDate(
                              row.created_at
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {activeTab ===
        "live" ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Live Activity
            </h2>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Participant
                    </th>

                    <th style={styles.th}>
                      Referral Code
                    </th>

                    <th style={styles.th}>
                      Event
                    </th>

                    <th style={styles.th}>
                      Tool
                    </th>

                    <th style={styles.th}>
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activity
                    .slice(0, 100)
                    .map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            row.id ||
                            `${row.created_at}-${index}`
                          }
                        >
                          <td style={styles.td}>
                            {row.full_name ||
                              row.email ||
                              "Participant"}
                          </td>

                          <td style={styles.td}>
                            <span style={styles.codeBadge}>
                              {row.referral_code ||
                                "—"}
                            </span>
                          </td>

                          <td style={styles.td}>
                            {row.event_type ||
                              "—"}
                          </td>

                          <td style={styles.td}>
                            {row.tool_name ||
                              row.page_name ||
                              "—"}
                          </td>

                          <td style={styles.td}>
                            {formatDate(
                              row.created_at
                            )}
                          </td>
                        </tr>
                      )
                    )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab ===
        "history" ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Activity History
            </h2>

            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>
                      Participant
                    </th>

                    <th style={styles.th}>
                      Referral Code
                    </th>

                    <th style={styles.th}>
                      Event
                    </th>

                    <th style={styles.th}>
                      Tool/Page
                    </th>

                    <th style={styles.th}>
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activity.map(
                    (
                      row,
                      index
                    ) => (
                      <tr
                        key={
                          row.id ||
                          `${row.created_at}-${index}`
                        }
                      >
                        <td style={styles.td}>
                          {row.full_name ||
                            row.email ||
                            "Participant"}
                        </td>

                        <td style={styles.td}>
                          <span style={styles.codeBadge}>
                            {row.referral_code ||
                              "—"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {row.event_type ||
                            "—"}
                        </td>

                        <td style={styles.td}>
                          {row.tool_name ||
                            row.page_name ||
                            "—"}
                        </td>

                        <td style={styles.td}>
                          {formatDate(
                            row.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {activeTab ===
        "tools" ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Tool Usage
            </h2>

            <p style={styles.muted}>
              Detailed tool usage is included
              in the Reports tab, where you
              can filter one code, several
              codes, all codes, or an
              individual participant.
            </p>
          </section>
        ) : null}

        {activeTab ===
        "reports" ? (
          <>
            <section
              className="no-print"
              style={styles.card}
            >
              <p style={styles.kicker}>
                REPORT BUILDER
              </p>

              <h2 style={styles.sectionTitle}>
                Generate HireMinds Report
              </h2>

              <p style={styles.muted}>
                Select one referral code,
                several codes, or all codes.
                You can also generate an
                individual participant report.
              </p>

              <div style={styles.reportControls}>
                <div>
                  <p style={styles.controlLabel}>
                    Referral Codes
                  </p>

                  <div style={styles.smallButtonRow}>
                    <button
                      type="button"
                      onClick={
                        selectAllCodes
                      }
                      style={styles.secondaryButton}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearAllCodes
                      }
                      style={styles.secondaryButton}
                    >
                      Clear All
                    </button>
                  </div>

                  <div style={styles.codeSelector}>
                    {referralCodes.map(
                      (code) => (
                        <label
                          key={code}
                          style={{
                            ...styles.codeChoice,
                            ...(selectedCodes.includes(
                              code
                            )
                              ? styles.codeChoiceActive
                              : {}),
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={selectedCodes.includes(
                              code
                            )}
                            onChange={() =>
                              toggleCode(
                                code
                              )
                            }
                          />

                          {code}
                        </label>
                      )
                    )}
                  </div>
                </div>

                <label style={styles.fieldWrap}>
                  <span style={styles.controlLabel}>
                    Participant
                  </span>

                  <select
                    value={
                      reportParticipantKey
                    }
                    onChange={(e) =>
                      setReportParticipantKey(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  >
                    <option value="all">
                      All Participants
                    </option>

                    {reportParticipantOptions.map(
                      (item) => (
                        <option
                          key={
                            item.key
                          }
                          value={
                            item.key
                          }
                        >
                          {item.name} —{" "}
                          {
                            item.referralCode
                          }
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.controlLabel}>
                    Reporting Period
                  </span>

                  <select
                    value={
                      reportPeriod
                    }
                    onChange={(e) =>
                      setReportPeriod(
                        e.target
                          .value as PeriodKey
                      )
                    }
                    style={styles.input}
                  >
                    <option value="all">
                      All Time
                    </option>

                    <option value="day">
                      Today
                    </option>

                    <option value="week">
                      This Week
                    </option>

                    <option value="month">
                      This Month
                    </option>

                    <option value="quarter">
                      This Quarter
                    </option>

                    <option value="fiscal">
                      Fiscal Year
                    </option>

                    <option value="custom">
                      Custom Date Range
                    </option>
                  </select>
                </label>

                {reportPeriod ===
                "custom" ? (
                  <>
                    <label style={styles.fieldWrap}>
                      <span style={styles.controlLabel}>
                        Start Date
                      </span>

                      <input
                        type="date"
                        value={
                          reportStartDate
                        }
                        onChange={(e) =>
                          setReportStartDate(
                            e.target.value
                          )
                        }
                        style={styles.input}
                      />
                    </label>

                    <label style={styles.fieldWrap}>
                      <span style={styles.controlLabel}>
                        End Date
                      </span>

                      <input
                        type="date"
                        value={
                          reportEndDate
                        }
                        onChange={(e) =>
                          setReportEndDate(
                            e.target.value
                          )
                        }
                        style={styles.input}
                      />
                    </label>
                  </>
                ) : null}
              </div>
            </section>

            <section
              id="hireminds-report"
              style={styles.reportCard}
            >
              <div style={styles.reportHeader}>
                <div>
                  <p style={styles.reportBrand}>
                    HireMinds™
                  </p>

                  <h1 style={styles.reportTitle}>
                    {individualParticipant
                      ? "Participant Progress Report"
                      : "Workforce Summary Report"}
                  </h1>
                </div>

                <div style={styles.reportDate}>
                  Generated{" "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div style={styles.reportMeta}>
                <div>
                  <strong>
                    Referral Code(s)
                  </strong>

                  <p>
                    {selectedCodes.length
                      ? selectedCodes.join(
                          ", "
                        )
                      : "None selected"}
                  </p>
                </div>

                <div>
                  <strong>
                    Participant
                  </strong>

                  <p>
                    {individualParticipant?.full_name ||
                      "All Participants"}
                  </p>
                </div>

                <div>
                  <strong>
                    Reporting Period
                  </strong>

                  <p>
                    {reportPeriod ===
                    "custom"
                      ? `${reportStartDate || "Start"} – ${reportEndDate || "End"}`
                      : reportPeriod.toUpperCase()}
                  </p>
                </div>
              </div>

              <div style={styles.reportMetrics}>
                <div style={styles.reportMetric}>
                  <strong>
                    {
                      reportStats.participants
                    }
                  </strong>

                  <span>
                    Participants
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {
                      reportStats.activities
                    }
                  </strong>

                  <span>
                    Activities
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {
                      reportStats.logins
                    }
                  </strong>

                  <span>
                    Logins
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {
                      reportStats.toolUses
                    }
                  </strong>

                  <span>
                    Tool Uses
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {
                      reportStats.completions
                    }
                  </strong>

                  <span>
                    Completions
                  </span>
                </div>
              </div>

              <section style={styles.summaryBox}>
                <h2 style={styles.reportSectionTitle}>
                  Summary
                </h2>

                <p style={styles.reportText}>
                  {reportSummaryText}
                </p>
              </section>

              {!individualParticipant ? (
                <section>
                  <h2 style={styles.reportSectionTitle}>
                    Referral Code Breakdown
                  </h2>

                  <div style={styles.breakdownGrid}>
                    {codeBreakdown.map(
                      (item) => (
                        <div
                          key={
                            item.code
                          }
                          style={
                            styles.breakdownCard
                          }
                        >
                          <h3>
                            {
                              item.code
                            }
                          </h3>

                          <p>
                            Participants:{" "}
                            <strong>
                              {
                                item.participants
                              }
                            </strong>
                          </p>

                          <p>
                            Activities:{" "}
                            <strong>
                              {
                                item.activities
                              }
                            </strong>
                          </p>

                          <p>
                            Logins:{" "}
                            <strong>
                              {
                                item.logins
                              }
                            </strong>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              {individualParticipant ? (
                <section style={styles.summaryBox}>
                  <h2 style={styles.reportSectionTitle}>
                    Participant Information
                  </h2>

                  <p style={styles.reportText}>
                    <strong>
                      Name:
                    </strong>{" "}
                    {individualParticipant.full_name ||
                      "—"}
                    <br />

                    <strong>
                      Email:
                    </strong>{" "}
                    {individualParticipant.email ||
                      "—"}
                    <br />

                    <strong>
                      Referral Code:
                    </strong>{" "}
                    {individualParticipant.referral_code ||
                      "—"}
                    <br />

                    <strong>
                      Joined:
                    </strong>{" "}
                    {formatShortDate(
                      individualParticipant.created_at
                    )}
                    <br />

                    <strong>
                      Most Used Tool:
                    </strong>{" "}
                    {reportStats.topTool}
                  </p>
                </section>
              ) : null}

              <section>
                <h2 style={styles.reportSectionTitle}>
                  Activity Detail
                </h2>

                <div style={styles.tableWrap}>
                  <table style={styles.reportTable}>
                    <thead>
                      <tr>
                        <th style={styles.reportTh}>
                          Participant
                        </th>

                        <th style={styles.reportTh}>
                          Code
                        </th>

                        <th style={styles.reportTh}>
                          Event
                        </th>

                        <th style={styles.reportTh}>
                          Tool/Page
                        </th>

                        <th style={styles.reportTh}>
                          Date
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {reportActivity
                        .slice(0, 200)
                        .map(
                          (
                            row,
                            index
                          ) => (
                            <tr
                              key={
                                row.id ||
                                `${row.created_at}-${index}`
                              }
                            >
                              <td style={styles.reportTd}>
                                {row.full_name ||
                                  row.email ||
                                  "Participant"}
                              </td>

                              <td style={styles.reportTd}>
                                {row.referral_code ||
                                  "—"}
                              </td>

                              <td style={styles.reportTd}>
                                {row.event_type ||
                                  "—"}
                              </td>

                              <td style={styles.reportTd}>
                                {row.tool_name ||
                                  row.page_name ||
                                  "—"}
                              </td>

                              <td style={styles.reportTd}>
                                {formatShortDate(
                                  row.created_at
                                )}
                              </td>
                            </tr>
                          )
                        )}
                    </tbody>
                  </table>
                </div>
              </section>

              <p style={styles.reportFooter}>
                HireMinds™ Workforce Infrastructure Platform
              </p>
            </section>

            <div
              className="no-print"
              style={styles.reportActions}
            >
              <button
                type="button"
                onClick={
                  printReport
                }
                style={styles.primaryButton}
              >
                Print Report
              </button>

              <button
                type="button"
                onClick={
                  exportCSV
                }
                style={styles.secondaryButton}
              >
                Export CSV
              </button>
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,.08), transparent 28%), linear-gradient(180deg,#050505,#0d0d0f)",
    color: "#f5f5f5",
    padding: "32px 24px 60px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  centerWrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },

  shell: {
    maxWidth: 1500,
    margin: "0 auto",
    display: "grid",
    gap: 22,
  },

  headerCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 20,
    flexWrap: "wrap",
    padding: 26,
    borderRadius: 24,
    background: "#151517",
    border: "1px solid #28282c",
  },

  kicker: {
    margin: "0 0 8px",
    color: "#93c5fd",
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: ".18em",
  },

  title: {
    margin: "0 0 8px",
    fontSize: 38,
  },

  subtitle: {
    color: "#d4d4d8",
    lineHeight: 1.6,
  },

  subtleLine: {
    margin: "6px 0",
    color: "#a1a1aa",
    fontSize: 13,
  },

  headerActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  notice: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(250,204,21,.08)",
    color: "#fde68a",
  },

  card: {
    padding: 24,
    borderRadius: 24,
    background: "#151517",
    border: "1px solid #28282c",
  },

  tabRow: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  tabButton: {
    padding: "10px 15px",
    borderRadius: 999,
    border: "1px solid #34343a",
    background: "#101012",
    color: "#f5f5f5",
    cursor: "pointer",
    fontWeight: 700,
  },

  tabButtonActive: {
    background: "#f5f5f5",
    color: "#080808",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
    gap: 16,
  },

  metricCard: {
    padding: 22,
    borderRadius: 20,
    background: "#151517",
    border: "1px solid #28282c",
  },

  metricLabel: {
    color: "#a1a1aa",
  },

  metricValue: {
    margin: 0,
    fontSize: 38,
    fontWeight: 800,
  },

  sectionTitle: {
    marginTop: 0,
    fontSize: 28,
  },

  muted: {
    color: "#b7b7be",
    lineHeight: 1.7,
  },

  input: {
    width: "100%",
    padding: "13px 14px",
    borderRadius: 14,
    border: "1px solid #34343a",
    background: "#0d0d0f",
    color: "#fff",
    boxSizing: "border-box",
  },

  tableWrap: {
    overflowX: "auto",
    marginTop: 18,
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    padding: 12,
    textAlign: "left",
    color: "#a1a1aa",
    borderBottom: "1px solid #303035",
    fontSize: 13,
  },

  td: {
    padding: 12,
    borderBottom: "1px solid #242428",
    fontSize: 14,
  },

  codeBadge: {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: 999,
    background: "rgba(59,130,246,.13)",
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: 800,
  },

  reportControls: {
    display: "grid",
    gap: 22,
    marginTop: 24,
  },

  controlLabel: {
    display: "block",
    marginBottom: 8,
    color: "#d4d4d8",
    fontWeight: 700,
    fontSize: 13,
  },

  fieldWrap: {
    display: "grid",
    gap: 8,
  },

  smallButtonRow: {
    display: "flex",
    gap: 10,
    marginBottom: 14,
  },

  codeSelector: {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
  },

  codeChoice: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 13px",
    borderRadius: 999,
    background: "#0d0d0f",
    border: "1px solid #34343a",
    cursor: "pointer",
    fontSize: 13,
  },

  codeChoiceActive: {
    background: "rgba(59,130,246,.16)",
    border: "1px solid rgba(96,165,250,.45)",
    color: "#dbeafe",
  },

  reportCard: {
    background: "#ffffff",
    color: "#111827",
    borderRadius: 24,
    padding: 34,
  },

  reportHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 20,
    alignItems: "flex-start",
    borderBottom: "2px solid #111827",
    paddingBottom: 20,
  },

  reportBrand: {
    margin: "0 0 5px",
    fontWeight: 900,
    fontSize: 18,
  },

  reportTitle: {
    margin: 0,
    fontSize: 34,
  },

  reportDate: {
    fontSize: 13,
    color: "#4b5563",
  },

  reportMeta: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 18,
    marginTop: 24,
    padding: 20,
    background: "#f3f4f6",
    borderRadius: 16,
  },

  reportMetrics: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 14,
    marginTop: 24,
  },

  reportMetric: {
    padding: 18,
    borderRadius: 14,
    border: "1px solid #d1d5db",
    display: "grid",
    gap: 6,
  },

  summaryBox: {
    marginTop: 28,
    padding: 22,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e5e7eb",
  },

  reportSectionTitle: {
    marginTop: 30,
    marginBottom: 12,
    fontSize: 22,
  },

  reportText: {
    lineHeight: 1.75,
  },

  breakdownGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 14,
  },

  breakdownCard: {
    padding: 18,
    border: "1px solid #d1d5db",
    borderRadius: 14,
  },

  reportTable: {
    width: "100%",
    borderCollapse: "collapse",
    color: "#111827",
  },

  reportTh: {
    textAlign: "left",
    padding: 10,
    borderBottom: "2px solid #111827",
    fontSize: 12,
  },

  reportTd: {
    padding: 10,
    borderBottom: "1px solid #e5e7eb",
    fontSize: 12,
  },

  reportFooter: {
    marginTop: 30,
    paddingTop: 18,
    borderTop: "1px solid #d1d5db",
    color: "#6b7280",
    textAlign: "center",
    fontSize: 12,
  },

  reportActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "12px 18px",
    borderRadius: 14,
    border: "none",
    background: "#f5f5f5",
    color: "#09090b",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #34343a",
    background: "#101012",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },

  logoutButton: {
    padding: "12px 16px",
    borderRadius: 14,
    border: "1px solid #334155",
    background: "#112b5f",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },
};
