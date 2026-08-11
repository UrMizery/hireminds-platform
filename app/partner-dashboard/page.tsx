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
  contact_name?: string | null;
  contact_title?: string | null;
  account_holder?: string | null;
  title?: string | null;
  contact_email?: string | null;
  referral_code?: string | null;
  account_type?: string | null;
};

type ParticipantRow = {
  id?: string | null;
  user_id?: string | null;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
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
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

function formatShortDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function toDate(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
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
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function startOfQuarter() {
  const now = new Date();
  const quarterStartMonth = Math.floor(now.getMonth() / 3) * 3;
  return new Date(now.getFullYear(), quarterStartMonth, 1);
}

function startOfFiscalYear() {
  const now = new Date();
  const fiscalStartMonth = 6;
  const year =
    now.getMonth() >= fiscalStartMonth
      ? now.getFullYear()
      : now.getFullYear() - 1;

  return new Date(year, fiscalStartMonth, 1);
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
        onClick={() => setOpen((prev) => !prev)}
        style={styles.infoButton}
        aria-label={`About ${title}`}
        title={`About ${title}`}
      >
        i
      </button>

      {open ? (
        <div style={styles.infoPopup}>
          <p style={styles.infoTitle}>{title}</p>
          <p style={styles.infoText}>{text}</p>
        </div>
      ) : null}
    </span>
  );
}

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [message, setMessage] = useState("");

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [partner, setPartner] = useState<PartnerRow | null>(null);
  const [participants, setParticipants] = useState<ParticipantRow[]>([]);
  const [activity, setActivity] = useState<ActivityRow[]>([]);

  const [period, setPeriod] = useState<PeriodKey>("month");

  const [platformUseView, setPlatformUseView] =
    useState<"day" | "week" | "month">("month");

  const [lastUpdated, setLastUpdated] = useState("");

  const [rangeMode, setRangeMode] =
    useState<"period" | "custom">("period");

  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

  const [participantSearch, setParticipantSearch] = useState("");

  const [historyParticipantSearch, setHistoryParticipantSearch] =
    useState("");

  const [historyToolFilter, setHistoryToolFilter] = useState("all");
  const [historyStartDate, setHistoryStartDate] = useState("");
  const [historyEndDate, setHistoryEndDate] = useState("");

  const [supportActions, setSupportActions] = useState<SupportAction[]>([]);
  const [supportType, setSupportType] =
    useState<SupportActionType>("task");

  const [supportParticipantKey, setSupportParticipantKey] = useState("");
  const [supportParticipantName, setSupportParticipantName] = useState("");
  const [supportParticipantEmail, setSupportParticipantEmail] = useState("");
  const [supportParticipantPhone, setSupportParticipantPhone] = useState("");
  const [supportTitle, setSupportTitle] = useState("");
  const [supportMessage, setSupportMessage] = useState("");
  const [supportDueDate, setSupportDueDate] = useState("");

  const [participantOutcomes, setParticipantOutcomes] =
    useState<ParticipantOutcome[]>([]);

  const [outcomeParticipantKey, setOutcomeParticipantKey] = useState("");
  const [outcomeParticipantName, setOutcomeParticipantName] = useState("");
  const [outcomeParticipantEmail, setOutcomeParticipantEmail] = useState("");
  const [outcomeParticipantPhone, setOutcomeParticipantPhone] = useState("");

  const [startedWorkingDate, setStartedWorkingDate] = useState("");
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [workLocation, setWorkLocation] = useState("");

  const [startedTrainingDate, setStartedTrainingDate] = useState("");
  const [program, setProgram] = useState("");
  const [trainingLocation, setTrainingLocation] = useState("");
  const [outcomeNotes, setOutcomeNotes] = useState("");

  const mountedRef = useRef(true);

  const supportStorageKey = useMemo(() => {
    const code = partner?.referral_code || "partner";
    return `hireminds-partner-support-actions-${code}`;
  }, [partner?.referral_code]);

  const outcomesStorageKey = useMemo(() => {
    const code = partner?.referral_code || "partner";
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
      const raw = window.localStorage.getItem(supportStorageKey);

      if (raw) {
        const parsed = JSON.parse(raw);
        setSupportActions(Array.isArray(parsed) ? parsed : []);
      } else {
        setSupportActions([]);
      }
    } catch {
      setSupportActions([]);
    }
  }, [supportStorageKey]);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(outcomesStorageKey);

      if (raw) {
        const parsed = JSON.parse(raw);
        setParticipantOutcomes(Array.isArray(parsed) ? parsed : []);
      } else {
        setParticipantOutcomes([]);
      }
    } catch {
      setParticipantOutcomes([]);
    }
  }, [outcomesStorageKey]);

  function persistSupportActions(next: SupportAction[]) {
    setSupportActions(next);

    try {
      window.localStorage.setItem(
        supportStorageKey,
        JSON.stringify(next)
      );
    } catch {
      setMessage("Unable to save support actions in this browser.");
    }
  }

  function persistOutcomes(next: ParticipantOutcome[]) {
    setParticipantOutcomes(next);

    try {
      window.localStorage.setItem(
        outcomesStorageKey,
        JSON.stringify(next)
      );
    } catch {
      setMessage("Unable to save participant outcomes in this browser.");
    }
  }

  const loadDashboard = useCallback(
    async (options?: { silent?: boolean }) => {
      const silent = options?.silent ?? false;

      if (!silent) {
        setLoading(true);
        setMessage("");
      }

      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user?.email) {
        window.location.href = "/employer-partner-login";
        return;
      }

      const email = authData.user.email;

      const { data: partnerRow, error: partnerError } = await supabase
        .from("partners")
        .select("*")
        .eq("contact_email", email)
        .maybeSingle();

      if (partnerError) {
        if (mountedRef.current) {
          setMessage(partnerError.message);
          if (!silent) setLoading(false);
        }
        return;
      }

      if (!partnerRow || !partnerRow.referral_code) {
        if (mountedRef.current) {
          setMessage(
            "This account does not have partner dashboard access."
          );
          if (!silent) setLoading(false);
        }
        return;
      }

      let participantQuery = supabase
        .from("candidate_profiles")
        .select("id, user_id, full_name, email, phone, created_at")
        .order("created_at", { ascending: false });

      if (partnerRow.account_type !== "super_admin") {
        participantQuery = participantQuery.eq(
          "referral_code",
          partnerRow.referral_code
        );
      }

      const {
        data: participantRows,
        error: participantError,
      } = await participantQuery;

      if (participantError) {
        if (mountedRef.current) {
          setMessage(participantError.message);
          if (!silent) setLoading(false);
        }
        return;
      }

      let activityQuery = supabase
        .from("user_activity")
        .select(
          "id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(5000);

      if (partnerRow.account_type !== "super_admin") {
        activityQuery = activityQuery.eq(
          "referral_code",
          partnerRow.referral_code
        );
      }

      const { data: activityRows, error: activityError } =
        await activityQuery;

      if (activityError) {
        if (mountedRef.current) {
          setMessage(activityError.message);
          if (!silent) setLoading(false);
        }
        return;
      }

      if (!mountedRef.current) return;

      setPartner(partnerRow as PartnerRow);
      setParticipants(
        (participantRows as ParticipantRow[] | null) || []
      );
      setActivity((activityRows as ActivityRow[] | null) || []);
      setLastUpdated(new Date().toLocaleTimeString());

      if (!silent) setLoading(false);
    },
    []
  );

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      loadDashboard({ silent: true });
    }, 15000);

    return () => window.clearInterval(interval);
  }, [loadDashboard]);

  const uniqueParticipants = useMemo(() => {
    const seen = new Set<string>();

    return participants.filter((row) => {
      const key =
        row.user_id || row.email || row.phone || row.id || "";

      if (!key || seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [participants]);

  const participantPhoneMap = useMemo(() => {
    const map = new Map<string, string>();

    uniqueParticipants.forEach((row) => {
      const phone = row.phone || "";
      if (!phone) return;

      if (row.user_id) {
        map.set(`uid:${row.user_id}`, phone);
      }

      if (row.email) {
        map.set(`email:${row.email.toLowerCase()}`, phone);
      }
    });

    return map;
  }, [uniqueParticipants]);

  const activityWithPhone = useMemo<DisplayActivityRow[]>(() => {
    return activity.map((row) => {
      const phone =
        (row.user_id
          ? participantPhoneMap.get(`uid:${row.user_id}`)
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
  }, [activity, participantPhoneMap]);

  const periodStart = useMemo(
    () => getPeriodStart(period),
    [period]
  );

  const usePeriodStart = useMemo(
    () => getPeriodStart(platformUseView),
    [platformUseView]
  );

  const customStart = useMemo(
    () =>
      customStartDate
        ? new Date(`${customStartDate}T00:00:00`)
        : null,
    [customStartDate]
  );

  const customEnd = useMemo(
    () =>
      customEndDate
        ? new Date(`${customEndDate}T23:59:59`)
        : null,
    [customEndDate]
  );

  const historyStart = useMemo(
    () =>
      historyStartDate
        ? new Date(`${historyStartDate}T00:00:00`)
        : null,
    [historyStartDate]
  );

  const historyEnd = useMemo(
    () =>
      historyEndDate
        ? new Date(`${historyEndDate}T23:59:59`)
        : null,
    [historyEndDate]
  );

  const filteredActivity = useMemo(() => {
    return activityWithPhone.filter((row) => {
      const date = toDate(row.created_at);
      if (!date) return false;

      if (
        rangeMode === "custom" &&
        customStart &&
        customEnd
      ) {
        return date >= customStart && date <= customEnd;
      }

      return date >= periodStart;
    });
  }, [
    activityWithPhone,
    rangeMode,
    customStart,
    customEnd,
    periodStart,
  ]);

  const usesBySelectedView = useMemo(() => {
    return activityWithPhone.filter((row) => {
      const date = toDate(row.created_at);
      return date ? date >= usePeriodStart : false;
    }).length;
  }, [activityWithPhone, usePeriodStart]);

  const totalHireMindsUsesReference = activityWithPhone.length;

  const newUsers = useMemo(() => {
    const monthStart = startOfMonth();

    return uniqueParticipants.filter((row) => {
      const date = toDate(row.created_at);
      return date ? date >= monthStart : false;
    });
  }, [uniqueParticipants]);

  const totalParticipants = uniqueParticipants.length;

  const filteredParticipants = useMemo(() => {
    const q = participantSearch.trim().toLowerCase();

    if (!q) return uniqueParticipants;

    return uniqueParticipants.filter((row) => {
      const name = (row.full_name || "").toLowerCase();
      const email = (row.email || "").toLowerCase();
      const phone = (row.phone || "").toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q)
      );
    });
  }, [uniqueParticipants, participantSearch]);

  const filteredParticipantKeys = useMemo(() => {
    const set = new Set<string>();

    filteredParticipants.forEach((row) => {
      const key =
        row.user_id || row.email || row.phone || row.id || "";

      if (key) set.add(key);
    });

    return set;
  }, [filteredParticipants]);

  const displayActivity = useMemo(() => {
    if (!participantSearch.trim()) return filteredActivity;

    return filteredActivity.filter((row) => {
      const key =
        row.user_id || row.email || row.phone || row.id || "";

      return key ? filteredParticipantKeys.has(key) : false;
    });
  }, [
    filteredActivity,
    filteredParticipantKeys,
    participantSearch,
  ]);

  const eventTypeGroups = useMemo(() => {
    const counts = {
      logins: 0,
      pageViews: 0,
      generatorUses: 0,
      completions: 0,
      guides: 0,
    };

    displayActivity.forEach((row) => {
      const event = (row.event_type || "").toLowerCase();
      const tool = (row.tool_name || "").toLowerCase();
      const page = (row.page_name || "").toLowerCase();

      if (event.includes("login") || event === "signed_in") {
        counts.logins += 1;
      }

      if (event.includes("page") || event === "page_view") {
        counts.pageViews += 1;
      }

      if (event.includes("complete")) {
        counts.completions += 1;
      }

      if (
        tool.includes("guide") ||
        tool.includes("video") ||
        page.includes("guide") ||
        page.includes("video")
      ) {
        counts.guides += 1;
      }

      if (tool) {
        counts.generatorUses += 1;
      }
    });

    return counts;
  }, [displayActivity]);

  const trackedTools = useMemo(
    () => [
      { key: "career_passport", label: "Career Passport" },
      { key: "career_map", label: "Career Map" },
      { key: "resume_generator", label: "Resume Generator" },
      {
        key: "guided_resume_generator",
        label: "Guided Resume Generator",
      },
      {
        key: "cover_letter_generator",
        label: "Cover Letter Generator",
      },
      { key: "house_of_letters", label: "House of Letters" },
      {
        key: "follow_up_generator",
        label: "Follow-Up Generator",
      },
      {
        key: "interview_question_generator",
        label: "Interview Question Generator",
      },
      {
        key: "job_description_analyzer",
        label: "Job Description Analyzer",
      },
      {
        key: "resume_match_analyzer",
        label: "Resume Match Analyzer",
      },
      {
        key: "job_log_generator",
        label: "Job Log Generator",
      },
      {
        key: "budget_generator",
        label: "Budget Generator",
      },
      {
        key: "industry_core_skills",
        label: "Industry Core Skills",
      },
      { key: "soft_skills", label: "Soft Skills" },
      {
        key: "professional_branding_generator",
        label: "Professional Branding Generator",
      },
      { key: "video_library", label: "Video Library" },
      {
        key: "resume_format_guide",
        label: "Resume Format Guide",
      },
      { key: "notes_tool", label: "Notes Tool" },
    ],
    []
  );

  const toolCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    trackedTools.forEach((tool) => {
      counts[tool.key] = 0;
    });

    displayActivity.forEach((row) => {
      const tool = (row.tool_name || "").toLowerCase();
      if (!tool) return;

      const match = trackedTools.find(
        (item) => item.key === tool
      );

      if (match) {
        counts[match.key] += 1;
      }
    });

    return counts;
  }, [displayActivity, trackedTools]);

  const liveFeed = useMemo(
    () => displayActivity.slice(0, 100),
    [displayActivity]
  );

  const historyFeed = useMemo(() => {
    const search =
      historyParticipantSearch.trim().toLowerCase();

    return activityWithPhone.filter((row) => {
      const participant =
        (row.full_name || "").toLowerCase();
      const email = (row.email || "").toLowerCase();
      const phone = (row.phone || "").toLowerCase();
      const toolName = (row.tool_name || "").toLowerCase();
      const rowDate = toDate(row.created_at);

      const matchesSearch =
        !search ||
        participant.includes(search) ||
        email.includes(search) ||
        phone.includes(search);

      const matchesTool =
        historyToolFilter === "all" ||
        toolName === historyToolFilter;

      const matchesDate =
        (!historyStart ||
          (rowDate && rowDate >= historyStart)) &&
        (!historyEnd ||
          (rowDate && rowDate <= historyEnd));

      return matchesSearch && matchesTool && matchesDate;
    });
  }, [
    activityWithPhone,
    historyParticipantSearch,
    historyToolFilter,
    historyStart,
    historyEnd,
  ]);

  const dailyTrend = useMemo(() => {
    const bucket = new Map<string, number>();

    displayActivity.forEach((row) => {
      const date = toDate(row.created_at);
      if (!date) return;

      const key = `${date.getMonth() + 1}/${date.getDate()}`;
      bucket.set(key, (bucket.get(key) || 0) + 1);
    });

    return [...bucket.entries()]
      .map(([label, count]) => ({ label, count }))
      .slice(-12);
  }, [displayActivity]);

  const toolBreakdown = useMemo(() => {
    return trackedTools
      .map((tool) => ({
        label: tool.label,
        key: tool.key,
        count: toolCounts[tool.key] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [trackedTools, toolCounts]);

  const maxTrendCount = dailyTrend.length
    ? Math.max(...dailyTrend.map((d) => d.count))
    : 1;

  const maxToolCount = toolBreakdown.length
    ? Math.max(...toolBreakdown.map((d) => d.count))
    : 1;

  const selectedParticipantOptions = useMemo(() => {
    return filteredParticipants.map((row) => ({
      key:
        row.user_id || row.email || row.phone || row.id || "",
      name:
        row.full_name ||
        row.email ||
        row.phone ||
        "Participant",
      email: row.email || "",
      phone: row.phone || "",
    }));
  }, [filteredParticipants]);

  const selectedParticipantActivity = useMemo(() => {
    if (!supportParticipantKey) return [];

    return activityWithPhone.filter((row) => {
      const key =
        row.user_id || row.email || row.phone || row.id || "";

      return key === supportParticipantKey;
    });
  }, [activityWithPhone, supportParticipantKey]);

  const selectedParticipantLatestActivity =
    selectedParticipantActivity[0] || null;

  const selectedParticipantCareerMap =
    selectedParticipantActivity.find(
      (row) =>
        (row.tool_name || "").toLowerCase() === "career_map"
    );

  const selectedParticipantJobLog =
    selectedParticipantActivity.find(
      (row) =>
        (row.tool_name || "").toLowerCase() ===
        "job_log_generator"
    );

  const supportActionsFiltered = useMemo(() => {
    const q = participantSearch.trim().toLowerCase();

    if (!q) return supportActions;

    return supportActions.filter((item) => {
      return (
        item.participantName.toLowerCase().includes(q) ||
        (item.participantEmail || "")
          .toLowerCase()
          .includes(q) ||
        (item.participantPhone || "")
          .toLowerCase()
          .includes(q)
      );
    });
  }, [supportActions, participantSearch]);

  const selectedOutcome = useMemo(() => {
    if (!outcomeParticipantKey) return null;

    return (
      participantOutcomes.find(
        (item) =>
          item.participantKey === outcomeParticipantKey
      ) || null
    );
  }, [participantOutcomes, outcomeParticipantKey]);

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
      selectedOutcome.startedWorkingDate || ""
    );
    setCompany(selectedOutcome.company || "");
    setPosition(selectedOutcome.position || "");
    setWorkLocation(selectedOutcome.workLocation || "");
    setStartedTrainingDate(
      selectedOutcome.startedTrainingDate || ""
    );
    setProgram(selectedOutcome.program || "");
    setTrainingLocation(
      selectedOutcome.trainingLocation || ""
    );
    setOutcomeNotes(selectedOutcome.notes || "");
  }, [selectedOutcome]);

  async function handleLogout() {
    setLoadingLogout(true);
    await supabase.auth.signOut();
    window.location.href = "/employer-partner-login";
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

    const next: SupportAction[] = [
      {
        id: `sa-${Date.now()}`,
        type: supportType,
        participantKey: supportParticipantKey,
        participantName: supportParticipantName,
        participantEmail: supportParticipantEmail,
        participantPhone: supportParticipantPhone,
        title: supportTitle.trim(),
        message: supportMessage.trim(),
        dueDate: supportDueDate || undefined,
        status: "Open",
        createdAt: new Date().toISOString(),
      },
      ...supportActions,
    ];

    persistSupportActions(next);

    setSupportTitle("");
    setSupportMessage("");
    setSupportDueDate("");
    setMessage("Support action saved.");
  }

  function toggleSupportActionStatus(id: string) {
    const next: SupportAction[] = supportActions.map(
      (item) => {
        if (item.id !== id) return item;

        return {
          ...item,
          status:
            item.status === "Open"
              ? "Completed"
              : "Open",
        };
      }
    );

    persistSupportActions(next);
  }

  function deleteSupportAction(id: string) {
    persistSupportActions(
      supportActions.filter((item) => item.id !== id)
    );
  }

  function saveParticipantOutcome() {
    if (!outcomeParticipantKey || !outcomeParticipantName) {
      setMessage(
        "Please select a participant before saving outcomes."
      );
      return;
    }

    const nextRecord: ParticipantOutcome = {
      id: selectedOutcome?.id || `outcome-${Date.now()}`,
      participantKey: outcomeParticipantKey,
      participantName: outcomeParticipantName,
      participantEmail: outcomeParticipantEmail,
      participantPhone: outcomeParticipantPhone,
      startedWorkingDate:
        startedWorkingDate || undefined,
      company: company.trim() || undefined,
      position: position.trim() || undefined,
      workLocation: workLocation.trim() || undefined,
      startedTrainingDate:
        startedTrainingDate || undefined,
      program: program.trim() || undefined,
      trainingLocation:
        trainingLocation.trim() || undefined,
      notes: outcomeNotes.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    const others = participantOutcomes.filter(
      (item) =>
        item.participantKey !== outcomeParticipantKey
    );

    persistOutcomes([nextRecord, ...others]);
    setMessage("Participant outcome saved.");
  }

  function selectSupportParticipant(value: string) {
    setSupportParticipantKey(value);

    const selected = selectedParticipantOptions.find(
      (item) => item.key === value
    );

    setSupportParticipantName(selected?.name || "");
    setSupportParticipantEmail(selected?.email || "");
    setSupportParticipantPhone(selected?.phone || "");
  }

  function selectOutcomeParticipant(value: string) {
    setOutcomeParticipantKey(value);

    const selected = selectedParticipantOptions.find(
      (item) => item.key === value
    );

    setOutcomeParticipantName(selected?.name || "");
    setOutcomeParticipantEmail(selected?.email || "");
    setOutcomeParticipantPhone(selected?.phone || "");
  }

  if (loading) {
    return (
      <main style={styles.page}>
        <div style={styles.centerWrap}>
          Loading Partner Dashboard...
        </div>
      </main>
    );
  }

  return (
    <main style={styles.page}>
      <style>{`
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .45; transform: scale(.82); }
        }

        @keyframes riseIn {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }

        @keyframes slideGlow {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }

        @media (max-width: 900px) {
          .hm-summary-grid,
          .hm-graph-grid,
          .hm-tool-grid,
          .hm-filter-grid,
          .hm-history-filter-grid,
          .hm-form-grid {
            grid-template-columns: 1fr !important;
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
              View participant engagement, platform activity,
              career tool usage, support actions, and outcomes.
            </p>

            <p style={styles.subtleLine}>
              Partner:{" "}
              {partner?.contact_name ||
                partner?.account_holder ||
                partner?.contact_email ||
                "Authorized Partner"}
            </p>

            {partner?.referral_code ? (
              <p style={styles.subtleLine}>
                Partner Code: {partner.referral_code}
              </p>
            ) : null}

            <div style={styles.liveMetaRow}>
              <span style={styles.liveBadge}>
                <span style={styles.liveDot} />
                Live
              </span>

              <span style={styles.lastUpdated}>
                Last updated: {lastUpdated || "—"}
              </span>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() =>
                setRangeMode(
                  rangeMode === "period"
                    ? "custom"
                    : "period"
                )
              }
              style={styles.secondaryButton}
            >
              {rangeMode === "period"
                ? "Use Custom Date Range"
                : "Use Standard Reporting Period"}
            </button>

            <button
              type="button"
              onClick={() => loadDashboard()}
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
          <div style={styles.notice}>{message}</div>
        ) : null}

        <section style={styles.card}>
          <div style={styles.tabRow}>
            {[
              ["overview", "Overview"],
              ["live", "Live Activity"],
              ["history", "History"],
              ["tools", "Tool Usage"],
              ["support", "Support & Outcomes"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() =>
                  setActiveTab(key as DashboardTab)
                }
                style={{
                  ...styles.tabButton,
                  ...(activeTab === key
                    ? styles.tabButtonActive
                    : {}),
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </section>

        {activeTab !== "history" ? (
          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <div>
                <p style={styles.sectionKicker}>
                  REPORTING RANGE
                </p>

                <h2 style={styles.sectionTitle}>
                  Dashboard Filters
                </h2>
              </div>
            </div>

            {rangeMode === "period" ? (
              <div
                className="hm-filter-grid"
                style={styles.filterGrid}
              >
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Reporting Period
                  </span>

                  <select
                    value={period}
                    onChange={(e) =>
                      setPeriod(
                        e.target.value as PeriodKey
                      )
                    }
                    style={styles.select}
                  >
                    <option value="day">Today</option>
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
                  </select>
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Search Participant
                  </span>

                  <input
                    value={participantSearch}
                    onChange={(e) =>
                      setParticipantSearch(
                        e.target.value
                      )
                    }
                    placeholder="Name, email, or phone"
                    style={styles.input}
                  />
                </label>
              </div>
            ) : (
              <div
                className="hm-form-grid"
                style={styles.manualStatsGrid}
              >
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Start Date
                  </span>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) =>
                      setCustomStartDate(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    End Date
                  </span>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) =>
                      setCustomEndDate(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Search Participant
                  </span>
                  <input
                    value={participantSearch}
                    onChange={(e) =>
                      setParticipantSearch(
                        e.target.value
                      )
                    }
                    placeholder="Name, email, or phone"
                    style={styles.input}
                  />
                </label>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "overview" ? (
          <>
            <section
              className="hm-summary-grid"
              style={styles.summaryGrid}
            >
              <div style={styles.metricCardBlue}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    Total Participants
                  </p>

                  <InfoBubble
                    title="Total Participants"
                    text="Unique participants currently associated with this partner account."
                  />
                </div>

                <p style={styles.summaryValue}>
                  {totalParticipants}
                </p>
              </div>

              <div style={styles.metricCardGreen}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    New This Month
                  </p>
                </div>

                <p style={styles.summaryValue}>
                  {newUsers.length}
                </p>
              </div>

              <div style={styles.metricCardPurple}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    Activity
                  </p>
                </div>

                <p style={styles.summaryValue}>
                  {displayActivity.length}
                </p>
              </div>

              <div style={styles.metricCardAmber}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    Logins
                  </p>
                </div>

                <p style={styles.summaryValue}>
                  {eventTypeGroups.logins}
                </p>
              </div>

              <div style={styles.metricCardNeutral}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    Activities Completed
                  </p>
                </div>

                <p style={styles.summaryValue}>
                  {eventTypeGroups.completions}
                </p>
              </div>

              <div style={styles.metricCardBlue}>
                <div style={styles.metricTop}>
                  <p style={styles.summaryLabel}>
                    Tool Uses
                  </p>
                </div>

                <p style={styles.summaryValue}>
                  {eventTypeGroups.generatorUses}
                </p>
              </div>
            </section>

            <section
              className="hm-graph-grid"
              style={styles.graphGrid}
            >
              <div style={styles.card}>
                <div style={styles.sectionTop}>
                  <div>
                    <p style={styles.sectionKicker}>
                      PLATFORM USE
                    </p>
                    <h2 style={styles.sectionTitle}>
                      HireMinds Activity
                    </h2>
                  </div>
                </div>

                <div style={styles.toggleRow}>
                  {(["day", "week", "month"] as const).map(
                    (item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() =>
                          setPlatformUseView(item)
                        }
                        style={{
                          ...styles.toggleButton,
                          ...(platformUseView === item
                            ? styles.toggleButtonActive
                            : {}),
                        }}
                      >
                        {item === "day"
                          ? "Today"
                          : item === "week"
                          ? "Week"
                          : "Month"}
                      </button>
                    )
                  )}
                </div>

                <div style={styles.usageValues}>
                  <div>
                    <p style={styles.usageValue}>
                      {usesBySelectedView}
                    </p>
                    <p style={styles.usageSubValue}>
                      Recorded uses for selected period
                    </p>
                  </div>

                  <div style={styles.referenceBox}>
                    <p style={styles.referenceLabel}>
                      All-Time Activity
                    </p>
                    <p style={styles.referenceValueSmall}>
                      {totalHireMindsUsesReference}
                    </p>
                  </div>
                </div>
              </div>

              <div style={styles.card}>
                <p style={styles.sectionKicker}>
                  SELECTED RANGE
                </p>

                <h2 style={styles.sectionTitle}>
                  {rangeMode === "period"
                    ? periodLabel(period)
                    : "Custom Range"}
                </h2>

                <div style={styles.usageValues}>
                  <div>
                    <p style={styles.usageValue}>
                      {displayActivity.length}
                    </p>
                    <p style={styles.usageSubValue}>
                      Total activity records
                    </p>
                  </div>

                  <div>
                    <p style={styles.usageValue}>
                      {eventTypeGroups.pageViews}
                    </p>
                    <p style={styles.usageSubValue}>
                      Page views
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <div>
                  <p style={styles.sectionKicker}>
                    ACTIVITY TREND
                  </p>
                  <h2 style={styles.sectionTitle}>
                    Recent Platform Activity
                  </h2>
                </div>
              </div>

              {dailyTrend.length === 0 ? (
                <p style={styles.emptyText}>
                  No activity was recorded for this
                  reporting range.
                </p>
              ) : (
                <div style={styles.verticalChart}>
                  {dailyTrend.map((item) => {
                    const height = Math.max(
                      8,
                      (item.count / maxTrendCount) * 100
                    );

                    return (
                      <div
                        key={item.label}
                        style={styles.verticalBarCol}
                      >
                        <span
                          style={styles.verticalBarCount}
                        >
                          {item.count}
                        </span>

                        <div
                          style={styles.verticalBarOuter}
                        >
                          <div
                            style={{
                              ...styles.verticalBarInnerBlue,
                              height: `${height}%`,
                            }}
                          />
                        </div>

                        <span
                          style={styles.verticalBarLabel}
                        >
                          {item.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        ) : null}

        {activeTab === "live" ? (
          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <div>
                <p style={styles.sectionKicker}>
                  LIVE ACTIVITY
                </p>

                <h2 style={styles.sectionTitle}>
                  Participant Activity Feed
                </h2>
              </div>

              <span style={styles.liveBadge}>
                <span style={styles.liveDot} />
                Auto-refreshing
              </span>
            </div>

            {liveFeed.length === 0 ? (
              <p style={styles.emptyText}>
                No activity is available for the
                selected reporting range.
              </p>
            ) : (
              <div style={styles.liveFeedWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Participant
                      </th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Activity</th>
                      <th style={styles.th}>Tool</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {liveFeed.map((row, index) => (
                      <tr
                        key={
                          row.id ||
                          `${row.created_at}-${index}`
                        }
                      >
                        <td style={styles.td}>
                          {row.full_name ||
                            "Participant"}
                        </td>
                        <td style={styles.td}>
                          {row.email || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.phone || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.event_type || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.tool_name ||
                            row.page_name ||
                            "—"}
                        </td>
                        <td style={styles.td}>
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "history" ? (
          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <div>
                <p style={styles.sectionKicker}>
                  ACTIVITY HISTORY
                </p>

                <h2 style={styles.sectionTitle}>
                  Search Participant History
                </h2>
              </div>
            </div>

            <div
              className="hm-history-filter-grid"
              style={styles.historyFilterGrid}
            >
              <input
                value={historyParticipantSearch}
                onChange={(e) =>
                  setHistoryParticipantSearch(
                    e.target.value
                  )
                }
                placeholder="Name, email, or phone"
                style={styles.input}
              />

              <select
                value={historyToolFilter}
                onChange={(e) =>
                  setHistoryToolFilter(e.target.value)
                }
                style={styles.select}
              >
                <option value="all">All Tools</option>

                {trackedTools.map((tool) => (
                  <option
                    key={tool.key}
                    value={tool.key}
                  >
                    {tool.label}
                  </option>
                ))}
              </select>

              <input
                type="date"
                value={historyStartDate}
                onChange={(e) =>
                  setHistoryStartDate(e.target.value)
                }
                style={styles.input}
              />

              <input
                type="date"
                value={historyEndDate}
                onChange={(e) =>
                  setHistoryEndDate(e.target.value)
                }
                style={styles.input}
              />
            </div>

            {historyFeed.length === 0 ? (
              <p style={styles.emptyText}>
                No matching activity was found.
              </p>
            ) : (
              <div style={styles.liveFeedWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>
                        Participant
                      </th>
                      <th style={styles.th}>Email</th>
                      <th style={styles.th}>Phone</th>
                      <th style={styles.th}>Event</th>
                      <th style={styles.th}>Tool/Page</th>
                      <th style={styles.th}>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {historyFeed.map((row, index) => (
                      <tr
                        key={
                          row.id ||
                          `${row.created_at}-${index}`
                        }
                      >
                        <td style={styles.td}>
                          {row.full_name ||
                            "Participant"}
                        </td>
                        <td style={styles.td}>
                          {row.email || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.phone || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.event_type || "—"}
                        </td>
                        <td style={styles.td}>
                          {row.tool_name ||
                            row.page_name ||
                            "—"}
                        </td>
                        <td style={styles.td}>
                          {formatDate(row.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        ) : null}

        {activeTab === "tools" ? (
          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <div>
                <p style={styles.sectionKicker}>
                  CAREER TOOLKIT
                </p>

                <h2 style={styles.sectionTitle}>
                  Tool Usage
                </h2>
              </div>
            </div>

            <div style={styles.horizontalChart}>
              {toolBreakdown.map((tool, index) => {
                const width =
                  maxToolCount > 0
                    ? (tool.count / maxToolCount) * 100
                    : 0;

                const barStyles = [
                  styles.horizontalBarBlue,
                  styles.horizontalBarGreen,
                  styles.horizontalBarPurple,
                  styles.horizontalBarAmber,
                  styles.horizontalBarTeal,
                  styles.horizontalBarPink,
                ];

                return (
                  <div
                    key={tool.key}
                    style={styles.horizontalRow}
                  >
                    <span
                      style={styles.horizontalLabel}
                    >
                      {tool.label}
                    </span>

                    <div style={styles.horizontalOuter}>
                      <div
                        style={{
                          ...barStyles[
                            index % barStyles.length
                          ],
                          width: `${width}%`,
                        }}
                      />
                    </div>

                    <span
                      style={styles.horizontalCount}
                    >
                      {tool.count}
                    </span>
                  </div>
                );
              })}
            </div>

            <div
              className="hm-tool-grid"
              style={styles.toolGrid}
            >
              {toolBreakdown.map((tool) => (
                <div
                  key={tool.key}
                  style={styles.toolCard}
                >
                  <p style={styles.toolCardLabel}>
                    {tool.label}
                  </p>

                  <p style={styles.toolCardValue}>
                    {tool.count}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {activeTab === "support" ? (
          <>
            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <div>
                  <p style={styles.sectionKicker}>
                    PARTICIPANT SUPPORT
                  </p>

                  <h2 style={styles.sectionTitle}>
                    Add Support Action
                  </h2>
                </div>
              </div>

              <div
                className="hm-form-grid"
                style={styles.manualStatsGrid}
              >
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Participant
                  </span>

                  <select
                    value={supportParticipantKey}
                    onChange={(e) =>
                      selectSupportParticipant(
                        e.target.value
                      )
                    }
                    style={styles.select}
                  >
                    <option value="">
                      Select participant
                    </option>

                    {selectedParticipantOptions.map(
                      (item) => (
                        <option
                          key={item.key}
                          value={item.key}
                        >
                          {item.name}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Action Type
                  </span>

                  <select
                    value={supportType}
                    onChange={(e) =>
                      setSupportType(
                        e.target
                          .value as SupportActionType
                      )
                    }
                    style={styles.select}
                  >
                    <option value="task">Task</option>
                    <option value="nudge">Nudge</option>
                    <option value="reminder">
                      Reminder
                    </option>
                  </select>
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Due Date
                  </span>

                  <input
                    type="date"
                    value={supportDueDate}
                    onChange={(e) =>
                      setSupportDueDate(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>
              </div>

              {supportParticipantKey ? (
                <div style={styles.selectedParticipantCard}>
                  <div
                    className="hm-form-grid"
                    style={styles.selectedParticipantGrid}
                  >
                    <div
                      style={styles.selectedParticipantItem}
                    >
                      <p
                        style={
                          styles.selectedParticipantLabel
                        }
                      >
                        Participant
                      </p>

                      <p
                        style={
                          styles.selectedParticipantValue
                        }
                      >
                        {supportParticipantName}
                      </p>
                    </div>

                    <div
                      style={styles.selectedParticipantItem}
                    >
                      <p
                        style={
                          styles.selectedParticipantLabel
                        }
                      >
                        Latest Activity
                      </p>

                      <p
                        style={
                          styles.selectedParticipantValue
                        }
                      >
                        {selectedParticipantLatestActivity
                          ? formatDate(
                              selectedParticipantLatestActivity.created_at
                            )
                          : "No recorded activity"}
                      </p>
                    </div>

                    <div
                      style={styles.selectedParticipantItem}
                    >
                      <p
                        style={
                          styles.selectedParticipantLabel
                        }
                      >
                        Career Activity
                      </p>

                      <p
                        style={
                          styles.selectedParticipantValue
                        }
                      >
                        Career Map:{" "}
                        {selectedParticipantCareerMap
                          ? "Used"
                          : "Not recorded"}
                        <br />
                        Job Log:{" "}
                        {selectedParticipantJobLog
                          ? "Used"
                          : "Not recorded"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              <div style={{ marginTop: 18 }}>
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>Title</span>

                  <input
                    value={supportTitle}
                    onChange={(e) =>
                      setSupportTitle(e.target.value)
                    }
                    placeholder="Example: Resume follow-up"
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Message / Notes
                  </span>

                  <textarea
                    value={supportMessage}
                    onChange={(e) =>
                      setSupportMessage(e.target.value)
                    }
                    placeholder="Add notes or instructions..."
                    style={styles.textarea}
                  />
                </label>
              </div>

              <div style={styles.notesActions}>
                <button
                  type="button"
                  onClick={addSupportAction}
                  style={styles.primaryButton}
                >
                  Save Support Action
                </button>
              </div>
            </section>

            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <div>
                  <p style={styles.sectionKicker}>
                    SUPPORT HISTORY
                  </p>

                  <h2 style={styles.sectionTitle}>
                    Saved Actions
                  </h2>
                </div>
              </div>

              {supportActionsFiltered.length === 0 ? (
                <p style={styles.emptyText}>
                  No support actions have been saved.
                </p>
              ) : (
                <div style={styles.supportList}>
                  {supportActionsFiltered.map((item) => (
                    <div
                      key={item.id}
                      style={styles.supportCard}
                    >
                      <div style={styles.supportCardTop}>
                        <div>
                          <p style={styles.supportType}>
                            {item.type}
                          </p>

                          <h3 style={styles.supportTitle}>
                            {item.title}
                          </h3>

                          <p style={styles.supportMeta}>
                            {item.participantName}
                            {item.dueDate
                              ? ` • Due ${formatShortDate(
                                  item.dueDate
                                )}`
                              : ""}
                          </p>
                        </div>

                        <span
                          style={
                            item.status === "Open"
                              ? styles.statusOpen
                              : styles.statusDone
                          }
                        >
                          {item.status}
                        </span>
                      </div>

                      {item.message ? (
                        <p style={styles.supportMessage}>
                          {item.message}
                        </p>
                      ) : null}

                      <div
                        style={styles.supportActionsRow}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            toggleSupportActionStatus(
                              item.id
                            )
                          }
                          style={styles.secondaryButton}
                        >
                          {item.status === "Open"
                            ? "Mark Completed"
                            : "Reopen"}
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteSupportAction(item.id)
                          }
                          style={styles.dangerButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section style={styles.card}>
              <div style={styles.sectionTop}>
                <div>
                  <p style={styles.sectionKicker}>
                    PARTICIPANT OUTCOMES
                  </p>

                  <h2 style={styles.sectionTitle}>
                    Employment & Training Outcomes
                  </h2>
                </div>
              </div>

              <label style={styles.fieldWrap}>
                <span style={styles.label}>
                  Participant
                </span>

                <select
                  value={outcomeParticipantKey}
                  onChange={(e) =>
                    selectOutcomeParticipant(
                      e.target.value
                    )
                  }
                  style={styles.select}
                >
                  <option value="">
                    Select participant
                  </option>

                  {selectedParticipantOptions.map(
                    (item) => (
                      <option
                        key={item.key}
                        value={item.key}
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </label>

              <div
                className="hm-form-grid"
                style={styles.outcomeFormGrid}
              >
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Started Working
                  </span>
                  <input
                    type="date"
                    value={startedWorkingDate}
                    onChange={(e) =>
                      setStartedWorkingDate(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Company
                  </span>
                  <input
                    value={company}
                    onChange={(e) =>
                      setCompany(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Position
                  </span>
                  <input
                    value={position}
                    onChange={(e) =>
                      setPosition(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Work Location
                  </span>
                  <input
                    value={workLocation}
                    onChange={(e) =>
                      setWorkLocation(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Started Training
                  </span>
                  <input
                    type="date"
                    value={startedTrainingDate}
                    onChange={(e) =>
                      setStartedTrainingDate(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Program
                  </span>
                  <input
                    value={program}
                    onChange={(e) =>
                      setProgram(e.target.value)
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Training Location
                  </span>
                  <input
                    value={trainingLocation}
                    onChange={(e) =>
                      setTrainingLocation(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>
              </div>

              <div style={{ marginTop: 16 }}>
                <label style={styles.fieldWrap}>
                  <span style={styles.label}>
                    Outcome Notes
                  </span>

                  <textarea
                    value={outcomeNotes}
                    onChange={(e) =>
                      setOutcomeNotes(e.target.value)
                    }
                    style={styles.textarea}
                  />
                </label>
              </div>

              <div style={styles.notesActions}>
                <button
                  type="button"
                  onClick={saveParticipantOutcome}
                  style={styles.primaryButton}
                >
                  Save Participant Outcome
                </button>
              </div>

              {selectedOutcome ? (
                <div style={styles.outcomePreviewCard}>
                  <p style={styles.sectionKicker}>
                    SAVED OUTCOME
                  </p>

                  <div
                    className="hm-form-grid"
                    style={styles.outcomePreviewGrid}
                  >
                    <div
                      style={styles.outcomePreviewItem}
                    >
                      <p
                        style={
                          styles.outcomePreviewLabel
                        }
                      >
                        Employment
                      </p>

                      <p
                        style={
                          styles.outcomePreviewValue
                        }
                      >
                        {selectedOutcome.company ||
                          "Not entered"}
                        <br />
                        {selectedOutcome.position || ""}
                      </p>
                    </div>

                    <div
                      style={styles.outcomePreviewItem}
                    >
                      <p
                        style={
                          styles.outcomePreviewLabel
                        }
                      >
                        Work Start
                      </p>

                      <p
                        style={
                          styles.outcomePreviewValue
                        }
                      >
                        {formatShortDate(
                          selectedOutcome.startedWorkingDate
                        )}
                      </p>
                    </div>

                    <div
                      style={styles.outcomePreviewItem}
                    >
                      <p
                        style={
                          styles.outcomePreviewLabel
                        }
                      >
                        Training
                      </p>

                      <p
                        style={
                          styles.outcomePreviewValue
                        }
                      >
                        {selectedOutcome.program ||
                          "Not entered"}
                      </p>
                    </div>

                    <div
                      style={styles.outcomePreviewItem}
                    >
                      <p
                        style={
                          styles.outcomePreviewLabel
                        }
                      >
                        Updated
                      </p>

                      <p
                        style={
                          styles.outcomePreviewValue
                        }
                      >
                        {formatDate(
                          selectedOutcome.updatedAt
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
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
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 18px 40px rgba(0,0,0,0.18)",
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(59,130,246,0.09), transparent 22%), linear-gradient(180deg, #050505 0%, #0d0d0f 100%)",
    color: "#e7e7e7",
    padding: "32px 24px 56px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  centerWrap: {
    minHeight: "70vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },

  shell: {
    maxWidth: 1480,
    margin: "0 auto",
    display: "grid",
    gap: 24,
  },

  headerCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 18,
    flexWrap: "wrap",
    background:
      "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: 24,
    padding: 24,
  },

  kicker: {
    margin: "0 0 8px",
    color: "#9a9a9a",
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  title: {
    margin: "0 0 10px",
    fontSize: 38,
    fontWeight: 700,
    color: "#f5f5f5",
  },

  subtitle: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: 16,
    lineHeight: 1.7,
  },

  subtleLine: {
    margin: "6px 0 0",
    color: "#a1a1aa",
    fontSize: 14,
  },

  headerActions: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
  },

  notice: {
    background: "rgba(250,204,21,0.08)",
    border: "1px solid rgba(250,204,21,0.24)",
    color: "#fde68a",
    borderRadius: 18,
    padding: "14px 16px",
    fontSize: 14,
    lineHeight: 1.6,
  },

  card: {
    background:
      "linear-gradient(180deg, #141414 0%, #181818 100%)",
    border: "1px solid #262626",
    borderRadius: 24,
    padding: 24,
  },

  sectionTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 18,
  },

  sectionKicker: {
    margin: "0 0 8px",
    color: "#9ca3af",
    fontSize: 12,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
  },

  sectionTitle: {
    margin: 0,
    fontSize: 28,
    lineHeight: 1.1,
    fontWeight: 700,
    color: "#f5f5f5",
  },

  infoWrap: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },

  infoButton: {
    width: 20,
    height: 20,
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.18)",
    background: "#111111",
    color: "#f5f5f5",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },

  infoPopup: {
    position: "absolute",
    top: 28,
    right: 0,
    width: 260,
    zIndex: 10,
    background: "#111111",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 14,
    padding: 12,
    boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
  },

  infoTitle: {
    margin: "0 0 6px",
    color: "#ffffff",
    fontSize: 13,
    fontWeight: 700,
  },

  infoText: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: 12,
    lineHeight: 1.6,
  },

  filterGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
  },

  historyFilterGrid: {
    display: "grid",
    gridTemplateColumns: "1.4fr 1fr 1fr 1fr",
    gap: 16,
    marginBottom: 18,
  },

  tabRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  tabButton: {
    padding: "10px 14px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },

  tabButtonActive: {
    background: "#f5f5f5",
    color: "#111111",
  },

  liveMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginTop: 10,
    flexWrap: "wrap",
  },

  liveBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 12px",
    borderRadius: 999,
    background: "rgba(34,197,94,0.12)",
    color: "#bbf7d0",
    border: "1px solid rgba(34,197,94,0.22)",
    fontSize: 13,
    fontWeight: 700,
  },

  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "#22c55e",
    display: "inline-block",
    animation: "pulseDot 1.8s infinite ease-in-out",
  },

  lastUpdated: {
    color: "#a1a1aa",
    fontSize: 13,
  },

  toggleRow: {
    display: "flex",
    gap: 8,
    marginBottom: 14,
    flexWrap: "wrap",
  },

  toggleButton: {
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#0f0f10",
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },

  toggleButtonActive: {
    background:
      "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)",
    color: "#09090b",
    border: "1px solid #d1d5db",
  },

  usageValues: {
    display: "flex",
    justifyContent: "space-between",
    gap: 14,
    alignItems: "stretch",
  },

  usageValue: {
    margin: "0 0 4px",
    color: "#ffffff",
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1,
  },

  usageSubValue: {
    margin: 0,
    color: "#a1a1aa",
    fontSize: 13,
  },

  referenceBox: {
    minWidth: 160,
    padding: "10px 12px",
    borderRadius: 16,
    background: "rgba(59,130,246,0.09)",
    border: "1px solid rgba(59,130,246,0.22)",
    alignSelf: "flex-start",
  },

  referenceLabel: {
    margin: "0 0 6px",
    color: "#93c5fd",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  referenceValueSmall: {
    margin: 0,
    color: "#eff6ff",
    fontSize: 16,
    fontWeight: 700,
    lineHeight: 1.2,
  },

  liveFeedWrap: {
    maxHeight: 480,
    overflow: "auto",
    borderRadius: 18,
    border: "1px solid #2b2b2e",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #2c2c2c",
    color: "#a1a1aa",
    fontSize: 13,
    fontWeight: 700,
    background: "#121214",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #232323",
    color: "#f1f5f9",
    fontSize: 14,
    verticalAlign: "top",
    background: "#171719",
  },

  emptyText: {
    margin: 0,
    color: "#c8c8c8",
    fontSize: 15,
    lineHeight: 1.7,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(3, minmax(0, 1fr))",
    gap: 16,
  },

  metricCardBlue: {
    ...baseMetricCard,
    background:
      "linear-gradient(180deg, rgba(30,64,175,0.24) 0%, rgba(20,20,24,1) 100%)",
  },

  metricCardGreen: {
    ...baseMetricCard,
    background:
      "linear-gradient(180deg, rgba(22,163,74,0.22) 0%, rgba(20,20,24,1) 100%)",
  },

  metricCardPurple: {
    ...baseMetricCard,
    background:
      "linear-gradient(180deg, rgba(126,34,206,0.22) 0%, rgba(20,20,24,1) 100%)",
  },

  metricCardAmber: {
    ...baseMetricCard,
    background:
      "linear-gradient(180deg, rgba(217,119,6,0.22) 0%, rgba(20,20,24,1) 100%)",
  },

  metricCardNeutral: {
    ...baseMetricCard,
    background:
      "linear-gradient(180deg, rgba(115,115,115,0.22) 0%, rgba(20,20,24,1) 100%)",
  },

  metricTop: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },

  summaryLabel: {
    margin: 0,
    color: "#d4d4d8",
    fontSize: 13,
  },

  summaryValue: {
    margin: 0,
    color: "#ffffff",
    fontSize: 34,
    fontWeight: 700,
    lineHeight: 1,
  },

  graphGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 24,
  },

  verticalChart: {
    height: 280,
    display: "grid",
    gridTemplateColumns:
      "repeat(12, minmax(0, 1fr))",
    gap: 10,
    alignItems: "end",
    marginTop: 16,
  },

  verticalBarCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  },

  verticalBarOuter: {
    height: 200,
    width: "100%",
    borderRadius: 18,
    background: "#0f0f10",
    border: "1px solid #2a2a2d",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
  },

  verticalBarInnerBlue: {
    width: "100%",
    borderRadius: "16px 16px 0 0",
    background:
      "linear-gradient(180deg, #60a5fa 0%, #2563eb 70%, #1d4ed8 100%)",
    transformOrigin: "bottom",
    animation: "riseIn 700ms ease-out",
  },

  verticalBarCount: {
    color: "#e5e7eb",
    fontSize: 12,
    fontWeight: 700,
  },

  verticalBarLabel: {
    color: "#a1a1aa",
    fontSize: 12,
    textAlign: "center",
  },

  horizontalChart: {
    display: "grid",
    gap: 14,
    marginTop: 16,
  },

  horizontalRow: {
    display: "grid",
    gridTemplateColumns: "190px 1fr 42px",
    gap: 12,
    alignItems: "center",
  },

  horizontalLabel: {
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 1.4,
  },

  horizontalOuter: {
    height: 16,
    width: "100%",
    borderRadius: 999,
    background: "#0f0f10",
    border: "1px solid #2a2a2d",
    overflow: "hidden",
  },

  horizontalBarBlue: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #60a5fa, #2563eb, #60a5fa)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalBarGreen: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #4ade80, #16a34a, #4ade80)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalBarPurple: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #c084fc, #7e22ce, #c084fc)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalBarAmber: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #fbbf24, #d97706, #fbbf24)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalBarTeal: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #5eead4, #0f766e, #5eead4)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalBarPink: {
    height: "100%",
    borderRadius: 999,
    background:
      "linear-gradient(90deg, #f9a8d4, #db2777, #f9a8d4)",
    backgroundSize: "200% 200%",
    animation: "slideGlow 2.8s linear infinite",
  },

  horizontalCount: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 700,
    textAlign: "right",
  },

  toolGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  toolCard: {
    border: "1px solid #2c2c2c",
    borderRadius: 18,
    padding: 14,
    background: "#101010",
  },

  toolCardLabel: {
    margin: "0 0 8px",
    color: "#d4d4d8",
    fontSize: 13,
  },

  toolCardValue: {
    margin: 0,
    color: "#fff",
    fontSize: 28,
    fontWeight: 700,
  },

  manualStatsGrid: {
    marginTop: 16,
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
  },

  outcomeFormGrid: {
    marginTop: 18,
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  fieldWrap: {
    display: "grid",
    gap: 8,
  },

  label: {
    color: "#d4d4d8",
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.5,
  },

  input: {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: 15,
    boxSizing: "border-box",
    outline: "none",
  },

  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 16,
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: 14,
    boxSizing: "border-box",
  },

  textarea: {
    width: "100%",
    minHeight: 120,
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid #313131",
    background: "#0f0f10",
    color: "#f4f4f5",
    fontSize: 15,
    resize: "vertical",
    boxSizing: "border-box",
    outline: "none",
  },

  notesActions: {
    marginTop: 16,
  },

  primaryButton: {
    padding: "12px 18px",
    borderRadius: 16,
    border: "1px solid #e5e7eb",
    background:
      "linear-gradient(180deg, #f5f5f5 0%, #d4d4d8 100%)",
    color: "#09090b",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "#111111",
    color: "#f5f5f5",
    fontWeight: 700,
    cursor: "pointer",
  },

  logoutButton: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(148,163,184,0.28)",
    background:
      "linear-gradient(180deg, #0f244d 0%, #112b5f 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  dangerButton: {
    padding: "12px 16px",
    borderRadius: 16,
    border: "1px solid rgba(248,113,113,.25)",
    background: "rgba(127,29,29,.18)",
    color: "#fecaca",
    fontWeight: 700,
    cursor: "pointer",
  },

  supportList: {
    display: "grid",
    gap: 14,
  },

  supportCard: {
    border: "1px solid #2c2c2c",
    borderRadius: 18,
    padding: 16,
    background: "#101010",
  },

  supportCardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    flexWrap: "wrap",
  },

  supportType: {
    margin: "0 0 6px",
    color: "#93c5fd",
    fontSize: 11,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
  },

  supportTitle: {
    margin: "0 0 8px",
    color: "#f5f5f5",
    fontSize: 18,
    fontWeight: 700,
  },

  supportMeta: {
    margin: 0,
    color: "#a1a1aa",
    fontSize: 13,
  },

  supportMessage: {
    margin: "14px 0 0",
    color: "#e5e7eb",
    fontSize: 14,
    lineHeight: 1.7,
  },

  supportActionsRow: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 14,
  },

  statusOpen: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color: "#bbf7d0",
    background: "rgba(34,197,94,0.12)",
    border: "1px solid rgba(34,197,94,0.24)",
  },

  statusDone: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    color: "#e5e7eb",
    background: "rgba(115,115,115,0.16)",
    border: "1px solid rgba(255,255,255,0.12)",
  },

  selectedParticipantCard: {
    marginTop: 18,
    border: "1px solid #2c2c2c",
    borderRadius: 18,
    padding: 18,
    background: "#101010",
  },

  selectedParticipantGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 14,
  },

  selectedParticipantItem: {
    border: "1px solid #242424",
    borderRadius: 16,
    padding: 14,
    background: "#0d0d0f",
  },

  selectedParticipantLabel: {
    margin: "0 0 8px",
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  selectedParticipantValue: {
    margin: 0,
    color: "#f5f5f5",
    fontSize: 14,
    lineHeight: 1.6,
  },

  outcomePreviewCard: {
    marginTop: 18,
    border: "1px solid #2c2c2c",
    borderRadius: 18,
    padding: 18,
    background: "#101010",
  },

  outcomePreviewGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  outcomePreviewItem: {
    border: "1px solid #242424",
    borderRadius: 16,
    padding: 14,
    background: "#0d0d0f",
  },

  outcomePreviewLabel: {
    margin: "0 0 8px",
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.06em",
  },

  outcomePreviewValue: {
    margin: 0,
    color: "#f5f5f5",
    fontSize: 14,
    lineHeight: 1.6,
  },
};
