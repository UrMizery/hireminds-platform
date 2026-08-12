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
  | "career_services";

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
  status: string;
  confirmed_slot_id?: string | null;
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

/* =========================================================
   CONSTANTS
========================================================= */

const SYSTEM_ADMIN_EMAIL = "info@hireminds.app";

const DEFAULT_CAREER_CONNECT_SETTINGS: CareerConnectSettings = {
  id: "default",
  meeting_link:
    "https://hire-minds.whereby.com/hireminds-open-room",
  open_room_title: "Open Room",
  open_room_schedule: "Last Tuesday monthly",
  open_room_time: "6:00 PM – 7:00 PM",
  doors_open: "5:50 PM",
  doors_close: "6:15 PM",
  open_room_note:
    "Live Q&A, networking, resource drops, opportunities, and career conversations.",
};

const SERVICE_LABELS: Record<string, string> = {
  open_room: "Open Room",
  resume_support: "Resume Support",
  cover_letter_review: "Cover Letter Review",
  career_coaching: "1:1 Career Coaching",
  mock_interview: "Mock Interview",
  workforce_training: "Workforce Development Training",
  job_search_assistance: "Job Search Assistance",
  other: "Other",
};

/* =========================================================
   HELPERS
========================================================= */

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

function formatAppointment(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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

function getPeriodLabel(
  period: PeriodKey,
  startDate: string,
  endDate: string
) {
  if (period === "all") return "All Time";
  if (period === "day") return "Today";
  if (period === "week") return "This Week";
  if (period === "month") return "This Month";
  if (period === "quarter") return "This Quarter";
  if (period === "fiscal") return "Fiscal Year";

  if (period === "custom") {
    if (startDate && endDate) {
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
  row: ParticipantRow | ActivityRow
) {
  return (
    row.user_id ||
    row.email?.toLowerCase() ||
    row.id ||
    ""
  );
}

function serviceLabel(
  serviceType?: string | null,
  otherService?: string | null
) {
  if (!serviceType) return "—";

  if (serviceType === "other" && otherService) {
    return otherService;
  }

  return (
    SERVICE_LABELS[serviceType] ||
    serviceType
  );
}

function requestStatusStyle(status: string): CSSProperties {
  const normalized = status.toLowerCase();

  if (normalized === "confirmed") {
    return {
      background: "rgba(34,197,94,.12)",
      color: "#86efac",
      border: "1px solid rgba(34,197,94,.25)",
    };
  }

  if (normalized === "completed") {
    return {
      background: "rgba(59,130,246,.12)",
      color: "#bfdbfe",
      border: "1px solid rgba(59,130,246,.25)",
    };
  }

  if (
    normalized === "cancelled" ||
    normalized === "declined"
  ) {
    return {
      background: "rgba(248,113,113,.10)",
      color: "#fca5a5",
      border: "1px solid rgba(248,113,113,.22)",
    };
  }

  if (normalized === "rescheduled") {
    return {
      background: "rgba(168,85,247,.10)",
      color: "#d8b4fe",
      border: "1px solid rgba(168,85,247,.22)",
    };
  }

  return {
    background: "rgba(250,204,21,.09)",
    color: "#fde68a",
    border: "1px solid rgba(250,204,21,.22)",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function PartnerDashboardPage() {
  const [loading, setLoading] = useState(true);

  const [loadingLogout, setLoadingLogout] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [activeTab, setActiveTab] =
    useState<DashboardTab>("overview");

  const [partner, setPartner] =
    useState<PartnerRow | null>(null);

  const [currentUserEmail, setCurrentUserEmail] =
    useState("");

  const [participants, setParticipants] =
    useState<ParticipantRow[]>([]);

  const [activity, setActivity] =
    useState<ActivityRow[]>([]);

  const [
    workforceSessionServices,
    setWorkforceSessionServices,
  ] = useState<WorkforceSessionServiceRow[]>([]);

  const [lastUpdated, setLastUpdated] =
    useState("");

  const [
    participantSearch,
    setParticipantSearch,
  ] = useState("");

  /* =======================================================
     MEETING REQUESTS
  ======================================================= */

  const [
    meetingRequests,
    setMeetingRequests,
  ] = useState<MeetingRequestRow[]>([]);

  const [
    meetingChoices,
    setMeetingChoices,
  ] = useState<MeetingChoiceRow[]>([]);

  const [
    requestAttachments,
    setRequestAttachments,
  ] = useState<AttachmentRow[]>([]);

  const [
    requestFilter,
    setRequestFilter,
  ] = useState("all");

  const [
    requestSearch,
    setRequestSearch,
  ] = useState("");

  /* =======================================================
     AVAILABILITY
  ======================================================= */

  const [
    availabilitySlots,
    setAvailabilitySlots,
  ] = useState<AvailabilitySlotRow[]>([]);

  const [
    newSlotStart,
    setNewSlotStart,
  ] = useState("");

  const [
    newSlotEnd,
    setNewSlotEnd,
  ] = useState("");

  const [
    newSlotLabel,
    setNewSlotLabel,
  ] = useState("");

  const [
    addingAvailability,
    setAddingAvailability,
  ] = useState(false);

  /* =======================================================
     CAREER CONNECT SETTINGS
  ======================================================= */

  const [
    careerSettings,
    setCareerSettings,
  ] = useState<CareerConnectSettings>(
    DEFAULT_CAREER_CONNECT_SETTINGS
  );

  const [
    savingCareerSettings,
    setSavingCareerSettings,
  ] = useState(false);

  /* =======================================================
     REPORT BUILDER
  ======================================================= */

  const [
    selectedCodes,
    setSelectedCodes,
  ] = useState<string[]>([]);

  const [
    reportParticipantKey,
    setReportParticipantKey,
  ] = useState("all");

  const [
    reportPeriod,
    setReportPeriod,
  ] = useState<PeriodKey>("all");

  const [
    reportStartDate,
    setReportStartDate,
  ] = useState("");

  const [
    reportEndDate,
    setReportEndDate,
  ] = useState("");

  const [
    selectedOptionalMetrics,
    setSelectedOptionalMetrics,
  ] = useState<OptionalMetricKey[]>([
    "tool_engagements",
    "completed_activities",
    "career_services",
    "code_comparison",
  ]);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  /* =======================================================
     ADMIN STATUS
  ======================================================= */

  const isSystemAdmin =
    currentUserEmail.toLowerCase() ===
      SYSTEM_ADMIN_EMAIL.toLowerCase() ||
    partner?.account_type === "super_admin";

  /* =======================================================
     LOAD MAIN DASHBOARD
  ======================================================= */

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

    const email =
      authData.user.email;

    setCurrentUserEmail(email);

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
      setMessage(
        partnerError.message
      );

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

    let participantQuery =
      supabase
        .from("candidate_profiles")
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
        .limit(10000);

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
      data: activityRows,
      error: activityError,
    } = await activityQuery;

    if (activityError) {
      setMessage(
        activityError.message
      );

      setLoading(false);

      return;
    }

    const {
      data: serviceRows,
      error: serviceError,
    } = await supabase
      .from(
        "workforce_session_services"
      )
      .select(
        "id, session_id, user_id, service_type, service_label, created_at"
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      )
      .limit(10000);

    if (serviceError) {
      console.error(
        "Service tracking load error:",
        serviceError
      );
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

    setWorkforceSessionServices(
      (serviceRows as WorkforceSessionServiceRow[]) ||
        []
    );

    setLastUpdated(
      new Date().toLocaleTimeString()
    );

    setLoading(false);
  }, []);

  /* =======================================================
     LOAD ADMIN DATA
  ======================================================= */

  const loadAdminData = useCallback(async () => {
    const {
      data: authData,
    } = await supabase.auth.getUser();

    const email =
      authData.user?.email || "";

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
    ] = await Promise.all([
      supabase
        .from(
          "meeting_requests"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: false,
          }
        ),

      supabase
        .from(
          "meeting_request_choices"
        )
        .select("*")
        .order(
          "preference_order",
          {
            ascending: true,
          }
        ),

      supabase
        .from(
          "meeting_request_attachments"
        )
        .select("*")
        .order(
          "created_at",
          {
            ascending: true,
          }
        ),

      supabase
        .from(
          "availability_slots"
        )
        .select("*")
        .order(
          "start_time",
          {
            ascending: true,
          }
        ),

      supabase
        .from(
          "career_connect_settings"
        )
        .select("*")
        .eq(
          "id",
          "default"
        )
        .maybeSingle(),
    ]);

    if (
      requestsResult.error
    ) {
      console.error(
        "Meeting requests load error:",
        requestsResult.error
      );
    } else {
      setMeetingRequests(
        (requestsResult.data as MeetingRequestRow[]) ||
          []
      );
    }

    if (
      choicesResult.error
    ) {
      console.error(
        "Meeting choices load error:",
        choicesResult.error
      );
    } else {
      setMeetingChoices(
        (choicesResult.data as MeetingChoiceRow[]) ||
          []
      );
    }

    if (
      attachmentsResult.error
    ) {
      console.error(
        "Attachment load error:",
        attachmentsResult.error
      );
    } else {
      setRequestAttachments(
        (attachmentsResult.data as AttachmentRow[]) ||
          []
      );
    }

    if (
      availabilityResult.error
    ) {
      console.error(
        "Availability load error:",
        availabilityResult.error
      );
    } else {
      setAvailabilitySlots(
        (availabilityResult.data as AvailabilitySlotRow[]) ||
          []
      );
    }

    if (
      settingsResult.error
    ) {
      console.error(
        "Career Connect settings error:",
        settingsResult.error
      );
    } else if (
      settingsResult.data
    ) {
      setCareerSettings({
        id:
          settingsResult.data.id ||
          "default",

        meeting_link:
          settingsResult.data
            .meeting_link ||
          DEFAULT_CAREER_CONNECT_SETTINGS.meeting_link,

        open_room_title:
          settingsResult.data
            .open_room_title ||
          DEFAULT_CAREER_CONNECT_SETTINGS.open_room_title,

        open_room_schedule:
          settingsResult.data
            .open_room_schedule ||
          DEFAULT_CAREER_CONNECT_SETTINGS.open_room_schedule,

        open_room_time:
          settingsResult.data
            .open_room_time ||
          DEFAULT_CAREER_CONNECT_SETTINGS.open_room_time,

        doors_open:
          settingsResult.data
            .doors_open ||
          DEFAULT_CAREER_CONNECT_SETTINGS.doors_open,

        doors_close:
          settingsResult.data
            .doors_close ||
          DEFAULT_CAREER_CONNECT_SETTINGS.doors_close,

        open_room_note:
          settingsResult.data
            .open_room_note ||
          DEFAULT_CAREER_CONNECT_SETTINGS.open_room_note,
      });
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  useEffect(() => {
    if (
      currentUserEmail.toLowerCase() ===
      SYSTEM_ADMIN_EMAIL.toLowerCase()
    ) {
      loadAdminData();
    }
  }, [
    currentUserEmail,
    loadAdminData,
  ]);

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function handleLogout() {
    setLoadingLogout(true);

    await supabase.auth.signOut();

    window.location.href =
      "/employer-partner-login";
  }

  /* =======================================================
     MEETING REQUEST ACTIONS
  ======================================================= */

  function getRequestChoices(
    requestId: string
  ) {
    return meetingChoices
      .filter(
        (choice) =>
          choice.request_id ===
          requestId
      )
      .sort(
        (a, b) =>
          a.preference_order -
          b.preference_order
      );
  }

  function getSlot(
    slotId: string
  ) {
    return availabilitySlots.find(
      (slot) =>
        slot.id === slotId
    );
  }

  function getRequestFiles(
    requestId: string
  ) {
    return requestAttachments.filter(
      (file) =>
        file.request_id ===
        requestId
    );
  }

  async function updateRequestStatus(
    requestId: string,
    status: string
  ) {
    if (!isSystemAdmin) {
      return;
    }

    const {
      error,
    } = await supabase
      .from(
        "meeting_requests"
      )
      .update({
        status,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        requestId
      );

    if (error) {
      setMessage(
        error.message
      );

      return;
    }

    setMeetingRequests(
      (previous) =>
        previous.map(
          (request) =>
            request.id ===
            requestId
              ? {
                  ...request,
                  status,
                  updated_at:
                    new Date().toISOString(),
                }
              : request
        )
    );

    setMessage(
      `Meeting request updated to ${status}.`
    );
  }

  async function confirmRequestSlot(
    requestId: string,
    slotId: string
  ) {
    if (!isSystemAdmin) {
      return;
    }

    const {
      error,
    } = await supabase
      .from(
        "meeting_requests"
      )
      .update({
        status:
          "confirmed",
        confirmed_slot_id:
          slotId,
        updated_at:
          new Date().toISOString(),
      })
      .eq(
        "id",
        requestId
      );

    if (error) {
      setMessage(
        error.message
      );

      return;
    }

    setMeetingRequests(
      (previous) =>
        previous.map(
          (request) =>
            request.id ===
            requestId
              ? {
                  ...request,
                  status:
                    "confirmed",
                  confirmed_slot_id:
                    slotId,
                }
              : request
        )
    );

    setMessage(
      "Meeting time confirmed."
    );
  }

  async function openAttachment(
    filePath: string
  ) {
    const {
      data,
      error,
    } = await supabase.storage
      .from(
        "meeting-request-files"
      )
      .createSignedUrl(
        filePath,
        60 * 10
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
     AVAILABILITY ACTIONS
  ======================================================= */

  async function addAvailabilitySlot() {
    if (!isSystemAdmin) {
      return;
    }

    if (!newSlotStart) {
      setMessage(
        "Please select a start date and time."
      );

      return;
    }

    setAddingAvailability(
      true
    );

    setMessage("");

    const {
      data: authData,
    } = await supabase.auth.getUser();

    const start =
      new Date(
        newSlotStart
      );

    const end =
      newSlotEnd
        ? new Date(
            newSlotEnd
          )
        : null;

    const {
      data,
      error,
    } = await supabase
      .from(
        "availability_slots"
      )
      .insert({
        start_time:
          start.toISOString(),

        end_time:
          end
            ? end.toISOString()
            : null,

        label:
          newSlotLabel.trim() ||
          null,

        is_active:
          true,

        max_requests:
          10,

        created_by:
          authData.user?.id ||
          null,
      })
      .select("*")
      .single();

    if (error) {
      setMessage(
        error.message
      );

      setAddingAvailability(
        false
      );

      return;
    }

    setAvailabilitySlots(
      (previous) =>
        [
          ...previous,
          data as AvailabilitySlotRow,
        ].sort(
          (a, b) =>
            new Date(
              a.start_time
            ).getTime() -
            new Date(
              b.start_time
            ).getTime()
        )
    );

    setNewSlotStart("");
    setNewSlotEnd("");
    setNewSlotLabel("");

    setMessage(
      "Availability added."
    );

    setAddingAvailability(
      false
    );
  }

  async function toggleAvailability(
    slot: AvailabilitySlotRow
  ) {
    if (!isSystemAdmin) {
      return;
    }

    const nextActive =
      !slot.is_active;

    const {
      error,
    } = await supabase
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

    if (error) {
      setMessage(
        error.message
      );

      return;
    }

    setAvailabilitySlots(
      (previous) =>
        previous.map(
          (item) =>
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
  }

  async function deleteAvailability(
    slotId: string
  ) {
    if (!isSystemAdmin) {
      return;
    }

    const confirmed =
      window.confirm(
        "Delete this availability slot?"
      );

    if (!confirmed) {
      return;
    }

    const {
      error,
    } = await supabase
      .from(
        "availability_slots"
      )
      .delete()
      .eq(
        "id",
        slotId
      );

    if (error) {
      setMessage(
        error.message
      );

      return;
    }

    setAvailabilitySlots(
      (previous) =>
        previous.filter(
          (slot) =>
            slot.id !==
            slotId
        )
    );

    setMessage(
      "Availability removed."
    );
  }

  /* =======================================================
     CAREER CONNECT SETTINGS
  ======================================================= */

  function updateCareerSetting(
    key: keyof CareerConnectSettings,
    value: string
  ) {
    setCareerSettings(
      (previous) => ({
        ...previous,
        [key]: value,
      })
    );
  }

  async function saveCareerConnectSettings() {
    if (!isSystemAdmin) {
      return;
    }

    setSavingCareerSettings(
      true
    );

    setMessage("");

    const {
      error,
    } = await supabase
      .from(
        "career_connect_settings"
      )
      .upsert({
        id: "default",

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

    if (error) {
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
    useMemo(() => {
      const codes =
        new Set<string>();

      participants.forEach(
        (row) => {
          const code =
            row.referral_code?.trim();

          if (code) {
            codes.add(
              code.toUpperCase()
            );
          }
        }
      );

      activity.forEach(
        (row) => {
          const code =
            row.referral_code?.trim();

          if (code) {
            codes.add(
              code.toUpperCase()
            );
          }
        }
      );

      return [...codes].sort();
    }, [
      participants,
      activity,
    ]);

  useEffect(() => {
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
  }, [
    referralCodes,
    selectedCodes.length,
  ]);

  /* =======================================================
     PARTICIPANTS
  ======================================================= */

  const uniqueParticipants =
    useMemo(() => {
      const map =
        new Map<
          string,
          ParticipantRow
        >();

      participants.forEach(
        (row) => {
          const key =
            participantKey(row);

          if (
            key &&
            !map.has(key)
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
        }
      );
    }, [
      participantSearch,
      uniqueParticipants,
    ]);

  /* =======================================================
     MEETING REQUEST FILTERING
  ======================================================= */

  const filteredMeetingRequests =
    useMemo(() => {
      const query =
        requestSearch
          .trim()
          .toLowerCase();

      return meetingRequests.filter(
        (request) => {
          if (
            requestFilter !==
              "all" &&
            request.status !==
              requestFilter
          ) {
            return false;
          }

          if (!query) {
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
    }, [
      meetingRequests,
      requestFilter,
      requestSearch,
    ]);

  const pendingRequestCount =
    meetingRequests.filter(
      (request) =>
        request.status ===
        "pending"
    ).length;

  /* =======================================================
     REPORT DATE MATCHING
  ======================================================= */

  function reportDateMatches(
    value?: string | null
  ) {
    const date =
      toDate(value);

    if (!date) {
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

  /* =======================================================
     REPORT PARTICIPANT UNIVERSE
  ======================================================= */

  const selectedParticipantUniverse =
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
    }, [
      uniqueParticipants,
      selectedCodes,
      reportParticipantKey,
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
            const key =
              participantKey(row);

            if (
              key !==
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

  const activityParticipantKeys =
    useMemo(() => {
      const keys =
        new Set<string>();

      reportActivity.forEach(
        (row) => {
          const key =
            participantKey(row);

          if (key) {
            keys.add(key);
          }
        }
      );

      return keys;
    }, [reportActivity]);

  const newEnrollments =
    useMemo(() => {
      return selectedParticipantUniverse.filter(
        (row) =>
          reportDateMatches(
            row.created_at
          )
      );
    }, [
      selectedParticipantUniverse,
      reportPeriod,
      reportStartDate,
      reportEndDate,
    ]);

  const participantsServed =
    useMemo(() => {
      if (
        reportPeriod ===
        "all"
      ) {
        return selectedParticipantUniverse;
      }

      return selectedParticipantUniverse.filter(
        (row) => {
          const key =
            participantKey(row);

          return (
            reportDateMatches(
              row.created_at
            ) ||
            (key
              ? activityParticipantKeys.has(
                  key
                )
              : false)
          );
        }
      );
    }, [
      selectedParticipantUniverse,
      activityParticipantKeys,
      reportPeriod,
      reportStartDate,
      reportEndDate,
    ]);

  const activeParticipants =
    useMemo(() => {
      return selectedParticipantUniverse.filter(
        (row) => {
          const key =
            participantKey(row);

          return key
            ? activityParticipantKeys.has(
                key
              )
            : false;
        }
      );
    }, [
      selectedParticipantUniverse,
      activityParticipantKeys,
    ]);

  const trainingEnrollments =
    useMemo(() => {
      return newEnrollments.filter(
        (row) =>
          (
            row.referral_code ||
            ""
          )
            .toUpperCase()
            .startsWith(
              "COHORT"
            )
      );
    }, [newEnrollments]);

  /* =======================================================
     REPORT SERVICE TRACKING
  ======================================================= */

  const reportServiceRows =
    useMemo(() => {
      const participantUserIds =
        new Set(
          selectedParticipantUniverse
            .map(
              (participant) =>
                participant.user_id
            )
            .filter(Boolean)
        );

      return workforceSessionServices.filter(
        (row) => {
          if (
            !row.user_id ||
            !participantUserIds.has(
              row.user_id
            )
          ) {
            return false;
          }

          if (
            reportParticipantKey !==
              "all"
          ) {
            const participant =
              uniqueParticipants.find(
                (item) =>
                  participantKey(
                    item
                  ) ===
                  reportParticipantKey
              );

            if (
              participant?.user_id !==
              row.user_id
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
      workforceSessionServices,
      selectedParticipantUniverse,
      reportParticipantKey,
      uniqueParticipants,
      reportPeriod,
      reportStartDate,
      reportEndDate,
    ]);

  const serviceBreakdown =
    useMemo(() => {
      const counts: Record<
        string,
        number
      > = {};

      reportServiceRows.forEach(
        (row) => {
          const label =
            row.service_label ||
            serviceLabel(
              row.service_type
            );

          counts[label] =
            (counts[label] ||
              0) + 1;
        }
      );

      return Object.entries(
        counts
      ).sort(
        (a, b) =>
          b[1] - a[1]
      );
    }, [reportServiceRows]);

  /* =======================================================
     REPORT OPTIONS
  ======================================================= */

  const reportParticipantOptions =
    useMemo(() => {
      return uniqueParticipants
        .filter((row) =>
          selectedCodes.includes(
            (
              row.referral_code ||
              ""
            ).toUpperCase()
          )
        )
        .map((row) => ({
          key:
            participantKey(row),

          name:
            row.full_name ||
            row.email ||
            "Participant",

          referralCode:
            row.referral_code ||
            "",
        }))
        .filter(
          (item) =>
            Boolean(item.key)
        );
    }, [
      uniqueParticipants,
      selectedCodes,
    ]);

  const individualParticipant =
    useMemo(() => {
      if (
        reportParticipantKey ===
        "all"
      ) {
        return null;
      }

      return (
        uniqueParticipants.find(
          (row) =>
            participantKey(
              row
            ) ===
            reportParticipantKey
        ) || null
      );
    }, [
      uniqueParticipants,
      reportParticipantKey,
    ]);

  /* =======================================================
     REPORT STATS
  ======================================================= */

  const reportStats =
    useMemo(() => {
      let completions = 0;
      let toolUses = 0;

      const tools: Record<
        string,
        number
      > = {};

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

      const topToolEntry =
        Object.entries(
          tools
        ).sort(
          (a, b) =>
            b[1] - a[1]
        )[0] || null;

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

        careerServices:
          reportServiceRows.length,

        topTool:
          topToolEntry
            ? topToolEntry[0]
            : "—",

        topToolUses:
          topToolEntry
            ? topToolEntry[1]
            : 0,
      };
    }, [
      participantsServed,
      newEnrollments,
      activeParticipants,
      trainingEnrollments,
      reportActivity,
      reportServiceRows,
    ]);

  /* =======================================================
     PARTICIPANT SUMMARY
  ======================================================= */

  const participantSummary =
    useMemo<
      ParticipantSummaryRow[]
    >(() => {
      return participantsServed.map(
        (participant) => {
          const key =
            participantKey(
              participant
            );

          const personActivity =
            reportActivity.filter(
              (row) =>
                participantKey(
                  row
                ) === key
            );

          const sortedActivity =
            [...personActivity].sort(
              (a, b) =>
                (toDate(
                  b.created_at
                )?.getTime() ||
                  0) -
                (toDate(
                  a.created_at
                )?.getTime() ||
                  0)
            );

          return {
            key,

            participant,

            referralCode:
              participant.referral_code ||
              "—",

            signupDate:
              participant.created_at,

            lastActivity:
              sortedActivity[0]
                ?.created_at ||
              null,

            activityCount:
              personActivity.length,

            toolUses:
              personActivity.filter(
                (row) =>
                  Boolean(
                    row.tool_name
                  )
              ).length,

            completions:
              personActivity.filter(
                (row) =>
                  (
                    row.event_type ||
                    ""
                  )
                    .toLowerCase()
                    .includes(
                      "complete"
                    )
              ).length,
          };
        }
      );
    }, [
      participantsServed,
      reportActivity,
    ]);

  /* =======================================================
     CODE BREAKDOWN
  ======================================================= */

  const codeBreakdown =
    useMemo(() => {
      return selectedCodes.map(
        (code) => {
          const codeParticipants =
            participantsServed.filter(
              (row) =>
                (
                  row.referral_code ||
                  ""
                ).toUpperCase() ===
                code
            );

          const codeNew =
            newEnrollments.filter(
              (row) =>
                (
                  row.referral_code ||
                  ""
                ).toUpperCase() ===
                code
            );

          const codeActive =
            activeParticipants.filter(
              (row) =>
                (
                  row.referral_code ||
                  ""
                ).toUpperCase() ===
                code
            );

          const codeActivity =
            reportActivity.filter(
              (row) =>
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
                (row) =>
                  Boolean(
                    row.tool_name
                  )
              ).length,
          };
        }
      );
    }, [
      selectedCodes,
      participantsServed,
      newEnrollments,
      activeParticipants,
      reportActivity,
    ]);

  /* =======================================================
     REPORT CONTROL HELPERS
  ======================================================= */

  function toggleCode(
    code: string
  ) {
    setSelectedCodes(
      (previous) =>
        previous.includes(
          code
        )
          ? previous.filter(
              (item) =>
                item !== code
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
    setSelectedCodes([]);

    setReportParticipantKey(
      "all"
    );
  }

  function toggleOptionalMetric(
    metric: OptionalMetricKey
  ) {
    setSelectedOptionalMetrics(
      (previous) =>
        previous.includes(
          metric
        )
          ? previous.filter(
              (item) =>
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
    metric: OptionalMetricKey
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

  /* =======================================================
     REPORT SUMMARY
  ======================================================= */

  const reportSummaryText =
    useMemo(() => {
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

      return text;
    }, [
      individualParticipant,
      reportStats,
      selectedCodes.length,
      reportingPeriodLabel,
      selectedOptionalMetrics,
    ]);

  /* =======================================================
     EXPORT
  ======================================================= */

  function printReport() {
    window.print();
  }

  function exportCSV() {
    const rows = [
      [
        "Participant",
        "Email",
        "Referral Code",
        "Sign-Up Date",
        "Last Activity",
        "Activity Count",
        "Tool Engagements",
        "Completed Activities",
      ],

      ...participantSummary.map(
        (row) => [
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
        ]
      ),
    ];

    const csv =
      rows
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

    const blob =
      new Blob(
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
      "hireminds-participant-report.csv";

    link.click();

    URL.revokeObjectURL(
      url
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     TABS
  ======================================================= */

  const dashboardTabs: {
    key: DashboardTab;
    label: string;
    adminOnly?: boolean;
  }[] = [
    {
      key: "overview",
      label: "Overview",
    },

    {
      key: "live",
      label: "Live Activity",
    },

    {
      key: "history",
      label: "History",
    },

    {
      key: "tools",
      label: "Tool Usage",
    },

    {
      key:
        "meeting_requests",
      label:
        pendingRequestCount >
        0
          ? `Meeting Requests (${pendingRequestCount})`
          : "Meeting Requests",
      adminOnly: true,
    },

    {
      key:
        "availability",
      label:
        "Availability Calendar",
      adminOnly: true,
    },

    {
      key:
        "career_connect",
      label:
        "Career Connect",
      adminOnly: true,
    },

    {
      key: "reports",
      label: "Reports",
    },
  ];

  /* =======================================================
     RENDER
  ======================================================= */

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

      <div style={styles.shell}>
        {/* =================================================
            HEADER
        ================================================= */}

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
              Participant engagement, referral-code reporting,
              Career Connect management, activity tracking, and
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

            {isSystemAdmin ? (
              <p style={styles.adminLine}>
                ● HireMinds System Administrator
              </p>
            ) : null}

            <p style={styles.subtleLine}>
              Last Updated:{" "}
              {lastUpdated ||
                "—"}
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={async () => {
                await loadDashboard();

                if (isSystemAdmin) {
                  await loadAdminData();
                }
              }}
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

        {/* =================================================
            TABS
        ================================================= */}

        <section style={styles.card}>
          <div style={styles.tabRow}>
            {dashboardTabs
              .filter(
                (tab) =>
                  !tab.adminOnly ||
                  isSystemAdmin
              )
              .map((tab) => (
                <button
                  key={tab.key}
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
              ))}
          </div>
        </section>

        {/* =================================================
            OVERVIEW
        ================================================= */}

        {activeTab ===
        "overview" ? (
          <>
            <section style={styles.summaryGrid}>
              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Participants
                </p>

                <p style={styles.metricValue}>
                  {uniqueParticipants.length}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Referral Codes
                </p>

                <p style={styles.metricValue}>
                  {referralCodes.length}
                </p>
              </div>

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Activity Records
                </p>

                <p style={styles.metricValue}>
                  {activity.length}
                </p>
              </div>

              {isSystemAdmin ? (
                <div style={styles.metricCard}>
                  <p style={styles.metricLabel}>
                    Pending Meeting Requests
                  </p>

                  <p style={styles.metricValue}>
                    {pendingRequestCount}
                  </p>
                </div>
              ) : null}

              <div style={styles.metricCard}>
                <p style={styles.metricLabel}>
                  Career Services Tracked
                </p>

                <p style={styles.metricValue}>
                  {workforceSessionServices.length}
                </p>
              </div>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Participant List
              </h2>

              <input
                value={participantSearch}
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

        {/* =================================================
            LIVE ACTIVITY
        ================================================= */}

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
                      Tool / Service
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

        {/* =================================================
            HISTORY
        ================================================= */}

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
                      Tool / Page
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

        {/* =================================================
            TOOL USAGE
        ================================================= */}

        {activeTab ===
        "tools" ? (
          <section style={styles.card}>
            <h2 style={styles.sectionTitle}>
              Tool & Career Service Usage
            </h2>

            <p style={styles.muted}>
              Career tools and Career Connect services can be included
              in reporting by referral code, multiple codes, all codes,
              or individual participant.
            </p>

            <div style={styles.summaryGrid}>
              <div style={styles.metricCardInner}>
                <p style={styles.metricLabel}>
                  Career Service Records
                </p>

                <p style={styles.metricValueSmall}>
                  {workforceSessionServices.length}
                </p>
              </div>

              {Object.entries(
                workforceSessionServices.reduce(
                  (
                    counts: Record<string, number>,
                    row
                  ) => {
                    const label =
                      row.service_label ||
                      serviceLabel(
                        row.service_type
                      );

                    counts[label] =
                      (counts[label] ||
                        0) + 1;

                    return counts;
                  },
                  {}
                )
              )
                .sort(
                  (a, b) =>
                    b[1] - a[1]
                )
                .map(
                  ([
                    label,
                    count,
                  ]) => (
                    <div
                      key={label}
                      style={styles.metricCardInner}
                    >
                      <p style={styles.metricLabel}>
                        {label}
                      </p>

                      <p style={styles.metricValueSmall}>
                        {count}
                      </p>
                    </div>
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
          <section style={styles.card}>
            <div style={styles.sectionTop}>
              <div>
                <p style={styles.kicker}>
                  CAREER CONNECT
                </p>

                <h2 style={styles.sectionTitle}>
                  Meeting Requests
                </h2>

                <p style={styles.muted}>
                  Review participant requests, preferred appointment
                  choices, notes, uploaded files, and confirm a meeting
                  time.
                </p>
              </div>

              <button
                type="button"
                onClick={loadAdminData}
                style={styles.secondaryButton}
              >
                Refresh Requests
              </button>
            </div>

            <div style={styles.requestControls}>
              <input
                value={requestSearch}
                onChange={(e) =>
                  setRequestSearch(
                    e.target.value
                  )
                }
                placeholder="Search participant, email, referral code, or service"
                style={styles.input}
              />

              <select
                value={requestFilter}
                onChange={(e) =>
                  setRequestFilter(
                    e.target.value
                  )
                }
                style={styles.input}
              >
                <option value="all">
                  All Requests
                </option>

                <option value="pending">
                  Pending
                </option>

                <option value="confirmed">
                  Confirmed
                </option>

                <option value="rescheduled">
                  Rescheduled
                </option>

                <option value="completed">
                  Completed
                </option>

                <option value="cancelled">
                  Cancelled
                </option>

                <option value="declined">
                  Declined
                </option>
              </select>
            </div>

            <div style={styles.requestList}>
              {filteredMeetingRequests.map(
                (request) => {
                  const choices =
                    getRequestChoices(
                      request.id
                    );

                  const files =
                    getRequestFiles(
                      request.id
                    );

                  return (
                    <article
                      key={request.id}
                      style={styles.requestCard}
                    >
                      <div style={styles.requestHeader}>
                        <div>
                          <div style={styles.requestNameRow}>
                            <h3 style={styles.requestName}>
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
                              {request.status.toUpperCase()}
                            </span>
                          </div>

                          <p style={styles.requestSubline}>
                            {request.participant_email ||
                              "No email"}{" "}
                            •{" "}
                            {request.referral_code ||
                              "No referral code"}
                          </p>

                          <p style={styles.requestServiceTitle}>
                            {serviceLabel(
                              request.service_type,
                              request.other_service
                            )}
                          </p>
                        </div>

                        <div style={styles.requestDateText}>
                          Requested{" "}
                          {formatDate(
                            request.created_at
                          )}
                        </div>
                      </div>

                      {request.notes ? (
                        <div style={styles.notesBox}>
                          <strong>
                            Participant Notes
                          </strong>

                          <p>
                            {request.notes}
                          </p>
                        </div>
                      ) : null}

                      <div style={styles.requestSection}>
                        <p style={styles.requestSectionLabel}>
                          Preferred Appointment Times
                        </p>

                        {choices.length ? (
                          <div style={styles.choiceList}>
                            {choices.map(
                              (choice) => {
                                const slot =
                                  getSlot(
                                    choice.slot_id
                                  );

                                const confirmed =
                                  request.confirmed_slot_id ===
                                  choice.slot_id;

                                return (
                                  <div
                                    key={choice.id}
                                    style={{
                                      ...styles.choiceCard,

                                      ...(confirmed
                                        ? styles.choiceCardConfirmed
                                        : {}),
                                    }}
                                  >
                                    <div>
                                      <span style={styles.preferenceLabel}>
                                        Choice{" "}
                                        {choice.preference_order}
                                      </span>

                                      <strong style={styles.choiceDate}>
                                        {formatAppointment(
                                          slot?.start_time
                                        )}
                                      </strong>

                                      {slot?.label ? (
                                        <span style={styles.choiceNote}>
                                          {slot.label}
                                        </span>
                                      ) : null}
                                    </div>

                                    {request.status !==
                                      "completed" &&
                                    request.status !==
                                      "cancelled" &&
                                    request.status !==
                                      "declined" ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          confirmRequestSlot(
                                            request.id,
                                            choice.slot_id
                                          )
                                        }
                                        style={
                                          confirmed
                                            ? styles.confirmedButton
                                            : styles.confirmButton
                                        }
                                      >
                                        {confirmed
                                          ? "✓ Confirmed"
                                          : "Confirm This Time"}
                                      </button>
                                    ) : null}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        ) : (
                          <p style={styles.emptyText}>
                            No appointment preferences were found.
                          </p>
                        )}
                      </div>

                      <div style={styles.requestSection}>
                        <p style={styles.requestSectionLabel}>
                          Supporting Files
                        </p>

                        {files.length ? (
                          <div style={styles.fileRow}>
                            {files.map(
                              (file) => (
                                <button
                                  key={file.id}
                                  type="button"
                                  onClick={() =>
                                    openAttachment(
                                      file.file_path
                                    )
                                  }
                                  style={styles.fileButton}
                                >
                                  📎 {file.file_name}
                                </button>
                              )
                            )}
                          </div>
                        ) : (
                          <p style={styles.emptyText}>
                            No files attached.
                          </p>
                        )}
                      </div>

                      <div style={styles.requestActions}>
                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "confirmed"
                            )
                          }
                          style={styles.actionButtonGreen}
                        >
                          Confirm
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "rescheduled"
                            )
                          }
                          style={styles.actionButtonPurple}
                        >
                          Rescheduled
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "completed"
                            )
                          }
                          style={styles.actionButtonBlue}
                        >
                          Completed
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "declined"
                            )
                          }
                          style={styles.actionButtonRed}
                        >
                          Decline
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            updateRequestStatus(
                              request.id,
                              "cancelled"
                            )
                          }
                          style={styles.actionButtonNeutral}
                        >
                          Cancel
                        </button>
                      </div>
                    </article>
                  );
                }
              )}

              {filteredMeetingRequests.length ===
              0 ? (
                <div style={styles.emptyPanel}>
                  No meeting requests match the selected filters.
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {/* =================================================
            AVAILABILITY
        ================================================= */}

        {activeTab ===
          "availability" &&
        isSystemAdmin ? (
          <>
            <section style={styles.card}>
              <p style={styles.kicker}>
                CAREER CONNECT
              </p>

              <h2 style={styles.sectionTitle}>
                Availability Calendar
              </h2>

              <p style={styles.muted}>
                Add the appointment dates and times participants can
                choose when requesting career services. Participants
                select 2–3 preferred options from these available
                times.
              </p>

              <div style={styles.slotFormGrid}>
                <label style={styles.fieldWrap}>
                  <span style={styles.controlLabel}>
                    Start Date & Time
                  </span>

                  <input
                    type="datetime-local"
                    value={newSlotStart}
                    onChange={(e) =>
                      setNewSlotStart(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.controlLabel}>
                    End Date & Time
                  </span>

                  <input
                    type="datetime-local"
                    value={newSlotEnd}
                    onChange={(e) =>
                      setNewSlotEnd(
                        e.target.value
                      )
                    }
                    style={styles.input}
                  />
                </label>

                <label style={styles.fieldWrap}>
                  <span style={styles.controlLabel}>
                    Optional Label
                  </span>

                  <input
                    value={newSlotLabel}
                    onChange={(e) =>
                      setNewSlotLabel(
                        e.target.value
                      )
                    }
                    placeholder="Example: Afternoon appointments"
                    style={styles.input}
                  />
                </label>
              </div>

              <button
                type="button"
                onClick={addAvailabilitySlot}
                disabled={addingAvailability}
                style={styles.primaryButton}
              >
                {addingAvailability
                  ? "Adding..."
                  : "+ Add Availability"}
              </button>
            </section>

            <section style={styles.card}>
              <h2 style={styles.sectionTitle}>
                Available Appointment Times
              </h2>

              <div style={styles.availabilityAdminGrid}>
                {availabilitySlots.map(
                  (slot) => (
                    <div
                      key={slot.id}
                      style={{
                        ...styles.availabilityAdminCard,

                        ...(!slot.is_active
                          ? styles.inactiveAvailability
                          : {}),
                      }}
                    >
                      <span style={styles.availabilityStatus}>
                        {slot.is_active
                          ? "● AVAILABLE"
                          : "○ HIDDEN"}
                      </span>

                      <strong style={styles.availabilityDate}>
                        {formatAppointment(
                          slot.start_time
                        )}
                      </strong>

                      {slot.end_time ? (
                        <span style={styles.availabilityEnd}>
                          Ends{" "}
                          {formatAppointment(
                            slot.end_time
                          )}
                        </span>
                      ) : null}

                      {slot.label ? (
                        <span style={styles.availabilityLabel}>
                          {slot.label}
                        </span>
                      ) : null}

                      <div style={styles.availabilityActions}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleAvailability(
                              slot
                            )
                          }
                          style={styles.secondaryButtonSmall}
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
                          style={styles.deleteButtonSmall}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>

              {availabilitySlots.length ===
              0 ? (
                <div style={styles.emptyPanel}>
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
          <section style={styles.card}>
            <p style={styles.kicker}>
              ADMIN SETTINGS
            </p>

            <h2 style={styles.sectionTitle}>
              Career Connect Settings
            </h2>

            <p style={styles.muted}>
              Change the live meeting room and Open Room information
              here. Updates are saved to Supabase, so you do not need
              to edit GitHub each time.
            </p>

            <div style={styles.settingsGrid}>
              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Live Meeting Link
                </span>

                <input
                  value={careerSettings.meeting_link}
                  onChange={(e) =>
                    updateCareerSetting(
                      "meeting_link",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  style={styles.input}
                />
              </label>

              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Open Room Title
                </span>

                <input
                  value={careerSettings.open_room_title}
                  onChange={(e) =>
                    updateCareerSetting(
                      "open_room_title",
                      e.target.value
                    )
                  }
                  style={styles.input}
                />
              </label>

              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Schedule
                </span>

                <input
                  value={careerSettings.open_room_schedule}
                  onChange={(e) =>
                    updateCareerSetting(
                      "open_room_schedule",
                      e.target.value
                    )
                  }
                  placeholder="Example: Last Tuesday monthly"
                  style={styles.input}
                />
              </label>

              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Time
                </span>

                <input
                  value={careerSettings.open_room_time}
                  onChange={(e) =>
                    updateCareerSetting(
                      "open_room_time",
                      e.target.value
                    )
                  }
                  placeholder="6:00 PM – 7:00 PM"
                  style={styles.input}
                />
              </label>

              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Doors Open
                </span>

                <input
                  value={careerSettings.doors_open}
                  onChange={(e) =>
                    updateCareerSetting(
                      "doors_open",
                      e.target.value
                    )
                  }
                  placeholder="5:50 PM"
                  style={styles.input}
                />
              </label>

              <label style={styles.fieldWrap}>
                <span style={styles.controlLabel}>
                  Doors Close
                </span>

                <input
                  value={careerSettings.doors_close}
                  onChange={(e) =>
                    updateCareerSetting(
                      "doors_close",
                      e.target.value
                    )
                  }
                  placeholder="6:15 PM"
                  style={styles.input}
                />
              </label>
            </div>

            <label style={styles.fieldWrap}>
              <span style={styles.controlLabel}>
                Open Room Description / Note
              </span>

              <textarea
                value={careerSettings.open_room_note}
                onChange={(e) =>
                  updateCareerSetting(
                    "open_room_note",
                    e.target.value
                  )
                }
                style={styles.textarea}
              />
            </label>

            <div style={styles.settingsPreview}>
              <p style={styles.kicker}>
                LIVE PREVIEW
              </p>

              <h3 style={styles.settingsPreviewTitle}>
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

              <p style={styles.muted}>
                {careerSettings.open_room_note}
              </p>
            </div>

            <button
              type="button"
              onClick={saveCareerConnectSettings}
              disabled={savingCareerSettings}
              style={styles.primaryButton}
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
              style={styles.card}
            >
              <p style={styles.kicker}>
                REPORT BUILDER
              </p>

              <h2 style={styles.sectionTitle}>
                Generate HireMinds Report
              </h2>

              <p style={styles.muted}>
                Select one referral code, multiple codes, all codes,
                or an individual participant. Career Connect service
                tracking can now also be included.
              </p>

              <div style={styles.reportControls}>
                <div>
                  <p style={styles.controlLabel}>
                    Referral Codes
                  </p>

                  <div style={styles.smallButtonRow}>
                    <button
                      type="button"
                      onClick={selectAllCodes}
                      style={styles.secondaryButton}
                    >
                      Select All
                    </button>

                    <button
                      type="button"
                      onClick={clearAllCodes}
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
                    value={reportParticipantKey}
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
                          key={item.key}
                          value={item.key}
                        >
                          {item.name} —{" "}
                          {item.referralCode}
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
                    value={reportPeriod}
                    onChange={(e) =>
                      setReportPeriod(
                        e.target.value as PeriodKey
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
                  <div style={styles.dateGrid}>
                    <label style={styles.fieldWrap}>
                      <span style={styles.controlLabel}>
                        Start Date
                      </span>

                      <input
                        type="date"
                        value={reportStartDate}
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
                        value={reportEndDate}
                        onChange={(e) =>
                          setReportEndDate(
                            e.target.value
                          )
                        }
                        style={styles.input}
                      />
                    </label>
                  </div>
                ) : null}

                <div>
                  <p style={styles.controlLabel}>
                    Choose Additional Data
                  </p>

                  <p style={styles.helperText}>
                    Participants Served, New Enrollments, Active
                    Participants, Training Enrollment, and Participant
                    Summary remain part of the core report.
                  </p>

                  <div style={styles.optionalGrid}>
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
                          "code_comparison",
                        label:
                          "Referral Code Comparison",
                      },
                    ].map(
                      (item) => {
                        const key =
                          item.key as OptionalMetricKey;

                        const checked =
                          hasOptionalMetric(
                            key
                          );

                        return (
                          <label
                            key={item.key}
                            style={{
                              ...styles.optionalChoice,

                              ...(checked
                                ? styles.optionalChoiceActive
                                : {}),
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
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

            {/* WHITE LIVE REPORT */}

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

              <div
                className="hm-report-meta"
                style={styles.reportMeta}
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
                style={styles.reportMetrics}
              >
                <div style={styles.reportMetric}>
                  <strong>
                    {reportStats.participantsServed}
                  </strong>

                  <span>
                    Participants Served
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {reportStats.newEnrollments}
                  </strong>

                  <span>
                    New Enrollments
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {reportStats.activeParticipants}
                  </strong>

                  <span>
                    Active Participants
                  </span>
                </div>

                <div style={styles.reportMetric}>
                  <strong>
                    {reportStats.trainingEnrollments}
                  </strong>

                  <span>
                    Training Enrollment
                  </span>
                </div>

                {hasOptionalMetric(
                  "career_services"
                ) ? (
                  <div style={styles.reportMetric}>
                    <strong>
                      {reportStats.careerServices}
                    </strong>

                    <span>
                      Career Services
                    </span>
                  </div>
                ) : null}

                {hasOptionalMetric(
                  "tool_engagements"
                ) ? (
                  <div style={styles.reportMetric}>
                    <strong>
                      {reportStats.toolUses}
                    </strong>

                    <span>
                      Career Tool Engagements
                    </span>
                  </div>
                ) : null}

                {hasOptionalMetric(
                  "completed_activities"
                ) ? (
                  <div style={styles.reportMetric}>
                    <strong>
                      {reportStats.completions}
                    </strong>

                    <span>
                      Completed Activities
                    </span>
                  </div>
                ) : null}

                {hasOptionalMetric(
                  "activity_records"
                ) ? (
                  <div style={styles.reportMetric}>
                    <strong>
                      {reportStats.activities}
                    </strong>

                    <span>
                      Activity Records
                    </span>
                  </div>
                ) : null}
              </div>

              {hasOptionalMetric(
                "most_used_tool"
              ) &&
              reportStats.topTool !==
                "—" ? (
                <div style={styles.highlightStrip}>
                  <strong>
                    Most Used Tool:
                  </strong>{" "}
                  {reportStats.topTool}{" "}
                  ({reportStats.topToolUses} uses)
                </div>
              ) : null}

              <section style={styles.summaryBox}>
                <h2 style={styles.reportSectionTitle}>
                  Summary
                </h2>

                <p style={styles.reportText}>
                  {reportSummaryText}
                </p>
              </section>

              {hasOptionalMetric(
                "career_services"
              ) &&
              serviceBreakdown.length >
                0 ? (
                <section>
                  <h2 style={styles.reportSectionTitle}>
                    Career Connect Service Breakdown
                  </h2>

                  <div style={styles.breakdownGrid}>
                    {serviceBreakdown.map(
                      ([
                        label,
                        count,
                      ]) => (
                        <div
                          key={label}
                          style={styles.breakdownCard}
                        >
                          <h3 style={styles.breakdownTitle}>
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

              {!individualParticipant &&
              hasOptionalMetric(
                "code_comparison"
              ) &&
              selectedCodes.length >
                0 ? (
                <section>
                  <h2 style={styles.reportSectionTitle}>
                    Referral Code Breakdown
                  </h2>

                  <div style={styles.breakdownGrid}>
                    {codeBreakdown.map(
                      (item) => (
                        <div
                          key={item.code}
                          style={styles.breakdownCard}
                        >
                          <h3 style={styles.breakdownTitle}>
                            {item.code}
                          </h3>

                          <p>
                            Participants Served:{" "}
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
                            Active Participants:{" "}
                            <strong>
                              {item.active}
                            </strong>
                          </p>

                          {hasOptionalMetric(
                            "tool_engagements"
                          ) ? (
                            <p>
                              Tool Engagements:{" "}
                              <strong>
                                {item.toolUses}
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
                <h2 style={styles.reportSectionTitle}>
                  Participant Summary
                </h2>

                <p style={styles.reportIntroText}>
                  Each participant is listed once.
                </p>

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
                          Sign-Up
                        </th>

                        <th style={styles.reportTh}>
                          Last Activity
                        </th>

                        {hasOptionalMetric(
                          "activity_records"
                        ) ? (
                          <th style={styles.reportTh}>
                            Activity
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "tool_engagements"
                        ) ? (
                          <th style={styles.reportTh}>
                            Tool Uses
                          </th>
                        ) : null}

                        {hasOptionalMetric(
                          "completed_activities"
                        ) ? (
                          <th style={styles.reportTh}>
                            Completed
                          </th>
                        ) : null}
                      </tr>
                    </thead>

                    <tbody>
                      {participantSummary.map(
                        (row) => (
                          <tr key={row.key}>
                            <td style={styles.reportTd}>
                              {row.participant.full_name ||
                                row.participant.email ||
                                "Participant"}
                            </td>

                            <td style={styles.reportTd}>
                              {row.referralCode}
                            </td>

                            <td style={styles.reportTd}>
                              {formatShortDate(
                                row.signupDate
                              )}
                            </td>

                            <td style={styles.reportTd}>
                              {formatShortDate(
                                row.lastActivity
                              )}
                            </td>

                            {hasOptionalMetric(
                              "activity_records"
                            ) ? (
                              <td style={styles.reportTd}>
                                {row.activityCount}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "tool_engagements"
                            ) ? (
                              <td style={styles.reportTd}>
                                {row.toolUses}
                              </td>
                            ) : null}

                            {hasOptionalMetric(
                              "completed_activities"
                            ) ? (
                              <td style={styles.reportTd}>
                                {row.completions}
                              </td>
                            ) : null}
                          </tr>
                        )
                      )}

                      {participantSummary.length ===
                      0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            style={styles.reportEmptyTd}
                          >
                            No participants match the selected report
                            criteria.
                          </td>
                        </tr>
                      ) : null}
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
                onClick={printReport}
                style={styles.primaryButton}
              >
                Print Report
              </button>

              <button
                type="button"
                onClick={exportCSV}
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

/* =========================================================
   STYLES
========================================================= */

const styles: Record<
  string,
  CSSProperties
> = {
  page: {
    minHeight: "100vh",

    background:
      "radial-gradient(circle at top left, rgba(59,130,246,.08), transparent 28%), linear-gradient(180deg,#050505,#0d0d0f)",

    color: "#f5f5f5",

    padding:
      "32px 24px 60px",

    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },

  centerWrap: {
    minHeight: "70vh",

    display: "flex",

    alignItems:
      "center",

    justifyContent:
      "center",
  },

  shell: {
    maxWidth: 1500,

    margin: "0 auto",

    display: "grid",

    gap: 22,
  },

  headerCard: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap: 20,

    flexWrap: "wrap",

    padding: 26,

    borderRadius: 24,

    background: "#151517",

    border:
      "1px solid #28282c",
  },

  kicker: {
    margin:
      "0 0 8px",

    color: "#93c5fd",

    fontSize: 11,

    fontWeight: 800,

    letterSpacing:
      ".18em",
  },

  title: {
    margin:
      "0 0 8px",

    fontSize: 38,
  },

  subtitle: {
    color: "#d4d4d8",

    lineHeight: 1.6,
  },

  subtleLine: {
    margin:
      "6px 0",

    color: "#a1a1aa",

    fontSize: 13,
  },

  adminLine: {
    margin:
      "8px 0",

    color: "#86efac",

    fontSize: 12,

    fontWeight: 800,
  },

  headerActions: {
    display: "flex",

    gap: 10,

    flexWrap: "wrap",
  },

  notice: {
    padding: 14,

    borderRadius: 14,

    background:
      "rgba(250,204,21,.08)",

    border:
      "1px solid rgba(250,204,21,.15)",

    color: "#fde68a",
  },

  card: {
    padding: 24,

    borderRadius: 24,

    background: "#151517",

    border:
      "1px solid #28282c",
  },

  tabRow: {
    display: "flex",

    flexWrap: "wrap",

    gap: 10,
  },

  tabButton: {
    padding:
      "10px 15px",

    borderRadius: 999,

    border:
      "1px solid #34343a",

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

    gridTemplateColumns:
      "repeat(auto-fit,minmax(200px,1fr))",

    gap: 16,
  },

  metricCard: {
    padding: 22,

    borderRadius: 20,

    background: "#151517",

    border:
      "1px solid #28282c",
  },

  metricCardInner: {
    padding: 18,

    borderRadius: 18,

    background:
      "#0f0f11",

    border:
      "1px solid #28282c",
  },

  metricLabel: {
    margin:
      "0 0 8px",

    color: "#a1a1aa",

    fontSize: 13,
  },

  metricValue: {
    margin: 0,

    fontSize: 38,

    fontWeight: 800,
  },

  metricValueSmall: {
    margin: 0,

    fontSize: 28,

    fontWeight: 800,
  },

  sectionTop: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap: 18,

    flexWrap: "wrap",
  },

  sectionTitle: {
    marginTop: 0,

    marginBottom: 10,

    fontSize: 28,
  },

  muted: {
    color: "#b7b7be",

    lineHeight: 1.7,
  },

  input: {
    width: "100%",

    padding:
      "13px 14px",

    borderRadius: 14,

    border:
      "1px solid #34343a",

    background: "#0d0d0f",

    color: "#fff",

    boxSizing:
      "border-box",

    outline: "none",
  },

  textarea: {
    width: "100%",

    minHeight: 120,

    padding:
      "13px 14px",

    borderRadius: 14,

    border:
      "1px solid #34343a",

    background: "#0d0d0f",

    color: "#fff",

    boxSizing:
      "border-box",

    outline: "none",

    resize: "vertical",
  },

  tableWrap: {
    overflowX: "auto",

    marginTop: 18,
  },

  table: {
    width: "100%",

    borderCollapse:
      "collapse",
  },

  th: {
    padding: 12,

    textAlign: "left",

    color: "#a1a1aa",

    borderBottom:
      "1px solid #303035",

    fontSize: 13,
  },

  td: {
    padding: 12,

    borderBottom:
      "1px solid #242428",

    fontSize: 14,
  },

  codeBadge: {
    display:
      "inline-block",

    padding:
      "6px 10px",

    borderRadius: 999,

    background:
      "rgba(59,130,246,.13)",

    color: "#bfdbfe",

    fontSize: 12,

    fontWeight: 800,
  },

  primaryButton: {
    padding:
      "12px 18px",

    borderRadius: 14,

    border: "none",

    background: "#f5f5f5",

    color: "#09090b",

    fontWeight: 800,

    cursor: "pointer",
  },

  secondaryButton: {
    padding:
      "12px 16px",

    borderRadius: 14,

    border:
      "1px solid #34343a",

    background: "#101012",

    color: "#f5f5f5",

    fontWeight: 700,

    cursor: "pointer",
  },

  logoutButton: {
    padding:
      "12px 16px",

    borderRadius: 14,

    border:
      "1px solid #334155",

    background: "#112b5f",

    color: "#fff",

    fontWeight: 700,

    cursor: "pointer",
  },

  /* REQUESTS */

  requestControls: {
    display: "grid",

    gridTemplateColumns:
      "2fr 1fr",

    gap: 12,

    marginTop: 20,
  },

  requestList: {
    display: "grid",

    gap: 18,

    marginTop: 22,
  },

  requestCard: {
    padding: 22,

    borderRadius: 20,

    background: "#0f0f11",

    border:
      "1px solid #2d2d33",

    display: "grid",

    gap: 18,
  },

  requestHeader: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "flex-start",

    gap: 16,

    flexWrap: "wrap",
  },

  requestNameRow: {
    display: "flex",

    alignItems:
      "center",

    gap: 10,

    flexWrap: "wrap",
  },

  requestName: {
    margin: 0,

    fontSize: 22,
  },

  requestSubline: {
    margin:
      "7px 0",

    color: "#9ca3af",

    fontSize: 13,
  },

  requestServiceTitle: {
    margin:
      "8px 0 0",

    color: "#93c5fd",

    fontSize: 15,

    fontWeight: 800,
  },

  requestDateText: {
    color: "#9ca3af",

    fontSize: 12,
  },

  statusBadge: {
    display:
      "inline-flex",

    padding:
      "6px 10px",

    borderRadius: 999,

    fontSize: 10,

    fontWeight: 900,

    letterSpacing:
      ".06em",
  },

  notesBox: {
    padding: 14,

    borderRadius: 14,

    background:
      "rgba(255,255,255,.035)",

    border:
      "1px solid #29292e",

    color: "#d4d4d8",

    fontSize: 13,

    lineHeight: 1.6,
  },

  requestSection: {
    display: "grid",

    gap: 10,
  },

  requestSectionLabel: {
    margin: 0,

    color: "#a1a1aa",

    fontSize: 11,

    fontWeight: 800,

    letterSpacing:
      ".1em",

    textTransform:
      "uppercase",
  },

  choiceList: {
    display: "grid",

    gap: 10,
  },

  choiceCard: {
    display: "flex",

    justifyContent:
      "space-between",

    alignItems:
      "center",

    gap: 14,

    flexWrap: "wrap",

    padding: 14,

    borderRadius: 14,

    background: "#151517",

    border:
      "1px solid #303035",
  },

  choiceCardConfirmed: {
    border:
      "1px solid rgba(34,197,94,.38)",

    background:
      "rgba(34,197,94,.05)",
  },

  preferenceLabel: {
    display: "block",

    color: "#93c5fd",

    fontSize: 10,

    fontWeight: 800,

    marginBottom: 4,
  },

  choiceDate: {
    display: "block",

    color: "#f5f5f5",

    fontSize: 14,
  },

  choiceNote: {
    display: "block",

    color: "#9ca3af",

    marginTop: 4,

    fontSize: 11,
  },

  confirmButton: {
    padding:
      "9px 13px",

    borderRadius: 999,

    border:
      "1px solid rgba(59,130,246,.35)",

    background:
      "rgba(59,130,246,.12)",

    color: "#bfdbfe",

    fontWeight: 800,

    cursor: "pointer",
  },

  confirmedButton: {
    padding:
      "9px 13px",

    borderRadius: 999,

    border:
      "1px solid rgba(34,197,94,.35)",

    background:
      "rgba(34,197,94,.12)",

    color: "#86efac",

    fontWeight: 800,

    cursor: "pointer",
  },

  fileRow: {
    display: "flex",

    flexWrap: "wrap",

    gap: 8,
  },

  fileButton: {
    padding:
      "9px 12px",

    borderRadius: 12,

    border:
      "1px solid #34343a",

    background: "#151517",

    color: "#dbeafe",

    cursor: "pointer",

    fontSize: 12,

    fontWeight: 700,
  },

  requestActions: {
    display: "flex",

    flexWrap: "wrap",

    gap: 8,

    paddingTop: 14,

    borderTop:
      "1px solid #28282c",
  },

  actionButtonGreen: {
    padding:
      "9px 12px",

    borderRadius: 10,

    border:
      "1px solid rgba(34,197,94,.3)",

    background:
      "rgba(34,197,94,.09)",

    color: "#86efac",

    cursor: "pointer",

    fontWeight: 700,
  },

  actionButtonPurple: {
    padding:
      "9px 12px",

    borderRadius: 10,

    border:
      "1px solid rgba(168,85,247,.3)",

    background:
      "rgba(168,85,247,.09)",

    color: "#d8b4fe",

    cursor: "pointer",

    fontWeight: 700,
  },

  actionButtonBlue: {
    padding:
      "9px 12px",

    borderRadius: 10,

    border:
      "1px solid rgba(59,130,246,.3)",

    background:
      "rgba(59,130,246,.09)",

    color: "#bfdbfe",

    cursor: "pointer",

    fontWeight: 700,
  },

  actionButtonRed: {
    padding:
      "9px 12px",

    borderRadius: 10,

    border:
      "1px solid rgba(248,113,113,.3)",

    background:
      "rgba(248,113,113,.08)",

    color: "#fca5a5",

    cursor: "pointer",

    fontWeight: 700,
  },

  actionButtonNeutral: {
    padding:
      "9px 12px",

    borderRadius: 10,

    border:
      "1px solid #34343a",

    background: "#151517",

    color: "#d4d4d8",

    cursor: "pointer",

    fontWeight: 700,
  },

  emptyText: {
    color: "#71717a",

    fontSize: 12,
  },

  emptyPanel: {
    padding: 30,

    borderRadius: 16,

    border:
      "1px dashed #34343a",

    color: "#71717a",

    textAlign: "center",
  },

  /* AVAILABILITY */

  slotFormGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(240px,1fr))",

    gap: 14,

    margin:
      "20px 0",
  },

  availabilityAdminGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(260px,1fr))",

    gap: 14,

    marginTop: 18,
  },

  availabilityAdminCard: {
    padding: 18,

    borderRadius: 18,

    background: "#0f0f11",

    border:
      "1px solid #303035",

    display: "grid",

    gap: 8,
  },

  inactiveAvailability: {
    opacity: 0.55,
  },

  availabilityStatus: {
    color: "#86efac",

    fontSize: 10,

    fontWeight: 900,

    letterSpacing:
      ".08em",
  },

  availabilityDate: {
    fontSize: 16,

    color: "#f5f5f5",
  },

  availabilityEnd: {
    color: "#a1a1aa",

    fontSize: 12,
  },

  availabilityLabel: {
    color: "#93c5fd",

    fontSize: 12,
  },

  availabilityActions: {
    display: "flex",

    gap: 8,

    marginTop: 8,
  },

  secondaryButtonSmall: {
    padding:
      "8px 11px",

    borderRadius: 10,

    border:
      "1px solid #34343a",

    background: "#151517",

    color: "#f5f5f5",

    cursor: "pointer",

    fontWeight: 700,
  },

  deleteButtonSmall: {
    padding:
      "8px 11px",

    borderRadius: 10,

    border:
      "1px solid rgba(248,113,113,.25)",

    background:
      "rgba(248,113,113,.06)",

    color: "#fca5a5",

    cursor: "pointer",

    fontWeight: 700,
  },

  /* SETTINGS */

  settingsGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(280px,1fr))",

    gap: 14,

    margin:
      "20px 0",
  },

  settingsPreview: {
    margin:
      "22px 0",

    padding: 20,

    borderRadius: 18,

    background:
      "rgba(59,130,246,.06)",

    border:
      "1px solid rgba(59,130,246,.16)",
  },

  settingsPreviewTitle: {
    margin:
      "0 0 14px",

    fontSize: 25,
  },

  /* REPORT */

  reportControls: {
    display: "grid",

    gap: 24,

    marginTop: 24,
  },

  controlLabel: {
    display: "block",

    marginBottom: 8,

    color: "#d4d4d8",

    fontWeight: 700,

    fontSize: 13,
  },

  helperText: {
    margin:
      "-2px 0 14px",

    color: "#9ca3af",

    fontSize: 13,

    lineHeight: 1.6,
  },

  fieldWrap: {
    display: "grid",

    gap: 8,
  },

  dateGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 14,
  },

  smallButtonRow: {
    display: "flex",

    gap: 10,

    marginBottom: 14,

    flexWrap: "wrap",
  },

  codeSelector: {
    display: "flex",

    flexWrap: "wrap",

    gap: 10,
  },

  codeChoice: {
    display: "flex",

    alignItems:
      "center",

    gap: 8,

    padding:
      "10px 13px",

    borderRadius: 999,

    background: "#0d0d0f",

    border:
      "1px solid #34343a",

    cursor: "pointer",

    fontSize: 13,
  },

  codeChoiceActive: {
    background:
      "rgba(59,130,246,.16)",

    border:
      "1px solid rgba(96,165,250,.45)",

    color: "#dbeafe",
  },

  optionalGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 10,
  },

  optionalChoice: {
    display: "flex",

    alignItems:
      "center",

    gap: 10,

    padding:
      "13px 14px",

    borderRadius: 14,

    background: "#0d0d0f",

    border:
      "1px solid #34343a",

    cursor: "pointer",

    color: "#d4d4d8",

    fontSize: 13,
  },

  optionalChoiceActive: {
    background:
      "rgba(59,130,246,.13)",

    border:
      "1px solid rgba(96,165,250,.40)",

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

    justifyContent:
      "space-between",

    gap: 20,

    alignItems:
      "flex-start",

    borderBottom:
      "2px solid #111827",

    paddingBottom: 20,
  },

  reportBrand: {
    margin:
      "0 0 5px",

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

    gridTemplateColumns:
      "repeat(3,minmax(0,1fr))",

    gap: 18,

    marginTop: 24,

    padding: 20,

    background: "#f3f4f6",

    borderRadius: 16,
  },

  reportMetrics: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(140px,1fr))",

    gap: 14,

    marginTop: 24,
  },

  reportMetric: {
    padding: 18,

    borderRadius: 14,

    border:
      "1px solid #d1d5db",

    display: "grid",

    gap: 6,
  },

  highlightStrip: {
    marginTop: 20,

    padding:
      "14px 16px",

    borderRadius: 12,

    background: "#eff6ff",

    border:
      "1px solid #bfdbfe",

    color: "#1e3a8a",

    fontSize: 14,
  },

  summaryBox: {
    marginTop: 28,

    padding: 22,

    borderRadius: 16,

    background: "#f8fafc",

    border:
      "1px solid #e5e7eb",
  },

  reportSectionTitle: {
    marginTop: 30,

    marginBottom: 12,

    fontSize: 22,
  },

  reportText: {
    lineHeight: 1.75,
  },

  reportIntroText: {
    marginTop: -4,

    color: "#6b7280",

    fontSize: 13,
  },

  breakdownGrid: {
    display: "grid",

    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",

    gap: 14,
  },

  breakdownCard: {
    padding: 18,

    border:
      "1px solid #d1d5db",

    borderRadius: 14,
  },

  breakdownTitle: {
    marginTop: 0,
  },

  reportTable: {
    width: "100%",

    borderCollapse:
      "collapse",

    color: "#111827",
  },

  reportTh: {
    textAlign: "left",

    padding: 10,

    borderBottom:
      "2px solid #111827",

    fontSize: 12,

    whiteSpace: "nowrap",
  },

  reportTd: {
    padding: 10,

    borderBottom:
      "1px solid #e5e7eb",

    fontSize: 12,

    verticalAlign: "top",
  },

  reportEmptyTd: {
    padding: 24,

    textAlign: "center",

    color: "#6b7280",

    fontSize: 13,
  },

  reportFooter: {
    marginTop: 30,

    paddingTop: 18,

    borderTop:
      "1px solid #d1d5db",

    color: "#6b7280",

    textAlign: "center",

    fontSize: 12,
  },

  reportActions: {
    display: "flex",

    gap: 12,

    flexWrap: "wrap",
  },
};
