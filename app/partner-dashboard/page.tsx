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

type PeriodKey = "day" | "week" | "month" | "quarter" | "fiscal";
type DashboardTab = "overview" | "live" | "history" | "tools" | "support";
type SupportActionType = "task" | "nudge" | "reminder";

type PartnerRow = {
  organization_name?: string | null;
  contact_email?: string | null;
  referral_code?: string | null;
  account_type?: string | null;
  account_holder?: string | null;
  title?: string | null;
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

type DisplayActivityRow = ActivityRow & {
  phone?: string | null;
};

type SupportAction = {
  id: string;
  type: SupportActionType;
  participantKey: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  title: string;
  message: string;
  dueDate?: string;
  status: "Open" | "Completed";
  createdAt: string;
};

type ParticipantOutcome = {
  id: string;
  participantKey: string;
  participantName: string;
  participantEmail?: string;
  participantPhone?: string;
  startedWorkingDate?: string;
  company?: string;
  position?: string;
  workLocation?: string;
  startedTrainingDate?: string;
  program?: string;
  trainingLocation?: string;
  notes?: string;
  updatedAt: string;
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
      return startOfMonth();
  }
}

function periodLabel(period: PeriodKey) {
  switch (period) {
    case "day":
      return "Today";

    case "week":
      return "This Week";

    case "month":
      return "This Month";

    case "quarter":
      return "This Quarter";

    case "fiscal":
      return "Fiscal Year";

    default:
      return "This Month";
  }
}

function InfoBubble({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <span style={styles.infoWrap}>
      <button
        type="button"
        onClick={() =>
          setOpen((prev) => !prev)
        }
        style={styles.infoButton}
      >
        i
      </button>

      {open ? (
        <div style={styles.infoPopup}>
          <p style={styles.infoTitle}>
            {title}
          </p>

          <p style={styles.infoText}>
            {text}
          </p>
        </div>
      ) : null}
    </span>
  );
}

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] =
    useState(false);

  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [partner, setPartner] =
    useState<PartnerRow | null>(null);

  const [participants, setParticipants] =
    useState<ParticipantRow[]>([]);

  const [activity, setActivity] =
    useState<ActivityRow[]>([]);

  const [period, setPeriod] =
    useState<PeriodKey>("month");

  const [platformUseView, setPlatformUseView] =
    useState<"day" | "week" | "month">(
      "month"
    );

  const [lastUpdated, setLastUpdated] =
    useState("");

  const [rangeMode, setRangeMode] =
    useState<"period" | "custom">(
      "period"
    );

  const [
    customStartDate,
    setCustomStartDate,
  ] = useState("");

  const [
    customEndDate,
    setCustomEndDate,
  ] = useState("");

  const [
    participantSearch,
    setParticipantSearch,
  ] = useState("");

  const [
    historyParticipantSearch,
    setHistoryParticipantSearch,
  ] = useState("");

  const [
    historyToolFilter,
    setHistoryToolFilter,
  ] = useState("all");

  const [
    historyStartDate,
    setHistoryStartDate,
  ] = useState("");

  const [
    historyEndDate,
    setHistoryEndDate,
  ] = useState("");

  const [
    supportActions,
    setSupportActions,
  ] = useState<SupportAction[]>([]);

  const [supportType, setSupportType] =
    useState<SupportActionType>(
      "task"
    );

  const [
    supportParticipantKey,
    setSupportParticipantKey,
  ] = useState("");

  const [
    supportParticipantName,
    setSupportParticipantName,
  ] = useState("");

  const [
    supportParticipantEmail,
    setSupportParticipantEmail,
  ] = useState("");

  const [
    supportParticipantPhone,
    setSupportParticipantPhone,
  ] = useState("");

  const [
    supportTitle,
    setSupportTitle,
  ] = useState("");

  const [
    supportMessage,
    setSupportMessage,
  ] = useState("");

  const [
    supportDueDate,
    setSupportDueDate,
  ] = useState("");

  const [
    participantOutcomes,
    setParticipantOutcomes,
  ] = useState<ParticipantOutcome[]>([]);

  const [
    outcomeParticipantKey,
    setOutcomeParticipantKey,
  ] = useState("");

  const [
    outcomeParticipantName,
    setOutcomeParticipantName,
  ] = useState("");

  const [
    outcomeParticipantEmail,
    setOutcomeParticipantEmail,
  ] = useState("");

  const [
    outcomeParticipantPhone,
    setOutcomeParticipantPhone,
  ] = useState("");

  const [
    startedWorkingDate,
    setStartedWorkingDate,
  ] = useState("");

  const [company, setCompany] =
    useState("");

  const [position, setPosition] =
    useState("");

  const [
    workLocation,
    setWorkLocation,
  ] = useState("");

  const [
    startedTrainingDate,
    setStartedTrainingDate,
  ] = useState("");

  const [program, setProgram] =
    useState("");

  const [
    trainingLocation,
    setTrainingLocation,
  ] = useState("");

  const [
    outcomeNotes,
    setOutcomeNotes,
  ] = useState("");

  const mountedRef = useRef(true);

  const supportStorageKey =
    useMemo(() => {
      const code =
        partner?.referral_code ||
        "partner";

      return `hireminds-partner-support-actions-${code}`;
    }, [partner?.referral_code]);

  const outcomesStorageKey =
    useMemo(() => {
      const code =
        partner?.referral_code ||
        "partner";

      return `hireminds-partner-outcomes-${code}`;
    }, [partner?.referral_code]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          supportStorageKey
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        setSupportActions(
          Array.isArray(parsed)
            ? parsed
            : []
        );
      } else {
        setSupportActions([]);
      }
    } catch {
      setSupportActions([]);
    }
  }, [supportStorageKey]);

  useEffect(() => {
    try {
      const raw =
        window.localStorage.getItem(
          outcomesStorageKey
        );

      if (raw) {
        const parsed =
          JSON.parse(raw);

        setParticipantOutcomes(
          Array.isArray(parsed)
            ? parsed
            : []
        );
      } else {
        setParticipantOutcomes([]);
      }
    } catch {
      setParticipantOutcomes([]);
    }
  }, [outcomesStorageKey]);

  function persistSupportActions(
    next: SupportAction[]
  ) {
    setSupportActions(next);

    try {
      window.localStorage.setItem(
        supportStorageKey,
        JSON.stringify(next)
      );
    } catch {
      setMessage(
        "Unable to save support actions in this browser."
      );
    }
  }

  function persistOutcomes(
    next: ParticipantOutcome[]
  ) {
    setParticipantOutcomes(next);

    try {
      window.localStorage.setItem(
        outcomesStorageKey,
        JSON.stringify(next)
      );
    } catch {
      setMessage(
        "Unable to save participant outcomes in this browser."
      );
    }
  }

  const loadDashboard =
    useCallback(
      async (
        options?: {
          silent?: boolean;
        }
      ) => {
        const silent =
          options?.silent ?? false;

        if (!silent) {
          setLoading(true);
          setMessage("");
        }

        const {
          data: authData,
          error: authError,
        } =
          await supabase.auth.getUser();

        if (
          authError ||
          !authData.user?.email
        ) {
          window.location.href =
            "/employer-partner-login";

          return;
        }

        const email =
          authData.user.email;

        const {
          data: partnerRow,
          error: partnerError,
        } = await supabase
          .from("partners")
          .select("*")
          .eq(
            "contact_email",
            email
          )
          .maybeSingle();

        if (partnerError) {
          if (mountedRef.current) {
            setMessage(
              partnerError.message
            );

            if (!silent) {
              setLoading(false);
            }
          }

          return;
        }

        if (!partnerRow) {
          if (mountedRef.current) {
            setMessage(
              "This account does not have partner dashboard access."
            );

            if (!silent) {
              setLoading(false);
            }
          }

          return;
        }

        let participantQuery =
          supabase
            .from(
              "candidate_profiles"
            )
            .select(
              "id, user_id, full_name, email, phone, referral_code, created_at"
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            );

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
        } =
          await participantQuery;

        if (participantError) {
          if (mountedRef.current) {
            setMessage(
              participantError.message
            );

            if (!silent) {
              setLoading(false);
            }
          }

          return;
        }

        let activityQuery =
          supabase
            .from("user_activity")
            .select(
              "id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at"
            )
            .order(
              "created_at",
              {
                ascending: false,
              }
            )
            .limit(5000);

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
        } =
          await activityQuery;

        if (activityError) {
          if (mountedRef.current) {
            setMessage(
              activityError.message
            );

            if (!silent) {
              setLoading(false);
            }
          }

          return;
        }

        if (!mountedRef.current) {
          return;
        }

        setPartner(
          partnerRow as PartnerRow
        );

        setParticipants(
          (participantRows as
            | ParticipantRow[]
            | null) || []
        );

        setActivity(
          (activityRows as
            | ActivityRow[]
            | null) || []
        );

        setLastUpdated(
          new Date().toLocaleTimeString()
        );

        if (!silent) {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        loadDashboard({
          silent: true,
        });
      }, 15000);

    return () =>
      window.clearInterval(
        interval
      );
  }, [loadDashboard]);

  const uniqueParticipants =
    useMemo(() => {
      const seen =
        new Set<string>();

      return participants.filter(
        (row) => {
          const key =
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "";

          if (
            !key ||
            seen.has(key)
          ) {
            return false;
          }

          seen.add(key);

          return true;
        }
      );
    }, [participants]);

  const participantPhoneMap =
    useMemo(() => {
      const map =
        new Map<string, string>();

      uniqueParticipants.forEach(
        (row) => {
          const phone =
            row.phone || "";

          if (!phone) {
            return;
          }

          if (row.user_id) {
            map.set(
              `uid:${row.user_id}`,
              phone
            );
          }

          if (row.email) {
            map.set(
              `email:${row.email.toLowerCase()}`,
              phone
            );
          }
        }
      );

      return map;
    }, [uniqueParticipants]);

  const activityWithPhone =
    useMemo<
      DisplayActivityRow[]
    >(() => {
      return activity.map((row) => {
        const phone =
          (row.user_id
            ? participantPhoneMap.get(
                `uid:${row.user_id}`
              )
            : undefined) ||
          (row.email
            ? participantPhoneMap.get(
                `email:${row.email.toLowerCase()}`
              )
            : undefined) ||
          null;

        return {
          ...row,
          phone,
        };
      });
    }, [
      activity,
      participantPhoneMap,
    ]);

  const periodStart =
    useMemo(
      () =>
        getPeriodStart(period),
      [period]
    );

  const usePeriodStart =
    useMemo(
      () =>
        getPeriodStart(
          platformUseView
        ),
      [platformUseView]
    );

  const customStart =
    useMemo(
      () =>
        customStartDate
          ? new Date(
              `${customStartDate}T00:00:00`
            )
          : null,
      [customStartDate]
    );

  const customEnd =
    useMemo(
      () =>
        customEndDate
          ? new Date(
              `${customEndDate}T23:59:59`
            )
          : null,
      [customEndDate]
    );

  const historyStart =
    useMemo(
      () =>
        historyStartDate
          ? new Date(
              `${historyStartDate}T00:00:00`
            )
          : null,
      [historyStartDate]
    );

  const historyEnd =
    useMemo(
      () =>
        historyEndDate
          ? new Date(
              `${historyEndDate}T23:59:59`
            )
          : null,
      [historyEndDate]
    );

  const filteredActivity =
    useMemo(() => {
      return activityWithPhone.filter(
        (row) => {
          const date =
            toDate(
              row.created_at
            );

          if (!date) {
            return false;
          }

          if (
            rangeMode ===
              "custom" &&
            customStart &&
            customEnd
          ) {
            return (
              date >= customStart &&
              date <= customEnd
            );
          }

          return (
            date >= periodStart
          );
        }
      );
    }, [
      activityWithPhone,
      rangeMode,
      customStart,
      customEnd,
      periodStart,
    ]);

  const usesBySelectedView =
    useMemo(() => {
      return activityWithPhone.filter(
        (row) => {
          const date =
            toDate(
              row.created_at
            );

          return date
            ? date >=
                usePeriodStart
            : false;
        }
      ).length;
    }, [
      activityWithPhone,
      usePeriodStart,
    ]);

  const totalHireMindsUsesReference =
    activityWithPhone.length;

  const newUsers =
    useMemo(() => {
      const monthStart =
        startOfMonth();

      return uniqueParticipants.filter(
        (row) => {
          const date =
            toDate(
              row.created_at
            );

          return date
            ? date >= monthStart
            : false;
        }
      );
    }, [uniqueParticipants]);

  const totalParticipants =
    uniqueParticipants.length;

  const filteredParticipants =
    useMemo(() => {
      const q =
        participantSearch
          .trim()
          .toLowerCase();

      if (!q) {
        return uniqueParticipants;
      }

      return uniqueParticipants.filter(
        (row) => {
          const name =
            (
              row.full_name ||
              ""
            ).toLowerCase();

          const email =
            (
              row.email ||
              ""
            ).toLowerCase();

          const phone =
            (
              row.phone ||
              ""
            ).toLowerCase();

          const referralCode =
            (
              row.referral_code ||
              ""
            ).toLowerCase();

          return (
            name.includes(q) ||
            email.includes(q) ||
            phone.includes(q) ||
            referralCode.includes(q)
          );
        }
      );
    }, [
      uniqueParticipants,
      participantSearch,
    ]);

  const filteredParticipantKeys =
    useMemo(() => {
      const set =
        new Set<string>();

      filteredParticipants.forEach(
        (row) => {
          const key =
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "";

          if (key) {
            set.add(key);
          }
        }
      );

      return set;
    }, [filteredParticipants]);

  const displayActivity =
    useMemo(() => {
      if (
        !participantSearch.trim()
      ) {
        return filteredActivity;
      }

      return filteredActivity.filter(
        (row) => {
          const key =
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "";

          return key
            ? filteredParticipantKeys.has(
                key
              )
            : false;
        }
      );
    }, [
      filteredActivity,
      filteredParticipantKeys,
      participantSearch,
    ]);

  const eventTypeGroups =
    useMemo(() => {
      const counts = {
        logins: 0,
        pageViews: 0,
        generatorUses: 0,
        completions: 0,
        guides: 0,
      };

      displayActivity.forEach(
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

          const page =
            (
              row.page_name ||
              ""
            ).toLowerCase();

          if (
            event.includes(
              "login"
            ) ||
            event ===
              "signed_in"
          ) {
            counts.logins += 1;
          }

          if (
            event.includes(
              "page"
            ) ||
            event ===
              "page_view"
          ) {
            counts.pageViews += 1;
          }

          if (
            event.includes(
              "complete"
            )
          ) {
            counts.completions += 1;
          }

          if (
            tool.includes(
              "guide"
            ) ||
            tool.includes(
              "video"
            ) ||
            page.includes(
              "guide"
            ) ||
            page.includes(
              "video"
            )
          ) {
            counts.guides += 1;
          }

          if (tool) {
            counts.generatorUses += 1;
          }
        }
      );

      return counts;
    }, [displayActivity]);

  const trackedTools =
    useMemo(
      () => [
        {
          key: "career_passport",
          label: "Career Passport",
        },
        {
          key: "career_map",
          label: "Career Map",
        },
        {
          key: "resume_generator",
          label: "Resume Generator",
        },
        {
          key: "guided_resume_generator",
          label:
            "Guided Resume Generator",
        },
        {
          key: "cover_letter_generator",
          label:
            "Cover Letter Generator",
        },
        {
          key: "house_of_letters",
          label:
            "House of Letters",
        },
        {
          key: "follow_up_generator",
          label:
            "Follow-Up Generator",
        },
        {
          key: "interview_question_generator",
          label:
            "Interview Question Generator",
        },
        {
          key: "job_description_analyzer",
          label:
            "Job Description Analyzer",
        },
        {
          key: "resume_match_analyzer",
          label:
            "Resume Match Analyzer",
        },
        {
          key: "job_log_generator",
          label:
            "Job Log Generator",
        },
        {
          key: "budget_generator",
          label:
            "Budget Generator",
        },
        {
          key: "industry_core_skills",
          label:
            "Industry Core Skills",
        },
        {
          key: "soft_skills",
          label: "Soft Skills",
        },
        {
          key: "professional_branding_generator",
          label:
            "Professional Branding Generator",
        },
        {
          key: "video_library",
          label:
            "Video Library",
        },
        {
          key: "resume_format_guide",
          label:
            "Resume Format Guide",
        },
        {
          key: "notes_tool",
          label:
            "Notes Tool",
        },
      ],
      []
    );

  const toolCounts =
    useMemo(() => {
      const counts:
        Record<string, number> =
        {};

      trackedTools.forEach(
        (tool) => {
          counts[tool.key] = 0;
        }
      );

      displayActivity.forEach(
        (row) => {
          const tool =
            (
              row.tool_name ||
              ""
            ).toLowerCase();

          if (!tool) {
            return;
          }

          const match =
            trackedTools.find(
              (item) =>
                item.key === tool
            );

          if (match) {
            counts[
              match.key
            ] += 1;
          }
        }
      );

      return counts;
    }, [
      displayActivity,
      trackedTools,
    ]);

  const liveFeed =
    useMemo(
      () =>
        displayActivity.slice(
          0,
          100
        ),
      [displayActivity]
    );

  const historyFeed =
    useMemo(() => {
      const search =
        historyParticipantSearch
          .trim()
          .toLowerCase();

      return activityWithPhone.filter(
        (row) => {
          const participant =
            (
              row.full_name ||
              ""
            ).toLowerCase();

          const email =
            (
              row.email ||
              ""
            ).toLowerCase();

          const phone =
            (
              row.phone ||
              ""
            ).toLowerCase();

          const referralCode =
            (
              row.referral_code ||
              ""
            ).toLowerCase();

          const toolName =
            (
              row.tool_name ||
              ""
            ).toLowerCase();

          const rowDate =
            toDate(
              row.created_at
            );

          const matchesSearch =
            !search ||
            participant.includes(
              search
            ) ||
            email.includes(
              search
            ) ||
            phone.includes(
              search
            ) ||
            referralCode.includes(
              search
            );

          const matchesTool =
            historyToolFilter ===
              "all" ||
            toolName ===
              historyToolFilter;

          const matchesDate =
            (!historyStart ||
              (rowDate &&
                rowDate >=
                  historyStart)) &&
            (!historyEnd ||
              (rowDate &&
                rowDate <=
                  historyEnd));

          return (
            matchesSearch &&
            matchesTool &&
            matchesDate
          );
        }
      );
    }, [
      activityWithPhone,
      historyParticipantSearch,
      historyToolFilter,
      historyStart,
      historyEnd,
    ]);

  const toolBreakdown =
    useMemo(() => {
      return trackedTools
        .map((tool) => ({
          label: tool.label,
          key: tool.key,
          count:
            toolCounts[
              tool.key
            ] || 0,
        }))
        .sort(
          (a, b) =>
            b.count -
            a.count
        );
    }, [
      trackedTools,
      toolCounts,
    ]);

  const maxToolCount =
    toolBreakdown.length
      ? Math.max(
          ...toolBreakdown.map(
            (d) => d.count
          )
        )
      : 1;

  const selectedParticipantOptions =
    useMemo(() => {
      return filteredParticipants.map(
        (row) => ({
          key:
            row.user_id ||
            row.email ||
            row.phone ||
            row.id ||
            "",

          name:
            row.full_name ||
            row.email ||
            row.phone ||
            "Participant",

          email:
            row.email || "",

          phone:
            row.phone || "",
        })
      );
    }, [filteredParticipants]);

  const supportActionsFiltered =
    useMemo(() => {
      const q =
        participantSearch
          .trim()
          .toLowerCase();

      if (!q) {
        return supportActions;
      }

      return supportActions.filter(
        (item) =>
          item.participantName
            .toLowerCase()
            .includes(q) ||
          (
            item.participantEmail ||
            ""
          )
            .toLowerCase()
            .includes(q) ||
          (
            item.participantPhone ||
            ""
          )
            .toLowerCase()
            .includes(q)
      );
    }, [
      supportActions,
      participantSearch,
    ]);

  const selectedOutcome =
    useMemo(() => {
      if (
        !outcomeParticipantKey
      ) {
        return null;
      }

      return (
        participantOutcomes.find(
          (item) =>
            item.participantKey ===
            outcomeParticipantKey
        ) || null
      );
    }, [
      participantOutcomes,
      outcomeParticipantKey,
    ]);

  useEffect(() => {
    if (!selectedOutcome) {
      setStartedWorkingDate("");
      setCompany("");
      setPosition("");
      setWorkLocation("");
      setStartedTrainingDate("");
      setProgram("");
      setTrainingLocation("");
      setOutcomeNotes("");

      return;
    }

    setStartedWorkingDate(
      selectedOutcome.startedWorkingDate ||
        ""
    );

    setCompany(
      selectedOutcome.company ||
        ""
    );

    setPosition(
      selectedOutcome.position ||
        ""
    );

    setWorkLocation(
      selectedOutcome.workLocation ||
        ""
    );

    setStartedTrainingDate(
      selectedOutcome.startedTrainingDate ||
        ""
    );

    setProgram(
      selectedOutcome.program ||
        ""
    );

    setTrainingLocation(
      selectedOutcome.trainingLocation ||
        ""
    );

    setOutcomeNotes(
      selectedOutcome.notes ||
        ""
    );
  }, [selectedOutcome]);

  async function handleLogout() {
    setLoadingLogout(true);

    await supabase.auth.signOut();

    window.location.href =
      "/employer-partner-login";
  }

  function addSupportAction() {
    if (
      !supportParticipantKey ||
      !supportParticipantName ||
      !supportTitle.trim()
    ) {
      setMessage(
        "Please select a participant and enter a title before saving."
      );

      return;
    }

    const next:
      SupportAction[] = [
      {
        id: `sa-${Date.now()}`,
        type: supportType,
        participantKey:
          supportParticipantKey,
        participantName:
          supportParticipantName,
        participantEmail:
          supportParticipantEmail,
        participantPhone:
          supportParticipantPhone,
        title:
          supportTitle.trim(),
        message:
          supportMessage.trim(),
        dueDate:
          supportDueDate ||
          undefined,
        status: "Open",
        createdAt:
          new Date().toISOString(),
      },
      ...supportActions,
    ];

    persistSupportActions(next);

    setSupportTitle("");
    setSupportMessage("");
    setSupportDueDate("");

    setMessage(
      "Support action saved."
    );
  }

  function toggleSupportActionStatus(
    id: string
  ) {
    const next =
      supportActions.map(
        (item) => {
          if (
            item.id !== id
          ) {
            return item;
          }

          return {
            ...item,
            status:
              item.status ===
              "Open"
                ? "Completed"
                : "Open",
          } as SupportAction;
        }
      );

    persistSupportActions(next);
  }

  function deleteSupportAction(
    id: string
  ) {
    persistSupportActions(
      supportActions.filter(
        (item) =>
          item.id !== id
      )
    );
  }

  function saveParticipantOutcome() {
    if (
      !outcomeParticipantKey ||
      !outcomeParticipantName
    ) {
      setMessage(
        "Please select a participant before saving outcomes."
      );

      return;
    }

    const nextRecord:
      ParticipantOutcome = {
      id:
        selectedOutcome?.id ||
        `outcome-${Date.now()}`,

      participantKey:
        outcomeParticipantKey,

      participantName:
        outcomeParticipantName,

      participantEmail:
        outcomeParticipantEmail,

      participantPhone:
        outcomeParticipantPhone,

      startedWorkingDate:
        startedWorkingDate ||
        undefined,

      company:
        company.trim() ||
        undefined,

      position:
        position.trim() ||
        undefined,

      workLocation:
        workLocation.trim() ||
        undefined,

      startedTrainingDate:
        startedTrainingDate ||
        undefined,

      program:
        program.trim() ||
        undefined,

      trainingLocation:
        trainingLocation.trim() ||
        undefined,

      notes:
        outcomeNotes.trim() ||
        undefined,

      updatedAt:
        new Date().toISOString(),
    };

    const others =
      participantOutcomes.filter(
        (item) =>
          item.participantKey !==
          outcomeParticipantKey
      );

    persistOutcomes([
      nextRecord,
      ...others,
    ]);

    setMessage(
      "Participant outcome saved."
    );
  }

  function selectSupportParticipant(
    value: string
  ) {
    setSupportParticipantKey(
      value
    );

    const selected =
      selectedParticipantOptions.find(
        (item) =>
          item.key === value
      );

    setSupportParticipantName(
      selected?.name || ""
    );

    setSupportParticipantEmail(
      selected?.email || ""
    );

    setSupportParticipantPhone(
      selected?.phone || ""
    );
  }

  function selectOutcomeParticipant(
    value: string
  ) {
    setOutcomeParticipantKey(
      value
    );

    const selected =
      selectedParticipantOptions.find(
        (item) =>
          item.key === value
      );

    setOutcomeParticipantName(
      selected?.name || ""
    );

    setOutcomeParticipantEmail(
      selected?.email || ""
    );

    setOutcomeParticipantPhone(
      selected?.phone || ""
    );
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
      <div style={styles.shell}>
        <section
          style={styles.headerCard}
        >
          <div>
            <p style={styles.kicker}>
              HIREMINDS™ PARTNER DASHBOARD
            </p>

            <h1 style={styles.title}>
              {partner?.organization_name ||
                "Partner Dashboard"}
            </h1>

            <p style={styles.subtitle}>
              View participant engagement,
              referral codes, platform activity,
              career tool usage, support actions,
              and outcomes.
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

            <div
              style={
                styles.liveMetaRow
              }
            >
              <span
                style={
                  styles.liveBadge
                }
              >
                <span
                  style={
                    styles.liveDot
                  }
                />
                Live
              </span>

              <span
                style={
                  styles.lastUpdated
                }
              >
                Last updated:{" "}
                {lastUpdated ||
                  "—"}
              </span>
            </div>
          </div>

          <div
            style={
              styles.headerActions
            }
          >
            <button
              type="button"
              onClick={() =>
                loadDashboard()
              }
              style={
                styles.secondaryButton
              }
            >
              Refresh
            </button>

            <button
              type="button"
              onClick={
                handleLogout
              }
              style={
                styles.logoutButton
              }
              disabled={
                loadingLogout
              }
            >
              {loadingLogout
                ? "Logging Off..."
                : "Log Off"}
            </button>
          </div>
        </section>

        {message ? (
          <div
            style={
              styles.notice
            }
          >
            {message}
          </div>
        ) : null}

        <section
          style={styles.card}
        >
          <div
            style={
              styles.tabRow
            }
          >
            {[
              [
                "overview",
                "Overview",
              ],
              [
                "live",
                "Live Activity",
              ],
              [
                "history",
                "History",
              ],
              [
                "tools",
                "Tool Usage",
              ],
              [
                "support",
                "Support & Outcomes",
              ],
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
            <section
              style={
                styles.summaryGrid
              }
            >
              <div
                style={
                  styles.metricCardBlue
                }
              >
                <p
                  style={
                    styles.summaryLabel
                  }
                >
                  Total Participants
                </p>

                <p
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    totalParticipants
                  }
                </p>
              </div>

              <div
                style={
                  styles.metricCardGreen
                }
              >
                <p
                  style={
                    styles.summaryLabel
                  }
                >
                  New This Month
                </p>

                <p
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    newUsers.length
                  }
                </p>
              </div>

              <div
                style={
                  styles.metricCardPurple
                }
              >
                <p
                  style={
                    styles.summaryLabel
                  }
                >
                  Activity
                </p>

                <p
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    displayActivity.length
                  }
                </p>
              </div>
            </section>

            <section
              style={styles.card}
            >
              <div
                style={
                  styles.sectionTop
                }
              >
                <div>
                  <p
                    style={
                      styles.sectionKicker
                    }
                  >
                    PARTICIPANTS
                  </p>

                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Participant List
                  </h2>
                </div>
              </div>

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
                style={
                  styles.input
                }
              />

              <div
                style={{
                  marginTop: 18,
                  ...styles.liveFeedWrap,
                }}
              >
                <table
                  style={
                    styles.table
                  }
                >
                  <thead>
                    <tr>
                      <th
                        style={
                          styles.th
                        }
                      >
                        Participant
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Email
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Phone
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Referral Code
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Joined
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParticipants.map(
                      (
                        row,
                        index
                      ) => (
                        <tr
                          key={
                            row.id ||
                            `${row.email}-${index}`
                          }
                        >
                          <td
                            style={
                              styles.td
                            }
                          >
                            {row.full_name ||
                              "Participant"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {row.email ||
                              "—"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            {row.phone ||
                              "—"}
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
                            <span
                              style={
                                styles.referralBadge
                              }
                            >
                              {row.referral_code ||
                                "—"}
                            </span>
                          </td>

                          <td
                            style={
                              styles.td
                            }
                          >
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
          </>
        ) : null}

        {activeTab ===
        "live" ? (
          <section
            style={styles.card}
          >
            <div
              style={
                styles.sectionTop
              }
            >
              <div>
                <p
                  style={
                    styles.sectionKicker
                  }
                >
                  LIVE ACTIVITY
                </p>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Participant Activity Feed
                </h2>
              </div>
            </div>

            <div
              style={
                styles.liveFeedWrap
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Participant
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Email
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Phone
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Referral Code
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Activity
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Tool
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {liveFeed.map(
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
                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.full_name ||
                            "Participant"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.email ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.phone ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={
                              styles.referralBadge
                            }
                          >
                            {row.referral_code ||
                              "—"}
                          </span>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.event_type ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.tool_name ||
                            row.page_name ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
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
          <section
            style={styles.card}
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Activity History
            </h2>

            <div
              style={
                styles.historyFilterGrid
              }
            >
              <input
                value={
                  historyParticipantSearch
                }
                onChange={(e) =>
                  setHistoryParticipantSearch(
                    e.target.value
                  )
                }
                placeholder="Search participant or referral code"
                style={
                  styles.input
                }
              />

              <select
                value={
                  historyToolFilter
                }
                onChange={(e) =>
                  setHistoryToolFilter(
                    e.target.value
                  )
                }
                style={
                  styles.select
                }
              >
                <option value="all">
                  All Tools
                </option>

                {trackedTools.map(
                  (tool) => (
                    <option
                      key={
                        tool.key
                      }
                      value={
                        tool.key
                      }
                    >
                      {tool.label}
                    </option>
                  )
                )}
              </select>

              <input
                type="date"
                value={
                  historyStartDate
                }
                onChange={(e) =>
                  setHistoryStartDate(
                    e.target.value
                  )
                }
                style={
                  styles.input
                }
              />

              <input
                type="date"
                value={
                  historyEndDate
                }
                onChange={(e) =>
                  setHistoryEndDate(
                    e.target.value
                  )
                }
                style={
                  styles.input
                }
              />
            </div>

            <div
              style={
                styles.liveFeedWrap
              }
            >
              <table
                style={
                  styles.table
                }
              >
                <thead>
                  <tr>
                    <th
                      style={
                        styles.th
                      }
                    >
                      Participant
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Email
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Phone
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Referral Code
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Event
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Tool/Page
                    </th>

                    <th
                      style={
                        styles.th
                      }
                    >
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {historyFeed.map(
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
                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.full_name ||
                            "Participant"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.email ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.phone ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          <span
                            style={
                              styles.referralBadge
                            }
                          >
                            {row.referral_code ||
                              "—"}
                          </span>
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.event_type ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
                          {row.tool_name ||
                            row.page_name ||
                            "—"}
                        </td>

                        <td
                          style={
                            styles.td
                          }
                        >
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
          <section
            style={styles.card}
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Tool Usage
            </h2>

            <div
              style={
                styles.horizontalChart
              }
            >
              {toolBreakdown.map(
                (
                  tool,
                  index
                ) => {
                  const width =
                    maxToolCount >
                    0
                      ? (tool.count /
                          maxToolCount) *
                        100
                      : 0;

                  return (
                    <div
                      key={
                        tool.key
                      }
                      style={
                        styles.horizontalRow
                      }
                    >
                      <span
                        style={
                          styles.horizontalLabel
                        }
                      >
                        {
                          tool.label
                        }
                      </span>

                      <div
                        style={
                          styles.horizontalOuter
                        }
                      >
                        <div
                          style={{
                            ...styles.horizontalBarBlue,
                            width: `${width}%`,
                          }}
                        />
                      </div>

                      <span
                        style={
                          styles.horizontalCount
                        }
                      >
                        {
                          tool.count
                        }
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </section>
        ) : null}

        {activeTab ===
        "support" ? (
          <>
            <section
              style={styles.card}
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                Add Support Action
              </h2>

              <select
                value={
                  supportParticipantKey
                }
                onChange={(e) =>
                  selectSupportParticipant(
                    e.target.value
                  )
                }
                style={
                  styles.select
                }
              >
                <option value="">
                  Select participant
                </option>

                {selectedParticipantOptions.map(
                  (item) => (
                    <option
                      key={
                        item.key
                      }
                      value={
                        item.key
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>

              <select
                value={
                  supportType
                }
                onChange={(e) =>
                  setSupportType(
                    e.target
                      .value as SupportActionType
                  )
                }
                style={{
                  ...styles.select,
                  marginTop: 12,
                }}
              >
                <option value="task">
                  Task
                </option>

                <option value="nudge">
                  Nudge
                </option>

                <option value="reminder">
                  Reminder
                </option>
              </select>

              <input
                value={
                  supportTitle
                }
                onChange={(e) =>
                  setSupportTitle(
                    e.target.value
                  )
                }
                placeholder="Title"
                style={{
                  ...styles.input,
                  marginTop: 12,
                }}
              />

              <textarea
                value={
                  supportMessage
                }
                onChange={(e) =>
                  setSupportMessage(
                    e.target.value
                  )
                }
                placeholder="Message / notes"
                style={{
                  ...styles.textarea,
                  marginTop: 12,
                }}
              />

              <button
                type="button"
                onClick={
                  addSupportAction
                }
                style={{
                  ...styles.primaryButton,
                  marginTop: 12,
                }}
              >
                Save Support Action
              </button>
            </section>

            <section
              style={styles.card}
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                Saved Support Actions
              </h2>

              {supportActionsFiltered.map(
                (item) => (
                  <div
                    key={item.id}
                    style={
                      styles.supportCard
                    }
                  >
                    <h3>
                      {
                        item.title
                      }
                    </h3>

                    <p>
                      {
                        item.participantName
                      }
                    </p>

                    <p>
                      {
                        item.message
                      }
                    </p>

                    <button
                      onClick={() =>
                        toggleSupportActionStatus(
                          item.id
                        )
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      {
                        item.status
                      }
                    </button>

                    <button
                      onClick={() =>
                        deleteSupportAction(
                          item.id
                        )
                      }
                      style={
                        styles.dangerButton
                      }
                    >
                      Delete
                    </button>
                  </div>
                )
              )}
            </section>

            <section
              style={styles.card}
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                Participant Outcomes
              </h2>

              <select
                value={
                  outcomeParticipantKey
                }
                onChange={(e) =>
                  selectOutcomeParticipant(
                    e.target.value
                  )
                }
                style={
                  styles.select
                }
              >
                <option value="">
                  Select participant
                </option>

                {selectedParticipantOptions.map(
                  (item) => (
                    <option
                      key={
                        item.key
                      }
                      value={
                        item.key
                      }
                    >
                      {item.name}
                    </option>
                  )
                )}
              </select>

              <input
                value={company}
                onChange={(e) =>
                  setCompany(
                    e.target.value
                  )
                }
                placeholder="Company"
                style={{
                  ...styles.input,
                  marginTop: 12,
                }}
              />

              <input
                value={position}
                onChange={(e) =>
                  setPosition(
                    e.target.value
                  )
                }
                placeholder="Position"
                style={{
                  ...styles.input,
                  marginTop: 12,
                }}
              />

              <button
                type="button"
                onClick={
                  saveParticipantOutcome
                }
                style={{
                  ...styles.primaryButton,
                  marginTop: 12,
                }}
              >
                Save Participant Outcome
              </button>
            </section>
          </>
        ) : null}
      </div>
    </main>
  );
}

const baseMetricCard: CSSProperties = {
  borderRadius: 22,
  padding: 20,
  border:
    "1px solid rgba(255,255,255,0.08)",
};

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: "100vh",
    background:
      "linear-gradient(180deg,#050505,#0d0d0f)",
    color: "#e7e7e7",
    padding:
      "32px 24px 56px",
  },

  centerWrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
  },

  shell: {
    maxWidth: 1480,
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },

  headerCard: {
    background: "#141414",
    border:
      "1px solid #262626",
    borderRadius: 24,
    padding: 24,
    display: "flex",
    justifyContent:
      "space-between",
    gap: 20,
  },

  kicker: {
    color: "#93c5fd",
    fontSize: 12,
    letterSpacing:
      ".16em",
  },

  title: {
    fontSize: 38,
    margin:
      "6px 0 10px",
  },

  subtitle: {
    color: "#d4d4d8",
  },

  subtleLine: {
    color: "#a1a1aa",
    fontSize: 14,
  },

  liveMetaRow: {
    display: "flex",
    gap: 12,
    marginTop: 12,
  },

  liveBadge: {
    color: "#bbf7d0",
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#22c55e",
    display:
      "inline-block",
    marginRight: 8,
  },

  lastUpdated: {
    color: "#a1a1aa",
  },

  headerActions: {
    display: "flex",
    gap: 10,
  },

  card: {
    background: "#141414",
    border:
      "1px solid #262626",
    borderRadius: 24,
    padding: 24,
  },

  notice: {
    background:
      "rgba(250,204,21,.08)",
    padding: 14,
    borderRadius: 14,
  },

  tabRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  tabButton: {
    padding:
      "10px 14px",
    borderRadius: 999,
    background: "#111",
    color: "#fff",
    border:
      "1px solid #333",
  },

  tabButtonActive: {
    background: "#fff",
    color: "#000",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3,1fr)",
    gap: 16,
  },

  metricCardBlue: {
    ...baseMetricCard,
    background:
      "rgba(30,64,175,.22)",
  },

  metricCardGreen: {
    ...baseMetricCard,
    background:
      "rgba(22,163,74,.22)",
  },

  metricCardPurple: {
    ...baseMetricCard,
    background:
      "rgba(126,34,206,.22)",
  },

  summaryLabel: {
    color: "#d4d4d8",
  },

  summaryValue: {
    fontSize: 34,
    fontWeight: 700,
  },

  sectionTop: {
    display: "flex",
    justifyContent:
      "space-between",
  },

  sectionKicker: {
    color: "#93c5fd",
    fontSize: 12,
  },

  sectionTitle: {
    fontSize: 28,
  },

  input: {
    width: "100%",
    padding: 14,
    background: "#0f0f10",
    color: "#fff",
    border:
      "1px solid #313131",
    borderRadius: 14,
    boxSizing:
      "border-box",
  },

  select: {
    width: "100%",
    padding: 14,
    background: "#0f0f10",
    color: "#fff",
    border:
      "1px solid #313131",
    borderRadius: 14,
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    padding: 14,
    background: "#0f0f10",
    color: "#fff",
    border:
      "1px solid #313131",
    borderRadius: 14,
    boxSizing:
      "border-box",
  },

  liveFeedWrap: {
    overflow: "auto",
    border:
      "1px solid #2b2b2e",
    borderRadius: 18,
  },

  table: {
    width: "100%",
    borderCollapse:
      "collapse",
  },

  th: {
    padding: 12,
    textAlign: "left",
    background: "#111",
    color: "#a1a1aa",
  },

  td: {
    padding: 12,
    borderTop:
      "1px solid #232323",
  },

  referralBadge: {
    display:
      "inline-block",
    padding:
      "6px 10px",
    borderRadius: 999,
    background:
      "rgba(59,130,246,.14)",
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: 700,
  },

  historyFilterGrid: {
    display: "grid",
    gridTemplateColumns:
      "1.4fr 1fr 1fr 1fr",
    gap: 12,
    marginBottom: 18,
  },

  horizontalChart: {
    display: "grid",
    gap: 14,
  },

  horizontalRow: {
    display: "grid",
    gridTemplateColumns:
      "200px 1fr 50px",
    gap: 12,
  },

  horizontalLabel: {
    color: "#e5e7eb",
  },

  horizontalOuter: {
    height: 16,
    background: "#0f0f10",
    borderRadius: 999,
    overflow: "hidden",
  },

  horizontalBarBlue: {
    height: "100%",
    background:
      "#2563eb",
  },

  horizontalCount: {
    textAlign: "right",
  },

  supportCard: {
    background: "#101010",
    border:
      "1px solid #2c2c2c",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },

  primaryButton: {
    padding:
      "12px 18px",
    borderRadius: 14,
    background: "#fff",
    color: "#000",
    fontWeight: 700,
    border: "none",
  },

  secondaryButton: {
    padding:
      "10px 14px",
    borderRadius: 14,
    background: "#111",
    color: "#fff",
    border:
      "1px solid #333",
  },

  dangerButton: {
    padding:
      "10px 14px",
    borderRadius: 14,
    background:
      "rgba(127,29,29,.2)",
    color: "#fecaca",
    border:
      "1px solid rgba(248,113,113,.25)",
    marginLeft: 8,
  },

  logoutButton: {
    padding:
      "10px 14px",
    borderRadius: 14,
    background:
      "#112b5f",
    color: "#fff",
    border:
      "1px solid #334155",
  },

  infoWrap: {},
  infoButton: {},
  infoPopup: {},
  infoTitle: {},
  infoText: {},
};
