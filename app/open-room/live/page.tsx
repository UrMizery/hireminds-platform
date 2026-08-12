"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type VisitMode =
  | "attend"
  | "request"
  | "";

type AvailabilitySlot = {
  id: string;
  start_time: string;
  end_time: string | null;
  label: string | null;
  booked_request_id?: string | null;
};

type MeetingRequest = {
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

  policy_agreed?: boolean | null;
  policy_agreed_at?: string | null;

  participant_confirmed_at?: string | null;

  reschedule_requested_at?: string | null;
  reschedule_slot_id?: string | null;
  reschedule_note?: string | null;

  cancellation_note?: string | null;

  created_at?: string | null;
};

type MeetingChoice = {
  id: string;

  request_id: string;

  slot_id: string;

  preference_order: number;
};

type CareerConnectSettings = {
  meeting_link: string;

  open_room_title: string;

  open_room_schedule: string;

  open_room_time: string;

  doors_open: string;

  doors_close: string;

  open_room_note: string;
};

/* =========================================================
   CONSTANTS
========================================================= */

const DEFAULT_SETTINGS: CareerConnectSettings = {
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

const SERVICE_OPTIONS = [
  {
    value:
      "open_room",

    label:
      "Open Room",

    description:
      "Live Q&A, networking, resource drops, opportunities, and career conversations.",
  },

  {
    value:
      "resume_support",

    label:
      "Resume Support",

    description:
      "Resume review, development, revisions, and recommendations.",
  },

  {
    value:
      "cover_letter_review",

    label:
      "Cover Letter Review",

    description:
      "Review your cover letter for clarity, relevance, and overall presentation.",
  },

  {
    value:
      "career_coaching",

    label:
      "1:1 Career Coaching",

    description:
      "Individual career planning, preparation, and support.",
  },

  {
    value:
      "mock_interview",

    label:
      "Mock Interview",

    description:
      "Practice interview questions, answers, and interview preparation.",
  },

  {
    value:
      "workforce_training",

    label:
      "Workforce Development Training",

    description:
      "Scheduled HireMinds workforce development training session.",
  },

  {
    value:
      "job_search_assistance",

    label:
      "Job Search Assistance",

    description:
      "Job search guidance, opportunities, and application support.",
  },

  {
    value:
      "other",

    label:
      "Other",

    description:
      "Another scheduled HireMinds meeting or career-support session.",
  },
];

const REQUEST_OPTIONS = [
  {
    value:
      "resume_support",

    label:
      "Resume Support",
  },

  {
    value:
      "cover_letter_review",

    label:
      "Cover Letter Review",
  },

  {
    value:
      "career_coaching",

    label:
      "1:1 Career Coaching",
  },

  {
    value:
      "mock_interview",

    label:
      "Mock Interview",
  },

  {
    value:
      "job_search_assistance",

    label:
      "Job Search Assistance",
  },

  {
    value:
      "other",

    label:
      "Other",
  },
];

const MAX_ATTACHMENTS =
  3;

const MAX_FILE_SIZE =
  10 *
  1024 *
  1024;

/* =========================================================
   PAGE
========================================================= */

export default function OpenRoomLivePage() {
  const router =
    useRouter();

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    userId,
    setUserId,
  ] =
    useState(
      ""
    );

  const [
    fullName,
    setFullName,
  ] =
    useState(
      ""
    );

  const [
    email,
    setEmail,
  ] =
    useState(
      ""
    );

  const [
    referralCode,
    setReferralCode,
  ] =
    useState(
      ""
    );

  const [
    settings,
    setSettings,
  ] =
    useState<CareerConnectSettings>(
      DEFAULT_SETTINGS
    );

  const [
    availabilitySlots,
    setAvailabilitySlots,
  ] =
    useState<
      AvailabilitySlot[]
    >(
      []
    );

  const [
    meetingRequests,
    setMeetingRequests,
  ] =
    useState<
      MeetingRequest[]
    >(
      []
    );

  const [
    meetingChoices,
    setMeetingChoices,
  ] =
    useState<
      MeetingChoice[]
    >(
      []
    );

  const [
    visitMode,
    setVisitMode,
  ] =
    useState<VisitMode>(
      ""
    );

  /* =======================================================
     ATTEND
  ======================================================= */

  const [
    selectedServices,
    setSelectedServices,
  ] =
    useState<
      string[]
    >(
      []
    );

  const [
    otherService,
    setOtherService,
  ] =
    useState(
      ""
    );

  const [
    checkingIn,
    setCheckingIn,
  ] =
    useState(
      false
    );

  const [
    checkInMessage,
    setCheckInMessage,
  ] =
    useState(
      ""
    );

  const [
    checkedIn,
    setCheckedIn,
  ] =
    useState(
      false
    );

  /* =======================================================
     INITIAL REQUEST
  ======================================================= */

  const [
    requestService,
    setRequestService,
  ] =
    useState(
      ""
    );

  const [
    requestOtherService,
    setRequestOtherService,
  ] =
    useState(
      ""
    );

  const [
    selectedSlots,
    setSelectedSlots,
  ] =
    useState<
      string[]
    >(
      []
    );

  const [
    requestNotes,
    setRequestNotes,
  ] =
    useState(
      ""
    );

  const [
    requestFiles,
    setRequestFiles,
  ] =
    useState<
      File[]
    >(
      []
    );

  const [
    requestSubmitting,
    setRequestSubmitting,
  ] =
    useState(
      false
    );

  const [
    requestMessage,
    setRequestMessage,
  ] =
    useState(
      ""
    );

  const [
    policyAgreed,
    setPolicyAgreed,
  ] =
    useState(
      false
    );

  /* =======================================================
     RESCHEDULE
  ======================================================= */

  const [
    rescheduleRequestId,
    setRescheduleRequestId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    rescheduleSlotId,
    setRescheduleSlotId,
  ] =
    useState(
      ""
    );

  const [
    rescheduleNote,
    setRescheduleNote,
  ] =
    useState(
      ""
    );

  const [
    rescheduleSubmitting,
    setRescheduleSubmitting,
  ] =
    useState(
      false
    );

  const [
    rescheduleMessage,
    setRescheduleMessage,
  ] =
    useState(
      ""
    );

  /* =======================================================
     CANCELLATION
  ======================================================= */

  const [
    cancelRequestId,
    setCancelRequestId,
  ] =
    useState<
      string | null
    >(
      null
    );

  const [
    cancellationNote,
    setCancellationNote,
  ] =
    useState(
      ""
    );

  const [
    cancelling,
    setCancelling,
  ] =
    useState(
      false
    );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(
    () => {
      loadPage();
    },
    []
  );

  async function loadPage() {
    setLoading(
      true
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

    setEmail(
      user.email ||
        ""
    );

    const {
      data:
        profile,
    } =
      await supabase
        .from(
          "candidate_profiles"
        )
        .select(
          "full_name, email, referral_code"
        )
        .eq(
          "user_id",
          user.id
        )
        .maybeSingle();

    setFullName(
      profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "Participant"
    );

    setEmail(
      profile?.email ||
        user.email ||
        ""
    );

    setReferralCode(
      profile?.referral_code ||
        user.user_metadata?.referral_code ||
        ""
    );

    await Promise.all([
      loadSettings(),
      loadAvailability(),
      loadMyMeetings(
        user.id
      ),
    ]);

    setLoading(
      false
    );
  }

  async function loadSettings() {
    const {
      data,
    } =
      await supabase
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
        .maybeSingle();

    if (
      data
    ) {
      setSettings({
        meeting_link:
          data.meeting_link ||
          DEFAULT_SETTINGS.meeting_link,

        open_room_title:
          data.open_room_title ||
          DEFAULT_SETTINGS.open_room_title,

        open_room_schedule:
          data.open_room_schedule ||
          DEFAULT_SETTINGS.open_room_schedule,

        open_room_time:
          data.open_room_time ||
          DEFAULT_SETTINGS.open_room_time,

        doors_open:
          data.doors_open ||
          DEFAULT_SETTINGS.doors_open,

        doors_close:
          data.doors_close ||
          DEFAULT_SETTINGS.doors_close,

        open_room_note:
          data.open_room_note ||
          DEFAULT_SETTINGS.open_room_note,
      });
    }
  }

  async function loadAvailability() {
    const now =
      new Date().toISOString();

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "availability_slots"
        )
        .select(
          "id,start_time,end_time,label,booked_request_id"
        )
        .eq(
          "is_active",
          true
        )
        .is(
          "booked_request_id",
          null
        )
        .gte(
          "start_time",
          now
        )
        .order(
          "start_time",
          {
            ascending:
              true,
          }
        );

    if (
      error
    ) {
      console.error(
        error
      );

      return;
    }

    setAvailabilitySlots(
      (
        data as AvailabilitySlot[]
      ) ||
        []
    );
  }

  async function loadMyMeetings(
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

    const [
      requestsResult,
      choicesResult,
    ] =
      await Promise.all([
        supabase
          .from(
            "meeting_requests"
          )
          .select(
            "*"
          )
          .eq(
            "user_id",
            id
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
          .eq(
            "user_id",
            id
          )
          .order(
            "preference_order",
            {
              ascending:
                true,
            }
          ),
      ]);

    if (
      !requestsResult.error
    ) {
      setMeetingRequests(
        (
          requestsResult.data as MeetingRequest[]
        ) ||
          []
      );
    }

    if (
      !choicesResult.error
    ) {
      setMeetingChoices(
        (
          choicesResult.data as MeetingChoice[]
        ) ||
          []
      );
    }
  }

  /* =======================================================
     HELPERS
  ======================================================= */

  function getServiceLabel(
    value:
      string
  ) {
    if (
      value ===
      "other"
    ) {
      return (
        otherService.trim() ||
        "Other"
      );
    }

    return (
      SERVICE_OPTIONS.find(
        (
          service
        ) =>
          service.value ===
          value
      )?.label ||
      value
    );
  }

  function requestServiceLabel(
    request:
      MeetingRequest
  ) {
    if (
      request.service_type ===
      "other"
    ) {
      return (
        request.other_service ||
        "Other"
      );
    }

    return (
      REQUEST_OPTIONS.find(
        (
          item
        ) =>
          item.value ===
          request.service_type
      )?.label ||
      request.service_type
    );
  }

  function formatSlot(
    slot:
      AvailabilitySlot
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

    const date =
      start.toLocaleDateString(
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
        }
      );

    const startTime =
      start.toLocaleTimeString(
        [],
        {
          hour:
            "numeric",

          minute:
            "2-digit",
        }
      );

    const endTime =
      end
        ? end.toLocaleTimeString(
            [],
            {
              hour:
                "numeric",

              minute:
                "2-digit",
            }
          )
        : "";

    return `${date} • ${startTime}${
      endTime
        ? ` – ${endTime}`
        : ""
    }`;
  }

  function getSlot(
    id?:
      string | null
  ) {
    if (
      !id
    ) {
      return undefined;
    }

    return availabilitySlots.find(
      (
        slot
      ) =>
        slot.id ===
        id
    );
  }

  function getRequestChoices(
    requestId:
      string
  ) {
    return meetingChoices.filter(
      (
        choice
      ) =>
        choice.request_id ===
        requestId
    );
  }

  function statusLabel(
    status:
      string
  ) {
    if (
      status ===
      "pending"
    ) {
      return "Pending Review";
    }

    if (
      status ===
      "approved"
    ) {
      return "Appointment Approved";
    }

    if (
      status ===
      "confirmed"
    ) {
      return "Confirmed";
    }

    if (
      status ===
      "reschedule_requested"
    ) {
      return "Reschedule Requested";
    }

    if (
      status ===
      "completed"
    ) {
      return "Completed";
    }

    if (
      status ===
      "cancelled"
    ) {
      return "Cancelled";
    }

    if (
      status ===
      "declined"
    ) {
      return "Declined";
    }

    return status;
  }

  /* =======================================================
     INITIAL SLOT SELECTION - MAX 3
  ======================================================= */

  function toggleAvailabilitySlot(
    slotId:
      string
  ) {
    setRequestMessage(
      ""
    );

    setSelectedSlots(
      (
        previous
      ) => {
        if (
          previous.includes(
            slotId
          )
        ) {
          return previous.filter(
            (
              id
            ) =>
              id !==
              slotId
          );
        }

        if (
          previous.length >=
          3
        ) {
          setRequestMessage(
            "You can select up to 3 appointment choices."
          );

          return previous;
        }

        return [
          ...previous,
          slotId,
        ];
      }
    );
  }

  /* =======================================================
     FILES
  ======================================================= */

  function handleFilesSelected(
    files:
      FileList | null
  ) {
    if (
      !files
    ) {
      return;
    }

    const selected =
      Array.from(
        files
      );

    if (
      selected.length >
      MAX_ATTACHMENTS
    ) {
      setRequestMessage(
        "You may attach up to 3 files."
      );

      return;
    }

    const tooLarge =
      selected.find(
        (
          file
        ) =>
          file.size >
          MAX_FILE_SIZE
      );

    if (
      tooLarge
    ) {
      setRequestMessage(
        `${tooLarge.name} is larger than 10 MB.`
      );

      return;
    }

    setRequestFiles(
      selected
    );
  }

  function safeFileName(
    name:
      string
  ) {
    return name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
  }

  /* =======================================================
     SUBMIT INITIAL REQUEST
  ======================================================= */

  async function handleMeetingRequest() {
    if (
      !requestService
    ) {
      setRequestMessage(
        "Please select the service you are requesting."
      );

      return;
    }

    if (
      requestService ===
        "other" &&
      !requestOtherService.trim()
    ) {
      setRequestMessage(
        "Please tell us what type of support you are requesting."
      );

      return;
    }

    if (
      selectedSlots.length <
      1
    ) {
      setRequestMessage(
        "Please select at least one appointment preference."
      );

      return;
    }

    if (
      selectedSlots.length >
      3
    ) {
      setRequestMessage(
        "Please select no more than 3 appointment preferences."
      );

      return;
    }

    if (
      !policyAgreed
    ) {
      setRequestMessage(
        "Please agree to the Scheduling & Cancellation Agreement."
      );

      return;
    }

    setRequestSubmitting(
      true
    );

    setRequestMessage(
      ""
    );

    const {
      data:
        request,

      error:
        requestError,
    } =
      await supabase
        .from(
          "meeting_requests"
        )
        .insert({
          user_id:
            userId,

          participant_name:
            fullName,

          participant_email:
            email,

          referral_code:
            referralCode ||
            null,

          service_type:
            requestService,

          other_service:
            requestService ===
            "other"
              ? requestOtherService.trim()
              : null,

          notes:
            requestNotes ||
            null,

          status:
            "pending",

          policy_agreed:
            true,

          policy_agreed_at:
            new Date().toISOString(),
        })
        .select(
          "id"
        )
        .single();

    if (
      requestError ||
      !request
    ) {
      setRequestMessage(
        requestError?.message ||
        "Could not submit request."
      );

      setRequestSubmitting(
        false
      );

      return;
    }

    const choiceRows =
      selectedSlots.map(
        (
          slotId,
          index
        ) => ({
          request_id:
            request.id,

          user_id:
            userId,

          slot_id:
            slotId,

          preference_order:
            index +
            1,
        })
      );

    const {
      error:
        choiceError,
    } =
      await supabase
        .from(
          "meeting_request_choices"
        )
        .insert(
          choiceRows
        );

    if (
      choiceError
    ) {
      setRequestMessage(
        choiceError.message
      );

      setRequestSubmitting(
        false
      );

      return;
    }

    for (
      const file of
      requestFiles
    ) {
      const path =
        `${userId}/${request.id}/${Date.now()}-${safeFileName(
          file.name
        )}`;

      const {
        error:
          uploadError,
      } =
        await supabase.storage
          .from(
            "meeting-request-files"
          )
          .upload(
            path,
            file
          );

      if (
        !uploadError
      ) {
        await supabase
          .from(
            "meeting_request_attachments"
          )
          .insert({
            request_id:
              request.id,

            user_id:
              userId,

            file_name:
              file.name,

            file_path:
              path,

            file_type:
              file.type ||
              null,

            file_size:
              file.size,
          });

        await supabase
          .from(
            "user_activity"
          )
          .insert({
            user_id:
              userId,

            full_name:
              fullName,

            email,

            referral_code:
              referralCode ||
              null,

            event_type:
              "document_submitted",

            tool_name:
              requestService ===
              "resume_support"
                ? "Resume Submitted"
                : requestService ===
                    "cover_letter_review"
                  ? "Cover Letter Submitted"
                  : "Career Document Submitted",

            page_name:
              "career-connect",
          });
      }
    }

    await supabase
      .from(
        "user_activity"
      )
      .insert({
        user_id:
          userId,

        full_name:
          fullName,

        email,

        referral_code:
          referralCode ||
          null,

        event_type:
          "meeting_requested",

        tool_name:
          REQUEST_OPTIONS.find(
            (
              item
            ) =>
              item.value ===
              requestService
          )?.label ||
          requestService,

        page_name:
          "career-connect",
      });

    setRequestMessage(
      "✓ Your request was submitted. Watch My Meetings & Requests above for your approval."
    );

    setRequestService(
      ""
    );

    setRequestOtherService(
      ""
    );

    setSelectedSlots(
      []
    );

    setRequestNotes(
      ""
    );

    setRequestFiles(
      []
    );

    setPolicyAgreed(
      false
    );

    setRequestSubmitting(
      false
    );

    await Promise.all([
      loadMyMeetings(),
      loadAvailability(),
    ]);
  }

  /* =======================================================
     PARTICIPANT CONFIRM
  ======================================================= */

  async function confirmAppointment(
    requestId:
      string
  ) {
    const {
      error,
    } =
      await supabase.rpc(
        "participant_confirm_meeting",
        {
          p_request_id:
            requestId,
        }
      );

    if (
      error
    ) {
      setRequestMessage(
        error.message
      );

      return;
    }

    await supabase
      .from(
        "user_activity"
      )
      .insert({
        user_id:
          userId,

        full_name:
          fullName,

        email,

        referral_code:
          referralCode ||
          null,

        event_type:
          "appointment_confirmed",

        tool_name:
          "Career Connect Appointment",

        page_name:
          "career-connect",
      });

    setRequestMessage(
      "✓ Your appointment is confirmed."
    );

    await loadMyMeetings();
  }

  /* =======================================================
     RESCHEDULE
  ======================================================= */

  function openReschedule(
    requestId:
      string
  ) {
    setRescheduleRequestId(
      requestId
    );

    setRescheduleSlotId(
      ""
    );

    setRescheduleNote(
      ""
    );

    setRescheduleMessage(
      ""
    );
  }

  async function submitRescheduleRequest() {
    if (
      !rescheduleRequestId
    ) {
      return;
    }

    if (
      !rescheduleSlotId &&
      !rescheduleNote.trim()
    ) {
      setRescheduleMessage(
        "Choose one available time or write a note requesting another date/time."
      );

      return;
    }

    setRescheduleSubmitting(
      true
    );

    setRescheduleMessage(
      ""
    );

    const {
      error,
    } =
      await supabase.rpc(
        "participant_request_reschedule",
        {
          p_request_id:
            rescheduleRequestId,

          p_slot_id:
            rescheduleSlotId ||
            null,

          p_note:
            rescheduleNote.trim() ||
            null,
        }
      );

    if (
      error
    ) {
      setRescheduleMessage(
        error.message
      );

      setRescheduleSubmitting(
        false
      );

      return;
    }

    await supabase
      .from(
        "user_activity"
      )
      .insert({
        user_id:
          userId,

        full_name:
          fullName,

        email,

        referral_code:
          referralCode ||
          null,

        event_type:
          "reschedule_requested",

        tool_name:
          "Career Connect Appointment",

        page_name:
          "career-connect",
      });

    setRescheduleMessage(
      "✓ Reschedule request submitted. Your current appointment remains scheduled until HireMinds approves a replacement."
    );

    setRescheduleSubmitting(
      false
    );

    await loadMyMeetings();
  }

  /* =======================================================
     CANCEL
  ======================================================= */

  async function submitCancellation() {
    if (
      !cancelRequestId
    ) {
      return;
    }

    setCancelling(
      true
    );

    const {
      error,
    } =
      await supabase.rpc(
        "participant_cancel_meeting",
        {
          p_request_id:
            cancelRequestId,

          p_note:
            cancellationNote.trim() ||
            null,
        }
      );

    if (
      error
    ) {
      setRequestMessage(
        error.message
      );

      setCancelling(
        false
      );

      return;
    }

    await supabase
      .from(
        "user_activity"
      )
      .insert({
        user_id:
          userId,

        full_name:
          fullName,

        email,

        referral_code:
          referralCode ||
          null,

        event_type:
          "appointment_cancelled",

        tool_name:
          "Career Connect Appointment",

        page_name:
          "career-connect",
      });

    setCancelRequestId(
      null
    );

    setCancellationNote(
      ""
    );

    setCancelling(
      false
    );

    setRequestMessage(
      "Your appointment has been cancelled."
    );

    await Promise.all([
      loadMyMeetings(),
      loadAvailability(),
    ]);
  }

  /* =======================================================
     CHECK IN
  ======================================================= */

  function toggleScheduledService(
    value:
      string
  ) {
    setSelectedServices(
      (
        previous
      ) =>
        previous.includes(
          value
        )
          ? previous.filter(
              (
                item
              ) =>
                item !==
                value
            )
          : [
              ...previous,
              value,
            ]
    );
  }

  async function handleCheckInAndEnter() {
    if (
      selectedServices.length ===
      0
    ) {
      setCheckInMessage(
        "Please select at least one service."
      );

      return;
    }

    setCheckingIn(
      true
    );

    const now =
      new Date();

    const selectedLabels =
      selectedServices.map(
        (
          service
        ) =>
          getServiceLabel(
            service
          )
      );

    const {
      data:
        session,

      error:
        sessionError,
    } =
      await supabase
        .from(
          "workforce_sessions"
        )
        .insert({
          service_type:
            selectedServices[
              0
            ],

          session_title:
            selectedLabels.join(
              " + "
            ),

          referral_code:
            referralCode ||
            null,

          session_date:
            now
              .toISOString()
              .slice(
                0,
                10
              ),

          start_time:
            now.toISOString(),

          location_type:
            "virtual",

          meeting_link:
            settings.meeting_link,

          created_by:
            userId,
        })
        .select(
          "id"
        )
        .single();

    if (
      sessionError ||
      !session
    ) {
      setCheckInMessage(
        sessionError?.message ||
        "Could not check in."
      );

      setCheckingIn(
        false
      );

      return;
    }

    await supabase
      .from(
        "workforce_session_services"
      )
      .insert(
        selectedServices.map(
          (
            service
          ) => ({
            session_id:
              session.id,

            user_id:
              userId,

            service_type:
              service,

            service_label:
              getServiceLabel(
                service
              ),
          })
        )
      );

    await supabase
      .from(
        "workforce_attendance"
      )
      .insert({
        session_id:
          session.id,

        user_id:
          userId,

        participant_name:
          fullName,

        participant_email:
          email,

        referral_code:
          referralCode ||
          null,

        status:
          "checked_in",

        check_in_time:
          now.toISOString(),
      });

    setCheckedIn(
      true
    );

    setCheckingIn(
      false
    );

    window.open(
      settings.meeting_link,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /* =======================================================
     UI HELPERS
  ======================================================= */

  const activeMeetingRequests =
    useMemo(
      () =>
        meetingRequests.filter(
          (
            request
          ) =>
            ![
              "completed",
              "declined",
            ].includes(
              request.status
            )
        ),
      [
        meetingRequests,
      ]
    );

  if (
    loading
  ) {
    return (
      <main
        className="loadingPage"
      >
        Loading Career Connect...

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050814;
            color: white;
            font-family: system-ui, sans-serif;
          }
        `}</style>
      </main>
    );
  }

  return (
    <main
      className="page"
    >
      <aside
        className="side"
      >
        <p
          className="brand"
        >
          HIREMINDS™
        </p>

        <h2>
          CAREER CONNECT
        </h2>

        <p
          className="live"
        >
          ● LIVE CAREER SERVICES
        </p>

        <button
          className="active"
        >
          🏠 Career Connect
        </button>

        <button>
          💬 Live Support
        </button>

        <button>
          📁 Resources
        </button>

        <button>
          💼 Opportunities
        </button>

        <button
          className="exit"
          onClick={() =>
            router.push(
              "/profile"
            )
          }
        >
          🚪 Exit Career Connect
        </button>
      </aside>

      <section
        className="main"
      >
        <p
          className="eyebrow"
        >
          HireMinds™ Live Career Services
        </p>

        <h1>
          CAREER CONNECT
        </h1>

        <p
          className="intro"
        >
          Attend scheduled career-support sessions, request services,
          and manage your HireMinds appointments.
        </p>

        {/* =================================================
            MY MEETINGS
        ================================================= */}

        <section
          className="meetingsPanel"
        >
          <div
            className="panelHeader"
          >
            <div>
              <p
                className="eyebrow"
              >
                Your Schedule
              </p>

              <h2>
                My Meetings & Requests
              </h2>

              <p>
                Track requests, approvals, confirmations, cancellations,
                and reschedule requests here.
              </p>
            </div>

            <button
              className="refreshBtn"
              onClick={() =>
                loadMyMeetings()
              }
            >
              Refresh
            </button>
          </div>

          {activeMeetingRequests.length ===
          0 ? (
            <div
              className="emptyState"
            >
              You do not have any active meeting requests right now.
            </div>
          ) : (
            <div
              className="meetingList"
            >
              {activeMeetingRequests.map(
                (
                  request
                ) => {
                  const confirmedSlot =
                    getSlot(
                      request.confirmed_slot_id
                    );

                  const originalChoices =
                    getRequestChoices(
                      request.id
                    );

                  const requestedRescheduleSlot =
                    getSlot(
                      request.reschedule_slot_id
                    );

                  return (
                    <article
                      key={
                        request.id
                      }
                      className="meetingCard"
                    >
                      <div
                        className="meetingTop"
                      >
                        <div>
                          <span
                            className={`status status-${request.status}`}
                          >
                            {statusLabel(
                              request.status
                            )}
                          </span>

                          <h3>
                            {requestServiceLabel(
                              request
                            )}
                          </h3>
                        </div>

                        <span
                          className="submittedDate"
                        >
                          Requested{" "}
                          {request.created_at
                            ? new Date(
                                request.created_at
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>

                      {request.status ===
                      "pending" ? (
                        <div
                          className="pendingBox"
                        >
                          <strong>
                            Your request is waiting for review.
                          </strong>

                          <p>
                            HireMinds will review your preferred times and
                            approve one.
                          </p>

                          <div
                            className="preferenceList"
                          >
                            {originalChoices.map(
                              (
                                choice
                              ) => {
                                const slot =
                                  getSlot(
                                    choice.slot_id
                                  );

                                return (
                                  <div
                                    key={
                                      choice.id
                                    }
                                  >
                                    <strong>
                                      Choice {choice.preference_order}
                                    </strong>

                                    <span>
                                      {slot
                                        ? formatSlot(
                                            slot
                                          )
                                        : "Appointment time no longer available"}
                                    </span>
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      ) : null}

                      {request.status ===
                      "approved" ? (
                        <div
                          className="approvalBox"
                        >
                          <p
                            className="miniLabel"
                          >
                            APPOINTMENT APPROVED
                          </p>

                          <strong
                            className="appointmentDate"
                          >
                            {confirmedSlot
                              ? formatSlot(
                                  confirmedSlot
                                )
                              : "Approved appointment"}
                          </strong>

                          <p>
                            HireMinds approved this appointment. Please
                            confirm that you will attend.
                          </p>

                          <div
                            className="meetingActions"
                          >
                            <button
                              className="confirmBtn"
                              onClick={() =>
                                confirmAppointment(
                                  request.id
                                )
                              }
                            >
                              ✓ Confirm Appointment
                            </button>

                            <button
                              className="rescheduleBtn"
                              onClick={() =>
                                openReschedule(
                                  request.id
                                )
                              }
                            >
                              Request Reschedule
                            </button>

                            <button
                              className="cancelBtn"
                              onClick={() =>
                                setCancelRequestId(
                                  request.id
                                )
                              }
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {request.status ===
                      "confirmed" ? (
                        <div
                          className="confirmedBox"
                        >
                          <p
                            className="miniLabel"
                          >
                            ✓ CONFIRMED
                          </p>

                          <strong
                            className="appointmentDate"
                          >
                            {confirmedSlot
                              ? formatSlot(
                                  confirmedSlot
                                )
                              : "Confirmed appointment"}
                          </strong>

                          <p>
                            You are confirmed for this appointment.
                          </p>

                          <div
                            className="meetingActions"
                          >
                            <a
                              href={
                                settings.meeting_link
                              }
                              target="_blank"
                              rel="noreferrer"
                              className="enterMeetingBtn"
                            >
                              Enter Meeting
                            </a>

                            <button
                              className="rescheduleBtn"
                              onClick={() =>
                                openReschedule(
                                  request.id
                                )
                              }
                            >
                              Request Reschedule
                            </button>

                            <button
                              className="cancelBtn"
                              onClick={() =>
                                setCancelRequestId(
                                  request.id
                                )
                              }
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {request.status ===
                      "reschedule_requested" ? (
                        <div
                          className="reschedulePendingBox"
                        >
                          <p
                            className="miniLabel"
                          >
                            RESCHEDULE REQUESTED
                          </p>

                          <strong>
                            Your current appointment remains scheduled.
                          </strong>

                          {confirmedSlot ? (
                            <p>
                              Current appointment:{" "}
                              <b>
                                {formatSlot(
                                  confirmedSlot
                                )}
                              </b>
                            </p>
                          ) : null}

                          {requestedRescheduleSlot ? (
                            <p>
                              Requested new time:{" "}
                              <b>
                                {formatSlot(
                                  requestedRescheduleSlot
                                )}
                              </b>
                            </p>
                          ) : null}

                          {request.reschedule_note ? (
                            <div
                              className="noteDisplay"
                            >
                              <strong>
                                Your note:
                              </strong>

                              <p>
                                {request.reschedule_note}
                              </p>
                            </div>
                          ) : null}

                          <p>
                            HireMinds will review your request. Your current
                            appointment stays reserved until another time is
                            approved.
                          </p>
                        </div>
                      ) : null}

                      {request.status ===
                      "cancelled" ? (
                        <div
                          className="cancelledBox"
                        >
                          <strong>
                            Appointment Cancelled
                          </strong>

                          {request.cancellation_note ? (
                            <p>
                              {request.cancellation_note}
                            </p>
                          ) : null}
                        </div>
                      ) : null}

                      {/* RESCHEDULE FORM */}

                      {rescheduleRequestId ===
                      request.id ? (
                        <div
                          className="rescheduleForm"
                        >
                          <div
                            className="formHeading"
                          >
                            <div>
                              <p
                                className="eyebrow"
                              >
                                Reschedule
                              </p>

                              <h3>
                                Request a Different Appointment
                              </h3>

                              <p>
                                Your current appointment will remain
                                scheduled until HireMinds approves a
                                replacement.
                              </p>
                            </div>

                            <button
                              className="closeBtn"
                              onClick={() =>
                                setRescheduleRequestId(
                                  null
                                )
                              }
                            >
                              ×
                            </button>
                          </div>

                          <div
                            className="rescheduleOption"
                          >
                            <strong>
                              Option 1 — Choose ONE new available time
                            </strong>

                            <p>
                              Selecting another time automatically replaces
                              your previous selection.
                            </p>

                            <div
                              className="slotGrid"
                            >
                              {availabilitySlots
                                .filter(
                                  (
                                    slot
                                  ) =>
                                    slot.id !==
                                    request.confirmed_slot_id
                                )
                                .map(
                                  (
                                    slot
                                  ) => (
                                    <button
                                      key={
                                        slot.id
                                      }
                                      type="button"
                                      className={`slotChoice ${
                                        rescheduleSlotId ===
                                        slot.id
                                          ? "slotChoiceActive"
                                          : ""
                                      }`}
                                      onClick={() =>
                                        setRescheduleSlotId(
                                          rescheduleSlotId ===
                                          slot.id
                                            ? ""
                                            : slot.id
                                        )
                                      }
                                    >
                                      {formatSlot(
                                        slot
                                      )}
                                    </button>
                                  )
                                )}
                            </div>
                          </div>

                          <div
                            className="orDivider"
                          >
                            OR
                          </div>

                          <div
                            className="rescheduleOption"
                          >
                            <strong>
                              Option 2 — Request another date or time
                            </strong>

                            <p>
                              If none of the listed appointments work, tell
                              us the specific date or time you would prefer.
                            </p>

                            <textarea
                              value={
                                rescheduleNote
                              }
                              onChange={
                                (
                                  e
                                ) =>
                                  setRescheduleNote(
                                    e.target.value
                                  )
                              }
                              placeholder="Example: Thursday, August 27 after 3:00 PM works best for me."
                            />
                          </div>

                          {rescheduleMessage ? (
                            <div
                              className="messageBox"
                            >
                              {rescheduleMessage}
                            </div>
                          ) : null}

                          <button
                            className="submitRescheduleBtn"
                            disabled={
                              rescheduleSubmitting ||
                              (!rescheduleSlotId &&
                                !rescheduleNote.trim())
                            }
                            onClick={
                              submitRescheduleRequest
                            }
                          >
                            {rescheduleSubmitting
                              ? "Submitting..."
                              : "Submit Reschedule Request"}
                          </button>
                        </div>
                      ) : null}

                      {/* CANCEL FORM */}

                      {cancelRequestId ===
                      request.id ? (
                        <div
                          className="cancelForm"
                        >
                          <h3>
                            Cancel Appointment?
                          </h3>

                          <p>
                            Please provide at least 48 hours notice whenever
                            possible. Two participant-initiated cancellations
                            may result in referral back to your referring
                            organization or provider.
                          </p>

                          <textarea
                            value={
                              cancellationNote
                            }
                            onChange={
                              (
                                e
                              ) =>
                                setCancellationNote(
                                  e.target.value
                                )
                            }
                            placeholder="Optional: tell us why you need to cancel."
                          />

                          <div
                            className="meetingActions"
                          >
                            <button
                              className="keepBtn"
                              onClick={() =>
                                setCancelRequestId(
                                  null
                                )
                              }
                            >
                              Keep Appointment
                            </button>

                            <button
                              className="cancelConfirmBtn"
                              disabled={
                                cancelling
                              }
                              onClick={
                                submitCancellation
                              }
                            >
                              {cancelling
                                ? "Cancelling..."
                                : "Submit Cancellation"}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                }
              )}
            </div>
          )}
        </section>

        {requestMessage ? (
          <div
            className="pageMessage"
          >
            {requestMessage}
          </div>
        ) : null}

        {/* =================================================
            ACTION SELECTOR
        ================================================= */}

        <section
          className="choiceBox"
        >
          <p
            className="eyebrow"
          >
            Career Connect
          </p>

          <h2>
            What would you like to do?
          </h2>

          <div
            className="choiceGrid"
          >
            <button
              className={`choice ${
                visitMode ===
                "attend"
                  ? "choiceActive"
                  : ""
              }`}
              onClick={() =>
                setVisitMode(
                  "attend"
                )
              }
            >
              <strong>
                I have a scheduled session
              </strong>

              <span>
                Check in and enter your meeting.
              </span>
            </button>

            <button
              className={`choice ${
                visitMode ===
                "request"
                  ? "choiceActive"
                  : ""
              }`}
              onClick={() =>
                setVisitMode(
                  "request"
                )
              }
            >
              <strong>
                Request Career Support
              </strong>

              <span>
                Request a service and select up to 3 preferred times.
              </span>
            </button>
          </div>
        </section>

        {/* =================================================
            ATTEND
        ================================================= */}

        {visitMode ===
        "attend" ? (
          <section
            className="contentBox"
          >
            <h2>
              What services are included in your meeting?
            </h2>

            <p>
              If your appointment includes more than one service, select
              each service before entering.
            </p>

            <div
              className="serviceGrid"
            >
              {SERVICE_OPTIONS.map(
                (
                  service
                ) => (
                  <button
                    key={
                      service.value
                    }
                    className={`serviceCard ${
                      selectedServices.includes(
                        service.value
                      )
                        ? "serviceSelected"
                        : ""
                    }`}
                    onClick={() =>
                      toggleScheduledService(
                        service.value
                      )
                    }
                  >
                    <strong>
                      {service.label}
                    </strong>

                    <span>
                      {service.description}
                    </span>
                  </button>
                )
              )}
            </div>

            {selectedServices.includes(
              "other"
            ) ? (
              <input
                value={
                  otherService
                }
                onChange={
                  (
                    e
                  ) =>
                    setOtherService(
                      e.target.value
                    )
                }
                placeholder="What additional service are you attending?"
              />
            ) : null}

            {checkInMessage ? (
              <div
                className="messageBox"
              >
                {checkInMessage}
              </div>
            ) : null}

            {checkedIn ? (
              <div
                className="successBox"
              >
                ✓ Check-in recorded.
              </div>
            ) : null}

            <button
              className="primaryBtn"
              disabled={
                checkingIn
              }
              onClick={
                handleCheckInAndEnter
              }
            >
              {checkingIn
                ? "Checking In..."
                : "Check In & Enter Meeting"}
            </button>
          </section>
        ) : null}

        {/* =================================================
            INITIAL REQUEST
        ================================================= */}

        {visitMode ===
        "request" ? (
          <section
            className="contentBox"
          >
            <p
              className="eyebrow"
            >
              Meeting Request
            </p>

            <h2>
              Request Career Support
            </h2>

            <label>
              Service Requested
            </label>

            <select
              value={
                requestService
              }
              onChange={
                (
                  e
                ) =>
                  setRequestService(
                    e.target.value
                  )
              }
            >
              <option
                value=""
              >
                Select service
              </option>

              {REQUEST_OPTIONS.map(
                (
                  item
                ) => (
                  <option
                    key={
                      item.value
                    }
                    value={
                      item.value
                    }
                  >
                    {item.label}
                  </option>
                )
              )}
            </select>

            {requestService ===
            "other" ? (
              <input
                value={
                  requestOtherService
                }
                onChange={
                  (
                    e
                  ) =>
                    setRequestOtherService(
                      e.target.value
                    )
                }
                placeholder="What type of support do you need?"
              />
            ) : null}

            <div
              className="availabilitySection"
            >
              <h3>
                Select up to 3 preferred appointment times
              </h3>

              <p>
                These are preferences only. Your appointment is not
                confirmed until HireMinds approves one.
              </p>

              <div
                className="choiceCounter"
              >
                {selectedSlots.length}/3 selected
              </div>

              <div
                className="slotGrid"
              >
                {availabilitySlots.map(
                  (
                    slot
                  ) => {
                    const selected =
                      selectedSlots.includes(
                        slot.id
                      );

                    const preference =
                      selectedSlots.indexOf(
                        slot.id
                      ) +
                      1;

                    return (
                      <button
                        key={
                          slot.id
                        }
                        className={`slotChoice ${
                          selected
                            ? "slotChoiceActive"
                            : ""
                        }`}
                        onClick={() =>
                          toggleAvailabilitySlot(
                            slot.id
                          )
                        }
                      >
                        {selected ? (
                          <b>
                            Choice {preference}
                            <br />
                          </b>
                        ) : null}

                        {formatSlot(
                          slot
                        )}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            <div
              className="uploadBox"
            >
              <strong>
                Supporting Files
              </strong>

              <p>
                You may upload a resume, cover letter, or other relevant
                document.
              </p>

              <input
                type="file"
                multiple
                onChange={
                  (
                    e
                  ) =>
                    handleFilesSelected(
                      e.target.files
                    )
                }
              />

              {requestFiles.map(
                (
                  file
                ) => (
                  <div
                    key={
                      file.name
                    }
                    className="fileName"
                  >
                    📎 {file.name}
                  </div>
                )
              )}
            </div>

            <label>
              Notes
            </label>

            <textarea
              value={
                requestNotes
              }
              onChange={
                (
                  e
                ) =>
                  setRequestNotes(
                    e.target.value
                  )
              }
              placeholder="Tell us what you would like help with."
            />

            <div
              className="policyBox"
            >
              <h3>
                Scheduling & Cancellation Agreement
              </h3>

              <p>
                I understand that my selected appointment times are
                preferences and my appointment is not confirmed until
                HireMinds approves one.
              </p>

              <p>
                If I need to cancel or reschedule a confirmed appointment,
                I agree to provide at least <b>48 hours (2 days) notice</b>{" "}
                whenever possible.
              </p>

              <p>
                I understand that after <b>two participant-initiated
                cancellations</b>, I may be referred back to the
                organization or provider that referred me to HireMinds.
              </p>

              <label
                className="agreementCheck"
              >
                <input
                  type="checkbox"
                  checked={
                    policyAgreed
                  }
                  onChange={
                    (
                      e
                    ) =>
                      setPolicyAgreed(
                        e.target.checked
                      )
                  }
                />

                I have read and agree to the Scheduling & Cancellation
                Agreement.
              </label>
            </div>

            {requestMessage ? (
              <div
                className="messageBox"
              >
                {requestMessage}
              </div>
            ) : null}

            <button
              className="primaryBtn"
              disabled={
                requestSubmitting ||
                !policyAgreed
              }
              onClick={
                handleMeetingRequest
              }
            >
              {requestSubmitting
                ? "Submitting..."
                : "Submit Meeting Request"}
            </button>
          </section>
        ) : null}
      </section>

      <aside
        className="right"
      >
        <h2>
          Career Connect
        </h2>

        <div
          className="detail"
        >
          <strong>
            Participant
          </strong>

          <span>
            {fullName}
          </span>
        </div>

        <div
          className="detail"
        >
          <strong>
            Referral Code
          </strong>

          <span>
            {referralCode ||
              "Not Assigned"}
          </span>
        </div>

        <div
          className="divider"
        />

        <h3>
          {settings.open_room_title}
        </h3>

        <div
          className="detail"
        >
          <strong>
            Schedule
          </strong>

          <span>
            {settings.open_room_schedule}
          </span>
        </div>

        <div
          className="detail"
        >
          <strong>
            Time
          </strong>

          <span>
            {settings.open_room_time}
          </span>
        </div>

        <div
          className="detail"
        >
          <strong>
            Doors Open
          </strong>

          <span>
            {settings.doors_open}
          </span>
        </div>

        <div
          className="detail"
        >
          <strong>
            Doors Close
          </strong>

          <span>
            {settings.doors_close}
          </span>
        </div>
      </aside>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) 300px;
          gap: 20px;
          padding: 22px;
          background:
            radial-gradient(circle at top right, rgba(0,229,255,.1), transparent 30%),
            linear-gradient(135deg,#050814,#0b1220,#05060d);
          color: white;
          font-family: Inter,system-ui,sans-serif;
        }

        .side,
        .main,
        .right {
          border-radius: 24px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
        }

        .side,
        .right {
          padding: 20px;
        }

        .main {
          padding: 26px;
          min-width: 0;
        }

        .brand,
        .eyebrow,
        .miniLabel {
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .live {
          color: #3cff82;
          font-size: 11px;
          font-weight: 900;
        }

        .side {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .side button {
          padding: 12px;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(255,255,255,.04);
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .side .active {
          color: #10f3ff;
          background: rgba(16,243,255,.08);
        }

        .side .exit {
          margin-top: auto;
          color: #ff9999;
        }

        h1 {
          margin: 0;
          color: #10f3ff;
          font-size: clamp(3rem,5vw,5rem);
        }

        .intro,
        .panelHeader p,
        .contentBox > p {
          color: rgba(255,255,255,.68);
          line-height: 1.6;
        }

        .meetingsPanel,
        .choiceBox,
        .contentBox {
          margin-top: 22px;
          padding: 22px;
          border-radius: 20px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.09);
        }

        .panelHeader,
        .meetingTop,
        .formHeading {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .panelHeader h2,
        .contentBox h2 {
          margin: 4px 0;
        }

        .refreshBtn,
        .closeBtn {
          border: 1px solid rgba(255,255,255,.12);
          background: rgba(255,255,255,.05);
          color: white;
          border-radius: 12px;
          padding: 9px 12px;
          cursor: pointer;
        }

        .meetingList {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .meetingCard {
          padding: 18px;
          border-radius: 17px;
          background: #080d16;
          border: 1px solid rgba(255,255,255,.09);
        }

        .meetingCard h3 {
          margin: 10px 0 0;
        }

        .status {
          display: inline-block;
          padding: 6px 9px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .status-pending {
          color: #fde68a;
          background: rgba(250,204,21,.08);
        }

        .status-approved {
          color: #86efac;
          background: rgba(34,197,94,.08);
        }

        .status-confirmed {
          color: #7dd3fc;
          background: rgba(56,189,248,.08);
        }

        .status-reschedule_requested {
          color: #d8b4fe;
          background: rgba(168,85,247,.08);
        }

        .status-cancelled {
          color: #fca5a5;
          background: rgba(248,113,113,.08);
        }

        .submittedDate {
          color: #8b95a7;
          font-size: 10px;
        }

        .pendingBox,
        .approvalBox,
        .confirmedBox,
        .reschedulePendingBox,
        .cancelledBox,
        .rescheduleForm,
        .cancelForm {
          margin-top: 16px;
          padding: 16px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.03);
        }

        .approvalBox {
          border-color: rgba(34,197,94,.25);
        }

        .confirmedBox {
          border-color: rgba(56,189,248,.25);
        }

        .reschedulePendingBox {
          border-color: rgba(168,85,247,.25);
        }

        .appointmentDate {
          display: block;
          margin: 7px 0;
          font-size: 18px;
        }

        .preferenceList {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .preferenceList div {
          padding: 10px;
          border-radius: 11px;
          background: rgba(255,255,255,.04);
          display: grid;
          gap: 3px;
        }

        .preferenceList span {
          color: #b8c4d6;
          font-size: 11px;
        }

        .meetingActions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 14px;
        }

        .meetingActions button,
        .enterMeetingBtn {
          padding: 10px 13px;
          border-radius: 999px;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          font-size: 11px;
        }

        .confirmBtn,
        .enterMeetingBtn {
          border: none;
          background: linear-gradient(135deg,#10f3ff,#ffd249);
          color: #06111f;
        }

        .rescheduleBtn {
          border: 1px solid rgba(168,85,247,.3);
          background: rgba(168,85,247,.08);
          color: #d8b4fe;
        }

        .cancelBtn,
        .cancelConfirmBtn {
          border: 1px solid rgba(248,113,113,.28);
          background: rgba(248,113,113,.08);
          color: #fca5a5;
        }

        .keepBtn {
          border: 1px solid rgba(255,255,255,.15);
          background: rgba(255,255,255,.05);
          color: white;
        }

        .noteDisplay {
          padding: 12px;
          border-radius: 12px;
          background: rgba(255,255,255,.04);
        }

        .rescheduleOption {
          margin-top: 16px;
        }

        .rescheduleOption p {
          color: #9ca3af;
          font-size: 11px;
        }

        .orDivider {
          margin: 18px 0;
          text-align: center;
          color: #64748b;
          font-weight: 900;
        }

        .slotGrid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 9px;
          margin-top: 12px;
        }

        .slotChoice {
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.2);
          color: white;
          cursor: pointer;
          text-align: left;
          font-size: 10px;
        }

        .slotChoiceActive {
          border-color: #10f3ff;
          background: rgba(16,243,255,.08);
        }

        textarea,
        input,
        select {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.12);
          background: #070b13;
          color: white;
          margin-top: 7px;
        }

        textarea {
          min-height: 100px;
          resize: vertical;
        }

        .submitRescheduleBtn,
        .primaryBtn {
          margin-top: 15px;
          padding: 13px 18px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg,#10f3ff,#ffd249);
          color: #06111f;
          font-weight: 900;
          cursor: pointer;
        }

        .submitRescheduleBtn:disabled,
        .primaryBtn:disabled {
          opacity: .45;
          cursor: not-allowed;
        }

        .pageMessage,
        .messageBox,
        .successBox {
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(16,243,255,.06);
          border: 1px solid rgba(16,243,255,.14);
          color: #c8faff;
          font-size: 11px;
        }

        .choiceGrid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 12px;
          margin-top: 15px;
        }

        .choice {
          padding: 18px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.18);
          color: white;
          text-align: left;
          cursor: pointer;
          display: grid;
          gap: 5px;
        }

        .choiceActive {
          border-color: #10f3ff;
          background: rgba(16,243,255,.07);
        }

        .choice span {
          color: #aab2c0;
          font-size: 11px;
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 10px;
          margin: 15px 0;
        }

        .serviceCard {
          padding: 14px;
          border-radius: 13px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(0,0,0,.16);
          color: white;
          text-align: left;
          cursor: pointer;
          display: grid;
          gap: 5px;
        }

        .serviceSelected {
          border-color: #10f3ff;
          background: rgba(16,243,255,.07);
        }

        .serviceCard span {
          color: #9ca3af;
          font-size: 10px;
        }

        .availabilitySection,
        .uploadBox,
        .policyBox {
          margin-top: 20px;
          padding: 16px;
          border-radius: 15px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.08);
        }

        .choiceCounter {
          margin-top: 10px;
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
        }

        .fileName {
          margin-top: 6px;
          color: #b8c4d6;
          font-size: 10px;
        }

        .policyBox {
          border-color: rgba(255,210,73,.18);
        }

        .agreementCheck {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 14px;
          padding: 12px;
          border-radius: 12px;
          background: rgba(0,0,0,.2);
        }

        .agreementCheck input {
          width: auto;
          margin: 3px 0 0;
        }

        .detail {
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 12px;
          background: rgba(255,255,255,.04);
          display: grid;
          gap: 4px;
        }

        .detail strong {
          color: #aab2c0;
          font-size: 10px;
        }

        .detail span {
          font-size: 11px;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,.08);
          margin: 18px 0;
        }

        .emptyState {
          margin-top: 15px;
          padding: 20px;
          border-radius: 14px;
          border: 1px dashed rgba(255,255,255,.12);
          color: #8b95a7;
          text-align: center;
        }

        @media(max-width:1100px) {
          .page {
            grid-template-columns: 1fr;
          }

          .slotGrid,
          .serviceGrid,
          .choiceGrid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}
