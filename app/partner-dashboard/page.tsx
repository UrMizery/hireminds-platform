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

/* =========================================================
   TYPES
========================================================= */

type DashboardTab =
  | "overview"
  | "live"
  | "history"
  | "tools"
  | "meeting_requests"
  | "availability"
  | "career_connect"
  | "reports";

type PeriodKey =
  | "all"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "fiscal"
  | "custom";

type OptionalMetricKey =
  | "tool_engagements"
  | "completed_activities"
  | "activity_records"
  | "code_comparison"
  | "most_used_tool"
  | "career_services"
  | "document_submissions"
  | "cancellations";

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

type ParticipantSummaryRow = {
  key: string;
  participant: ParticipantRow;
  referralCode: string;
  signupDate?: string | null;
  lastActivity?: string | null;
  activityCount: number;
  toolUses: number;
  completions: number;
  documentSubmissions: number;
  cancellations: number;
};

type MeetingRequestRow = {
  id: string;
  user_id: string;
  participant_name?: string | null;
  participant_email?: string | null;
  referral_code?: string | null;
  service_type: string;
  other_service?: string | null;
  notes?: string | null;
  admin_notes?: string | null;
  status: string;
  confirmed_slot_id?: string | null;

  participant_confirmed_at?: string | null;
  participant_response_at?: string | null;

  reschedule_requested_at?: string | null;
  reschedule_slot_id?: string | null;
  reschedule_note?: string | null;

  cancellation_note?: string | null;

  policy_agreed?: boolean | null;
  policy_agreed_at?: string | null;

  cancelled_at?: string | null;

  cancellation_source?:
    | "participant"
    | "admin"
    | null;

  created_at?: string | null;
  updated_at?: string | null;
};

type MeetingChoiceRow = {
  id: string;
  request_id: string;
  user_id: string;
  slot_id: string;
  preference_order: number;
  created_at?: string | null;
};

type AttachmentRow = {
  id: string;
  request_id: string;
  user_id: string;
  file_name: string;
  file_path: string;
  file_type?: string | null;
  file_size?: number | null;
  created_at?: string | null;
};

type AvailabilitySlotRow = {
  id: string;
  start_time: string;
  end_time?: string | null;
  label?: string | null;
  is_active?: boolean | null;
  max_requests?: number | null;

  booked_request_id?: string | null;

  created_by?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type CareerConnectSettings = {
  id: string;
  meeting_link: string;
  open_room_title: string;
  open_room_schedule: string;
  open_room_time: string;
  doors_open: string;
  doors_close: string;
  open_room_note: string;
};

type WorkforceSessionServiceRow = {
  id?: string | null;
  session_id?: string | null;
  user_id?: string | null;
  service_type?: string | null;
  service_label?: string | null;
  created_at?: string | null;
};

type MeetingCancellationRow = {
  id: string;
  request_id: string;
  user_id: string;
  participant_name?: string | null;
  participant_email?: string | null;
  referral_code?: string | null;

  cancellation_source:
    | "participant"
    | "admin";

  cancelled_at: string;
  created_at?: string | null;
};

/* =========================================================
   CONSTANTS
========================================================= */

const SYSTEM_ADMIN_EMAIL =
  "info@hireminds.app";

const DEFAULT_CAREER_CONNECT_SETTINGS: CareerConnectSettings =
  {
    id: "default",

    meeting_link:
      "https://hire-minds.whereby.com/hireminds-open-room",

    open_room_title:
      "Open Room",

    open_room_schedule:
      "Last Tuesday monthly",

    open_room_time:
      "6:00 PM – 7:00 PM",

    doors_open:
      "5:50 PM",

    doors_close:
      "6:15 PM",

    open_room_note:
      "Live Q&A, networking, resource drops, opportunities, and career conversations.",
  };

const SERVICE_LABELS: Record<
  string,
  string
> = {
  open_room:
    "Open Room",

  resume_support:
    "Resume Support",

  cover_letter_review:
    "Cover Letter Review",

  career_coaching:
    "1:1 Career Coaching",

  mock_interview:
    "Mock Interview",

  workforce_training:
    "Workforce Development Training",

  job_search_assistance:
    "Job Search Assistance",

  other:
    "Other",
};

/* =========================================================
   TIME OPTIONS
========================================================= */

function createTimeOptions() {
  const times: {
    value: string;
    label: string;
  }[] = [];

  for (
    let hour = 6;
    hour <= 22;
    hour++
  ) {
    for (
      const minute of [
        0,
        15,
        30,
        45,
      ]
    ) {
      if (
        hour === 22 &&
        minute > 0
      ) {
        continue;
      }

      const value =
        `${String(
          hour
        ).padStart(
          2,
          "0"
        )}:${String(
          minute
        ).padStart(
          2,
          "0"
        )}`;

      const date =
        new Date();

      date.setHours(
        hour,
        minute,
        0,
        0
      );

      const label =
        date.toLocaleTimeString(
          [],
          {
            hour:
              "numeric",

            minute:
              "2-digit",
          }
        );

      times.push({
        value,
        label,
      });
    }
  }

  return times;
}

const TIME_OPTIONS =
  createTimeOptions();

/* =========================================================
   HELPERS
========================================================= */

function formatDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

function formatShortDate(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleDateString();
}

function formatAppointment(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    [],
    {
      weekday:
        "short",

      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",

      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
}

function formatTimeOnly(
  value?: string | null
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleTimeString(
    [],
    {
      hour:
        "numeric",

      minute:
        "2-digit",
    }
  );
}

function toDate(
  value?: string | null
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

function startOfToday() {
  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}

function startOfWeek() {
  const now =
    new Date();

  const day =
    now.getDay();

  const diff =
    day === 0
      ? 6
      : day - 1;

  const start =
    new Date(
      now
    );

  start.setDate(
    now.getDate() -
      diff
  );

  start.setHours(
    0,
    0,
    0,
    0
  );

  return start;
}

function startOfMonth() {
  const now =
    new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    1
  );
}

function startOfQuarter() {
  const now =
    new Date();

  const quarterStartMonth =
    Math.floor(
      now.getMonth() /
        3
    ) * 3;

  return new Date(
    now.getFullYear(),
    quarterStartMonth,
    1
  );
}

function startOfFiscalYear() {
  const now =
    new Date();

  const fiscalStartMonth =
    6;

  const year =
    now.getMonth() >=
    fiscalStartMonth
      ? now.getFullYear()
      : now.getFullYear() -
        1;

  return new Date(
    year,
    fiscalStartMonth,
    1
  );
}

function getPeriodStart(
  period: PeriodKey
) {
  switch (
    period
  ) {
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

function getPeriodLabel(
  period: PeriodKey,
  startDate: string,
  endDate: string
) {
  if (
    period ===
    "all"
  ) {
    return "All Time";
  }

  if (
    period ===
    "day"
  ) {
    return "Today";
  }

  if (
    period ===
    "week"
  ) {
    return "This Week";
  }

  if (
    period ===
    "month"
  ) {
    return "This Month";
  }

  if (
    period ===
    "quarter"
  ) {
    return "This Quarter";
  }

  if (
    period ===
    "fiscal"
  ) {
    return "Fiscal Year";
  }

  if (
    period ===
    "custom"
  ) {
    if (
      startDate &&
      endDate
    ) {
      return `${formatShortDate(
        `${startDate}T00:00:00`
      )} – ${formatShortDate(
        `${endDate}T00:00:00`
      )}`;
    }

    return "Custom Date Range";
  }

  return "All Time";
}

function participantKey(
  row:
    | ParticipantRow
    | ActivityRow
) {
  return (
    row.user_id ||
    row.email?.toLowerCase() ||
    row.id ||
    ""
  );
}

function serviceLabel(
  serviceType?:
    | string
    | null,

  otherService?:
    | string
    | null
) {
  if (
    !serviceType
  ) {
    return "—";
  }

  if (
    serviceType ===
      "other" &&
    otherService
  ) {
    return otherService;
  }

  return (
    SERVICE_LABELS[
      serviceType
    ] ||
    serviceType
  );
}

function calculateDurationMinutes(
  startTime: string,
  endTime: string
) {
  if (
    !startTime ||
    !endTime
  ) {
    return null;
  }

  const [
    startHour,
    startMinute,
  ] = startTime
    .split(":")
    .map(Number);

  const [
    endHour,
    endMinute,
  ] = endTime
    .split(":")
    .map(Number);

  const startMinutes =
    startHour *
      60 +
    startMinute;

  const endMinutes =
    endHour *
      60 +
    endMinute;

  return (
    endMinutes -
    startMinutes
  );
}

function formatDuration(
  minutes:
    | number
    | null
) {
  if (
    minutes ===
    null
  ) {
    return "";
  }

  if (
    minutes <= 0
  ) {
    return "End time must be after start time";
  }

  if (
    minutes < 60
  ) {
    return `${minutes} minutes`;
  }

  if (
    minutes === 60
  ) {
    return "1 hour";
  }

  const hours =
    Math.floor(
      minutes /
        60
    );

  const remainder =
    minutes %
    60;

  if (
    remainder ===
    0
  ) {
    return `${hours} hours`;
  }

  return `${hours} hr ${remainder} min`;
}

function requestStatusStyle(
  status: string
): CSSProperties {
  const normalized =
    status.toLowerCase();

  if (
    normalized ===
    "approved"
  ) {
    return {
      background:
        "rgba(250,204,21,.10)",

      color:
        "#fde68a",

      border:
        "1px solid rgba(250,204,21,.25)",
    };
  }

  if (
    normalized ===
    "confirmed"
  ) {
    return {
      background:
        "rgba(34,197,94,.12)",

      color:
        "#86efac",

      border:
        "1px solid rgba(34,197,94,.25)",
    };
  }

  if (
    normalized ===
    "completed"
  ) {
    return {
      background:
        "rgba(59,130,246,.12)",

      color:
        "#bfdbfe",

      border:
        "1px solid rgba(59,130,246,.25)",
    };
  }

  if (
    normalized ===
      "cancelled" ||
    normalized ===
      "declined"
  ) {
    return {
      background:
        "rgba(248,113,113,.10)",

      color:
        "#fca5a5",

      border:
        "1px solid rgba(248,113,113,.22)",
    };
  }

  if (
    normalized ===
      "reschedule_requested" ||
    normalized ===
      "rescheduled"
  ) {
    return {
      background:
        "rgba(168,85,247,.10)",

      color:
        "#d8b4fe",

      border:
        "1px solid rgba(168,85,247,.22)",
    };
  }

  return {
    background:
      "rgba(250,204,21,.09)",

    color:
      "#fde68a",

    border:
      "1px solid rgba(250,204,21,.22)",
  };
}


function requestStatusLabel(
  status: string
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized ===
    "approved"
  ) {
    return "APPROVED • WAITING ON PARTICIPANT";
  }

  if (
    normalized ===
    "confirmed"
  ) {
    return "CONFIRMED";
  }

  if (
    normalized ===
    "pending"
  ) {
    return "PENDING REQUEST";
  }

  if (
    normalized ===
    "reschedule_requested"
  ) {
    return "RESCHEDULE REQUESTED";
  }

  if (
    normalized ===
    "rescheduled"
  ) {
    return "RESCHEDULED";
  }

  if (
    normalized ===
    "completed"
  ) {
    return "COMPLETED";
  }

  if (
    normalized ===
    "cancelled"
  ) {
    return "CANCELLED";
  }

  if (
    normalized ===
    "declined"
  ) {
    return "DECLINED";
  }

  return status
    .replaceAll("_", " ")
    .toUpperCase();
}

function requestStatusRank(
  status: string
) {
  const normalized =
    status.toLowerCase();

  const rank: Record<
    string,
    number
  > = {
    reschedule_requested: 0,
    pending: 1,
    approved: 2,
    confirmed: 3,
    rescheduled: 4,
    completed: 5,
    cancelled: 6,
    declined: 7,
  };

  return (
    rank[normalized] ??
    99
  );
}

function requestCardStatusStyle(
  status: string
): CSSProperties {
  const normalized =
    status.toLowerCase();

  if (
    normalized ===
    "confirmed"
  ) {
    return {
      borderLeft:
        "5px solid #22c55e",
      background:
        "linear-gradient(90deg, rgba(34,197,94,.055), #0f0f11 18%)",
    };
  }

  if (
    normalized ===
    "pending"
  ) {
    return {
      borderLeft:
        "5px solid #facc15",
      background:
        "linear-gradient(90deg, rgba(250,204,21,.05), #0f0f11 18%)",
    };
  }

  if (
    normalized ===
    "approved"
  ) {
    return {
      borderLeft:
        "5px solid #3b82f6",
      background:
        "linear-gradient(90deg, rgba(59,130,246,.055), #0f0f11 18%)",
    };
  }

  if (
    normalized ===
      "reschedule_requested" ||
    normalized ===
      "rescheduled"
  ) {
    return {
      borderLeft:
        "5px solid #a855f7",
      background:
        "linear-gradient(90deg, rgba(168,85,247,.055), #0f0f11 18%)",
    };
  }

  if (
    normalized ===
    "cancelled"
  ) {
    return {
      borderLeft:
        "5px solid #ef4444",
      background:
        "linear-gradient(90deg, rgba(239,68,68,.05), #0f0f11 18%)",
      opacity: 0.86,
    };
  }

  if (
    normalized ===
    "declined"
  ) {
    return {
      borderLeft:
        "5px solid #71717a",
      background:
        "linear-gradient(90deg, rgba(113,113,122,.06), #0f0f11 18%)",
      opacity: 0.82,
    };
  }

  if (
    normalized ===
    "completed"
  ) {
    return {
      borderLeft:
        "5px solid #60a5fa",
      background:
        "linear-gradient(90deg, rgba(96,165,250,.045), #0f0f11 18%)",
      opacity: 0.9,
    };
  }

  return {};
}

/* =========================================================
   PAGE
========================================================= */

export default function PartnerDashboardPage() {
  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    loadingLogout,
    setLoadingLogout,
  ] =
    useState(
      false
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<DashboardTab>(
      "overview"
    );

  const [
    partner,
    setPartner,
  ] =
    useState<PartnerRow | null>(
      null
    );

  const [
    currentUserEmail,
    setCurrentUserEmail,
  ] =
    useState(
      ""
    );

  const [
    participants,
    setParticipants,
  ] =
    useState<
      ParticipantRow[]
    >(
      []
    );

  const [
    activity,
    setActivity,
  ] =
    useState<
      ActivityRow[]
    >(
      []
    );

  const [
    workforceSessionServices,
    setWorkforceSessionServices,
  ] =
    useState<
      WorkforceSessionServiceRow[]
    >(
      []
    );

  const [
    lastUpdated,
    setLastUpdated,
  ] =
    useState(
      ""
    );

  const [
    participantSearch,
    setParticipantSearch,
  ] =
    useState(
      ""
    );

  /* =======================================================
     MEETING REQUESTS
  ======================================================= */

  const [
    meetingRequests,
    setMeetingRequests,
  ] =
    useState<
      MeetingRequestRow[]
    >(
      []
    );

  const [
    meetingChoices,
    setMeetingChoices,
  ] =
    useState<
      MeetingChoiceRow[]
    >(
      []
    );

  const [
    requestAttachments,
    setRequestAttachments,
  ] =
    useState<
      AttachmentRow[]
    >(
      []
    );

  const [
    meetingCancellations,
    setMeetingCancellations,
  ] =
    useState<
      MeetingCancellationRow[]
    >(
      []
    );

  const [
    requestFilter,
    setRequestFilter,
  ] =
    useState(
      "all"
    );

  const [
    requestSearch,
    setRequestSearch,
  ] =
    useState(
      ""
    );

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  const [
    availabilitySlots,
    setAvailabilitySlots,
  ] =
    useState<
      AvailabilitySlotRow[]
    >(
      []
    );

  const [
    availabilityDate,
    setAvailabilityDate,
  ] =
    useState(
      ""
    );

  const [
    availabilityStartTime,
    setAvailabilityStartTime,
  ] =
    useState(
      ""
    );

  const [
    availabilityEndTime,
    setAvailabilityEndTime,
  ] =
    useState(
      ""
    );

  const [
    newSlotLabel,
    setNewSlotLabel,
  ] =
    useState(
      ""
    );

  const [
    addingAvailability,
    setAddingAvailability,
  ] =
    useState(
      false
    );

  const [
    editingAvailabilityId,
    setEditingAvailabilityId,
  ] =
    useState<
      string | null
    >(
      null
    );

  /* =======================================================
     CAREER CONNECT
  ======================================================= */

  const [
    careerSettings,
    setCareerSettings,
  ] =
    useState<CareerConnectSettings>(
      DEFAULT_CAREER_CONNECT_SETTINGS
    );

  const [
    savingCareerSettings,
    setSavingCareerSettings,
  ] =
    useState(
      false
    );

  /* =======================================================
     REPORTS
  ======================================================= */

  const [
    selectedCodes,
    setSelectedCodes,
  ] =
    useState<
      string[]
    >(
      []
    );

  const [
    reportParticipantKey,
    setReportParticipantKey,
  ] =
    useState(
      "all"
    );

  const [
    reportPeriod,
    setReportPeriod,
  ] =
    useState<PeriodKey>(
      "all"
    );

  const [
    reportStartDate,
    setReportStartDate,
  ] =
    useState(
      ""
    );

  const [
    reportEndDate,
    setReportEndDate,
  ] =
    useState(
      ""
    );

  const [
    selectedOptionalMetrics,
    setSelectedOptionalMetrics,
  ] =
    useState<
      OptionalMetricKey[]
    >([
      "tool_engagements",
      "completed_activities",
      "career_services",
      "document_submissions",
      "code_comparison",
    ]);

  const mountedRef =
    useRef(
      true
    );

  useEffect(
    () => {
      mountedRef.current =
        true;

      return () => {
        mountedRef.current =
          false;
      };
    },
    []
  );

  /* =======================================================
     ADMIN STATUS
  ======================================================= */

  const isSystemAdmin =
    currentUserEmail.toLowerCase() ===
      SYSTEM_ADMIN_EMAIL.toLowerCase() ||
    partner?.account_type ===
      "super_admin";

  /* =======================================================
     LOAD DASHBOARD
  ======================================================= */

  const loadDashboard =
    useCallback(
      async () => {
        setLoading(
          true
        );

        setMessage(
          ""
        );

        const {
          data:
            authData,

          error:
            authError,
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

        setCurrentUserEmail(
          email
        );

        const {
          data:
            partnerRow,

          error:
            partnerError,
        } =
          await supabase
            .from(
              "partners"
            )
            .select(
              "*"
            )
            .eq(
              "contact_email",
              email
            )
            .maybeSingle();

        if (
          partnerError
        ) {
          setMessage(
            partnerError.message
          );

          setLoading(
            false
          );

          return;
        }

        if (
          !partnerRow
        ) {
          setMessage(
            "This account does not have Partner Dashboard access."
          );

          setLoading(
            false
          );

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
                ascending:
                  false,
              }
            );

        if (
          partnerRow.account_type !==
            "super_admin" &&
          email.toLowerCase() !==
            SYSTEM_ADMIN_EMAIL.toLowerCase()
        ) {
          participantQuery =
            participantQuery.eq(
              "referral_code",
              partnerRow.referral_code
            );
        }

        const {
          data:
            participantRows,

          error:
            participantError,
        } =
          await participantQuery;

        if (
          participantError
        ) {
          setMessage(
            participantError.message
          );

          setLoading(
            false
          );

          return;
        }

        let activityQuery =
          supabase
            .from(
              "user_activity"
            )
            .select(
              "id, user_id, full_name, email, referral_code, event_type, tool_name, page_name, created_at"
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            )
            .limit(
              10000
            );

        if (
          partnerRow.account_type !==
            "super_admin" &&
          email.toLowerCase() !==
            SYSTEM_ADMIN_EMAIL.toLowerCase()
        ) {
          activityQuery =
            activityQuery.eq(
              "referral_code",
              partnerRow.referral_code
            );
        }

        const {
          data:
            activityRows,

          error:
            activityError,
        } =
          await activityQuery;

        if (
          activityError
        ) {
          setMessage(
            activityError.message
          );

          setLoading(
            false
          );

          return;
        }

        const {
          data:
            serviceRows,

          error:
            serviceError,
        } =
          await supabase
            .from(
              "workforce_session_services"
            )
            .select(
              "id, session_id, user_id, service_type, service_label, created_at"
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            )
            .limit(
              10000
            );

        if (
          serviceError
        ) {
          console.error(
            "Service tracking load error:",
            serviceError
          );
        }

        if (
          !mountedRef.current
        ) {
          return;
        }

        setPartner(
          partnerRow as PartnerRow
        );

        setParticipants(
          (
            participantRows as ParticipantRow[]
          ) ||
            []
        );

        setActivity(
          (
            activityRows as ActivityRow[]
          ) ||
            []
        );

        setWorkforceSessionServices(
          (
            serviceRows as WorkforceSessionServiceRow[]
          ) ||
            []
        );

        setLastUpdated(
          new Date().toLocaleTimeString()
        );

        setLoading(
          false
        );
      },
      []
    );

  /* =======================================================
     LOAD ADMIN DATA
  ======================================================= */

  const loadAdminData =
    useCallback(
      async () => {
        const {
          data:
            authData,
        } =
          await supabase.auth.getUser();

        const email =
          authData.user?.email ||
          "";

        if (
          email.toLowerCase() !==
          SYSTEM_ADMIN_EMAIL.toLowerCase()
        ) {
          return;
        }

        const [
          requestsResult,
          choicesResult,
          attachmentsResult,
          availabilityResult,
          settingsResult,
          cancellationsResult,
        ] =
          await Promise.all([
            supabase
              .from(
                "meeting_requests"
              )
              .select(
                "*"
              )
              .order(
                "created_at",
                {
                  ascending:
                    false,
                }
              ),

            supabase
              .from(
                "meeting_request_choices"
              )
              .select(
                "*"
              )
              .order(
                "preference_order",
                {
                  ascending:
                    true,
                }
              ),

            supabase
              .from(
                "meeting_request_attachments"
              )
              .select(
                "*"
              )
              .order(
                "created_at",
                {
                  ascending:
                    true,
                }
              ),

            supabase
              .from(
                "availability_slots"
              )
              .select(
                "*"
              )
              .order(
                "start_time",
                {
                  ascending:
                    true,
                }
              ),

            supabase
              .from(
                "career_connect_settings"
              )
              .select(
                "*"
              )
              .eq(
                "id",
                "default"
              )
              .maybeSingle(),

            supabase
              .from(
                "meeting_cancellations"
              )
              .select(
                "*"
              )
              .order(
                "cancelled_at",
                {
                  ascending:
                    false,
                }
              ),
          ]);

        if (
          !requestsResult.error
        ) {
          setMeetingRequests(
            (
              requestsResult.data as MeetingRequestRow[]
            ) ||
              []
          );
        } else {
          console.error(
            requestsResult.error
          );
        }

        if (
          !choicesResult.error
        ) {
          setMeetingChoices(
            (
              choicesResult.data as MeetingChoiceRow[]
            ) ||
              []
          );
        } else {
          console.error(
            choicesResult.error
          );
        }

        if (
          !attachmentsResult.error
        ) {
          setRequestAttachments(
            (
              attachmentsResult.data as AttachmentRow[]
            ) ||
              []
          );
        } else {
          console.error(
            attachmentsResult.error
          );
        }

        if (
          !availabilityResult.error
        ) {
          setAvailabilitySlots(
            (
              availabilityResult.data as AvailabilitySlotRow[]
            ) ||
              []
          );
        } else {
          console.error(
            availabilityResult.error
          );
        }

        if (
          !cancellationsResult.error
        ) {
          setMeetingCancellations(
            (
              cancellationsResult.data as MeetingCancellationRow[]
            ) ||
              []
          );
        } else {
          console.error(
            "Cancellation load error:",
            cancellationsResult.error
          );
        }

        if (
          !settingsResult.error &&
          settingsResult.data
        ) {
          setCareerSettings({
            id:
              settingsResult.data.id ||
              "default",

            meeting_link:
              settingsResult.data.meeting_link ||
              DEFAULT_CAREER_CONNECT_SETTINGS.meeting_link,

            open_room_title:
              settingsResult.data.open_room_title ||
              DEFAULT_CAREER_CONNECT_SETTINGS.open_room_title,

            open_room_schedule:
              settingsResult.data.open_room_schedule ||
              DEFAULT_CAREER_CONNECT_SETTINGS.open_room_schedule,

            open_room_time:
              settingsResult.data.open_room_time ||
              DEFAULT_CAREER_CONNECT_SETTINGS.open_room_time,

            doors_open:
              settingsResult.data.doors_open ||
              DEFAULT_CAREER_CONNECT_SETTINGS.doors_open,

            doors_close:
              settingsResult.data.doors_close ||
              DEFAULT_CAREER_CONNECT_SETTINGS.doors_close,

            open_room_note:
              settingsResult.data.open_room_note ||
              DEFAULT_CAREER_CONNECT_SETTINGS.open_room_note,
          });
        }
      },
      []
    );

  useEffect(
    () => {
      loadDashboard();
    },
    [
      loadDashboard,
    ]
  );

  useEffect(
    () => {
      if (
        currentUserEmail.toLowerCase() ===
        SYSTEM_ADMIN_EMAIL.toLowerCase()
      ) {
        loadAdminData();
      }
    },
    [
      currentUserEmail,
      loadAdminData,
    ]
  );

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    setLoadingLogout(
      true
    );

    await supabase.auth.signOut();

    window.location.href =
      "/employer-partner-login";
  }

  /* =======================================================
     MEETING REQUEST HELPERS
  ======================================================= */

  function getRequestChoices(
    requestId: string
  ) {
    return meetingChoices
      .filter(
        (
          choice
        ) =>
          choice.request_id ===
          requestId
      )
      .sort(
        (
          a,
          b
        ) =>
          a.preference_order -
          b.preference_order
      );
  }

  function getSlot(
    slotId: string
  ) {
    return availabilitySlots.find(
      (
        slot
      ) =>
        slot.id ===
        slotId
    );
  }

  function getRequestFiles(
    requestId: string
  ) {
    return requestAttachments.filter(
      (
        file
      ) =>
        file.request_id ===
        requestId
    );
  }

  function getParticipantCancellationCount(
    userId: string
  ) {
    return meetingCancellations.filter(
      (
        cancellation
      ) =>
        cancellation.user_id ===
          userId &&
        cancellation.cancellation_source ===
          "participant"
    ).length;
  }

  function isSlotUnavailableForRequest(
    slot:
      | AvailabilitySlotRow
      | undefined,

    requestId:
      string
  ) {
    if (
      !slot
    ) {
      return true;
    }

    if (
      !slot.booked_request_id
    ) {
      return false;
    }

    return (
      slot.booked_request_id !==
      requestId
    );
  }

  async function updateRequestStatus(
    requestId: string,
    status: string,
    cancellationSource:
      | "participant"
      | "admin"
      | null = null
  ) {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    setMessage(
      ""
    );

    const {
      error,
    } =
      await supabase.rpc(
        "set_meeting_request_status",
        {
          p_request_id:
            requestId,

          p_status:
            status,

          p_cancellation_source:
            cancellationSource,
        }
      );

    if (
      error
    ) {
      setMessage(
        error.message
      );

      return;
    }

    if (
      status ===
        "cancelled" &&
      cancellationSource ===
        "participant"
    ) {
      setMessage(
        "Participant cancellation recorded. This cancellation counts toward the two-cancellation policy."
      );
    } else if (
      status ===
        "cancelled" &&
      cancellationSource ===
        "admin"
    ) {
      setMessage(
        "Administrative cancellation recorded. This does not count against the participant."
      );
    } else if (
      status ===
      "rescheduled"
    ) {
      setMessage(
        "Meeting marked for rescheduling. The previously confirmed appointment time is now available again."
      );
    } else {
      setMessage(
        `Meeting request updated to ${status}.`
      );
    }

    await loadAdminData();
  }

  async function editAdminNotes(
    request: MeetingRequestRow
  ) {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    const nextNote =
      window.prompt(
        "Admin notes for this appointment:",
        request.admin_notes ||
          ""
      );

    if (
      nextNote ===
      null
    ) {
      return;
    }

    setMessage(
      ""
    );

    const {
      error,
    } =
      await supabase
        .from(
          "meeting_requests"
        )
        .update({
          admin_notes:
            nextNote.trim() ||
            null,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          request.id
        );

    if (
      error
    ) {
      setMessage(
        `Could not save admin notes: ${error.message}`
      );

      return;
    }

    setMessage(
      "Admin notes saved."
    );

    await loadAdminData();
  }

  function openBookedRequest(
    requestId?: string | null
  ) {
    if (
      !requestId
    ) {
      return;
    }

    const request =
      meetingRequests.find(
        (
          item
        ) =>
          item.id ===
          requestId
      );

    setActiveTab(
      "meeting_requests"
    );

    setRequestFilter(
      "all"
    );

    setRequestSearch(
      request?.participant_email ||
        request?.participant_name ||
        requestId
    );

    window.setTimeout(
      () => {
        window.scrollTo({
          top: 0,
          behavior:
            "smooth",
        });
      },
      50
    );
  }

  async function confirmRequestSlot(
    requestId: string,
    slotId: string
  ) {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    setMessage(
      ""
    );

    const request =
      meetingRequests.find(
        (item) =>
          item.id ===
          requestId
      );

    const slot =
      getSlot(
        slotId
      );

    if (
      !request
    ) {
      setMessage(
        "Meeting request not found. Refresh the dashboard and try again."
      );

      return;
    }

    if (
      slot?.booked_request_id &&
      slot.booked_request_id !==
        requestId
    ) {
      setMessage(
        "That appointment time has already been booked. Please choose another available appointment time."
      );

      await loadAdminData();

      return;
    }

    const rpcName =
      request.status ===
      "reschedule_requested"
        ? "approve_meeting_reschedule"
        : "confirm_meeting_request";

    const {
      error,
    } =
      await supabase.rpc(
        rpcName,
        {
          p_request_id:
            requestId,

          p_slot_id:
            slotId,
        }
      );

    if (
      error
    ) {
      setMessage(
        `Could not approve appointment: ${error.message}`
      );

      await loadAdminData();

      return;
    }

    const unusedChoiceSlotIds =
      getRequestChoices(
        requestId
      )
        .map(
          (
            choice
          ) =>
            choice.slot_id
        )
        .filter(
          (
            choiceSlotId
          ) =>
            choiceSlotId !==
            slotId
        );

    if (
      unusedChoiceSlotIds.length >
      0
    ) {
      const {
        error:
          releaseError,
      } =
        await supabase
          .from(
            "availability_slots"
          )
          .update({
            booked_request_id:
              null,

            updated_at:
              new Date().toISOString(),
          })
          .in(
            "id",
            unusedChoiceSlotIds
          )
          .eq(
            "booked_request_id",
            requestId
          );

      if (
        releaseError
      ) {
        console.error(
          "Could not release unused appointment choices:",
          releaseError
        );
      }
    }

    setMessage(
      request.status ===
      "reschedule_requested"
        ? "Reschedule approved. The selected time is reserved and any unused preferred times were released."
        : "Appointment approved. The selected time is reserved for this participant and the other preferred times were released back to availability."
    );

    await loadAdminData();
  }

  async function openAttachment(
    filePath: string
  ) {
    const {
      data,
      error,
    } =
      await supabase.storage
        .from(
          "meeting-request-files"
        )
        .createSignedUrl(
          filePath,
          600
        );

    if (
      error ||
      !data?.signedUrl
    ) {
      setMessage(
        error?.message ||
          "Could not open attachment."
      );

      return;
    }

    window.open(
      data.signedUrl,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  const availabilityDuration =
    useMemo(
      () =>
        calculateDurationMinutes(
          availabilityStartTime,
          availabilityEndTime
        ),
      [
        availabilityStartTime,
        availabilityEndTime,
      ]
    );

  async function saveAvailabilitySlot() {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    if (
      !availabilityDate
    ) {
      setMessage(
        "Please choose a date."
      );

      return;
    }

    if (
      !availabilityStartTime
    ) {
      setMessage(
        "Please choose a start time."
      );

      return;
    }

    if (
      !availabilityEndTime
    ) {
      setMessage(
        "Please choose an end time."
      );

      return;
    }

    if (
      availabilityDuration ===
        null ||
      availabilityDuration <=
        0
    ) {
      setMessage(
        "End time must be after start time."
      );

      return;
    }

    const start =
      new Date(
        `${availabilityDate}T${availabilityStartTime}:00`
      );

    const end =
      new Date(
        `${availabilityDate}T${availabilityEndTime}:00`
      );

    setAddingAvailability(
      true
    );

    setMessage(
      ""
    );

    const {
      data:
        authData,
    } =
      await supabase.auth.getUser();

    if (
      editingAvailabilityId
    ) {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "availability_slots"
          )
          .update({
            start_time:
              start.toISOString(),

            end_time:
              end.toISOString(),

            label:
              newSlotLabel.trim() ||
              null,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            editingAvailabilityId
          )
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        setMessage(
          error.message
        );

        setAddingAvailability(
          false
        );

        return;
      }

      setAvailabilitySlots(
        (
          previous
        ) =>
          previous
            .map(
              (
                slot
              ) =>
                slot.id ===
                editingAvailabilityId
                  ? (
                      data as AvailabilitySlotRow
                    )
                  : slot
            )
            .sort(
              (
                a,
                b
              ) =>
                new Date(
                  a.start_time
                ).getTime() -
                new Date(
                  b.start_time
                ).getTime()
            )
      );

      setMessage(
        "Availability updated."
      );
    } else {
      const {
        data,
        error,
      } =
        await supabase
          .from(
            "availability_slots"
          )
          .insert({
            start_time:
              start.toISOString(),

            end_time:
              end.toISOString(),

            label:
              newSlotLabel.trim() ||
              null,

            is_active:
              true,

            max_requests:
              10,

            booked_request_id:
              null,

            created_by:
              authData.user?.id ||
              null,
          })
          .select(
            "*"
          )
          .single();

      if (
        error
      ) {
        setMessage(
          error.message
        );

        setAddingAvailability(
          false
        );

        return;
      }

      setAvailabilitySlots(
        (
          previous
        ) =>
          [
            ...previous,
            data as AvailabilitySlotRow,
          ].sort(
            (
              a,
              b
            ) =>
              new Date(
                a.start_time
              ).getTime() -
              new Date(
                b.start_time
              ).getTime()
          )
      );

      setMessage(
        "Availability added."
      );
    }

    clearAvailabilityForm();

    setAddingAvailability(
      false
    );
  }

  function editAvailability(
    slot:
      AvailabilitySlotRow
  ) {
    const start =
      new Date(
        slot.start_time
      );

    const end =
      slot.end_time
        ? new Date(
            slot.end_time
          )
        : null;

    const localDate =
      `${start.getFullYear()}-${String(
        start.getMonth() +
          1
      ).padStart(
        2,
        "0"
      )}-${String(
        start.getDate()
      ).padStart(
        2,
        "0"
      )}`;

    const startTime =
      `${String(
        start.getHours()
      ).padStart(
        2,
        "0"
      )}:${String(
        start.getMinutes()
      ).padStart(
        2,
        "0"
      )}`;

    const endTime =
      end
        ? `${String(
            end.getHours()
          ).padStart(
            2,
            "0"
          )}:${String(
            end.getMinutes()
          ).padStart(
            2,
            "0"
          )}`
        : "";

    setAvailabilityDate(
      localDate
    );

    setAvailabilityStartTime(
      startTime
    );

    setAvailabilityEndTime(
      endTime
    );

    setNewSlotLabel(
      slot.label ||
        ""
    );

    setEditingAvailabilityId(
      slot.id
    );

    setMessage(
      slot.booked_request_id
        ? "Editing booked appointment time. Saving changes will update the time tied to the booked request."
        : "Editing availability."
    );

    window.scrollTo({
      top:
        0,

      behavior:
        "smooth",
    });
  }

  function clearAvailabilityForm() {
    setAvailabilityDate(
      ""
    );

    setAvailabilityStartTime(
      ""
    );

    setAvailabilityEndTime(
      ""
    );

    setNewSlotLabel(
      ""
    );

    setEditingAvailabilityId(
      null
    );
  }

  function cancelAvailabilityEdit() {
    clearAvailabilityForm();

    setMessage(
      ""
    );
  }

  async function toggleAvailability(
    slot:
      AvailabilitySlotRow
  ) {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    if (
      slot.booked_request_id
    ) {
      setMessage(
        "This appointment time is booked. Cancel or reschedule the confirmed appointment before hiding it."
      );

      return;
    }

    const nextActive =
      !slot.is_active;

    const {
      error,
    } =
      await supabase
        .from(
          "availability_slots"
        )
        .update({
          is_active:
            nextActive,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          slot.id
        );

    if (
      error
    ) {
      setMessage(
        error.message
      );

      return;
    }

    setAvailabilitySlots(
      (
        previous
      ) =>
        previous.map(
          (
            item
          ) =>
            item.id ===
            slot.id
              ? {
                  ...item,

                  is_active:
                    nextActive,
                }
              : item
        )
    );

    setMessage(
      nextActive
        ? "Availability activated."
        : "Availability hidden."
    );
  }

  async function deleteAvailability(
    slotId:
      string
  ) {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    const slot =
      availabilitySlots.find(
        (
          item
        ) =>
          item.id ===
          slotId
      );

    if (
      slot?.booked_request_id
    ) {
      setMessage(
        "This appointment is booked and cannot be deleted. Cancel or reschedule the confirmed appointment first."
      );

      return;
    }

    const confirmed =
      window.confirm(
        "Delete this availability slot?"
      );

    if (
      !confirmed
    ) {
      return;
    }

    const {
      error,
    } =
      await supabase
        .from(
          "availability_slots"
        )
        .delete()
        .eq(
          "id",
          slotId
        );

    if (
      error
    ) {
      setMessage(
        error.message
      );

      return;
    }

    setAvailabilitySlots(
      (
        previous
      ) =>
        previous.filter(
          (
            slot
          ) =>
            slot.id !==
            slotId
        )
    );

    if (
      editingAvailabilityId ===
      slotId
    ) {
      clearAvailabilityForm();
    }

    setMessage(
      "Availability removed."
    );
  }

  /* =======================================================
     CAREER CONNECT SETTINGS
  ======================================================= */

  function updateCareerSetting(
    key:
      keyof CareerConnectSettings,

    value:
      string
  ) {
    setCareerSettings(
      (
        previous
      ) => ({
        ...previous,

        [key]:
          value,
      })
    );
  }

  async function saveCareerConnectSettings() {
    if (
      !isSystemAdmin
    ) {
      return;
    }

    setSavingCareerSettings(
      true
    );

    setMessage(
      ""
    );

    const {
      error,
    } =
      await supabase
        .from(
          "career_connect_settings"
        )
        .upsert({
          id:
            "default",

          meeting_link:
            careerSettings.meeting_link,

          open_room_title:
            careerSettings.open_room_title,

          open_room_schedule:
            careerSettings.open_room_schedule,

          open_room_time:
            careerSettings.open_room_time,

          doors_open:
            careerSettings.doors_open,

          doors_close:
            careerSettings.doors_close,

          open_room_note:
            careerSettings.open_room_note,

          updated_at:
            new Date().toISOString(),
        });

    if (
      error
    ) {
      setMessage(
        error.message
      );

      setSavingCareerSettings(
        false
      );

      return;
    }

    setMessage(
      "Career Connect settings saved."
    );

    setSavingCareerSettings(
      false
    );
  }

  /* =======================================================
     REFERRAL CODES
  ======================================================= */

  const referralCodes =
    useMemo(
      () => {
        const codes =
          new Set<
            string
          >();

        participants.forEach(
          (
            row
          ) => {
            const code =
              row.referral_code?.trim();

            if (
              code
            ) {
              codes.add(
                code.toUpperCase()
              );
            }
          }
        );

        activity.forEach(
          (
            row
          ) => {
            const code =
              row.referral_code?.trim();

            if (
              code
            ) {
              codes.add(
                code.toUpperCase()
              );
            }
          }
        );

        return [
          ...codes,
        ].sort();
      },
      [
        participants,
        activity,
      ]
    );

  useEffect(
    () => {
      if (
        selectedCodes.length ===
          0 &&
        referralCodes.length >
          0
      ) {
        setSelectedCodes(
          referralCodes
        );
      }
    },
    [
      referralCodes,
      selectedCodes.length,
    ]
  );

  /* =======================================================
     PARTICIPANTS
  ======================================================= */

  const uniqueParticipants =
    useMemo(
      () => {
        const map =
          new Map<
            string,
            ParticipantRow
          >();

        participants.forEach(
          (
            row
          ) => {
            const key =
              participantKey(
                row
              );

            if (
              key &&
              !map.has(
                key
              )
            ) {
              map.set(
                key,
                row
              );
            }
          }
        );

        return [
          ...map.values(),
        ];
      },
      [
        participants,
      ]
    );

  const filteredParticipants =
    useMemo(
      () => {
        const query =
          participantSearch
            .trim()
            .toLowerCase();

        if (
          !query
        ) {
          return uniqueParticipants;
        }

        return uniqueParticipants.filter(
          (
            row
          ) =>
            (
              row.full_name ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              ) ||
            (
              row.email ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              ) ||
            (
              row.phone ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              ) ||
            (
              row.referral_code ||
              ""
            )
              .toLowerCase()
              .includes(
                query
              )
        );
      },
      [
        participantSearch,
        uniqueParticipants,
      ]
    );

  /* =======================================================
     MEETING REQUEST FILTERING
  ======================================================= */

  const filteredMeetingRequests =
    useMemo(
      () => {
        const query =
          requestSearch
            .trim()
            .toLowerCase();

        return meetingRequests.filter(
          (
            request
          ) => {
            if (
              requestFilter !==
                "all" &&
              request.status !==
                requestFilter
            ) {
              return false;
            }

            if (
              !query
            ) {
              return true;
            }

            return (
              (
                request.participant_name ||
                ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              (
                request.participant_email ||
                ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              (
                request.referral_code ||
                ""
              )
                .toLowerCase()
                .includes(
                  query
                ) ||
              serviceLabel(
                request.service_type,
                request.other_service
              )
                .toLowerCase()
                .includes(
                  query
                )
            );
          }
        );
      },
      [
        meetingRequests,
        requestFilter,
        requestSearch,
      ]
    );

  const sortedMeetingRequests =
    useMemo(
      () => {
        return [
          ...filteredMeetingRequests,
        ].sort(
          (
            a,
            b
          ) => {
            const aParticipant =
              (
                a.participant_name ||
                a.participant_email ||
                a.user_id ||
                ""
              ).toLowerCase();

            const bParticipant =
              (
                b.participant_name ||
                b.participant_email ||
                b.user_id ||
                ""
              ).toLowerCase();

            const participantCompare =
              aParticipant.localeCompare(
                bParticipant
              );

            if (
              participantCompare !==
              0
            ) {
              return participantCompare;
            }

            const statusCompare =
              requestStatusRank(
                a.status
              ) -
              requestStatusRank(
                b.status
              );

            if (
              statusCompare !==
              0
            ) {
              return statusCompare;
            }

            return (
              new Date(
                b.created_at ||
                  0
              ).getTime() -
              new Date(
                a.created_at ||
                  0
              ).getTime()
            );
          }
        );
      },
      [
        filteredMeetingRequests,
      ]
    );

  const pendingRequestCount =
    meetingRequests.filter(
      (
        request
      ) =>
        request.status ===
        "pending"
    ).length;

  const approvedRequestCount =
    meetingRequests.filter(
      (
        request
      ) =>
        request.status ===
        "approved"
    ).length;

  const confirmedRequestCount =
    meetingRequests.filter(
      (
        request
      ) =>
        request.status ===
        "confirmed"
    ).length;

  const rescheduleRequestCount =
    meetingRequests.filter(
      (
        request
      ) =>
        request.status ===
        "reschedule_requested"
    ).length;

  const completedRequestCount =
    meetingRequests.filter(
      (
        request
      ) =>
        request.status ===
        "completed"
    ).length;

  const availableSlotCount =
    availabilitySlots.filter(
      (
        slot
      ) =>
        slot.is_active ===
          true &&
        !slot.booked_request_id &&
        new Date(
          slot.start_time
        ).getTime() >
          Date.now()
    ).length;

  const bookedSlotCount =
    availabilitySlots.filter(
      (
        slot
      ) =>
        Boolean(
          slot.booked_request_id
        )
    ).length;

  const participantCancellationTotal =
    meetingCancellations.filter(
      (
        row
      ) =>
        row.cancellation_source ===
        "participant"
    ).length;

  /* =======================================================
     REPORT DATE FILTER
  ======================================================= */

  function reportDateMatches(
    value?:
      | string
      | null
  ) {
    const date =
      toDate(
        value
      );

    if (
      !date
    ) {
      return false;
    }

    if (
      reportPeriod ===
      "all"
    ) {
      return true;
    }

    if (
      reportPeriod ===
      "custom"
    ) {
      if (
        !reportStartDate ||
        !reportEndDate
      ) {
        return true;
      }

      const start =
        new Date(
          `${reportStartDate}T00:00:00`
        );

      const end =
        new Date(
          `${reportEndDate}T23:59:59`
        );

      return (
        date >=
          start &&
        date <=
          end
      );
    }

    const start =
      getPeriodStart(
        reportPeriod
      );

    return start
      ? date >=
          start
      : true;
  }

  /* =======================================================
     REPORT DATA
  ======================================================= */

  const selectedParticipantUniverse =
    useMemo(
      () => {
        return uniqueParticipants.filter(
          (
            row
          ) => {
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
              return (
                participantKey(
                  row
                ) ===
                reportParticipantKey
              );
            }

            return true;
          }
        );
      },
      [
        uniqueParticipants,
        selectedCodes,
        reportParticipantKey,
      ]
    );

  const reportActivity =
    useMemo(
      () => {
        return activity.filter(
          (
            row
          ) => {
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
                "all" &&
              participantKey(
                row
              ) !==
                reportParticipantKey
            ) {
              return false;
            }

            return reportDateMatches(
              row.created_at
            );
          }
        );
      },
      [
        activity,
        selectedCodes,
        reportParticipantKey,
        reportPeriod,
        reportStartDate,
        reportEndDate,
      ]
    );

  const activityParticipantKeys =
    useMemo(
      () => {
        const keys =
          new Set<
            string
          >();

        reportActivity.forEach(
          (
            row
          ) => {
            const key =
              participantKey(
                row
              );

            if (
              key
            ) {
              keys.add(
                key
              );
            }
          }
        );

        return keys;
      },
      [
        reportActivity,
      ]
    );

  const newEnrollments =
    useMemo(
      () => {
        return selectedParticipantUniverse.filter(
          (
            row
          ) =>
            reportDateMatches(
              row.created_at
            )
        );
      },
      [
        selectedParticipantUniverse,
        reportPeriod,
        reportStartDate,
        reportEndDate,
      ]
    );

  const participantsServed =
    useMemo(
      () => {
        if (
          reportPeriod ===
          "all"
        ) {
          return selectedParticipantUniverse;
        }

        return selectedParticipantUniverse.filter(
          (
            row
          ) => {
            const key =
              participantKey(
                row
              );

            return (
              reportDateMatches(
                row.created_at
              ) ||
              (
                key
                  ? activityParticipantKeys.has(
                      key
                    )
                  : false
              )
            );
          }
        );
      },
      [
        selectedParticipantUniverse,
        activityParticipantKeys,
        reportPeriod,
        reportStartDate,
        reportEndDate,
      ]
    );

  const activeParticipants =
    useMemo(
      () => {
        return selectedParticipantUniverse.filter(
          (
            row
          ) => {
            const key =
              participantKey(
                row
              );

            return key
              ? activityParticipantKeys.has(
                  key
                )
              : false;
          }
        );
      },
      [
        selectedParticipantUniverse,
        activityParticipantKeys,
      ]
    );

  const trainingEnrollments =
    useMemo(
      () => {
        return newEnrollments.filter(
          (
            row
          ) =>
            (
              row.referral_code ||
              ""
            )
              .toUpperCase()
              .startsWith(
                "COHORT"
              )
        );
      },
      [
        newEnrollments,
      ]
    );

  const reportParticipantOptions =
    useMemo(
      () => {
        return uniqueParticipants
          .filter(
            (
              row
            ) =>
              selectedCodes.includes(
                (
                  row.referral_code ||
                  ""
                ).toUpperCase()
              )
          )
          .map(
            (
              row
            ) => ({
              key:
                participantKey(
                  row
                ),

              name:
                row.full_name ||
                row.email ||
                "Participant",

              referralCode:
                row.referral_code ||
                "",
            })
          )
          .filter(
            (
              item
            ) =>
              Boolean(
                item.key
              )
          );
      },
      [
        uniqueParticipants,
        selectedCodes,
      ]
    );

  const individualParticipant =
    useMemo(
      () => {
        if (
          reportParticipantKey ===
          "all"
        ) {
          return null;
        }

        return (
          uniqueParticipants.find(
            (
              row
            ) =>
              participantKey(
                row
              ) ===
              reportParticipantKey
          ) ||
          null
        );
      },
      [
        uniqueParticipants,
        reportParticipantKey,
      ]
    );

  const reportServiceRows =
    useMemo(
      () => {
        const userIds =
          new Set(
            selectedParticipantUniverse
              .map(
                (
                  row
                ) =>
                  row.user_id
              )
              .filter(
                Boolean
              )
          );

        return workforceSessionServices.filter(
          (
            row
          ) => {
            if (
              !row.user_id ||
              !userIds.has(
                row.user_id
              )
            ) {
              return false;
            }

            return reportDateMatches(
              row.created_at
            );
          }
        );
      },
      [
        workforceSessionServices,
        selectedParticipantUniverse,
        reportPeriod,
        reportStartDate,
        reportEndDate,
      ]
    );

  const reportCancellationRows =
    useMemo(
      () => {
        const userIds =
          new Set(
            selectedParticipantUniverse
              .map(
                (
                  row
                ) =>
                  row.user_id
              )
              .filter(
                Boolean
              )
          );

        return meetingCancellations.filter(
          (
            row
          ) => {
            if (
              row.cancellation_source !==
              "participant"
            ) {
              return false;
            }

            if (
              !userIds.has(
                row.user_id
              )
            ) {
              return false;
            }

            return reportDateMatches(
              row.cancelled_at
            );
          }
        );
      },
      [
        meetingCancellations,
        selectedParticipantUniverse,
        reportPeriod,
        reportStartDate,
        reportEndDate,
      ]
    );

  const serviceBreakdown =
    useMemo(
      () => {
        const counts: Record<
          string,
          number
        > = {};

        reportServiceRows.forEach(
          (
            row
          ) => {
            const label =
              row.service_label ||
              serviceLabel(
                row.service_type
              );

            counts[
              label
            ] =
              (
                counts[
                  label
                ] ||
                0
              ) +
              1;
          }
        );

        return Object.entries(
          counts
        ).sort(
          (
            a,
            b
          ) =>
            b[1] -
            a[1]
        );
      },
      [
        reportServiceRows,
      ]
    );

  const documentSubmissionBreakdown =
    useMemo(
      () => {
        const counts: Record<
          string,
          number
        > = {};

        reportActivity
          .filter(
            (
              row
            ) =>
              row.event_type ===
              "document_submitted"
          )
          .forEach(
            (
              row
            ) => {
              const label =
                row.tool_name ||
                "Career Document Submitted";

              counts[
                label
              ] =
                (
                  counts[
                    label
                  ] ||
                  0
                ) +
                1;
            }
          );

        return Object.entries(
          counts
        ).sort(
          (
            a,
            b
          ) =>
            b[1] -
            a[1]
        );
      },
      [
        reportActivity,
      ]
    );

  const reportStats =
    useMemo(
      () => {
        let completions =
          0;

        let toolUses =
          0;

        let documentSubmissions =
          0;

        const tools: Record<
          string,
          number
        > = {};

        reportActivity.forEach(
          (
            row
          ) => {
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
              event.includes(
                "complete"
              )
            ) {
              completions +=
                1;
            }

            if (
              event ===
              "document_submitted"
            ) {
              documentSubmissions +=
                1;
            }

            if (
              tool
            ) {
              toolUses +=
                1;

              tools[
                tool
              ] =
                (
                  tools[
                    tool
                  ] ||
                  0
                ) +
                1;
            }
          }
        );

        const topToolEntry =
          Object.entries(
            tools
          ).sort(
            (
              a,
              b
            ) =>
              b[1] -
              a[1]
          )[0] ||
          null;

        return {
          participantsServed:
            participantsServed.length,

          newEnrollments:
            newEnrollments.length,

          activeParticipants:
            activeParticipants.length,

          trainingEnrollments:
            trainingEnrollments.length,

          activities:
            reportActivity.length,

          toolUses,

          completions,

          documentSubmissions,

          careerServices:
            reportServiceRows.length,

          cancellations:
            reportCancellationRows.length,

          topTool:
            topToolEntry
              ? topToolEntry[
                  0
                ]
              : "—",

          topToolUses:
            topToolEntry
              ? topToolEntry[
                  1
                ]
              : 0,
        };
      },
      [
        participantsServed,
        newEnrollments,
        activeParticipants,
        trainingEnrollments,
        reportActivity,
        reportServiceRows,
        reportCancellationRows,
      ]
    );

  const participantSummary =
    useMemo<
      ParticipantSummaryRow[]
    >(
      () => {
        return participantsServed.map(
          (
            participant
          ) => {
            const key =
              participantKey(
                participant
              );

            const personActivity =
              reportActivity.filter(
                (
                  row
                ) =>
                  participantKey(
                    row
                  ) ===
                  key
              );

            const sortedActivity =
              [
                ...personActivity,
              ].sort(
                (
                  a,
                  b
                ) =>
                  (
                    toDate(
                      b.created_at
                    )?.getTime() ||
                    0
                  ) -
                  (
                    toDate(
                      a.created_at
                    )?.getTime() ||
                    0
                  )
              );

            const documentSubmissions =
              personActivity.filter(
                (
                  row
                ) =>
                  row.event_type ===
                  "document_submitted"
              ).length;

            const cancellations =
              participant.user_id
                ? reportCancellationRows.filter(
                    (
                      row
                    ) =>
                      row.user_id ===
                      participant.user_id
                  ).length
                : 0;

            return {
              key,

              participant,

              referralCode:
                participant.referral_code ||
                "—",

              signupDate:
                participant.created_at,

              lastActivity:
                sortedActivity[
                  0
                ]?.created_at ||
                null,

              activityCount:
                personActivity.length,

              toolUses:
                personActivity.filter(
                  (
                    row
                  ) =>
                    Boolean(
                      row.tool_name
                    )
                ).length,

              completions:
                personActivity.filter(
                  (
                    row
                  ) =>
                    (
                      row.event_type ||
                      ""
                    )
                      .toLowerCase()
                      .includes(
                        "complete"
                      )
                ).length,

              documentSubmissions,

              cancellations,
            };
          }
        );
      },
      [
        participantsServed,
        reportActivity,
        reportCancellationRows,
      ]
    );

  const codeBreakdown =
    useMemo(
      () => {
        return selectedCodes.map(
          (
            code
          ) => {
            const codeParticipants =
              participantsServed.filter(
                (
                  row
                ) =>
                  (
                    row.referral_code ||
                    ""
                  ).toUpperCase() ===
                  code
              );

            const codeNew =
              newEnrollments.filter(
                (
                  row
                ) =>
                  (
                    row.referral_code ||
                    ""
                  ).toUpperCase() ===
                  code
              );

            const codeActive =
              activeParticipants.filter(
                (
                  row
                ) =>
                  (
                    row.referral_code ||
                    ""
                  ).toUpperCase() ===
                  code
              );

            const codeActivity =
              reportActivity.filter(
                (
                  row
                ) =>
                  (
                    row.referral_code ||
                    ""
                  ).toUpperCase() ===
                  code
              );

            const codeCancellations =
              reportCancellationRows.filter(
                (
                  row
                ) =>
                  (
                    row.referral_code ||
                    ""
                  ).toUpperCase() ===
                  code
              );

            return {
              code,

              participants:
                codeParticipants.length,

              newEnrollments:
                codeNew.length,

              active:
                codeActive.length,

              toolUses:
                codeActivity.filter(
                  (
                    row
                  ) =>
                    Boolean(
                      row.tool_name
                    )
                ).length,

              cancellations:
                codeCancellations.length,
            };
          }
        );
      },
      [
        selectedCodes,
        participantsServed,
        newEnrollments,
        activeParticipants,
        reportActivity,
        reportCancellationRows,
      ]
    );

  /* =======================================================
     REPORT CONTROLS
  ======================================================= */

  function toggleCode(
    code:
      string
  ) {
    setSelectedCodes(
      (
        previous
      ) =>
        previous.includes(
          code
        )
          ? previous.filter(
              (
                item
              ) =>
                item !==
                code
            )
          : [
              ...previous,
              code,
            ]
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
    setSelectedCodes(
      []
    );

    setReportParticipantKey(
      "all"
    );
  }

  function toggleOptionalMetric(
    metric:
      OptionalMetricKey
  ) {
    setSelectedOptionalMetrics(
      (
        previous
      ) =>
        previous.includes(
          metric
        )
          ? previous.filter(
              (
                item
              ) =>
                item !==
                metric
            )
          : [
              ...previous,
              metric,
            ]
    );
  }

  function hasOptionalMetric(
    metric:
      OptionalMetricKey
  ) {
    return selectedOptionalMetrics.includes(
      metric
    );
  }

  const reportingPeriodLabel =
    getPeriodLabel(
      reportPeriod,
      reportStartDate,
      reportEndDate
    );

  const reportSummaryText =
    useMemo(
      () => {
        if (
          individualParticipant
        ) {
          const name =
            individualParticipant.full_name ||
            "The participant";

          let text =
            `${name} is associated with referral code ` +
            `${individualParticipant.referral_code || "—"}. ` +
            `During the selected reporting period, ` +
            `${
              reportStats.activeParticipants >
              0
                ? "the participant demonstrated recorded platform engagement"
                : "no platform engagement was recorded"
            }.`;

          if (
            hasOptionalMetric(
              "tool_engagements"
            )
          ) {
            text +=
              ` ${reportStats.toolUses} career tool engagement(s) were recorded.`;
          }

          if (
            hasOptionalMetric(
              "completed_activities"
            )
          ) {
            text +=
              ` ${reportStats.completions} completed activity event(s) were recorded.`;
          }

          if (
            hasOptionalMetric(
              "career_services"
            )
          ) {
            text +=
              ` ${reportStats.careerServices} tracked career service(s) were recorded.`;
          }

          if (
            hasOptionalMetric(
              "document_submissions"
            )
          ) {
            text +=
              ` ${reportStats.documentSubmissions} career document submission(s) were recorded.`;
          }

          if (
            hasOptionalMetric(
              "cancellations"
            )
          ) {
            text +=
              ` ${reportStats.cancellations} participant-initiated cancellation(s) were recorded.`;
          }

          return text;
        }

        let text =
          `During ${reportingPeriodLabel.toLowerCase()}, HireMinds served ` +
          `${reportStats.participantsServed} participant(s) across ` +
          `${selectedCodes.length} selected referral code(s). ` +
          `${reportStats.newEnrollments} new enrollment(s) were recorded, ` +
          `and ${reportStats.activeParticipants} participant(s) demonstrated platform engagement.`;

        if (
          reportStats.trainingEnrollments >
          0
        ) {
          text +=
            ` ${reportStats.trainingEnrollments} training enrollment(s) were associated with COHORT referral codes.`;
        }

        if (
          hasOptionalMetric(
            "career_services"
          )
        ) {
          text +=
            ` ${reportStats.careerServices} tracked career service(s) were recorded through Career Connect.`;
        }

        if (
          hasOptionalMetric(
            "document_submissions"
          )
        ) {
          text +=
            ` ${reportStats.documentSubmissions} career document submission(s) were recorded.`;
        }

        if (
          hasOptionalMetric(
            "cancellations"
          )
        ) {
          text +=
            ` ${reportStats.cancellations} participant-initiated cancellation(s) were recorded.`;
        }

        return text;
      },
      [
        individualParticipant,
        reportStats,
        selectedCodes.length,
        reportingPeriodLabel,
        selectedOptionalMetrics,
      ]
    );

  /* =======================================================
     EXPORT
  ======================================================= */

  function printReport() {
    window.print();
  }

  function exportCSV() {
    const rows =
      [
        [
          "Participant",
          "Email",
          "Referral Code",
          "Sign-Up Date",
          "Last Activity",
          "Activity Count",
          "Tool Engagements",
          "Completed Activities",
          "Document Submissions",
          "Participant Cancellations",
        ],

        ...participantSummary.map(
          (
            row
          ) => [
            row.participant.full_name ||
              "",

            row.participant.email ||
              "",

            row.referralCode,

            row.signupDate ||
              "",

            row.lastActivity ||
              "",

            String(
              row.activityCount
            ),

            String(
              row.toolUses
            ),

            String(
              row.completions
            ),

            String(
              row.documentSubmissions
            ),

            String(
              row.cancellations
            ),
          ]
        ),
      ];

    const csv =
      rows
        .map(
          (
            row
          ) =>
            row
              .map(
                (
                  value
                ) =>
                  `"${String(
                    value
                  ).replace(
                    /"/g,
                    '""'
                  )}"`
              )
              .join(
                ","
              )
        )
        .join(
          "\n"
        );

    const blob =
      new Blob(
        [
          csv,
        ],
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

    link.href =
      url;

    link.download =
      "hireminds-participant-report.csv";

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <main
        style={
          styles.page
        }
      >
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

  /* =======================================================
     TABS
  ======================================================= */

  const dashboardTabs: {
    key:
      DashboardTab;

    label:
      string;

    adminOnly?:
      boolean;
  }[] =
    [
      {
        key:
          "overview",

        label:
          "Overview",
      },

      {
        key:
          "live",

        label:
          "Live Activity",
      },

      {
        key:
          "history",

        label:
          "History",
      },

      {
        key:
          "tools",

        label:
          "Tool Usage",
      },

      {
        key:
          "meeting_requests",

        label:
          pendingRequestCount +
            rescheduleRequestCount >
          0
            ? `Meeting Requests (${pendingRequestCount + rescheduleRequestCount})`
            : "Meeting Requests",

        adminOnly:
          true,
      },

      {
        key:
          "availability",

        label:
          "Availability Calendar",

        adminOnly:
          true,
      },

      {
        key:
          "career_connect",

        label:
          "Career Connect",

        adminOnly:
          true,
      },

      {
        key:
          "reports",

        label:
          "Reports",
      },
    ];

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      style={
        styles.page
      }
    >
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
            background: #ffffff !important;
            color: #111827 !important;
            border-radius: 0 !important;
          }

          .no-print {
            display: none !important;
          }
        }

        @media (max-width: 850px) {
          .hm-report-metrics {
            grid-template-columns: repeat(2,minmax(0,1fr)) !important;
          }

          .hm-report-meta {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        style={
          styles.shell
        }
      >
        {/* =================================================
            HEADER
        ================================================= */}

        <section
          style={
            styles.headerCard
          }
        >
          <div>
            <p
              style={
                styles.kicker
              }
            >
              HIREMINDS™ PARTNER DASHBOARD
            </p>

            <h1
              style={
                styles.title
              }
            >
            {isSystemAdmin
  ? "HireMinds™ Administration"
  : partner?.organization_name || "Partner Dashboard"}
            </h1>

            <p
              style={
                styles.subtitle
              }
            >
              Participant engagement, referral-code reporting,
              Career Connect management, activity tracking,
              and workforce outcomes.
            </p>

            <p
              style={
                styles.subtleLine
              }
            >
              Account:{" "}
              {partner?.account_holder ||
                partner?.contact_email ||
                "Authorized Partner"}
            </p>

            <p
              style={
                styles.subtleLine
              }
            >
              Account Type:{" "}
              {partner?.account_type ||
                "partner"}
            </p>

            {isSystemAdmin ? (
              <p
                style={
                  styles.adminLine
                }
              >
                ● HireMinds System Administrator
              </p>
            ) : null}

            <p
              style={
                styles.subtleLine
              }
            >
              Last Updated:{" "}
              {lastUpdated ||
                "—"}
            </p>
          </div>

          <div
            style={
              styles.headerActions
            }
          >
            <button
              type="button"
              onClick={
                async () => {
                  await loadDashboard();

                  if (
                    isSystemAdmin
                  ) {
                    await loadAdminData();
                  }
                }
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

        {/* =================================================
            TABS
        ================================================= */}

        <section
          style={
            styles.card
          }
        >
          <div
            style={
              styles.tabRow
            }
          >
            {dashboardTabs
              .filter(
                (
                  tab
                ) =>
                  !tab.adminOnly ||
                  isSystemAdmin
              )
              .map(
                (
                  tab
                ) => (
                  <button
                    key={
                      tab.key
                    }
                    type="button"
                    onClick={() =>
                      setActiveTab(
                        tab.key
                      )
                    }
                    style={{
                      ...styles.tabButton,

                      ...(activeTab ===
                      tab.key
                        ? styles.tabButtonActive
                        : {}),
                    }}
                  >
                    {tab.label}
                  </button>
                )
              )}
          </div>
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab ===
        "overview" ? (
          <>
            <section
              style={
                styles.summaryGrid
              }
            >
              <MetricCard
                label="Participants"
                value={
                  uniqueParticipants.length
                }
              />

              <MetricCard
                label="Referral Codes"
                value={
                  referralCodes.length
                }
              />

              <MetricCard
                label="Activity Records"
                value={
                  activity.length
                }
              />

              <MetricCard
                label="Career Services Tracked"
                value={
                  workforceSessionServices.length
                }
              />

              {isSystemAdmin ? (
                <>
                  <MetricCard
                    label="Pending Meeting Requests"
                    value={
                      pendingRequestCount
                    }
                  />

                  <MetricCard
                    label="Approved - Awaiting Confirmation"
                    value={
                      approvedRequestCount
                    }
                  />

                  <MetricCard
                    label="Confirmed Meetings"
                    value={
                      confirmedRequestCount
                    }
                  />

                  <MetricCard
                    label="Reschedule Requests"
                    value={
                      rescheduleRequestCount
                    }
                  />

                  <MetricCard
                    label="Completed Meetings"
                    value={
                      completedRequestCount
                    }
                  />

                  <MetricCard
                    label="Available Times"
                    value={
                      availableSlotCount
                    }
                  />

                  <MetricCard
                    label="Booked Times"
                    value={
                      bookedSlotCount
                    }
                  />

                  <MetricCard
                    label="Participant Cancellations"
                    value={
                      participantCancellationTotal
                    }
                  />
                </>
              ) : null}
            </section>

            <a
              href="/partner-dashboard/logs"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 18,
                padding: 22,
                marginBottom: 18,
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,.12)",
                background: "rgba(255,255,255,.04)",
                color: "#ffffff",
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: "grid",
                    placeItems: "center",
                    background: "rgba(168,85,247,.14)",
                    border: "1px solid rgba(168,85,247,.25)",
                    fontSize: 23,
                    flexShrink: 0,
                  }}
                >
                  📋
                </div>

                <div>
                  <p
                    style={{
                      margin: "0 0 4px",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: ".12em",
                      color: "#c4b5fd",
                    }}
                  >
                    PARTICIPANT ACTIVITY
                  </p>

                  <h3
                    style={{
                      margin: "0 0 5px",
                      fontSize: 20,
                    }}
                  >
                    Weekly Logs
                  </h3>

                  <p
                    style={{
                      margin: 0,
                      color: "#9ca3af",
                      lineHeight: 1.5,
                    }}
                  >
                    Review submitted Weekly Job Logs and Career Development Logs.
                  </p>
                </div>
              </div>

              <span
                aria-hidden="true"
                style={{
                  fontSize: 24,
                  color: "#c4b5fd",
                  flexShrink: 0,
                }}
              >
                →
              </span>
            </a>

            <section
              style={
                styles.card
              }
            >
              <h2
                style={
                  styles.sectionTitle
                }
              >
                Participant List
              </h2>

              <p
                style={
                  styles.muted
                }
              >
                Participants are shown once. Referral codes and activity
                are tracked separately for reporting.
              </p>

              <input
                value={
                  participantSearch
                }
                onChange={
                  (
                    e
                  ) =>
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
                style={
                  styles.tableWrap
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
                        Referral Code
                      </th>

                      <th
                        style={
                          styles.th
                        }
                      >
                        Joined
                      </th>

                      {isSystemAdmin ? (
                        <th
                          style={
                            styles.th
                          }
                        >
                          Cancellations
                        </th>
                      ) : null}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredParticipants.map(
                      (
                        row,
                        index
                      ) => {
                        const cancellations =
                          row.user_id
                            ? getParticipantCancellationCount(
                                row.user_id
                              )
                            : 0;

                        return (
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

                              {cancellations >=
                              2 ? (
                                <div
                                  style={
                                    styles.referralWarningInline
                                  }
                                >
                                  ⚠ Refer back to provider
                                </div>
                              ) : null}
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
                              <span
                                style={
                                  styles.codeBadge
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
                              {formatShortDate(
                                row.created_at
                              )}
                            </td>

                            {isSystemAdmin ? (
                              <td
                                style={
                                  styles.td
                                }
                              >
                                <span
                                  style={{
                                    ...styles.cancellationBadge,

                                    ...(cancellations >=
                                    2
                                      ? styles.cancellationBadgeWarning
                                      : {}),
                                  }}
                                >
                                  {cancellations}
                                </span>
                              </td>
                            ) : null}
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {/* =================================================
            LIVE ACTIVITY
        ================================================= */}

        {activeTab ===
        "live" ? (
          <ActivityTable
            title="Live Activity"
            rows={
              activity.slice(
                0,
                100
              )
            }
          />
        ) : null}

        {/* =================================================
            HISTORY
        ================================================= */}

        {activeTab ===
        "history" ? (
          <ActivityTable
            title="Activity History"
            rows={
              activity
            }
          />
        ) : null}

        {/* =================================================
            TOOL USAGE
        ================================================= */}

        {activeTab ===
        "tools" ? (
          <section
            style={
              styles.card
            }
          >
            <h2
              style={
                styles.sectionTitle
              }
            >
              Tool & Career Service Usage
            </h2>

            <p
              style={
                styles.muted
              }
            >
              Career tools and Career Connect services are tracked for
              participant and referral-code reporting.
            </p>

            <div
              style={
                styles.summaryGrid
              }
            >
              <MetricCard
                label="Career Services"
                value={
                  workforceSessionServices.length
                }
              />

              {Object.entries(
                workforceSessionServices.reduce(
                  (
                    counts: Record<
                      string,
                      number
                    >,
                    row
                  ) => {
                    const label =
                      row.service_label ||
                      serviceLabel(
                        row.service_type
                      );

                    counts[
                      label
                    ] =
                      (
                        counts[
                          label
                        ] ||
                        0
                      ) +
                      1;

                    return counts;
                  },
                  {}
                )
              )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    b[1] -
                    a[1]
                )
                .map(
                  ([
                    label,
                    count,
                  ]) => (
                    <MetricCard
                      key={
                        label
                      }
                      label={
                        label
                      }
                      value={
                        count
                      }
                    />
                  )
                )}
            </div>
          </section>
        ) : null}

        {/* =================================================
            MEETING REQUESTS
        ================================================= */}

        {activeTab ===
          "meeting_requests" &&
        isSystemAdmin ? (
          <section
            style={
              styles.card
            }
          >
            <div
              style={
                styles.sectionTop
              }
            >
              <div>
                <p
                  style={
                    styles.kicker
                  }
                >
                  CAREER CONNECT
                </p>

                <h2
                  style={
                    styles.sectionTitle
                  }
                >
                  Meeting Requests
                </h2>

                <p
                  style={
                    styles.muted
                  }
                >
                  Participants may choose up to 3 preferred appointment times.
                  You approve one time. That time becomes booked and the
                  participant then confirms the appointment inside Career Connect.
                </p>
              </div>

              <button
                type="button"
                onClick={
                  loadAdminData
                }
                style={
                  styles.secondaryButton
                }
              >
                Refresh Requests
              </button>
            </div>

            <div
              style={
                styles.requestStatsGrid
              }
            >
              <div
                style={
                  styles.requestMiniStat
                }
              >
                <strong>
                  {pendingRequestCount}
                </strong>

                <span>
                  Pending
                </span>
              </div>

              <div
                style={
                  styles.requestMiniStat
                }
              >
                <strong>
                  {approvedRequestCount}
                </strong>

                <span>
                  Awaiting Participant Confirmation
                </span>
              </div>

              <div
                style={
                  styles.requestMiniStat
                }
              >
                <strong>
                  {confirmedRequestCount}
                </strong>

                <span>
                  Confirmed
                </span>
              </div>

              <div
                style={
                  styles.requestMiniStat
                }
              >
                <strong>
                  {rescheduleRequestCount}
                </strong>

                <span>
                  Reschedule Requests
                </span>
              </div>

              <div
                style={
                  styles.requestMiniStat
                }
              >
                <strong>
                  {completedRequestCount}
                </strong>

                <span>
                  Completed
                </span>
              </div>
            </div>

            <div
              style={
                styles.requestControls
              }
            >
              <input
                value={
                  requestSearch
                }
                onChange={
                  (
                    e
                  ) =>
                    setRequestSearch(
                      e.target.value
                    )
                }
                placeholder="Search participant, email, referral code, or service"
                style={
                  styles.input
                }
              />

              <select
                value={
                  requestFilter
                }
                onChange={
                  (
                    e
                  ) =>
                    setRequestFilter(
                      e.target.value
                    )
                }
                style={
                  styles.input
                }
              >
                <option
                  value="all"
                >
                  All Requests
                </option>

                <option
                  value="pending"
                >
                  Pending
                </option>

                <option
                  value="approved"
                >
                  Approved - Awaiting Participant
                </option>

                <option
                  value="confirmed"
                >
                  Confirmed
                </option>

                <option
                  value="reschedule_requested"
                >
                  Reschedule Requested
                </option>

                <option
                  value="rescheduled"
                >
                  Rescheduled
                </option>

                <option
                  value="completed"
                >
                  Completed
                </option>

                <option
                  value="cancelled"
                >
                  Cancelled
                </option>

                <option
                  value="declined"
                >
                  Declined
                </option>
              </select>
            </div>

            <div
              style={
                styles.requestList
              }
            >
              {sortedMeetingRequests.map(
                (
                  request,
                  index
                ) => {
                  const choices =
                    getRequestChoices(
                      request.id
                    );

                  const files =
                    getRequestFiles(
                      request.id
                    );

                  const cancellationCount =
                    getParticipantCancellationCount(
                      request.user_id
                    );

                  const participantGroupKey =
                    request.user_id ||
                    request.participant_email?.toLowerCase() ||
                    request.participant_name?.toLowerCase() ||
                    request.id;

                  const previousRequest =
                    index >
                    0
                      ? sortedMeetingRequests[
                          index -
                            1
                        ]
                      : null;

                  const previousGroupKey =
                    previousRequest
                      ? previousRequest.user_id ||
                        previousRequest.participant_email?.toLowerCase() ||
                        previousRequest.participant_name?.toLowerCase() ||
                        previousRequest.id
                      : null;

                  const isNewParticipant =
                    participantGroupKey !==
                    previousGroupKey;

                  const participantRequests =
                    sortedMeetingRequests.filter(
                      (
                        item
                      ) =>
                        (
                          item.user_id ||
                          item.participant_email?.toLowerCase() ||
                          item.participant_name?.toLowerCase() ||
                          item.id
                        ) ===
                        participantGroupKey
                    );

                  const confirmedCount =
                    participantRequests.filter(
                      (
                        item
                      ) =>
                        item.status ===
                        "confirmed"
                    ).length;

                  const activeCount =
                    participantRequests.filter(
                      (
                        item
                      ) =>
                        [
                          "pending",
                          "approved",
                          "reschedule_requested",
                          "rescheduled",
                        ].includes(
                          item.status
                        )
                    ).length;

                  const closedCount =
                    participantRequests.filter(
                      (
                        item
                      ) =>
                        [
                          "completed",
                          "cancelled",
                          "declined",
                        ].includes(
                          item.status
                        )
                    ).length;

                  return (
                    <div
                      key={
                        request.id
                      }
                      style={
                        styles.requestGroupItem
                      }
                    >
                      {isNewParticipant ? (
                        <div
                          style={
                            styles.participantGroupHeader
                          }
                        >
                          <div>
                            <p
                              style={
                                styles.participantGroupEyebrow
                              }
                            >
                              PARTICIPANT APPOINTMENTS
                            </p>

                            <h3
                              style={
                                styles.participantGroupName
                              }
                            >
                              {request.participant_name ||
                                request.participant_email ||
                                "Participant"}
                            </h3>

                            <p
                              style={
                                styles.participantGroupEmail
                              }
                            >
                              {request.participant_email ||
                                "No email"}
                            </p>
                          </div>

                          <div
                            style={
                              styles.participantGroupStats
                            }
                          >
                            {confirmedCount >
                            0 ? (
                              <span
                                style={
                                  styles.groupConfirmedBadge
                                }
                              >
                                {confirmedCount} Confirmed
                              </span>
                            ) : null}

                            {activeCount >
                            0 ? (
                              <span
                                style={
                                  styles.groupActiveBadge
                                }
                              >
                                {activeCount} Needs Attention
                              </span>
                            ) : null}

                            {closedCount >
                            0 ? (
                              <span
                                style={
                                  styles.groupClosedBadge
                                }
                              >
                                {closedCount} Closed
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      <article
                      key={
                        request.id
                      }
                      style={{
                        ...styles.requestCard,
                        ...requestCardStatusStyle(
                          request.status
                        ),
                      }}
                    >
                      <div
                        style={
                          styles.requestHeader
                        }
                      >
                        <div>
                          <div
                            style={
                              styles.requestNameRow
                            }
                          >
                            <h3
                              style={
                                styles.requestName
                              }
                            >
                              {request.participant_name ||
                                request.participant_email ||
                                "Participant"}
                            </h3>

                            <span
                              style={{
                                ...styles.statusBadge,

                                ...requestStatusStyle(
                                  request.status
                                ),
                              }}
                            >
                              {requestStatusLabel(
                                request.status
                              )}
                            </span>
                          </div>

                          <p
                            style={
                              styles.requestSubline
                            }
                          >
                            {request.participant_email ||
                              "No email"}{" "}
                            •{" "}
                            {request.referral_code ||
                              "No referral code"}
                          </p>

                          <p
                            style={
                              styles.requestServiceTitle
                            }
                          >
                            {serviceLabel(
                              request.service_type,
                              request.other_service
                            )}
                          </p>
                        </div>

                        <div
                          style={
                            styles.requestDateText
                          }
                        >
                          Requested{" "}
                          {formatDate(
                            request.created_at
                          )}
                        </div>
                      </div>

                      {/* AGREEMENT */}

                      <div
                        style={
                          request.policy_agreed
                            ? styles.agreementAcceptedBox
                            : styles.agreementMissingBox
                        }
                      >
                        <strong>
                          {request.policy_agreed
                            ? "✓ Scheduling & Cancellation Agreement Accepted"
                            : "⚠ Scheduling & Cancellation Agreement Not Recorded"}
                        </strong>

                        {request.policy_agreed_at ? (
                          <p
                            style={
                              styles.agreementDate
                            }
                          >
                            Accepted{" "}
                            {formatDate(
                              request.policy_agreed_at
                            )}
                          </p>
                        ) : null}
                      </div>

                      {/* CANCELLATION COUNT */}

                      <div
                        style={{
                          ...styles.cancellationSummaryBox,

                          ...(cancellationCount >=
                          2
                            ? styles.cancellationSummaryWarning
                            : {}),
                        }}
                      >
                        <div>
                          <span
                            style={
                              styles.requestSectionLabel
                            }
                          >
                            PARTICIPANT CANCELLATIONS
                          </span>

                          <strong
                            style={
                              styles.cancellationBigNumber
                            }
                          >
                            {cancellationCount}
                          </strong>
                        </div>

                        {cancellationCount >=
                        2 ? (
                          <div
                            style={
                              styles.providerReferralAlert
                            }
                          >
                            ⚠ Two participant-initiated cancellations
                            have been recorded. Refer this participant
                            back to the organization or provider that
                            referred them to HireMinds.
                          </div>
                        ) : (
                          <p
                            style={
                              styles.cancellationPolicySmall
                            }
                          >
                            Two participant-initiated cancellations
                            trigger referral back to the referring
                            provider or organization.
                          </p>
                        )}
                      </div>

                      {/* NOTES */}

                      {request.cancellation_note ? (
                        <div
                          style={
                            styles.cancellationNoteBox
                          }
                        >
                          <strong>
                            Cancellation Note
                          </strong>

                          <p>
                            {request.cancellation_note}
                          </p>
                        </div>
                      ) : null}

                      {request.notes ? (
                        <div
                          style={
                            styles.notesBox
                          }
                        >
                          <strong>
                            Participant Notes
                          </strong>

                          <p>
                            {request.notes}
                          </p>
                        </div>
                      ) : null}

                      {request.admin_notes ? (
                        <div
                          style={
                            styles.adminNotesBox
                          }
                        >
                          <strong>
                            Admin Notes
                          </strong>

                          <p>
                            {request.admin_notes}
                          </p>
                        </div>
                      ) : null}

                      {/* RESCHEDULE REQUEST */}

                      {request.status ===
                        "reschedule_requested" ||
                      request.reschedule_requested_at ||
                      request.reschedule_slot_id ||
                      request.reschedule_note ? (
                        <div
                          style={
                            styles.rescheduleAlertBox
                          }
                        >
                          <div
                            style={
                              styles.rescheduleAlertHeader
                            }
                          >
                            <div>
                              <span
                                style={
                                  styles.requestSectionLabel
                                }
                              >
                                RESCHEDULE REQUESTED
                              </span>

                              <strong
                                style={
                                  styles.rescheduleAlertTitle
                                }
                              >
                                Participant requested a different appointment
                              </strong>
                            </div>

                            {request.reschedule_requested_at ? (
                              <span
                                style={
                                  styles.requestDateText
                                }
                              >
                                {formatDate(
                                  request.reschedule_requested_at
                                )}
                              </span>
                            ) : null}
                          </div>

                          {request.confirmed_slot_id ? (
                            <div
                              style={
                                styles.rescheduleInfoCard
                              }
                            >
                              <span>
                                CURRENT APPOINTMENT
                              </span>

                              <strong>
                                {formatAppointment(
                                  getSlot(
                                    request.confirmed_slot_id
                                  )?.start_time
                                )}
                              </strong>
                            </div>
                          ) : null}

                          {request.reschedule_slot_id ? (
                            <div
                              style={
                                styles.rescheduleInfoCardHighlight
                              }
                            >
                              <span>
                                PARTICIPANT SELECTED NEW TIME
                              </span>

                              <strong>
                                {formatAppointment(
                                  getSlot(
                                    request.reschedule_slot_id
                                  )?.start_time
                                )}
                              </strong>

                              <button
                                type="button"
                                onClick={() =>
                                  confirmRequestSlot(
                                    request.id,
                                    request.reschedule_slot_id as string
                                  )
                                }
                                style={
                                  styles.confirmButton
                                }
                              >
                                Approve Requested New Time
                              </button>
                            </div>
                          ) : null}

                          {request.reschedule_note ? (
                            <div
                              style={
                                styles.notesBox
                              }
                            >
                              <strong>
                                Participant Requested
                              </strong>

                              <p>
                                {request.reschedule_note}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* PREFERRED TIMES */}

                      <div
                        style={
                          styles.requestSection
                        }
                      >
                        <p
                          style={
                            styles.requestSectionLabel
                          }
                        >
                          Preferred Appointment Times
                        </p>

                        <p
                          style={
                            styles.preferenceInstruction
                          }
                        >
                          Participant may select up to 3 preferred appointment
                          times. Approve only one. The participant confirms it
                          afterward inside Career Connect.
                        </p>

                        {choices.length ? (
                          <div
                            style={
                              styles.choiceList
                            }
                          >
                            {choices.map(
                              (
                                choice
                              ) => {
                                const slot =
                                  getSlot(
                                    choice.slot_id
                                  );

                                const confirmed =
                                  request.confirmed_slot_id ===
                                  choice.slot_id;

                                const unavailable =
                                  isSlotUnavailableForRequest(
                                    slot,
                                    request.id
                                  );

                                return (
                                  <div
                                    key={
                                      choice.id
                                    }
                                    style={{
                                      ...styles.choiceCard,

                                      ...(confirmed
                                        ? styles.choiceCardConfirmed
                                        : {}),

                                      ...(unavailable
                                        ? styles.choiceCardUnavailable
                                        : {}),
                                    }}
                                  >
                                    <div>
                                      <span
                                        style={
                                          styles.preferenceLabel
                                        }
                                      >
                                        Choice{" "}
                                        {choice.preference_order}
                                      </span>

                                      <strong
                                        style={
                                          styles.choiceDate
                                        }
                                      >
                                        {formatShortDate(
                                          slot?.start_time
                                        )}
                                      </strong>

                                      <span
                                        style={
                                          styles.choiceTime
                                        }
                                      >
                                        {formatTimeOnly(
                                          slot?.start_time
                                        )}
                                        {" – "}
                                        {formatTimeOnly(
                                          slot?.end_time
                                        )}
                                      </span>

                                      {slot?.label ? (
                                        <span
                                          style={
                                            styles.choiceNote
                                          }
                                        >
                                          {slot.label}
                                        </span>
                                      ) : null}

                                      {confirmed ? (
                                        <span
                                          style={
                                            styles.confirmedTimeText
                                          }
                                        >
                                          {request.status ===
                                          "confirmed"
                                            ? "✓ PARTICIPANT CONFIRMED"
                                            : "✓ APPROVED APPOINTMENT TIME"}
                                        </span>
                                      ) : unavailable ? (
                                        <span
                                          style={
                                            styles.unavailableTimeText
                                          }
                                        >
                                          NO LONGER AVAILABLE
                                        </span>
                                      ) : (
                                        <span
                                          style={
                                            styles.availableTimeText
                                          }
                                        >
                                          AVAILABLE TO APPROVE
                                        </span>
                                      )}
                                    </div>

                                    {request.status !==
                                      "completed" &&
                                    request.status !==
                                      "cancelled" &&
                                    request.status !==
                                      "declined" ? (
                                      <button
                                        type="button"
                                        disabled={
                                          unavailable ||
                                          confirmed
                                        }
                                        onClick={() =>
                                          confirmRequestSlot(
                                            request.id,
                                            choice.slot_id
                                          )
                                        }
                                        style={
                                          confirmed
                                            ? styles.confirmedButton
                                            : unavailable
                                              ? styles.unavailableButton
                                              : styles.confirmButton
                                        }
                                      >
                                        {confirmed
                                          ? request.status ===
                                            "confirmed"
                                            ? "✓ Participant Confirmed"
                                            : "✓ Approved Time"
                                          : unavailable
                                            ? "No Longer Available"
                                            : request.status ===
                                              "reschedule_requested"
                                              ? "Approve New Time"
                                              : "Approve This Time"}
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <p
                            style={
                              styles.emptyText
                            }
                          >
                            No appointment preferences found.
                          </p>
                        )}
                      </div>

                      {/* FILES */}

                      <div
                        style={
                          styles.requestSection
                        }
                      >
                        <p
                          style={
                            styles.requestSectionLabel
                          }
                        >
                          Supporting Files
                        </p>

                        {files.length ? (
                          <div
                            style={
                              styles.fileRow
                            }
                          >
                            {files.map(
                              (
                                file
                              ) => (
                                <button
                                  key={
                                    file.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    openAttachment(
                                      file.file_path
                                    )
                                  }
                                  style={
                                    styles.fileButton
                                  }
                                >
                                  📎 {file.file_name}
                                </button>
                              )
                            )}
                          </div>
                        ) : (
                          <p
                            style={
                              styles.emptyText
                            }
                          >
                            No files attached.
                          </p>
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div
                        style={
                          styles.requestActions
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            editAdminNotes(
                              request
                            )
                          }
                          style={
                            styles.actionButtonBlue
                          }
                        >
                          {request.admin_notes
                            ? "Edit Admin Notes"
                            : "Add Admin Notes"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Mark this appointment as needing reschedule review? The currently booked time will remain reserved until a replacement is approved."
                              );

                            if (
                              confirmed
                            ) {
                              updateRequestStatus(
                                request.id,
                                "reschedule_requested"
                              );
                            }
                          }}
                          style={
                            styles.actionButtonPurple
                          }
                        >
                          Reschedule
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "completed"
                            )
                          }
                          style={
                            styles.actionButtonBlue
                          }
                        >
                          Completed
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Record this as a PARTICIPANT cancellation? This WILL count toward the two-cancellation policy."
                              );

                            if (
                              confirmed
                            ) {
                              updateRequestStatus(
                                request.id,
                                "cancelled",
                                "participant"
                              );
                            }
                          }}
                          style={
                            styles.actionButtonRed
                          }
                        >
                          Participant Cancelled
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Record this as an ADMIN cancellation? This will NOT count against the participant."
                              );

                            if (
                              confirmed
                            ) {
                              updateRequestStatus(
                                request.id,
                                "cancelled",
                                "admin"
                              );
                            }
                          }}
                          style={
                            styles.actionButtonNeutral
                          }
                        >
                          Admin Cancelled
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            const confirmed =
                              window.confirm(
                                "Decline this meeting request?"
                              );

                            if (
                              confirmed
                            ) {
                              updateRequestStatus(
                                request.id,
                                "declined"
                              );
                            }
                          }}
                          style={
                            styles.actionButtonNeutral
                          }
                        >
                          Decline
                        </button>
                      </div>
                    </article>
                    </div>
                  );
                }
              )}

              {sortedMeetingRequests.length ===
              0 ? (
                <div
                  style={
                    styles.emptyPanel
                  }
                >
                  No meeting requests match the selected filters.
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* =================================================
            AVAILABILITY CALENDAR
        ================================================= */}

        {activeTab ===
          "availability" &&
        isSystemAdmin ? (
          <>
            <section
              style={
                styles.card
              }
            >
              <p
                style={
                  styles.kicker
                }
              >
                CAREER CONNECT
              </p>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Availability Calendar
              </h2>

              <p
                style={
                  styles.muted
                }
              >
                Choose a date, then choose the exact start and end time
                you want to make available. Appointment length is
                calculated automatically. Participants will choose two
                preferred appointment times.
              </p>

              <div
                style={
                  styles.availabilityStatusGrid
                }
              >
                <div
                  style={
                    styles.availabilityMiniMetric
                  }
                >
                  <strong>
                    {availableSlotCount}
                  </strong>

                  <span>
                    Available Times
                  </span>
                </div>

                <div
                  style={
                    styles.availabilityMiniMetric
                  }
                >
                  <strong>
                    {bookedSlotCount}
                  </strong>

                  <span>
                    Booked Times
                  </span>
                </div>
              </div>

              {editingAvailabilityId ? (
                <div
                  style={
                    styles.editNotice
                  }
                >
                  ✏ You are editing an existing appointment time.
                </div>
              ) : null}

              <div
                style={
                  styles.availabilityBuilder
                }
              >
                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    Date
                  </span>

                  <input
                    type="date"
                    value={
                      availabilityDate
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setAvailabilityDate(
                          e.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                  />
                </label>

                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    Start Time
                  </span>

                  <select
                    value={
                      availabilityStartTime
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setAvailabilityStartTime(
                          e.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                  >
                    <option
                      value=""
                    >
                      Select start time
                    </option>

                    {TIME_OPTIONS.map(
                      (
                        time
                      ) => (
                        <option
                          key={`start-${time.value}`}
                          value={
                            time.value
                          }
                        >
                          {time.label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    End Time
                  </span>

                  <select
                    value={
                      availabilityEndTime
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setAvailabilityEndTime(
                          e.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                  >
                    <option
                      value=""
                    >
                      Select end time
                    </option>

                    {TIME_OPTIONS.map(
                      (
                        time
                      ) => (
                        <option
                          key={`end-${time.value}`}
                          value={
                            time.value
                          }
                        >
                          {time.label}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    Optional Label
                  </span>

                  <input
                    value={
                      newSlotLabel
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setNewSlotLabel(
                          e.target.value
                        )
                    }
                    placeholder="Example: Resume Reviews"
                    style={
                      styles.input
                    }
                  />
                </label>
              </div>

              {availabilityStartTime &&
              availabilityEndTime ? (
                <div
                  style={{
                    ...styles.durationPreview,

                    ...(availabilityDuration !==
                      null &&
                    availabilityDuration <=
                      0
                      ? styles.durationPreviewError
                      : {}),
                  }}
                >
                  <span
                    style={
                      styles.durationLabel
                    }
                  >
                    APPOINTMENT LENGTH
                  </span>

                  <strong
                    style={
                      styles.durationValue
                    }
                  >
                    {formatDuration(
                      availabilityDuration
                    )}
                  </strong>

                  {availabilityDuration !==
                    null &&
                  availabilityDuration >
                    0 ? (
                    <p
                      style={
                        styles.durationTimeRange
                      }
                    >
                      {TIME_OPTIONS.find(
                        (
                          time
                        ) =>
                          time.value ===
                          availabilityStartTime
                      )?.label ||
                        availabilityStartTime}
                      {" – "}
                      {TIME_OPTIONS.find(
                        (
                          time
                        ) =>
                          time.value ===
                          availabilityEndTime
                      )?.label ||
                        availabilityEndTime}
                    </p>
                  ) : null}
                </div>
              ) : null}

              <div
                style={
                  styles.availabilityFormActions
                }
              >
                <button
                  type="button"
                  onClick={
                    saveAvailabilitySlot
                  }
                  disabled={
                    addingAvailability
                  }
                  style={
                    styles.primaryButton
                  }
                >
                  {addingAvailability
                    ? "Saving..."
                    : editingAvailabilityId
                      ? "Save Changes"
                      : "+ Add Availability"}
                </button>

                {editingAvailabilityId ? (
                  <button
                    type="button"
                    onClick={
                      cancelAvailabilityEdit
                    }
                    style={
                      styles.secondaryButton
                    }
                  >
                    Cancel Edit
                  </button>
                ) : null}
              </div>
            </section>

            <section
              style={
                styles.card
              }
            >
              <div
                style={
                  styles.sectionTop
                }
              >
                <div>
                  <h2
                    style={
                      styles.sectionTitle
                    }
                  >
                    Appointment Times
                  </h2>

                  <p
                    style={
                      styles.muted
                    }
                  >
                    Available appointment times can be edited, hidden,
                    activated, or deleted. Booked appointments remain manageable:
                    you can open the request, edit the appointment time, add notes,
                    reschedule, or cancel without losing admin access.
                  </p>
                </div>
              </div>

              <div
                style={
                  styles.availabilityAdminGrid
                }
              >
                {availabilitySlots.map(
                  (
                    slot
                  ) => {
                    const start =
                      new Date(
                        slot.start_time
                      );

                    const end =
                      slot.end_time
                        ? new Date(
                            slot.end_time
                          )
                        : null;

                    const duration =
                      end
                        ? Math.round(
                            (
                              end.getTime() -
                              start.getTime()
                            ) /
                              60000
                          )
                        : null;

                    const booked =
                      Boolean(
                        slot.booked_request_id
                      );

                    return (
                      <div
                        key={
                          slot.id
                        }
                        style={{
                          ...styles.availabilityAdminCard,

                          ...(!slot.is_active &&
                          !booked
                            ? styles.inactiveAvailability
                            : {}),

                          ...(booked
                            ? styles.bookedAvailabilityCard
                            : {}),
                        }}
                      >
                        <span
                          style={{
                            ...styles.availabilityStatus,

                            color:
                              booked
                                ? "#fca5a5"
                                : slot.is_active
                                  ? "#86efac"
                                  : "#a1a1aa",
                          }}
                        >
                          {booked
                            ? "● BOOKED"
                            : slot.is_active
                              ? "● AVAILABLE"
                              : "○ HIDDEN"}
                        </span>

                        <strong
                          style={
                            styles.availabilityDay
                          }
                        >
                          {start.toLocaleDateString(
                            [],
                            {
                              weekday:
                                "long",

                              month:
                                "long",

                              day:
                                "numeric",

                              year:
                                "numeric",
                            }
                          )}
                        </strong>

                        <div
                          style={
                            styles.timeRange
                          }
                        >
                          <strong>
                            {formatTimeOnly(
                              slot.start_time
                            )}
                          </strong>

                          <span>
                            →
                          </span>

                          <strong>
                            {formatTimeOnly(
                              slot.end_time
                            )}
                          </strong>
                        </div>

                        <div
                          style={
                            styles.durationBadge
                          }
                        >
                          {formatDuration(
                            duration
                          ) ||
                            "Duration unavailable"}
                        </div>

                        {slot.label ? (
                          <span
                            style={
                              styles.availabilityLabel
                            }
                          >
                            {slot.label}
                          </span>
                        ) : null}

                        <div
                          style={
                            styles.availabilityActions
                          }
                        >
                          <button
                            type="button"
                            onClick={() =>
                              editAvailability(
                                slot
                              )
                            }
                            style={
                              styles.editButtonSmall
                            }
                          >
                            {booked
                              ? "Edit Time"
                              : "Edit"}
                          </button>

                          {booked ? (
                            <button
                              type="button"
                              onClick={() =>
                                openBookedRequest(
                                  slot.booked_request_id
                                )
                              }
                              style={
                                styles.secondaryButtonSmall
                              }
                            >
                              Open Appointment
                            </button>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  toggleAvailability(
                                    slot
                                  )
                                }
                                style={
                                  styles.secondaryButtonSmall
                                }
                              >
                                {slot.is_active
                                  ? "Hide"
                                  : "Activate"}
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  deleteAvailability(
                                    slot.id
                                  )
                                }
                                style={
                                  styles.deleteButtonSmall
                                }
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>

                        {booked ? (
                          <div
                            style={
                              styles.bookedMessage
                            }
                          >
                            This time is booked, but you can still edit the
                            appointment or open the participant request to add
                            notes, reschedule, complete, or cancel it.
                          </div>
                        ) : null}
                      </div>
                    );
                  }
                )}
              </div>

              {availabilitySlots.length ===
              0 ? (
                <div
                  style={
                    styles.emptyPanel
                  }
                >
                  No availability has been added yet.
                </div>
              ) : null}
            </section>
          </>
        ) : null}

        {/* =================================================
            CAREER CONNECT SETTINGS
        ================================================= */}

        {activeTab ===
          "career_connect" &&
        isSystemAdmin ? (
          <section
            style={
              styles.card
            }
          >
            <p
              style={
                styles.kicker
              }
            >
              ADMIN SETTINGS
            </p>

            <h2
              style={
                styles.sectionTitle
              }
            >
              Career Connect Settings
            </h2>

            <p
              style={
                styles.muted
              }
            >
              Change your meeting room and Open Room schedule directly
              from HireMinds without editing GitHub.
            </p>

            <div
              style={
                styles.settingsGrid
              }
            >
              <SettingInput
                label="Live Meeting Link"
                value={
                  careerSettings.meeting_link
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "meeting_link",
                      value
                    )
                }
              />

              <SettingInput
                label="Open Room Title"
                value={
                  careerSettings.open_room_title
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "open_room_title",
                      value
                    )
                }
              />

              <SettingInput
                label="Schedule"
                value={
                  careerSettings.open_room_schedule
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "open_room_schedule",
                      value
                    )
                }
              />

              <SettingInput
                label="Time"
                value={
                  careerSettings.open_room_time
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "open_room_time",
                      value
                    )
                }
              />

              <SettingInput
                label="Doors Open"
                value={
                  careerSettings.doors_open
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "doors_open",
                      value
                    )
                }
              />

              <SettingInput
                label="Doors Close"
                value={
                  careerSettings.doors_close
                }
                onChange={
                  (
                    value
                  ) =>
                    updateCareerSetting(
                      "doors_close",
                      value
                    )
                }
              />
            </div>

            <label
              style={
                styles.fieldWrap
              }
            >
              <span
                style={
                  styles.controlLabel
                }
              >
                Open Room Description / Note
              </span>

              <textarea
                value={
                  careerSettings.open_room_note
                }
                onChange={
                  (
                    e
                  ) =>
                    updateCareerSetting(
                      "open_room_note",
                      e.target.value
                    )
                }
                style={
                  styles.textarea
                }
              />
            </label>

            <div
              style={
                styles.settingsPreview
              }
            >
              <p
                style={
                  styles.kicker
                }
              >
                LIVE PREVIEW
              </p>

              <h3
                style={
                  styles.settingsPreviewTitle
                }
              >
                {careerSettings.open_room_title}
              </h3>

              <p>
                <strong>
                  Schedule:
                </strong>{" "}
                {careerSettings.open_room_schedule}
              </p>

              <p>
                <strong>
                  Time:
                </strong>{" "}
                {careerSettings.open_room_time}
              </p>

              <p>
                <strong>
                  Doors Open:
                </strong>{" "}
                {careerSettings.doors_open}
              </p>

              <p>
                <strong>
                  Doors Close:
                </strong>{" "}
                {careerSettings.doors_close}
              </p>

              <p
                style={
                  styles.muted
                }
              >
                {careerSettings.open_room_note}
              </p>
            </div>

            <button
              type="button"
              onClick={
                saveCareerConnectSettings
              }
              disabled={
                savingCareerSettings
              }
              style={
                styles.primaryButton
              }
            >
              {savingCareerSettings
                ? "Saving..."
                : "Save Career Connect Settings"}
            </button>
          </section>
        ) : null}

        {/* =================================================
            REPORTS
        ================================================= */}

        {activeTab ===
        "reports" ? (
          <>
            <section
              className="no-print"
              style={
                styles.card
              }
            >
              <p
                style={
                  styles.kicker
                }
              >
                REPORT BUILDER
              </p>

              <h2
                style={
                  styles.sectionTitle
                }
              >
                Generate HireMinds Report
              </h2>

              <p
                style={
                  styles.muted
                }
              >
                Select one referral code, multiple codes, all codes, or
                an individual participant. Participants are listed once
                while their services and activities are quantified
                separately.
              </p>

              <div
                style={
                  styles.reportControls
                }
              >
                <div>
                  <p
                    style={
                      styles.controlLabel
                    }
                  >
                    Referral Codes
                  </p>

                  <div
                    style={
                      styles.smallButtonRow
                    }
                  >
                    <button
                      type="button"
                      onClick={
                        selectAllCodes
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={
                        clearAllCodes
                      }
                      style={
                        styles.secondaryButton
                      }
                    >
                      Clear All
                    </button>
                  </div>

                  <div
                    style={
                      styles.codeSelector
                    }
                  >
                    {referralCodes.map(
                      (
                        code
                      ) => (
                        <label
                          key={
                            code
                          }
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
                            checked={
                              selectedCodes.includes(
                                code
                              )
                            }
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

                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    Participant
                  </span>

                  <select
                    value={
                      reportParticipantKey
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setReportParticipantKey(
                          e.target.value
                        )
                    }
                    style={
                      styles.input
                    }
                  >
                    <option
                      value="all"
                    >
                      All Participants
                    </option>

                    {reportParticipantOptions.map(
                      (
                        item
                      ) => (
                        <option
                          key={
                            item.key
                          }
                          value={
                            item.key
                          }
                        >
                          {item.name} — {item.referralCode}
                        </option>
                      )
                    )}
                  </select>
                </label>

                <label
                  style={
                    styles.fieldWrap
                  }
                >
                  <span
                    style={
                      styles.controlLabel
                    }
                  >
                    Reporting Period
                  </span>

                  <select
                    value={
                      reportPeriod
                    }
                    onChange={
                      (
                        e
                      ) =>
                        setReportPeriod(
                          e.target.value as PeriodKey
                        )
                    }
                    style={
                      styles.input
                    }
                  >
                    <option
                      value="all"
                    >
                      All Time
                    </option>

                    <option
                      value="day"
                    >
                      Today
                    </option>

                    <option
                      value="week"
                    >
                      This Week
                    </option>

                    <option
                      value="month"
                    >
                      This Month
                    </option>

                    <option
                      value="quarter"
                    >
                      This Quarter
                    </option>

                    <option
                      value="fiscal"
                    >
                      Fiscal Year
                    </option>

                    <option
                      value="custom"
                    >
                      Custom Date Range
                    </option>
                  </select>
                </label>

                {reportPeriod ===
                "custom" ? (
                  <div
                    style={
                      styles.dateGrid
                    }
                  >
                    <label
                      style={
                        styles.fieldWrap
                      }
                    >
                      <span
                        style={
                          styles.controlLabel
                        }
                      >
                        Start Date
                      </span>

                      <input
                        type="date"
                        value={
                          reportStartDate
                        }
                        onChange={
                          (
                            e
                          ) =>
                            setReportStartDate(
                              e.target.value
                            )
                        }
                        style={
                          styles.input
                        }
                      />
                    </label>

                    <label
                      style={
                        styles.fieldWrap
                      }
                    >
                      <span
                        style={
                          styles.controlLabel
                        }
                      >
                        End Date
                      </span>

                      <input
                        type="date"
                        value={
                          reportEndDate
                        }
                        onChange={
                          (
                            e
                          ) =>
                            setReportEndDate(
                              e.target.value
                            )
                        }
                        style={
                          styles.input
                        }
                      />
                    </label>
                  </div>
                ) : null}

                <div>
                  <p
                    style={
                      styles.controlLabel
                    }
                  >
                    Choose Additional Data
                  </p>

                  <div
                    style={
                      styles.optionalGrid
                    }
                  >
                    {[
                      {
                        key:
                          "tool_engagements",

                        label:
                          "Career Tool Engagements",
                      },

                      {
                        key:
                          "completed_activities",

                        label:
                          "Completed Activities",
                      },

                      {
                        key:
                          "activity_records",

                        label:
                          "Total Activity Records",
                      },

                      {
                        key:
                          "most_used_tool",

                        label:
                          "Most Used Tool",
                      },

                      {
                        key:
                          "career_services",

                        label:
                          "Career Connect Services",
                      },

                      {
                        key:
                          "document_submissions",

                        label:
                          "Document Submissions",
                      },

                      {
                        key:
                          "cancellations",

                        label:
                          "Participant Cancellations",
                      },

                      {
                        key:
                          "code_comparison",

                        label:
                          "Referral Code Comparison",
                      },
                    ].map(
                      (
                        item
                      ) => {
                        const key =
                          item.key as OptionalMetricKey;

                        const checked =
                          hasOptionalMetric(
                            key
                          );

                        return (
                          <label
                            key={
                              item.key
                            }
                            style={{
                              ...styles.optionalChoice,

                              ...(checked
                                ? styles.optionalChoiceActive
                                : {}),
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={
                                checked
                              }
                              onChange={() =>
                                toggleOptionalMetric(
                                  key
                                )
                              }
                            />

                            {item.label}
                          </label>
                        );
                      }
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* =============================================
                WHITE LIVE PREVIEW
            ============================================= */}

            <section
              id="hireminds-report"
              style={
                styles.reportCard
              }
            >
              <div
                style={
                  styles.reportHeader
                }
              >
                <div>
                  <p
                    style={
                      styles.reportBrand
                    }
                  >
                    HireMinds™
                  </p>

                  <h1
                    style={
                      styles.reportTitle
                    }
                  >
                    {individualParticipant
                      ? "Participant Progress Report"
                      : "Workforce Summary Report"}
                  </h1>
                </div>

                <div
                  style={
                    styles.reportDate
                  }
                >
                  Generated{" "}
                  {new Date().toLocaleDateString()}
                </div>
              </div>

              <div
                className="hm-report-meta"
                style={
                  styles.reportMeta
                }
              >
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
                    {reportingPeriodLabel}
                  </p>
                </div>
              </div>

              <div
                className="hm-report-metrics"
                style={
                  styles.reportMetrics
                }
              >
                <ReportMetric
                  value={
                    reportStats.participantsServed
                  }
                  label="Participants Served"
                />

                <ReportMetric
                  value={
                    reportStats.newEnrollments
                  }
                  label="New Enrollments"
                />

                <ReportMetric
                  value={
                    reportStats.activeParticipants
                  }
                  label="Active Participants"
                />

                <ReportMetric
                  value={
                    reportStats.trainingEnrollments
                  }
                  label="Training Enrollment"
                />

                {hasOptionalMetric(
                  "career_services"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.careerServices
                    }
                    label="Career Services"
                  />
                ) : null}

                {hasOptionalMetric(
                  "document_submissions"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.documentSubmissions
                    }
                    label="Documents Submitted"
                  />
                ) : null}

                {hasOptionalMetric(
                  "cancellations"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.cancellations
                    }
                    label="Participant Cancellations"
                  />
                ) : null}

                {hasOptionalMetric(
                  "tool_engagements"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.toolUses
                    }
                    label="Career Tool Engagements"
                  />
                ) : null}

                {hasOptionalMetric(
                  "completed_activities"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.completions
                    }
                    label="Completed Activities"
                  />
                ) : null}

                {hasOptionalMetric(
                  "activity_records"
                ) ? (
                  <ReportMetric
                    value={
                      reportStats.activities
                    }
                    label="Activity Records"
                  />
                ) : null}
              </div>

              {hasOptionalMetric(
                "most_used_tool"
              ) &&
              reportStats.topTool !==
                "—" ? (
                <div
                  style={
                    styles.highlightStrip
                  }
                >
                  <strong>
                    Most Used Tool:
                  </strong>{" "}
                  {reportStats.topTool}{" "}
                  ({reportStats.topToolUses} uses)
                </div>
              ) : null}

              <section
                style={
                  styles.summaryBox
                }
              >
                <h2
                  style={
                    styles.reportSectionTitle
                  }
                >
                  Summary
                </h2>

                <p
                  style={
                    styles.reportText
                  }
                >
                  {reportSummaryText}
                </p>
              </section>

              {hasOptionalMetric(
                "career_services"
              ) &&
              serviceBreakdown.length >
                0 ? (
                <section>
                  <h2
                    style={
                      styles.reportSectionTitle
                    }
                  >
                    Career Connect Service Breakdown
                  </h2>

                  <div
                    style={
                      styles.breakdownGrid
                    }
                  >
                    {serviceBreakdown.map(
                      ([
                        label,
                        count,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          style={
                            styles.breakdownCard
                          }
                        >
                          <h3
                            style={
                              styles.breakdownTitle
                            }
                          >
                            {label}
                          </h3>

                          <p>
                            Services Recorded:{" "}
                            <strong>
                              {count}
                            </strong>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              {hasOptionalMetric(
                "document_submissions"
              ) &&
              documentSubmissionBreakdown.length >
                0 ? (
                <section>
                  <h2
                    style={
                      styles.reportSectionTitle
                    }
                  >
                    Document Submission Breakdown
                  </h2>

                  <div
                    style={
                      styles.breakdownGrid
                    }
                  >
                    {documentSubmissionBreakdown.map(
                      ([
                        label,
                        count,
                      ]) => (
                        <div
                          key={
                            label
                          }
                          style={
                            styles.breakdownCard
                          }
                        >
                          <h3
                            style={
                              styles.breakdownTitle
                            }
                          >
                            {label}
                          </h3>

                          <p>
                            Submitted:{" "}
                            <strong>
                              {count}
                            </strong>
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              {!individualParticipant &&
              hasOptionalMetric(
                "code_comparison"
              ) ? (
                <section>
                  <h2
                    style={
                      styles.reportSectionTitle
                    }
                  >
                    Referral Code Breakdown
                  </h2>

                  <div
                    style={
                      styles.breakdownGrid
                    }
                  >
                    {codeBreakdown.map(
                      (
                        item
                      ) => (
                        <div
                          key={
                            item.code
                          }
                          style={
                            styles.breakdownCard
                          }
                        >
                          <h3
                            style={
                              styles.breakdownTitle
                            }
                          >
                            {item.code}
                          </h3>

                          <p>
                            Participants:{" "}
                            <strong>
                              {item.participants}
                            </strong>
                          </p>

                          <p>
                            New Enrollments:{" "}
                            <strong>
                              {item.newEnrollments}
                            </strong>
                          </p>

                          <p>
                            Active:{" "}
                            <strong>
                              {item.active}
                            </strong>
                          </p>

                          <p>
                            Tool Engagements:{" "}
                            <strong>
                              {item.toolUses}
                            </strong>
                          </p>

                          {hasOptionalMetric(
                            "cancellations"
                          ) ? (
                            <p>
                              Participant Cancellations:{" "}
                              <strong>
                                {item.cancellations}
                              </strong>
                            </p>
                          ) : null}
                        </div>
                      )
                    )}
                  </div>
                </section>
              ) : null}

              <section>
                <h2
                  style={
                    styles.reportSectionTitle
                  }
                >
                  Participant Summary
                </h2>

                <p
                  style={
                    styles.reportIntroText
                  }
                >
                  Each participant is listed once.
                </p>

                <div
                  style={
                    styles.tableWrap
                  }
                >
                  <table
                    style={
                      styles.reportTable
                    }
                  >
                    <thead>
                      <tr>
                        <th
                          style={
                            styles.reportTh
                          }
                        >
                          Participant
                        </th>

                        <th
                          style={
                            styles.reportTh
                          }
                        >
                          Code
                        </th>

                        <th
                          style={
                            styles.reportTh
                          }
                        >
                          Sign-Up
                        </th>

                        <th
                          style={
                            styles.reportTh
                          }
                        >
                          Last Activity
                        </th>

                        {hasOptionalMetric(
                          "activity_records"
                        ) ? (
                          <th
                            style={
                              styles.reportTh
                            }
                          >
                            Activity
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "tool_engagements"
                        ) ? (
                          <th
                            style={
                              styles.reportTh
                            }
                          >
                            Tool Uses
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "completed_activities"
                        ) ? (
                          <th
                            style={
                              styles.reportTh
                            }
                          >
                            Completed
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "document_submissions"
                        ) ? (
                          <th
                            style={
                              styles.reportTh
                            }
                          >
                            Documents
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "cancellations"
                        ) ? (
                          <th
                            style={
                              styles.reportTh
                            }
                          >
                            Cancellations
                          </th>
                        ) : null}
                      </tr>
                    </thead>

                    <tbody>
                      {participantSummary.map(
                        (
                          row
                        ) => (
                          <tr
                            key={
                              row.key
                            }
                          >
                            <td
                              style={
                                styles.reportTd
                              }
                            >
                              {row.participant.full_name ||
                                row.participant.email ||
                                "Participant"}

                              {row.cancellations >=
                              2 ? (
                                <div
                                  style={
                                    styles.reportReferralWarning
                                  }
                                >
                                  ⚠ Refer back to provider
                                </div>
                              ) : null}
                            </td>

                            <td
                              style={
                                styles.reportTd
                              }
                            >
                              {row.referralCode}
                            </td>

                            <td
                              style={
                                styles.reportTd
                              }
                            >
                              {formatShortDate(
                                row.signupDate
                              )}
                            </td>

                            <td
                              style={
                                styles.reportTd
                              }
                            >
                              {formatShortDate(
                                row.lastActivity
                              )}
                            </td>

                            {hasOptionalMetric(
                              "activity_records"
                            ) ? (
                              <td
                                style={
                                  styles.reportTd
                                }
                              >
                                {row.activityCount}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "tool_engagements"
                            ) ? (
                              <td
                                style={
                                  styles.reportTd
                                }
                              >
                                {row.toolUses}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "completed_activities"
                            ) ? (
                              <td
                                style={
                                  styles.reportTd
                                }
                              >
                                {row.completions}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "document_submissions"
                            ) ? (
                              <td
                                style={
                                  styles.reportTd
                                }
                              >
                                {row.documentSubmissions}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "cancellations"
                            ) ? (
                              <td
                                style={
                                  styles.reportTd
                                }
                              >
                                {row.cancellations}
                              </td>
                            ) : null}
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </section>

              <p
                style={
                  styles.reportFooter
                }
              >
                HireMinds™ Workforce Infrastructure Platform
              </p>
            </section>

            <div
              className="no-print"
              style={
                styles.reportActions
              }
            >
              <button
                type="button"
                onClick={
                  printReport
                }
                style={
                  styles.primaryButton
                }
              >
                Print Report
              </button>

              <button
                type="button"
                onClick={
                  exportCSV
                }
                style={
                  styles.secondaryButton
                }
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

/* =========================================================
   COMPONENTS
========================================================= */

function MetricCard({
  label,
  value,
}: {
  label:
    string;

  value:
    | string
    | number;
}) {
  return (
    <div
      style={
        styles.metricCard
      }
    >
      <p
        style={
          styles.metricLabel
        }
      >
        {label}
      </p>

      <p
        style={
          styles.metricValue
        }
      >
        {value}
      </p>
    </div>
  );
}

function ReportMetric({
  value,
  label,
}: {
  value:
    | string
    | number;

  label:
    string;
}) {
  return (
    <div
      style={
        styles.reportMetric
      }
    >
      <strong>
        {value}
      </strong>

      <span>
        {label}
      </span>
    </div>
  );
}

function SettingInput({
  label,
  value,
  onChange,
}: {
  label:
    string;

  value:
    string;

  onChange:
    (
      value:
        string
    ) => void;
}) {
  return (
    <label
      style={
        styles.fieldWrap
      }
    >
      <span
        style={
          styles.controlLabel
        }
      >
        {label}
      </span>

      <input
        value={
          value
        }
        onChange={
          (
            e
          ) =>
            onChange(
              e.target.value
            )
        }
        style={
          styles.input
        }
      />
    </label>
  );
}

function ActivityTable({
  title,
  rows,
}: {
  title:
    string;

  rows:
    ActivityRow[];
}) {
  return (
    <section
      style={
        styles.card
      }
    >
      <h2
        style={
          styles.sectionTitle
        }
      >
        {title}
      </h2>

      <div
        style={
          styles.tableWrap
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
                Tool / Service
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
            {rows.map(
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
                      row.email ||
                      "Participant"}
                  </td>

                  <td
                    style={
                      styles.td
                    }
                  >
                    <span
                      style={
                        styles.codeBadge
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
  );
}

/* =========================================================
   STYLES
========================================================= */

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight:
      "100vh",

    background:
      "radial-gradient(circle at top left, rgba(59,130,246,.08), transparent 28%), linear-gradient(180deg,#050505,#0d0d0f)",

    color:
      "#f5f5f5",

    padding:
      "32px 24px 60px",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  centerWrap: {
    minHeight:
      "70vh",

    display:
      "flex",

    alignItems:
      "center",

    justifyContent:
      "center",
  },

  shell: {
    maxWidth:
      1500,

    margin:
      "0 auto",

    display:
      "grid",

    gap:
      22,
  },

  headerCard: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      20,

    flexWrap:
      "wrap",

    padding:
      26,

    borderRadius:
      24,

    background:
      "#151517",

    border:
      "1px solid #28282c",
  },

  kicker: {
    margin:
      "0 0 8px",

    color:
      "#93c5fd",

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      ".18em",
  },

  title: {
    margin:
      "0 0 8px",

    fontSize:
      38,
  },

  subtitle: {
    color:
      "#d4d4d8",

    lineHeight:
      1.6,
  },

  subtleLine: {
    margin:
      "6px 0",

    color:
      "#a1a1aa",

    fontSize:
      13,
  },

  adminLine: {
    margin:
      "8px 0",

    color:
      "#86efac",

    fontSize:
      12,

    fontWeight:
      800,
  },

  headerActions: {
    display:
      "flex",

    gap:
      10,

    flexWrap:
      "wrap",
  },

  notice: {
    padding:
      14,

    borderRadius:
      14,

    background:
      "rgba(250,204,21,.08)",

    border:
      "1px solid rgba(250,204,21,.15)",

    color:
      "#fde68a",
  },

  card: {
    padding:
      24,

    borderRadius:
      24,

    background:
      "#151517",

    border:
      "1px solid #28282c",
  },

  tabRow: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      10,
  },

  tabButton: {
    padding:
      "10px 15px",

    borderRadius:
      999,

    border:
      "1px solid #34343a",

    background:
      "#101012",

    color:
      "#f5f5f5",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  tabButtonActive: {
    background:
      "#f5f5f5",

    color:
      "#080808",
  },

  summaryGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",

    gap:
      16,
  },

  metricCard: {
    padding:
      22,

    borderRadius:
      20,

    background:
      "#151517",

    border:
      "1px solid #28282c",
  },

  metricLabel: {
    margin:
      "0 0 8px",

    color:
      "#a1a1aa",

    fontSize:
      13,
  },

  metricValue: {
    margin:
      0,

    fontSize:
      38,

    fontWeight:
      800,
  },

  sectionTop: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      18,

    flexWrap:
      "wrap",
  },

  sectionTitle: {
    marginTop:
      0,

    marginBottom:
      10,

    fontSize:
      28,
  },

  muted: {
    color:
      "#b7b7be",

    lineHeight:
      1.7,
  },

  input: {
    width:
      "100%",

    padding:
      "13px 14px",

    borderRadius:
      14,

    border:
      "1px solid #34343a",

    background:
      "#0d0d0f",

    color:
      "#ffffff",

    boxSizing:
      "border-box",

    outline:
      "none",
  },

  textarea: {
    width:
      "100%",

    minHeight:
      120,

    padding:
      "13px 14px",

    borderRadius:
      14,

    border:
      "1px solid #34343a",

    background:
      "#0d0d0f",

    color:
      "#ffffff",

    boxSizing:
      "border-box",

    outline:
      "none",

    resize:
      "vertical",
  },

  tableWrap: {
    overflowX:
      "auto",

    marginTop:
      18,
  },

  table: {
    width:
      "100%",

    borderCollapse:
      "collapse",
  },

  th: {
    padding:
      12,

    textAlign:
      "left",

    color:
      "#a1a1aa",

    borderBottom:
      "1px solid #303035",

    fontSize:
      13,
  },

  td: {
    padding:
      12,

    borderBottom:
      "1px solid #242428",

    fontSize:
      14,
  },

  codeBadge: {
    display:
      "inline-block",

    padding:
      "6px 10px",

    borderRadius:
      999,

    background:
      "rgba(59,130,246,.13)",

    color:
      "#bfdbfe",

    fontSize:
      12,

    fontWeight:
      800,
  },

  primaryButton: {
    padding:
      "12px 18px",

    borderRadius:
      14,

    border:
      "none",

    background:
      "#f5f5f5",

    color:
      "#09090b",

    fontWeight:
      800,

    cursor:
      "pointer",
  },

  secondaryButton: {
    padding:
      "12px 16px",

    borderRadius:
      14,

    border:
      "1px solid #34343a",

    background:
      "#101012",

    color:
      "#f5f5f5",

    fontWeight:
      700,

    cursor:
      "pointer",
  },

  logoutButton: {
    padding:
      "12px 16px",

    borderRadius:
      14,

    border:
      "1px solid #334155",

    background:
      "#112b5f",

    color:
      "#ffffff",

    fontWeight:
      700,

    cursor:
      "pointer",
  },

  fieldWrap: {
    display:
      "grid",

    gap:
      8,
  },

  controlLabel: {
    display:
      "block",

    color:
      "#d4d4d8",

    fontWeight:
      700,

    fontSize:
      13,
  },

  referralWarningInline: {
    marginTop:
      5,

    color:
      "#fca5a5",

    fontSize:
      10,

    fontWeight:
      800,
  },

  cancellationBadge: {
    display:
      "inline-flex",

    alignItems:
      "center",

    justifyContent:
      "center",

    minWidth:
      30,

    height:
      30,

    borderRadius:
      999,

    background:
      "rgba(255,255,255,.05)",

    border:
      "1px solid #34343a",

    fontWeight:
      800,
  },

  cancellationBadgeWarning: {
    color:
      "#fca5a5",

    background:
      "rgba(248,113,113,.09)",

    border:
      "1px solid rgba(248,113,113,.25)",
  },

  /* =======================================================
     REQUESTS
  ======================================================= */

  requestStatsGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(140px,200px))",

    gap:
      12,

    marginTop:
      20,
  },

  requestMiniStat: {
    padding:
      15,

    borderRadius:
      14,

    background:
      "#0f0f11",

    border:
      "1px solid #29292e",

    display:
      "grid",

    gap:
      4,
  },

  requestControls: {
    display:
      "grid",

    gridTemplateColumns:
      "2fr 1fr",

    gap:
      12,

    marginTop:
      20,
  },

  requestList: {
    display:
      "grid",

    gap:
      18,

    marginTop:
      22,
  },

  requestGroupItem: {
    display:
      "grid",

    gap:
      12,
  },

  participantGroupHeader: {
    marginTop:
      8,

    padding:
      "16px 18px",

    borderRadius:
      16,

    background:
      "linear-gradient(90deg, rgba(22,119,255,.13), rgba(22,119,255,.035))",

    border:
      "1px solid rgba(22,119,255,.28)",

    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      16,

    flexWrap:
      "wrap",
  },

  participantGroupEyebrow: {
    margin:
      0,

    color:
      "#60a5fa",

    fontSize:
      9,

    fontWeight:
      900,

    letterSpacing:
      ".14em",
  },

  participantGroupName: {
    margin:
      "4px 0 0",

    color:
      "#ffffff",

    fontSize:
      21,
  },

  participantGroupEmail: {
    margin:
      "5px 0 0",

    color:
      "#9ca3af",

    fontSize:
      12,
  },

  participantGroupStats: {
    display:
      "flex",

    gap:
      8,

    flexWrap:
      "wrap",
  },

  groupConfirmedBadge: {
    padding:
      "6px 10px",

    borderRadius:
      999,

    background:
      "rgba(34,197,94,.12)",

    border:
      "1px solid rgba(34,197,94,.28)",

    color:
      "#86efac",

    fontSize:
      10,

    fontWeight:
      900,
  },

  groupActiveBadge: {
    padding:
      "6px 10px",

    borderRadius:
      999,

    background:
      "rgba(250,204,21,.10)",

    border:
      "1px solid rgba(250,204,21,.24)",

    color:
      "#fde68a",

    fontSize:
      10,

    fontWeight:
      900,
  },

  groupClosedBadge: {
    padding:
      "6px 10px",

    borderRadius:
      999,

    background:
      "rgba(113,113,122,.14)",

    border:
      "1px solid rgba(113,113,122,.25)",

    color:
      "#d4d4d8",

    fontSize:
      10,

    fontWeight:
      900,
  },

  requestCard: {
    padding:
      22,

    borderRadius:
      20,

    background:
      "#0f0f11",

    border:
      "1px solid #2d2d33",

    display:
      "grid",

    gap:
      18,
  },

  requestHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap:
      16,

    flexWrap:
      "wrap",
  },

  requestNameRow: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    flexWrap:
      "wrap",
  },

  requestName: {
    margin:
      0,

    fontSize:
      22,
  },

  requestSubline: {
    margin:
      "7px 0",

    color:
      "#9ca3af",

    fontSize:
      13,
  },

  requestServiceTitle: {
    margin:
      "8px 0 0",

    color:
      "#93c5fd",

    fontSize:
      15,

    fontWeight:
      800,
  },

  requestDateText: {
    color:
      "#9ca3af",

    fontSize:
      12,
  },

  statusBadge: {
    display:
      "inline-flex",

    padding:
      "6px 10px",

    borderRadius:
      999,

    fontSize:
      10,

    fontWeight:
      900,

    letterSpacing:
      ".06em",
  },

  agreementAcceptedBox: {
    padding:
      "12px 14px",

    borderRadius:
      14,

    background:
      "rgba(34,197,94,.06)",

    border:
      "1px solid rgba(34,197,94,.18)",

    color:
      "#86efac",
  },

  agreementMissingBox: {
    padding:
      "12px 14px",

    borderRadius:
      14,

    background:
      "rgba(248,113,113,.06)",

    border:
      "1px solid rgba(248,113,113,.18)",

    color:
      "#fca5a5",
  },

  agreementDate: {
    margin:
      "5px 0 0",

    color:
      "#a1a1aa",

    fontSize:
      11,
  },

  cancellationSummaryBox: {
    padding:
      15,

    borderRadius:
      15,

    background:
      "rgba(255,255,255,.035)",

    border:
      "1px solid #29292e",

    display:
      "grid",

    gap:
      9,
  },

  cancellationSummaryWarning: {
    background:
      "rgba(248,113,113,.08)",

    border:
      "1px solid rgba(248,113,113,.26)",
  },

  cancellationBigNumber: {
    display:
      "block",

    marginTop:
      5,

    color:
      "#f5f5f5",

    fontSize:
      30,
  },

  cancellationPolicySmall: {
    margin:
      0,

    color:
      "#9ca3af",

    fontSize:
      11,

    lineHeight:
      1.5,
  },

  providerReferralAlert: {
    padding:
      12,

    borderRadius:
      12,

    color:
      "#fecaca",

    background:
      "rgba(248,113,113,.08)",

    border:
      "1px solid rgba(248,113,113,.16)",

    fontSize:
      12,

    lineHeight:
      1.55,

    fontWeight:
      700,
  },

  notesBox: {
    padding:
      14,

    borderRadius:
      14,

    background:
      "rgba(255,255,255,.035)",

    border:
      "1px solid #29292e",

    color:
      "#d4d4d8",

    fontSize:
      13,

    lineHeight:
      1.6,
  },

  adminNotesBox: {
    padding:
      14,

    borderRadius:
      14,

    background:
      "rgba(22,119,255,.07)",

    border:
      "1px solid rgba(22,119,255,.25)",

    color:
      "#dbeafe",

    fontSize:
      13,

    lineHeight:
      1.6,
  },

  requestSection: {
    display:
      "grid",

    gap:
      10,
  },

  requestSectionLabel: {
    margin:
      0,

    color:
      "#a1a1aa",

    fontSize:
      11,

    fontWeight:
      800,

    letterSpacing:
      ".1em",

    textTransform:
      "uppercase",
  },

  preferenceInstruction: {
    margin:
      "-4px 0 4px",

    color:
      "#9ca3af",

    fontSize:
      11,
  },

  choiceList: {
    display:
      "grid",

    gap:
      10,
  },

  choiceCard: {
    display:
      "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap:
      14,

    flexWrap:
      "wrap",

    padding:
      14,

    borderRadius:
      14,

    background:
      "#151517",

    border:
      "1px solid #303035",
  },

  choiceCardConfirmed: {
    background:
      "rgba(34,197,94,.05)",

    border:
      "1px solid rgba(34,197,94,.38)",
  },

  choiceCardUnavailable: {
    opacity:
      0.62,

    border:
      "1px solid rgba(248,113,113,.18)",
  },

  preferenceLabel: {
    display:
      "block",

    color:
      "#93c5fd",

    fontSize:
      10,

    fontWeight:
      800,

    marginBottom:
      4,
  },

  choiceDate: {
    display:
      "block",

    color:
      "#f5f5f5",

    fontSize:
      14,
  },

  choiceTime: {
    display:
      "block",

    color:
      "#bfdbfe",

    marginTop:
      4,

    fontSize:
      13,

    fontWeight:
      700,
  },

  choiceNote: {
    display:
      "block",

    color:
      "#9ca3af",

    marginTop:
      4,

    fontSize:
      11,
  },

  confirmedTimeText: {
    display:
      "block",

    marginTop:
      7,

    color:
      "#86efac",

    fontSize:
      9,

    fontWeight:
      900,

    letterSpacing:
      ".07em",
  },

  unavailableTimeText: {
    display:
      "block",

    marginTop:
      7,

    color:
      "#fca5a5",

    fontSize:
      9,

    fontWeight:
      900,

    letterSpacing:
      ".07em",
  },

  availableTimeText: {
    display:
      "block",

    marginTop:
      7,

    color:
      "#93c5fd",

    fontSize:
      9,

    fontWeight:
      900,

    letterSpacing:
      ".07em",
  },

  confirmButton: {
    padding:
      "9px 13px",

    borderRadius:
      999,

    border:
      "1px solid rgba(59,130,246,.35)",

    background:
      "rgba(59,130,246,.12)",

    color:
      "#bfdbfe",

    fontWeight:
      800,

    cursor:
      "pointer",
  },

  confirmedButton: {
    padding:
      "9px 13px",

    borderRadius:
      999,

    border:
      "1px solid rgba(34,197,94,.35)",

    background:
      "rgba(34,197,94,.12)",

    color:
      "#86efac",

    fontWeight:
      800,

    cursor:
      "default",
  },

  unavailableButton: {
    padding:
      "9px 13px",

    borderRadius:
      999,

    border:
      "1px solid rgba(248,113,113,.18)",

    background:
      "rgba(248,113,113,.06)",

    color:
      "#fca5a5",

    fontWeight:
      800,

    cursor:
      "not-allowed",
  },

  fileRow: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      8,
  },

  fileButton: {
    padding:
      "9px 12px",

    borderRadius:
      12,

    border:
      "1px solid #34343a",

    background:
      "#151517",

    color:
      "#dbeafe",

    cursor:
      "pointer",

    fontSize:
      12,

    fontWeight:
      700,
  },

  requestActions: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      8,

    paddingTop:
      14,

    borderTop:
      "1px solid #28282c",
  },

  actionButtonPurple: {
    padding:
      "9px 12px",

    borderRadius:
      10,

    border:
      "1px solid rgba(168,85,247,.3)",

    background:
      "rgba(168,85,247,.09)",

    color:
      "#d8b4fe",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  actionButtonBlue: {
    padding:
      "9px 12px",

    borderRadius:
      10,

    border:
      "1px solid rgba(59,130,246,.3)",

    background:
      "rgba(59,130,246,.09)",

    color:
      "#bfdbfe",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  actionButtonRed: {
    padding:
      "9px 12px",

    borderRadius:
      10,

    border:
      "1px solid rgba(248,113,113,.3)",

    background:
      "rgba(248,113,113,.08)",

    color:
      "#fca5a5",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  actionButtonNeutral: {
    padding:
      "9px 12px",

    borderRadius:
      10,

    border:
      "1px solid #34343a",

    background:
      "#151517",

    color:
      "#d4d4d8",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  emptyText: {
    color:
      "#71717a",

    fontSize:
      12,
  },

  emptyPanel: {
    padding:
      30,

    borderRadius:
      16,

    border:
      "1px dashed #34343a",

    color:
      "#71717a",

    textAlign:
      "center",

    marginTop:
      18,
  },

  rescheduleAlertBox: {
    padding: 16,
    borderRadius: 15,
    background: "rgba(168,85,247,.08)",
    border: "1px solid rgba(168,85,247,.26)",
    display: "grid",
    gap: 12,
  },

  rescheduleAlertHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    flexWrap: "wrap",
  },

  rescheduleAlertTitle: {
    display: "block",
    marginTop: 6,
    color: "#e9d5ff",
    fontSize: 16,
  },

  rescheduleInfoCard: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,.035)",
    border: "1px solid #303035",
    display: "grid",
    gap: 5,
  },

  rescheduleInfoCardHighlight: {
    padding: 12,
    borderRadius: 12,
    background: "rgba(59,130,246,.08)",
    border: "1px solid rgba(96,165,250,.25)",
    display: "grid",
    gap: 8,
  },

  cancellationNoteBox: {
    padding: 14,
    borderRadius: 14,
    background: "rgba(248,113,113,.07)",
    border: "1px solid rgba(248,113,113,.2)",
    color: "#fecaca",
    fontSize: 13,
    lineHeight: 1.6,
  },

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  availabilityStatusGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(160px,220px))",

    gap:
      12,

    marginTop:
      18,
  },

  availabilityMiniMetric: {
    padding:
      15,

    borderRadius:
      14,

    background:
      "#0f0f11",

    border:
      "1px solid #29292e",

    display:
      "grid",

    gap:
      4,
  },

  availabilityBuilder: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap:
      14,

    marginTop:
      22,
  },

  editNotice: {
    marginTop:
      16,

    padding:
      "11px 13px",

    borderRadius:
      12,

    background:
      "rgba(59,130,246,.08)",

    border:
      "1px solid rgba(59,130,246,.18)",

    color:
      "#bfdbfe",

    fontSize:
      12,

    fontWeight:
      700,
  },

  durationPreview: {
    marginTop:
      18,

    padding:
      16,

    borderRadius:
      16,

    background:
      "rgba(59,130,246,.08)",

    border:
      "1px solid rgba(96,165,250,.18)",

    display:
      "grid",

    gap:
      5,

    maxWidth:
      360,
  },

  durationPreviewError: {
    background:
      "rgba(248,113,113,.06)",

    border:
      "1px solid rgba(248,113,113,.2)",
  },

  durationLabel: {
    color:
      "#93c5fd",

    fontSize:
      9,

    fontWeight:
      900,

    letterSpacing:
      ".12em",
  },

  durationValue: {
    fontSize:
      22,

    color:
      "#f5f5f5",
  },

  durationTimeRange: {
    margin:
      0,

    color:
      "#a1a1aa",

    fontSize:
      12,
  },

  availabilityFormActions: {
    display:
      "flex",

    gap:
      10,

    flexWrap:
      "wrap",

    marginTop:
      18,
  },

  availabilityAdminGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap:
      14,

    marginTop:
      18,
  },

  availabilityAdminCard: {
    padding:
      18,

    borderRadius:
      18,

    background:
      "#0f0f11",

    border:
      "1px solid #303035",

    display:
      "grid",

    gap:
      9,
  },

  bookedAvailabilityCard: {
    background:
      "rgba(248,113,113,.035)",

    border:
      "1px solid rgba(248,113,113,.26)",
  },

  inactiveAvailability: {
    opacity:
      0.55,
  },

  availabilityStatus: {
    fontSize:
      10,

    fontWeight:
      900,

    letterSpacing:
      ".08em",
  },

  availabilityDay: {
    fontSize:
      15,

    color:
      "#f5f5f5",

    lineHeight:
      1.4,
  },

  timeRange: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    color:
      "#bfdbfe",

    fontSize:
      18,
  },

  durationBadge: {
    width:
      "fit-content",

    padding:
      "6px 9px",

    borderRadius:
      999,

    background:
      "rgba(250,204,21,.09)",

    border:
      "1px solid rgba(250,204,21,.18)",

    color:
      "#fde68a",

    fontSize:
      10,

    fontWeight:
      800,
  },

  availabilityLabel: {
    color:
      "#93c5fd",

    fontSize:
      12,
  },

  availabilityActions: {
    display:
      "flex",

    gap:
      8,

    flexWrap:
      "wrap",

    marginTop:
      8,
  },

  bookedMessage: {
    marginTop:
      8,

    padding:
      10,

    borderRadius:
      11,

    color:
      "#fca5a5",

    background:
      "rgba(248,113,113,.06)",

    border:
      "1px solid rgba(248,113,113,.14)",

    fontSize:
      11,

    lineHeight:
      1.5,

    fontWeight:
      700,
  },

  editButtonSmall: {
    padding:
      "8px 11px",

    borderRadius:
      10,

    border:
      "1px solid rgba(59,130,246,.28)",

    background:
      "rgba(59,130,246,.08)",

    color:
      "#bfdbfe",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  secondaryButtonSmall: {
    padding:
      "8px 11px",

    borderRadius:
      10,

    border:
      "1px solid #34343a",

    background:
      "#151517",

    color:
      "#f5f5f5",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  deleteButtonSmall: {
    padding:
      "8px 11px",

    borderRadius:
      10,

    border:
      "1px solid rgba(248,113,113,.25)",

    background:
      "rgba(248,113,113,.06)",

    color:
      "#fca5a5",

    cursor:
      "pointer",

    fontWeight:
      700,
  },

  /* =======================================================
     SETTINGS
  ======================================================= */

  settingsGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap:
      14,

    margin:
      "20px 0",
  },

  settingsPreview: {
    margin:
      "22px 0",

    padding:
      20,

    borderRadius:
      18,

    background:
      "rgba(59,130,246,.06)",

    border:
      "1px solid rgba(59,130,246,.16)",
  },

  settingsPreviewTitle: {
    margin:
      "0 0 14px",

    fontSize:
      25,
  },

  /* =======================================================
     REPORTS
  ======================================================= */

  reportControls: {
    display:
      "grid",

    gap:
      24,

    marginTop:
      24,
  },

  smallButtonRow: {
    display:
      "flex",

    gap:
      10,

    marginBottom:
      14,

    flexWrap:
      "wrap",
  },

  codeSelector: {
    display:
      "flex",

    flexWrap:
      "wrap",

    gap:
      10,
  },

  codeChoice: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      8,

    padding:
      "10px 13px",

    borderRadius:
      999,

    background:
      "#0d0d0f",

    border:
      "1px solid #34343a",

    cursor:
      "pointer",

    fontSize:
      13,
  },

  codeChoiceActive: {
    background:
      "rgba(59,130,246,.16)",

    border:
      "1px solid rgba(96,165,250,.45)",

    color:
      "#dbeafe",
  },

  optionalGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap:
      10,
  },

  optionalChoice: {
    display:
      "flex",

    alignItems:
      "center",

    gap:
      10,

    padding:
      "13px 14px",

    borderRadius:
      14,

    background:
      "#0d0d0f",

    border:
      "1px solid #34343a",

    cursor:
      "pointer",

    color:
      "#d4d4d8",

    fontSize:
      13,
  },

  optionalChoiceActive: {
    background:
      "rgba(59,130,246,.13)",

    border:
      "1px solid rgba(96,165,250,.40)",

    color:
      "#dbeafe",
  },

  dateGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap:
      14,
  },

  reportCard: {
    background:
      "#ffffff",

    color:
      "#111827",

    borderRadius:
      24,

    padding:
      34,
  },

  reportHeader: {
    display:
      "flex",

    justifyContent:
      "space-between",

    gap:
      20,

    alignItems:
      "flex-start",

    borderBottom:
      "2px solid #111827",

    paddingBottom:
      20,
  },

  reportBrand: {
    margin:
      "0 0 5px",

    fontWeight:
      900,

    fontSize:
      18,
  },

  reportTitle: {
    margin:
      0,

    fontSize:
      34,
  },

  reportDate: {
    fontSize:
      13,

    color:
      "#4b5563",
  },

  reportMeta: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",

    gap:
      18,

    marginTop:
      24,

    padding:
      20,

    background:
      "#f3f4f6",

    borderRadius:
      16,
  },

  reportMetrics: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(140px,1fr))",

    gap:
      14,

    marginTop:
      24,
  },

  reportMetric: {
    padding:
      18,

    borderRadius:
      14,

    border:
      "1px solid #d1d5db",

    display:
      "grid",

    gap:
      6,
  },

  highlightStrip: {
    marginTop:
      18,

    padding:
      14,

    borderRadius:
      12,

    background:
      "#eff6ff",

    border:
      "1px solid #bfdbfe",

    color:
      "#1e3a8a",
  },

  summaryBox: {
    marginTop:
      28,

    padding:
      22,

    borderRadius:
      16,

    background:
      "#f8fafc",

    border:
      "1px solid #e5e7eb",
  },

  reportSectionTitle: {
    marginTop:
      30,

    marginBottom:
      12,

    fontSize:
      22,
  },

  reportText: {
    lineHeight:
      1.75,
  },

  reportIntroText: {
    marginTop:
      -4,

    color:
      "#6b7280",

    fontSize:
      13,
  },

  breakdownGrid: {
    display:
      "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap:
      14,
  },

  breakdownCard: {
    padding:
      18,

    border:
      "1px solid #d1d5db",

    borderRadius:
      14,
  },

  breakdownTitle: {
    marginTop:
      0,

    marginBottom:
      10,
  },

  reportTable: {
    width:
      "100%",

    borderCollapse:
      "collapse",

    color:
      "#111827",
  },

  reportTh: {
    textAlign:
      "left",

    padding:
      10,

    borderBottom:
      "2px solid #111827",

    fontSize:
      12,

    whiteSpace:
      "nowrap",
  },

  reportTd: {
    padding:
      10,

    borderBottom:
      "1px solid #e5e7eb",

    fontSize:
      12,

    verticalAlign:
      "top",
  },

  reportReferralWarning: {
    marginTop:
      4,

    color:
      "#b91c1c",

    fontSize:
      9,

    fontWeight:
      800,
  },

  reportFooter: {
    marginTop:
      30,

    paddingTop:
      18,

    borderTop:
      "1px solid #d1d5db",

    color:
      "#6b7280",

    textAlign:
      "center",

    fontSize:
      12,
  },

  reportActions: {
    display:
      "flex",

    gap:
      12,

    flexWrap:
      "wrap",
  },
};
