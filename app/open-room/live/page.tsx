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

  cancelled_at?: string | null;

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

  /*
   IMPORTANT:
   availabilitySlots contains ALL active slots, including booked ones.

   We need booked slots available in memory so a participant's
   APPROVED or CONFIRMED appointment can still display its actual
   date and time.

   availableAppointmentSlots below filters this list down to only
   unbooked future slots when someone is choosing a new appointment.
  */

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

      error:
        profileError,
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

    if (
      profileError
    ) {
      console.error(
        "Profile load error:",
        profileError
      );
    }

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

  /* =======================================================
     SETTINGS
  ======================================================= */

  async function loadSettings() {
    const {
      data,
      error,
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
      error
    ) {
      console.error(
        "Career Connect settings error:",
        error
      );

      return;
    }

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

  /* =======================================================
     AVAILABILITY
     LOAD ALL ACTIVE SLOTS SO BOOKED APPOINTMENTS DISPLAY
  ======================================================= */

  async function loadAvailability() {
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
        "Availability load error:",
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

  /* =======================================================
     MY MEETINGS
  ======================================================= */

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
      requestsResult.error
    ) {
      console.error(
        "Meeting request load error:",
        requestsResult.error
      );
    } else {
      setMeetingRequests(
        (
          requestsResult.data as MeetingRequest[]
        ) ||
          []
      );
    }

    if (
      choicesResult.error
    ) {
      console.error(
        "Meeting choice load error:",
        choicesResult.error
      );
    } else {
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
      SERVICE_OPTIONS.find(
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

  function formatAppointmentDate(
    slot:
      AvailabilitySlot
  ) {
    return new Date(
      slot.start_time
    ).toLocaleDateString(
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
    );
  }

  function formatAppointmentStart(
    slot:
      AvailabilitySlot
  ) {
    return new Date(
      slot.start_time
    ).toLocaleTimeString(
      [],
      {
        hour:
          "numeric",

        minute:
          "2-digit",
      }
    );
  }

  function formatAppointmentEnd(
    slot:
      AvailabilitySlot
  ) {
    if (
      !slot.end_time
    ) {
      return "";
    }

    return new Date(
      slot.end_time
    ).toLocaleTimeString(
      [],
      {
        hour:
          "numeric",

        minute:
          "2-digit",
      }
    );
  }

  function getAppointmentDuration(
    slot:
      AvailabilitySlot
  ) {
    if (
      !slot.end_time
    ) {
      return "";
    }

    const start =
      new Date(
        slot.start_time
      );

    const end =
      new Date(
        slot.end_time
      );

    const minutes =
      Math.round(
        (
          end.getTime() -
          start.getTime()
        ) /
          60000
      );

    if (
      minutes <= 0
    ) {
      return "";
    }

    if (
      minutes ===
      60
    ) {
      return "1 Hour Appointment";
    }

    if (
      minutes > 60
    ) {
      const hours =
        Math.floor(
          minutes /
            60
        );

      const remaining =
        minutes %
        60;

      return remaining
        ? `${hours} hr ${remaining} min Appointment`
        : `${hours} Hour Appointment`;
    }

    return `${minutes}-Minute Appointment`;
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
     AVAILABLE APPOINTMENTS
     ONLY FUTURE + UNBOOKED
  ======================================================= */

  const availableAppointmentSlots =
    useMemo(
      () => {
        const now =
          Date.now();

        return availabilitySlots.filter(
          (
            slot
          ) =>
            !slot.booked_request_id &&
            new Date(
              slot.start_time
            ).getTime() >
              now
        );
      },
      [
        availabilitySlots,
      ]
    );

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

    setRequestMessage(
      ""
    );
  }

  function removeRequestFile(
    index:
      number
  ) {
    setRequestFiles(
      (
        previous
      ) =>
        previous.filter(
          (
            _,
            fileIndex
          ) =>
            fileIndex !==
            index
        )
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
        uploadError
      ) {
        console.error(
          "File upload error:",
          uploadError
        );

        continue;
      }

      const {
        error:
          attachmentError,
      } =
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

      if (
        attachmentError
      ) {
        console.error(
          "Attachment record error:",
          attachmentError
        );
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
    setRequestMessage(
      ""
    );

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

    await Promise.all([
      loadMyMeetings(),
      loadAvailability(),
    ]);
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

    setCancelRequestId(
      null
    );
  }

  function closeReschedule() {
    setRescheduleRequestId(
      null
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

    await Promise.all([
      loadMyMeetings(),
      loadAvailability(),
    ]);
  }

  /* =======================================================
     CANCEL
  ======================================================= */

  function openCancellation(
    requestId:
      string
  ) {
    setCancelRequestId(
      requestId
    );

    setCancellationNote(
      ""
    );

    setRescheduleRequestId(
      null
    );

    setRescheduleMessage(
      ""
    );
  }

  function closeCancellation() {
    setCancelRequestId(
      null
    );

    setCancellationNote(
      ""
    );
  }

  async function submitCancellation() {
    if (
      !cancelRequestId
    ) {
      return;
    }

    setCancelling(
      true
    );

    setRequestMessage(
      ""
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
      "✓ Your appointment has been cancelled."
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
    setCheckInMessage(
      ""
    );

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

    if (
      selectedServices.includes(
        "other"
      ) &&
      !otherService.trim()
    ) {
      setCheckInMessage(
        "Please tell us what additional service you are attending."
      );

      return;
    }

    setCheckingIn(
      true
    );

    setCheckInMessage(
      ""
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

    const {
      error:
        serviceError,
    } =
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

    if (
      serviceError
    ) {
      console.error(
        "Service tracking error:",
        serviceError
      );
    }

    const {
      error:
        attendanceError,
    } =
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

    if (
      attendanceError
    ) {
      console.error(
        "Attendance tracking error:",
        attendanceError
      );
    }

    for (
      const service of
      selectedServices
    ) {
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
            "workforce_service_check_in",

          tool_name:
            getServiceLabel(
              service
            ),

          page_name:
            "career-connect",
        });
    }

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

  /*
   Keep cancelled meetings visible so the participant can see
   the result of the cancellation they just submitted.

   Completed and declined records are removed from this active area.
  */

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

  /* =======================================================
     LOADING
  ======================================================= */

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

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <main
      className="page"
    >
      {/* ===================================================
          LEFT SIDEBAR
      =================================================== */}

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

      {/* ===================================================
          MAIN
      =================================================== */}

      <section
        className="main"
      >
        <div
          className="heroAlert"
        >
          <div
            className="heroArrow"
          >
            ➜
          </div>

          <div>
            <span>
              CAREER CONNECT
            </span>

            <strong>
              Your career support hub
            </strong>

            <p>
              Manage appointments, request support, check in, and connect live.
            </p>
          </div>
        </div>

        <p
          className="eyebrow"
        >
          HireMinds™ Live Career Services
        </p>

        <h1>
          CAREER CONNECT
        </h1>

        <p
          className="tagline"
        >
          Connect. Prepare. Keep moving.
        </p>

        <p
          className="intro"
        >
          Attend scheduled career-support sessions, request services,
          and manage your HireMinds appointments.
        </p>

        <div
          className="participantBar"
        >
          <div>
            <span>
              PARTICIPANT
            </span>

            <strong>
              {fullName}
            </strong>
          </div>

          <div>
            <span>
              PROGRAM / CODE
            </span>

            <strong>
              {referralCode ||
                "Not Assigned"}
            </strong>
          </div>
        </div>

        {/* =================================================
            MY MEETINGS & REQUESTS
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
                Track your requests, approvals, confirmations,
                cancellations, and reschedule requests here.
              </p>
            </div>

            <button
              className="refreshBtn"
              type="button"
              onClick={async () => {
                await Promise.all([
                  loadMyMeetings(),
                  loadAvailability(),
                ]);
              }}
            >
              ↻ Refresh
            </button>
          </div>

          {activeMeetingRequests.length ===
          0 ? (
            <div
              className="emptyState"
            >
              <div
                className="emptyIcon"
              >
                ◷
              </div>

              <strong>
                No active meeting requests
              </strong>

              <p>
                When you request career support, your request and appointment
                updates will appear here.
              </p>
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

                      {/* =====================================
                          PENDING
                      ===================================== */}

                      {request.status ===
                      "pending" ? (
                        <div
                          className="pendingBox"
                        >
                          <div
                            className="pendingTitleRow"
                          >
                            <div
                              className="pendingIcon"
                            >
                              ◷
                            </div>

                            <div>
                              <strong>
                                Your request is waiting for review.
                              </strong>

                              <p>
                                HireMinds will review your preferred times
                                and approve one.
                              </p>
                            </div>
                          </div>

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
                                    className="preferenceItem"
                                  >
                                    <span
                                      className="preferenceNumber"
                                    >
                                      {choice.preference_order}
                                    </span>

                                    <div>
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
                                  </div>
                                );
                              }
                            )}
                          </div>

                          {request.notes ? (
                            <div
                              className="requestNoteDisplay"
                            >
                              <strong>
                                Your note
                              </strong>

                              <p>
                                {request.notes}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* =====================================
                          APPROVED
                      ===================================== */}

                      {request.status ===
                      "approved" ? (
                        <div
                          className="approvalBox appointmentFeatureBox"
                        >
                          <div
                            className="appointmentStatusRow"
                          >
                            <div
                              className="appointmentStatusIcon"
                            >
                              ✓
                            </div>

                            <div>
                              <p
                                className="miniLabel"
                              >
                                APPOINTMENT APPROVED
                              </p>

                              <h3
                                className="appointmentHeading"
                              >
                                Your appointment is ready to confirm
                              </h3>
                            </div>
                          </div>

                          {confirmedSlot ? (
                            <div
                              className="appointmentDetailsCard"
                            >
                              <p
                                className="appointmentService"
                              >
                                {requestServiceLabel(
                                  request
                                )}
                              </p>

                              <strong
                                className="appointmentDateLarge"
                              >
                                {formatAppointmentDate(
                                  confirmedSlot
                                )}
                              </strong>

                              <div
                                className="appointmentTimeLarge"
                              >
                                {formatAppointmentStart(
                                  confirmedSlot
                                )}

                                <span>
                                  →
                                </span>

                                {formatAppointmentEnd(
                                  confirmedSlot
                                )}
                              </div>

                              {getAppointmentDuration(
                                confirmedSlot
                              ) ? (
                                <div
                                  className="appointmentDuration"
                                >
                                  ⏱{" "}
                                  {getAppointmentDuration(
                                    confirmedSlot
                                  )}
                                </div>
                              ) : null}

                              {confirmedSlot.label ? (
                                <div
                                  className="appointmentSlotLabel"
                                >
                                  {confirmedSlot.label}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className="appointmentLookupWarning"
                            >
                              Your appointment was approved. Use Refresh
                              if the date and time do not appear.
                            </div>
                          )}

                          <p
                            className="appointmentInstruction"
                          >
                            HireMinds approved this appointment. Please
                            confirm that you will attend.
                          </p>

                          <div
                            className="meetingActions"
                          >
                            <button
                              type="button"
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
                              type="button"
                              className="rescheduleBtn"
                              onClick={() =>
                                openReschedule(
                                  request.id
                                )
                              }
                            >
                              ↻ Request Reschedule
                            </button>

                            <button
                              type="button"
                              className="cancelBtn"
                              onClick={() =>
                                openCancellation(
                                  request.id
                                )
                              }
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* =====================================
                          CONFIRMED
                      ===================================== */}

                      {request.status ===
                      "confirmed" ? (
                        <div
                          className="confirmedBox appointmentFeatureBox"
                        >
                          <div
                            className="appointmentStatusRow"
                          >
                            <div
                              className="appointmentStatusIcon confirmedIcon"
                            >
                              ✓
                            </div>

                            <div>
                              <p
                                className="miniLabel"
                              >
                                CONFIRMED
                              </p>

                              <h3
                                className="appointmentHeading"
                              >
                                You&apos;re all set
                              </h3>
                            </div>
                          </div>

                          {confirmedSlot ? (
                            <div
                              className="appointmentDetailsCard confirmedAppointmentDetails"
                            >
                              <p
                                className="appointmentService"
                              >
                                {requestServiceLabel(
                                  request
                                )}
                              </p>

                              <strong
                                className="appointmentDateLarge"
                              >
                                {formatAppointmentDate(
                                  confirmedSlot
                                )}
                              </strong>

                              <div
                                className="appointmentTimeLarge"
                              >
                                {formatAppointmentStart(
                                  confirmedSlot
                                )}

                                <span>
                                  →
                                </span>

                                {formatAppointmentEnd(
                                  confirmedSlot
                                )}
                              </div>

                              {getAppointmentDuration(
                                confirmedSlot
                              ) ? (
                                <div
                                  className="appointmentDuration"
                                >
                                  ⏱{" "}
                                  {getAppointmentDuration(
                                    confirmedSlot
                                  )}
                                </div>
                              ) : null}

                              {confirmedSlot.label ? (
                                <div
                                  className="appointmentSlotLabel"
                                >
                                  {confirmedSlot.label}
                                </div>
                              ) : null}
                            </div>
                          ) : (
                            <div
                              className="appointmentLookupWarning"
                            >
                              Your appointment is confirmed. Use Refresh
                              if the appointment details do not appear.
                            </div>
                          )}

                          <p
                            className="appointmentInstruction"
                          >
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
                              🚪 Enter Meeting
                            </a>

                            <button
                              type="button"
                              className="rescheduleBtn"
                              onClick={() =>
                                openReschedule(
                                  request.id
                                )
                              }
                            >
                              ↻ Request Reschedule
                            </button>

                            <button
                              type="button"
                              className="cancelBtn"
                              onClick={() =>
                                openCancellation(
                                  request.id
                                )
                              }
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* =====================================
                          RESCHEDULE REQUESTED
                      ===================================== */}

                      {request.status ===
                      "reschedule_requested" ? (
                        <div
                          className="reschedulePendingBox"
                        >
                          <div
                            className="rescheduleStatusRow"
                          >
                            <div
                              className="rescheduleStatusIcon"
                            >
                              ↻
                            </div>

                            <div>
                              <p
                                className="miniLabel purpleLabel"
                              >
                                RESCHEDULE REQUESTED
                              </p>

                              <h3>
                                Your request is being reviewed
                              </h3>
                            </div>
                          </div>

                          <div
                            className="rescheduleCurrentCard"
                          >
                            <span>
                              CURRENT APPOINTMENT
                            </span>

                            <strong>
                              {confirmedSlot
                                ? formatSlot(
                                    confirmedSlot
                                  )
                                : "Current appointment"}
                            </strong>

                            <p>
                              This appointment remains reserved until
                              HireMinds approves a replacement.
                            </p>
                          </div>

                          {requestedRescheduleSlot ? (
                            <div
                              className="requestedNewTimeCard"
                            >
                              <span>
                                REQUESTED NEW TIME
                              </span>

                              <strong>
                                {formatSlot(
                                  requestedRescheduleSlot
                                )}
                              </strong>
                            </div>
                          ) : null}

                          {request.reschedule_note ? (
                            <div
                              className="noteDisplay"
                            >
                              <strong>
                                Your requested date/time note
                              </strong>

                              <p>
                                {request.reschedule_note}
                              </p>
                            </div>
                          ) : null}

                          <p
                            className="rescheduleWaitText"
                          >
                            HireMinds will review your request. You will
                            see the newly approved appointment here once
                            the change is made.
                          </p>

                          <div
                            className="meetingActions"
                          >
                            <button
                              type="button"
                              className="cancelBtn"
                              onClick={() =>
                                openCancellation(
                                  request.id
                                )
                              }
                            >
                              Cancel Appointment
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* =====================================
                          CANCELLED
                      ===================================== */}

                      {request.status ===
                      "cancelled" ? (
                        <div
                          className="cancelledBox"
                        >
                          <div
                            className="cancelledStatusRow"
                          >
                            <div
                              className="cancelledIcon"
                            >
                              ×
                            </div>

                            <div>
                              <p
                                className="miniLabel redLabel"
                              >
                                CANCELLED
                              </p>

                              <h3>
                                Appointment Cancelled
                              </h3>
                            </div>
                          </div>

                          <p>
                            This appointment has been cancelled and the
                            appointment time has been released.
                          </p>

                          {request.cancellation_note ? (
                            <div
                              className="noteDisplay"
                            >
                              <strong>
                                Cancellation note
                              </strong>

                              <p>
                                {request.cancellation_note}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      ) : null}

                      {/* =====================================
                          RESCHEDULE FORM
                      ===================================== */}

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
                              type="button"
                              className="closeBtn"
                              onClick={
                                closeReschedule
                              }
                              aria-label="Close reschedule form"
                            >
                              ×
                            </button>
                          </div>

                          <div
                            className="rescheduleOption"
                          >
                            <div
                              className="optionNumber"
                            >
                              1
                            </div>

                            <div
                              className="optionContent"
                            >
                              <strong>
                                Choose ONE new available time
                              </strong>

                              <p>
                                Select one appointment time below.
                                Selecting a different time replaces your
                                previous selection.
                              </p>
                            </div>
                          </div>

                          {availableAppointmentSlots.length >
                          0 ? (
                            <div
                              className="slotGrid"
                            >
                              {availableAppointmentSlots
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
                                      <span
                                        className="slotRadio"
                                      >
                                        {rescheduleSlotId ===
                                        slot.id
                                          ? "✓"
                                          : ""}
                                      </span>

                                      <div>
                                        <strong>
                                          {formatAppointmentDate(
                                            slot
                                          )}
                                        </strong>

                                        <span>
                                          {formatAppointmentStart(
                                            slot
                                          )}{" "}
                                          –{" "}
                                          {formatAppointmentEnd(
                                            slot
                                          )}
                                        </span>

                                        {getAppointmentDuration(
                                          slot
                                        ) ? (
                                          <small>
                                            {getAppointmentDuration(
                                              slot
                                            )}
                                          </small>
                                        ) : null}
                                      </div>
                                    </button>
                                  )
                                )}
                            </div>
                          ) : (
                            <div
                              className="noAvailability"
                            >
                              There are currently no additional appointment
                              times listed. Use the note option below to
                              request a specific date or time.
                            </div>
                          )}

                          <div
                            className="orDivider"
                          >
                            <span />
                            OR
                            <span />
                          </div>

                          <div
                            className="rescheduleOption"
                          >
                            <div
                              className="optionNumber"
                            >
                              2
                            </div>

                            <div
                              className="optionContent"
                            >
                              <strong>
                                Request another date or time
                              </strong>

                              <p>
                                If none of the available times work, tell
                                us what specific date or time would work
                                better for you.
                              </p>
                            </div>
                          </div>

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

                          <div
                            className="rescheduleReminder"
                          >
                            <strong>
                              Your current appointment stays reserved.
                            </strong>

                            <p>
                              It will not be released until HireMinds
                              approves your replacement appointment.
                            </p>
                          </div>

                          {rescheduleMessage ? (
                            <div
                              className={
                                rescheduleMessage.startsWith(
                                  "✓"
                                )
                                  ? "successBox"
                                  : "messageBox"
                              }
                            >
                              {rescheduleMessage}
                            </div>
                          ) : null}

                          <div
                            className="formActionRow"
                          >
                            <button
                              type="button"
                              className="secondaryFormBtn"
                              onClick={
                                closeReschedule
                              }
                            >
                              Keep Current Appointment
                            </button>

                            <button
                              type="button"
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
                                : "Submit Reschedule Request →"}
                            </button>
                          </div>
                        </div>
                      ) : null}

                      {/* =====================================
                          CANCEL FORM
                      ===================================== */}

                      {cancelRequestId ===
                      request.id ? (
                        <div
                          className="cancelForm"
                        >
                          <div
                            className="formHeading"
                          >
                            <div>
                              <p
                                className="miniLabel redLabel"
                              >
                                CANCELLATION
                              </p>

                              <h3>
                                Cancel Appointment?
                              </h3>
                            </div>

                            <button
                              type="button"
                              className="closeBtn"
                              onClick={
                                closeCancellation
                              }
                              aria-label="Close cancellation form"
                            >
                              ×
                            </button>
                          </div>

                          {confirmedSlot ? (
                            <div
                              className="cancelAppointmentSummary"
                            >
                              <strong>
                                {requestServiceLabel(
                                  request
                                )}
                              </strong>

                              <span>
                                {formatSlot(
                                  confirmedSlot
                                )}
                              </span>
                            </div>
                          ) : null}

                          <div
                            className="cancelPolicyWarning"
                          >
                            <strong>
                              Cancellation Notice
                            </strong>

                            <p>
                              If possible, cancellations should be submitted
                              at least <b>48 hours (2 days)</b> before your
                              appointment.
                            </p>

                            <p>
                              After <b>two participant-initiated cancellations</b>,
                              you may be referred back to the organization
                              or provider that referred you to HireMinds™.
                            </p>
                          </div>

                          <label
                            className="fieldLabel"
                          >
                            Cancellation Note
                          </label>

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
                            className="formActionRow"
                          >
                            <button
                              type="button"
                              className="keepBtn"
                              onClick={
                                closeCancellation
                              }
                            >
                              Keep Appointment
                            </button>

                            <button
                              type="button"
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
            className={
              requestMessage.startsWith(
                "✓"
              )
                ? "pageMessage successPageMessage"
                : "pageMessage"
            }
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
          <div
            className="choiceHeader"
          >
            <p
              className="eyebrow"
            >
              Career Connect
            </p>

            <h2>
              What would you like to do today?
            </h2>

            <p>
              Choose the option that matches what you need.
            </p>
          </div>

          <div
            className="choiceGrid"
          >
            <button
              type="button"
              className={`mainChoice ${
                visitMode ===
                "attend"
                  ? "mainChoiceActive"
                  : ""
              }`}
              onClick={() =>
                setVisitMode(
                  "attend"
                )
              }
            >
              <div
                className="choiceIcon"
              >
                ✓
              </div>

              <div
                className="mainChoiceContent"
              >
                <strong>
                  I have a scheduled session / I&apos;m attending today
                </strong>

                <p>
                  Check in for Resume Support, Career Coaching,
                  a Mock Interview, Workforce Development Training,
                  Job Search Assistance, Open Room, or another
                  scheduled session.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`mainChoice ${
                visitMode ===
                "request"
                  ? "mainChoiceActive"
                  : ""
              }`}
              onClick={() =>
                setVisitMode(
                  "request"
                )
              }
            >
              <div
                className="choiceIcon plusIcon"
              >
                +
              </div>

              <div
                className="mainChoiceContent"
              >
                <strong>
                  I need to request a meeting
                </strong>

                <p>
                  Request Resume Support, Career Coaching, a Mock
                  Interview, Job Search Assistance, Cover Letter
                  Review, or another career-support service.
                </p>
              </div>
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
            <div
              className="contentHeader"
            >
              <div>
                <p
                  className="eyebrow"
                >
                  Scheduled Session
                </p>

                <h2>
                  What services are included in your meeting?
                </h2>

                <p>
                  Select every service included in today&apos;s meeting.
                </p>

                <div
                  className="multiServiceNotice"
                >
                  <strong>
                    More than one service?
                  </strong>

                  <span>
                    If your meeting includes Resume Support and a Mock
                    Interview, for example, select both before checking in.
                  </span>
                </div>
              </div>

              <span
                className="checkInBadge"
              >
                CHECK IN
              </span>
            </div>

            <div
              className="serviceGrid"
            >
              {SERVICE_OPTIONS.map(
                (
                  service
                ) => {
                  const selected =
                    selectedServices.includes(
                      service.value
                    );

                  return (
                    <button
                      key={
                        service.value
                      }
                      type="button"
                      className={`serviceCard ${
                        selected
                          ? "serviceSelected"
                          : ""
                      }`}
                      onClick={() =>
                        toggleScheduledService(
                          service.value
                        )
                      }
                    >
                      <div
                        className="serviceCheck"
                      >
                        {selected
                          ? "✓"
                          : ""}
                      </div>

                      <div>
                        <strong>
                          {service.label}
                        </strong>

                        <span>
                          {service.description}
                        </span>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {selectedServices.includes(
              "other"
            ) ? (
              <div
                className="formField"
              >
                <label>
                  What additional service are you attending?
                </label>

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
                  placeholder="Example: Career planning meeting"
                />
              </div>
            ) : null}

            {selectedServices.length >
            0 ? (
              <div
                className="selectedServicesBox"
              >
                <span>
                  SERVICES SELECTED
                </span>

                <strong>
                  {selectedServices
                    .map(
                      (
                        service
                      ) =>
                        getServiceLabel(
                          service
                        )
                    )
                    .join(
                      " • "
                    )}
                </strong>
              </div>
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
                ✓ Your check-in was recorded and the meeting room
                opened in a new tab.
              </div>
            ) : null}

            <div
              className="bottomAction"
            >
              <div>
                <strong>
                  Ready to join?
                </strong>

                <p>
                  Your attendance and each selected career service
                  will be recorded.
                </p>
              </div>

              <button
                type="button"
                className="primaryBtn"
                disabled={
                  checkingIn ||
                  selectedServices.length ===
                    0
                }
                onClick={
                  handleCheckInAndEnter
                }
              >
                {checkingIn
                  ? "Checking In..."
                  : "Check In & Enter Meeting →"}
              </button>
            </div>
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
            <div
              className="contentHeader"
            >
              <div>
                <p
                  className="eyebrow"
                >
                  Meeting Request
                </p>

                <h2>
                  Request Career Support
                </h2>

                <p>
                  Select the service you need, choose up to 3 preferred
                  appointment times, and attach any documents you want
                  reviewed.
                </p>
              </div>

              <span
                className="requestBadge"
              >
                REQUEST
              </span>
            </div>

            <div
              className="formField"
            >
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
            </div>

            {requestService ===
            "other" ? (
              <div
                className="formField"
              >
                <label>
                  What type of support do you need?
                </label>

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
                  placeholder="Example: Career planning"
                />
              </div>
            ) : null}

            {/* ===============================================
                INITIAL AVAILABILITY
            =============================================== */}

            <div
              className="availabilitySection"
            >
              <div
                className="availabilityHeader"
              >
                <div>
                  <p
                    className="eyebrow"
                  >
                    Appointment Preferences
                  </p>

                  <h3>
                    Select up to 3 preferred appointment times
                  </h3>

                  <p>
                    These are preferences only. Your appointment is
                    not confirmed until HireMinds approves one.
                  </p>
                </div>

                <div
                  className="choiceCounter"
                >
                  {selectedSlots.length}/3 selected
                </div>
              </div>

              {availableAppointmentSlots.length ===
              0 ? (
                <div
                  className="noAvailability"
                >
                  There are currently no appointment times available.
                  Please check back later.
                </div>
              ) : (
                <div
                  className="slotGrid"
                >
                  {availableAppointmentSlots.map(
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
                          type="button"
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
                          <span
                            className="slotRadio"
                          >
                            {selected
                              ? preference
                              : ""}
                          </span>

                          <div>
                            {selected ? (
                              <span
                                className="choicePreference"
                              >
                                CHOICE {preference}
                              </span>
                            ) : null}

                            <strong>
                              {formatAppointmentDate(
                                slot
                              )}
                            </strong>

                            <span>
                              {formatAppointmentStart(
                                slot
                              )}{" "}
                              –{" "}
                              {formatAppointmentEnd(
                                slot
                              )}
                            </span>

                            {getAppointmentDuration(
                              slot
                            ) ? (
                              <small>
                                {getAppointmentDuration(
                                  slot
                                )}
                              </small>
                            ) : null}

                            {slot.label ? (
                              <small>
                                {slot.label}
                              </small>
                            ) : null}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* ===============================================
                FILE UPLOAD
            =============================================== */}

            <div
              className="uploadBox"
            >
              <div>
                <p
                  className="eyebrow"
                >
                  Supporting Files
                </p>

                <h3>
                  Attach files for review
                </h3>

                <p>
                  Upload your resume for Resume Support, a cover letter
                  for Cover Letter Review, or another document that may
                  help with your requested service.
                </p>

                <span
                  className="uploadTrackingNote"
                >
                  Document submissions are recorded as part of your
                  HireMinds career-support activity.
                </span>
              </div>

              <label
                className="uploadButton"
              >
                📎 Choose Files

                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={
                    (
                      e
                    ) =>
                      handleFilesSelected(
                        e.target.files
                      )
                  }
                />
              </label>

              {requestFiles.length >
              0 ? (
                <div
                  className="fileList"
                >
                  {requestFiles.map(
                    (
                      file,
                      index
                    ) => (
                      <div
                        key={`${file.name}-${index}`}
                        className="fileItem"
                      >
                        <span>
                          📄 {file.name}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            removeRequestFile(
                              index
                            )
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              ) : null}
            </div>

            {/* ===============================================
                NOTES
            =============================================== */}

            <div
              className="formField"
            >
              <label>
                Anything we should know?
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
                placeholder="Optional notes about what you would like help with."
              />
            </div>

            {/* ===============================================
                POLICY
            =============================================== */}

            <div
              className="policyBox"
            >
              <div
                className="policyHeader"
              >
                <div
                  className="policyIcon"
                >
                  ✓
                </div>

                <div>
                  <p
                    className="policyEyebrow"
                  >
                    REQUIRED
                  </p>

                  <h3>
                    Scheduling & Cancellation Agreement
                  </h3>
                </div>
              </div>

              <p>
                I understand that my selected appointment times are
                preferences and my appointment is not confirmed until
                HireMinds™ approves one.
              </p>

              <p>
                If I need to cancel or reschedule a confirmed appointment,
                I agree to provide at least{" "}
                <b>
                  48 hours (2 days) notice
                </b>{" "}
                whenever possible.
              </p>

              <p>
                I understand that after{" "}
                <b>
                  two participant-initiated cancellations
                </b>
                , I may be referred back to the organization or provider
                that referred me to HireMinds™.
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

                <span>
                  I have read, understand, and agree to the Scheduling
                  & Cancellation Agreement.
                </span>
              </label>
            </div>

            {requestMessage ? (
              <div
                className={
                  requestMessage.startsWith(
                    "✓"
                  )
                    ? "successBox"
                    : "messageBox"
                }
              >
                {requestMessage}
              </div>
            ) : null}

            <div
              className="bottomAction"
            >
              <div>
                <strong>
                  Request status
                </strong>

                <p>
                  Your appointment remains pending until HireMinds
                  approves one of your preferred times.
                </p>
              </div>

              <button
                type="button"
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
                  : "Submit Meeting Request →"}
              </button>
            </div>
          </section>
        ) : null}
      </section>

      {/* ===================================================
          RIGHT SIDEBAR
      =================================================== */}

      <aside
        className="right"
      >
        <p
          className="rightEyebrow"
        >
          CAREER CONNECT
        </p>

        <h2>
          Today
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

        {selectedServices.length >
        0 ? (
          <div
            className="detail detailHighlight"
          >
            <strong>
              Services Selected
            </strong>

            <span>
              {selectedServices
                .map(
                  (
                    service
                  ) =>
                    getServiceLabel(
                      service
                    )
                )
                .join(
                  ", "
                )}
            </span>
          </div>
        ) : null}

        <div
          className="divider"
        />

        <h3
          className="openRoomTitle"
        >
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

        <div
          className="rightInfoBox"
        >
          <p>
            {settings.open_room_note}
          </p>
        </div>
      </aside>

      {/* ===================================================
          STYLES
      =================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;

          display: grid;

          grid-template-columns:
            220px
            minmax(0,1fr)
            300px;

          gap: 20px;

          padding: 22px;

          background:
            radial-gradient(
              circle at top right,
              rgba(0,229,255,.12),
              transparent 30%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(255,210,73,.035),
              transparent 30%
            ),
            linear-gradient(
              135deg,
              #050814,
              #0b1220,
              #05060d
            );

          color: white;

          font-family:
            Inter,
            system-ui,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .side,
        .main,
        .right {
          border-radius: 24px;

          background:
            rgba(255,255,255,.04);

          border:
            1px solid rgba(255,255,255,.09);
        }

        /* =================================================
           LEFT
        ================================================= */

        .side {
          padding: 20px;

          display: flex;
          flex-direction: column;

          gap: 10px;
        }

        .brand {
          margin: 0;

          color: #10f3ff;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: .14em;
        }

        .side h2 {
          margin: 2px 0 0;

          font-size: 20px;
        }

        .live {
          margin: 5px 0 16px;

          color: #3cff82;

          font-size: 11px;
          font-weight: 900;
        }

        .side button {
          width: 100%;

          padding: 12px 13px;

          border-radius: 13px;

          border:
            1px solid rgba(255,255,255,.09);

          background:
            rgba(255,255,255,.04);

          color: white;

          text-align: left;

          font-weight: 750;

          cursor: pointer;
        }

        .side button:hover {
          border-color:
            rgba(16,243,255,.25);
        }

        .side .active {
          color: #10f3ff;

          background:
            rgba(16,243,255,.08);

          border-color:
            rgba(16,243,255,.2);
        }

        .side .exit {
          margin-top: auto;

          color: #ff8c8c;

          border-color:
            rgba(255,140,140,.18);
        }

        /* =================================================
           MAIN
        ================================================= */

        .main {
          padding: 26px;

          min-width: 0;
        }

        .heroAlert {
          display: flex;
          align-items: center;

          gap: 14px;

          padding: 16px 18px;

          margin-bottom: 24px;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.11),
              rgba(255,210,73,.045)
            );

          border:
            1px solid rgba(16,243,255,.22);
        }

        .heroArrow {
          color: #ffd249;

          font-size: 33px;

          font-weight: 900;
        }

        .heroAlert > div:last-child {
          display: grid;

          gap: 3px;
        }

        .heroAlert span {
          color: #10f3ff;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: .13em;
        }

        .heroAlert strong {
          font-size: 14px;
        }

        .heroAlert p {
          margin: 0;

          color:
            rgba(255,255,255,.6);

          font-size: 10px;
        }

        .eyebrow {
          margin: 0 0 7px;

          color: #10f3ff;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: .13em;

          text-transform: uppercase;
        }

        h1 {
          margin: 0;

          color: #10f3ff;

          font-size:
            clamp(
              2.8rem,
              5vw,
              5rem
            );

          line-height: .95;

          letter-spacing: -.04em;
        }

        .tagline {
          margin: 13px 0 0;

          color: #ffd249;

          font-weight: 850;
        }

        .intro {
          max-width: 800px;

          color:
            rgba(255,255,255,.72);

          line-height: 1.65;

          font-size: 14px;
        }

        .participantBar {
          display: flex;
          flex-wrap: wrap;

          gap: 10px;

          margin: 22px 0;
        }

        .participantBar div {
          min-width: 175px;

          padding: 11px 13px;

          border-radius: 12px;

          background:
            rgba(255,255,255,.04);

          border:
            1px solid rgba(255,255,255,.08);

          display: grid;

          gap: 3px;
        }

        .participantBar span {
          color:
            rgba(255,255,255,.48);

          font-size: 8px;
          font-weight: 900;

          letter-spacing: .12em;
        }

        .participantBar strong {
          font-size: 12px;
        }

        /* =================================================
           GENERAL BOXES
        ================================================= */

        .meetingsPanel,
        .choiceBox,
        .contentBox {
          margin-top: 22px;

          padding: 24px;

          border-radius: 22px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.09);
        }

        .panelHeader,
        .contentHeader {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 18px;
        }

        .panelHeader h2,
        .choiceHeader h2,
        .contentHeader h2 {
          margin: 3px 0 7px;

          font-size: 25px;
        }

        .panelHeader p:not(.eyebrow),
        .choiceHeader p:not(.eyebrow),
        .contentHeader p:not(.eyebrow) {
          margin: 0;

          color:
            rgba(255,255,255,.62);

          line-height: 1.55;

          font-size: 11px;
        }

        .refreshBtn {
          padding: 9px 13px;

          border-radius: 999px;

          border:
            1px solid rgba(16,243,255,.2);

          background:
            rgba(16,243,255,.06);

          color: #bdfaff;

          cursor: pointer;

          font-size: 10px;
          font-weight: 850;

          white-space: nowrap;
        }

        /* =================================================
           EMPTY MEETING STATE
        ================================================= */

        .emptyState {
          margin-top: 18px;

          padding: 30px 20px;

          display: flex;
          flex-direction: column;
          align-items: center;

          gap: 7px;

          border-radius: 16px;

          border:
            1px dashed rgba(255,255,255,.12);

          background:
            rgba(0,0,0,.12);

          color: #8b95a7;

          text-align: center;
        }

        .emptyIcon {
          width: 44px;
          height: 44px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(16,243,255,.06);

          border:
            1px solid rgba(16,243,255,.14);

          color: #10f3ff;

          font-size: 22px;

          margin-bottom: 4px;
        }

        .emptyState strong {
          color: white;

          font-size: 13px;
        }

        .emptyState p {
          margin: 0;

          max-width: 500px;

          font-size: 10px;

          line-height: 1.55;
        }

        /* =================================================
           MEETING LIST
        ================================================= */

        .meetingList {
          display: grid;

          gap: 16px;

          margin-top: 19px;
        }

        .meetingCard {
          padding: 20px;

          border-radius: 19px;

          background:
            linear-gradient(
              135deg,
              #080d16,
              #080b12
            );

          border:
            1px solid rgba(255,255,255,.09);
        }

        .meetingTop {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 14px;

          flex-wrap: wrap;
        }

        .meetingTop h3 {
          margin: 10px 0 0;

          font-size: 20px;
        }

        .submittedDate {
          color: #8b95a7;

          font-size: 9px;
        }

        .status {
          display: inline-block;

          padding: 6px 9px;

          border-radius: 999px;

          border:
            1px solid transparent;

          font-size: 8px;
          font-weight: 900;

          text-transform: uppercase;

          letter-spacing: .06em;
        }

        .status-pending {
          color: #fde68a;

          background:
            rgba(250,204,21,.08);

          border-color:
            rgba(250,204,21,.16);
        }

        .status-approved {
          color: #86efac;

          background:
            rgba(34,197,94,.08);

          border-color:
            rgba(34,197,94,.17);
        }

        .status-confirmed {
          color: #7dd3fc;

          background:
            rgba(56,189,248,.08);

          border-color:
            rgba(56,189,248,.18);
        }

        .status-reschedule_requested {
          color: #d8b4fe;

          background:
            rgba(168,85,247,.08);

          border-color:
            rgba(168,85,247,.18);
        }

        .status-cancelled {
          color: #fca5a5;

          background:
            rgba(248,113,113,.08);

          border-color:
            rgba(248,113,113,.18);
        }

        /* =================================================
           PENDING
        ================================================= */

        .pendingBox {
          margin-top: 16px;

          padding: 18px;

          border-radius: 16px;

          background:
            rgba(250,204,21,.03);

          border:
            1px solid rgba(250,204,21,.12);
        }

        .pendingTitleRow {
          display: flex;

          align-items: flex-start;

          gap: 12px;
        }

        .pendingIcon {
          width: 34px;
          height: 34px;

          min-width: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(250,204,21,.08);

          border:
            1px solid rgba(250,204,21,.17);

          color: #fde68a;
        }

        .pendingTitleRow strong {
          font-size: 13px;
        }

        .pendingTitleRow p {
          margin: 5px 0 0;

          color:
            rgba(255,255,255,.58);

          font-size: 10px;
        }

        .preferenceList {
          display: grid;

          gap: 8px;

          margin-top: 15px;
        }

        .preferenceItem {
          padding: 11px;

          display: flex;

          align-items: center;

          gap: 11px;

          border-radius: 11px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.06);
        }

        .preferenceNumber {
          width: 26px;
          height: 26px;

          min-width: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(16,243,255,.07);

          border:
            1px solid rgba(16,243,255,.15);

          color: #10f3ff;

          font-size: 10px;
          font-weight: 900;
        }

        .preferenceItem div {
          display: grid;

          gap: 2px;
        }

        .preferenceItem strong {
          font-size: 10px;

          color: #d8e4f3;
        }

        .preferenceItem span:not(.preferenceNumber) {
          color: #9ba9ba;

          font-size: 10px;
        }

        .requestNoteDisplay {
          margin-top: 12px;

          padding: 12px;

          border-radius: 11px;

          background:
            rgba(255,255,255,.03);

          border:
            1px solid rgba(255,255,255,.06);
        }

        .requestNoteDisplay strong {
          font-size: 10px;

          color: #ffd249;
        }

        .requestNoteDisplay p {
          margin: 5px 0 0;

          color: #aeb8c7;

          font-size: 10px;

          line-height: 1.5;
        }

        /* =================================================
           LARGE APPOINTMENT CARD
        ================================================= */

        .appointmentFeatureBox {
          margin-top: 17px;

          padding: 25px;

          border-radius: 21px;
        }

        .approvalBox {
          background:
            linear-gradient(
              135deg,
              rgba(34,197,94,.055),
              rgba(16,243,255,.025)
            );

          border:
            1px solid rgba(34,197,94,.22);
        }

        .confirmedBox {
          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.055),
              rgba(56,189,248,.025)
            );

          border:
            1px solid rgba(56,189,248,.22);
        }

        .appointmentStatusRow {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .appointmentStatusIcon {
          width: 52px;
          height: 52px;

          min-width: 52px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color: #06111f;

          font-size: 26px;
          font-weight: 950;

          box-shadow:
            0 0 26px rgba(16,243,255,.14);
        }

        .confirmedIcon {
          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #75e8ff
            );
        }

        .miniLabel {
          margin: 0;

          color: #10f3ff;

          font-size: 9px;
          font-weight: 900;

          letter-spacing: .12em;

          text-transform: uppercase;
        }

        .appointmentHeading {
          margin: 4px 0 0 !important;

          font-size: 21px !important;
        }

        .appointmentDetailsCard {
          margin-top: 20px;

          padding: 24px;

          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.10),
              rgba(255,210,73,.05)
            );

          border:
            1px solid rgba(16,243,255,.23);

          box-shadow:
            inset 0 1px 0 rgba(255,255,255,.035);
        }

        .confirmedAppointmentDetails {
          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.11),
              rgba(56,189,248,.045)
            );
        }

        .appointmentService {
          margin: 0 0 8px;

          color: #ffd249;

          font-size: 10px;
          font-weight: 900;

          letter-spacing: .09em;

          text-transform: uppercase;
        }

        .appointmentDateLarge {
          display: block;

          color: white;

          font-size:
            clamp(
              22px,
              3vw,
              32px
            );

          font-weight: 950;

          line-height: 1.22;
        }

        .appointmentTimeLarge {
          display: flex;

          align-items: center;

          gap: 14px;

          flex-wrap: wrap;

          margin-top: 11px;

          color: #10f3ff;

          font-size:
            clamp(
              20px,
              2.5vw,
              28px
            );

          font-weight: 950;
        }

        .appointmentTimeLarge span {
          color:
            rgba(255,255,255,.4);
        }

        .appointmentDuration {
          display: inline-flex;

          margin-top: 14px;

          padding: 7px 11px;

          border-radius: 999px;

          background:
            rgba(255,210,73,.09);

          border:
            1px solid rgba(255,210,73,.2);

          color: #ffe58a;

          font-size: 10px;
          font-weight: 900;
        }

        .appointmentSlotLabel {
          margin-top: 12px;

          color:
            rgba(255,255,255,.68);

          font-size: 10px;
          font-weight: 700;
        }

        .appointmentInstruction {
          margin: 18px 0 0;

          color:
            rgba(255,255,255,.7);

          line-height: 1.55;

          font-size: 11px;
        }

        .appointmentLookupWarning {
          margin-top: 18px;

          padding: 14px;

          border-radius: 13px;

          background:
            rgba(250,204,21,.06);

          border:
            1px solid rgba(250,204,21,.16);

          color: #fde68a;

          font-size: 10px;
        }

        /* =================================================
           MEETING BUTTONS
        ================================================= */

        .meetingActions {
          display: flex;

          flex-wrap: wrap;

          gap: 9px;

          margin-top: 17px;
        }

        .meetingActions button,
        .enterMeetingBtn {
          padding: 11px 14px;

          border-radius: 999px;

          font-weight: 850;

          cursor: pointer;

          text-decoration: none;

          font-size: 10px;
        }

        .confirmBtn,
        .enterMeetingBtn {
          border: none;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color: #06111f;
        }

        .rescheduleBtn {
          border:
            1px solid rgba(168,85,247,.3);

          background:
            rgba(168,85,247,.08);

          color: #d8b4fe;
        }

        .cancelBtn {
          border:
            1px solid rgba(248,113,113,.28);

          background:
            rgba(248,113,113,.07);

          color: #fca5a5;
        }

        /* =================================================
           RESCHEDULE PENDING
        ================================================= */

        .reschedulePendingBox {
          margin-top: 17px;

          padding: 22px;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              rgba(168,85,247,.07),
              rgba(16,243,255,.025)
            );

          border:
            1px solid rgba(168,85,247,.23);
        }

        .rescheduleStatusRow {
          display: flex;

          gap: 13px;

          align-items: center;
        }

        .rescheduleStatusIcon {
          width: 45px;
          height: 45px;

          min-width: 45px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(168,85,247,.1);

          border:
            1px solid rgba(168,85,247,.25);

          color: #d8b4fe;

          font-size: 23px;
          font-weight: 900;
        }

        .purpleLabel {
          color: #d8b4fe;
        }

        .redLabel {
          color: #fca5a5;
        }

        .rescheduleStatusRow h3,
        .cancelledStatusRow h3 {
          margin: 4px 0 0;

          font-size: 18px;
        }

        .rescheduleCurrentCard,
        .requestedNewTimeCard {
          margin-top: 16px;

          padding: 15px;

          border-radius: 14px;

          display: grid;

          gap: 5px;
        }

        .rescheduleCurrentCard {
          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.07);
        }

        .requestedNewTimeCard {
          background:
            rgba(16,243,255,.05);

          border:
            1px solid rgba(16,243,255,.14);
        }

        .rescheduleCurrentCard span,
        .requestedNewTimeCard span {
          color: #9ca3af;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: .1em;
        }

        .requestedNewTimeCard span {
          color: #10f3ff;
        }

        .rescheduleCurrentCard strong,
        .requestedNewTimeCard strong {
          font-size: 12px;
        }

        .rescheduleCurrentCard p {
          margin: 2px 0 0;

          color: #9ba6b5;

          font-size: 9px;
        }

        .noteDisplay {
          margin-top: 13px;

          padding: 13px;

          border-radius: 12px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.07);
        }

        .noteDisplay strong {
          color: #ffd249;

          font-size: 10px;
        }

        .noteDisplay p {
          margin: 5px 0 0;

          color: #b7c0ce;

          line-height: 1.5;

          font-size: 10px;
        }

        .rescheduleWaitText {
          margin: 14px 0 0;

          color:
            rgba(255,255,255,.62);

          font-size: 10px;

          line-height: 1.55;
        }

        /* =================================================
           CANCELLED RESULT
        ================================================= */

        .cancelledBox {
          margin-top: 17px;

          padding: 20px;

          border-radius: 17px;

          background:
            rgba(248,113,113,.055);

          border:
            1px solid rgba(248,113,113,.18);
        }

        .cancelledStatusRow {
          display: flex;

          align-items: center;

          gap: 12px;
        }

        .cancelledIcon {
          width: 43px;
          height: 43px;

          min-width: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(248,113,113,.09);

          border:
            1px solid rgba(248,113,113,.2);

          color: #fca5a5;

          font-size: 25px;
        }

        .cancelledBox > p {
          margin: 14px 0 0;

          color:
            rgba(255,255,255,.62);

          line-height: 1.55;

          font-size: 10px;
        }

        /* =================================================
           RESCHEDULE / CANCEL FORMS
        ================================================= */

        .rescheduleForm,
        .cancelForm {
          margin-top: 18px;

          padding: 22px;

          border-radius: 19px;

          background:
            #090d17;

          border:
            1px solid rgba(255,255,255,.1);

          box-shadow:
            0 16px 50px rgba(0,0,0,.18);
        }

        .rescheduleForm {
          border-color:
            rgba(168,85,247,.24);
        }

        .cancelForm {
          border-color:
            rgba(248,113,113,.22);
        }

        .formHeading {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 14px;
        }

        .formHeading h3 {
          margin: 4px 0 5px;

          font-size: 20px;
        }

        .formHeading p:not(.eyebrow):not(.miniLabel) {
          margin: 0;

          color: #9aa5b4;

          font-size: 10px;

          line-height: 1.5;
        }

        .closeBtn {
          width: 34px;
          height: 34px;

          min-width: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            1px solid rgba(255,255,255,.1);

          background:
            rgba(255,255,255,.04);

          color: white;

          font-size: 18px;

          cursor: pointer;
        }

        .rescheduleOption {
          display: flex;

          align-items: flex-start;

          gap: 12px;

          margin-top: 19px;
        }

        .optionNumber {
          width: 30px;
          height: 30px;

          min-width: 30px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(16,243,255,.08);

          border:
            1px solid rgba(16,243,255,.18);

          color: #10f3ff;

          font-size: 11px;
          font-weight: 900;
        }

        .optionContent strong {
          font-size: 12px;
        }

        .optionContent p {
          margin: 5px 0 0;

          color: #929eae;

          font-size: 10px;

          line-height: 1.5;
        }

        .orDivider {
          display: grid;

          grid-template-columns:
            1fr auto 1fr;

          align-items: center;

          gap: 12px;

          margin: 22px 0;

          color: #697586;

          font-size: 9px;
          font-weight: 900;
        }

        .orDivider span {
          height: 1px;

          background:
            rgba(255,255,255,.08);
        }

        .rescheduleReminder {
          margin-top: 14px;

          padding: 12px;

          border-radius: 12px;

          background:
            rgba(168,85,247,.055);

          border:
            1px solid rgba(168,85,247,.14);
        }

        .rescheduleReminder strong {
          color: #d8b4fe;

          font-size: 10px;
        }

        .rescheduleReminder p {
          margin: 4px 0 0;

          color: #9ba5b4;

          font-size: 9px;
        }

        .cancelAppointmentSummary {
          display: grid;

          gap: 4px;

          margin-top: 15px;

          padding: 14px;

          border-radius: 13px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.07);
        }

        .cancelAppointmentSummary strong {
          color: #ffd249;

          font-size: 11px;
        }

        .cancelAppointmentSummary span {
          color: #d5dce7;

          font-size: 10px;
        }

        .cancelPolicyWarning {
          margin-top: 15px;

          padding: 14px;

          border-radius: 13px;

          background:
            rgba(248,113,113,.055);

          border:
            1px solid rgba(248,113,113,.14);
        }

        .cancelPolicyWarning strong {
          color: #fca5a5;

          font-size: 11px;
        }

        .cancelPolicyWarning p {
          margin: 7px 0 0;

          color: #b7bdc8;

          font-size: 9px;

          line-height: 1.55;
        }

        .fieldLabel {
          display: block;

          margin-top: 15px;

          color: #d9e0e9;

          font-size: 10px;
          font-weight: 800;
        }

        .formActionRow {
          display: flex;

          justify-content: flex-end;

          gap: 9px;

          flex-wrap: wrap;

          margin-top: 16px;
        }

        .secondaryFormBtn,
        .keepBtn {
          padding: 11px 14px;

          border-radius: 999px;

          border:
            1px solid rgba(255,255,255,.13);

          background:
            rgba(255,255,255,.04);

          color: white;

          cursor: pointer;

          font-size: 10px;
          font-weight: 800;
        }

        .submitRescheduleBtn {
          padding: 11px 16px;

          border-radius: 999px;

          border: none;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color: #06111f;

          cursor: pointer;

          font-size: 10px;
          font-weight: 900;
        }

        .submitRescheduleBtn:disabled {
          opacity: .4;

          cursor: not-allowed;
        }

        .cancelConfirmBtn {
          padding: 11px 15px;

          border-radius: 999px;

          border:
            1px solid rgba(248,113,113,.28);

          background:
            rgba(248,113,113,.09);

          color: #fca5a5;

          cursor: pointer;

          font-size: 10px;
          font-weight: 850;
        }

        .cancelConfirmBtn:disabled {
          opacity: .45;

          cursor: not-allowed;
        }

        /* =================================================
           CHOICE BOXES - LARGE COLORFUL ✓ / +
        ================================================= */

        .choiceHeader h2 {
          margin-bottom: 5px;
        }

        .choiceGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 16px;

          margin-top: 20px;
        }

        .mainChoice {
          min-height: 138px;

          padding: 24px;

          display: flex;

          align-items: flex-start;

          gap: 18px;

          border-radius: 20px;

          border:
            1px solid rgba(255,255,255,.12);

          background:
            linear-gradient(
              135deg,
              rgba(255,255,255,.06),
              rgba(255,255,255,.025)
            );

          color: white;

          text-align: left;

          cursor: pointer;

          transition:
            transform .2s ease,
            border-color .2s ease,
            background .2s ease,
            box-shadow .2s ease;
        }

        .mainChoice:hover {
          transform:
            translateY(-3px);

          border-color:
            rgba(16,243,255,.42);

          box-shadow:
            0 12px 35px rgba(16,243,255,.07);
        }

        .mainChoiceActive {
          border-color:
            rgba(16,243,255,.7);

          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.15),
              rgba(255,210,73,.065)
            );

          box-shadow:
            0 0 35px rgba(16,243,255,.09);
        }

        .choiceIcon {
          width: 60px;
          height: 60px;

          min-width: 60px;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            2px solid rgba(16,243,255,.55);

          background:
            rgba(16,243,255,.09);

          color:
            #10f3ff;

          font-size: 31px;
          font-weight: 950;

          line-height: 1;

          box-shadow:
            0 0 25px rgba(16,243,255,.11);
        }

        .plusIcon {
          font-size: 40px;
        }

        .mainChoiceActive .choiceIcon {
          border-color:
            transparent;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color:
            #06111f;

          box-shadow:
            0 0 28px rgba(16,243,255,.18);
        }

        .mainChoiceContent {
          flex: 1;
        }

        .mainChoice strong {
          display: block;

          margin-top: 2px;
          margin-bottom: 9px;

          color: white;

          font-size: 16px;
          font-weight: 900;

          line-height: 1.35;
        }

        .mainChoice p {
          margin: 0;

          color:
            rgba(255,255,255,.66);

          font-size: 11px;

          line-height: 1.65;
        }

        /* =================================================
           CONTENT
        ================================================= */

        .checkInBadge,
        .requestBadge {
          padding: 7px 10px;

          border-radius: 999px;

          flex-shrink: 0;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: .08em;
        }

        .checkInBadge {
          color: #10f3ff;

          background:
            rgba(16,243,255,.07);

          border:
            1px solid rgba(16,243,255,.18);
        }

        .requestBadge {
          color: #ffd249;

          background:
            rgba(255,210,73,.07);

          border:
            1px solid rgba(255,210,73,.18);
        }

        .multiServiceNotice {
          margin-top: 12px;

          padding: 11px 12px;

          display: grid;

          gap: 3px;

          border-radius: 11px;

          background:
            rgba(16,243,255,.055);

          border:
            1px solid rgba(16,243,255,.13);
        }

        .multiServiceNotice strong {
          color: #10f3ff;

          font-size: 9px;
        }

        .multiServiceNotice span {
          color: #b4c0cf;

          font-size: 9px;

          line-height: 1.45;
        }

        /* =================================================
           SERVICES
        ================================================= */

        .serviceGrid {
          display: grid;

          grid-template-columns:
            repeat(
              2,
              minmax(0,1fr)
            );

          gap: 10px;

          margin: 18px 0;
        }

        .serviceCard {
          padding: 15px;

          display: flex;

          align-items: flex-start;

          gap: 11px;

          border-radius: 14px;

          border:
            1px solid rgba(255,255,255,.09);

          background:
            rgba(0,0,0,.16);

          color: white;

          text-align: left;

          cursor: pointer;
        }

        .serviceSelected {
          border-color:
            rgba(16,243,255,.48);

          background:
            rgba(16,243,255,.075);
        }

        .serviceCheck {
          width: 23px;
          height: 23px;

          min-width: 23px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 7px;

          border:
            1px solid rgba(255,255,255,.25);

          color: #06111f;

          font-size: 10px;
          font-weight: 900;
        }

        .serviceSelected .serviceCheck {
          background: #10f3ff;

          border-color: #10f3ff;
        }

        .serviceCard strong {
          display: block;

          margin-bottom: 4px;

          font-size: 12px;
        }

        .serviceCard span {
          display: block;

          color: #9ca6b4;

          font-size: 9px;

          line-height: 1.45;
        }

        .selectedServicesBox {
          margin-top: 12px;

          padding: 12px;

          display: grid;

          gap: 4px;

          border-radius: 12px;

          background:
            rgba(255,210,73,.055);

          border:
            1px solid rgba(255,210,73,.14);
        }

        .selectedServicesBox span {
          color: #a6acb5;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: .1em;
        }

        .selectedServicesBox strong {
          color: #ffe385;

          font-size: 10px;
        }

        /* =================================================
           FORM INPUTS
        ================================================= */

        .formField {
          display: grid;

          gap: 6px;

          margin-top: 15px;
        }

        .formField label {
          color: #d4dce7;

          font-size: 10px;
          font-weight: 800;
        }

        input,
        textarea,
        select {
          width: 100%;

          padding: 12px 13px;

          border-radius: 12px;

          border:
            1px solid rgba(255,255,255,.12);

          background: #070b13;

          color: white;

          outline: none;

          font-family: inherit;
        }

        select option {
          background: #070b13;

          color: white;
        }

        textarea {
          min-height: 100px;

          resize: vertical;

          line-height: 1.5;
        }

        /* =================================================
           AVAILABILITY
        ================================================= */

        .availabilitySection {
          margin-top: 22px;

          padding: 19px;

          border-radius: 17px;

          background:
            rgba(255,255,255,.025);

          border:
            1px solid rgba(255,255,255,.08);
        }

        .availabilityHeader {
          display: flex;

          justify-content: space-between;

          align-items: flex-start;

          gap: 15px;
        }

        .availabilityHeader h3 {
          margin: 3px 0 5px;

          font-size: 18px;
        }

        .availabilityHeader p:not(.eyebrow) {
          margin: 0;

          color: #9da7b4;

          font-size: 10px;

          line-height: 1.5;
        }

        .choiceCounter {
          padding: 7px 10px;

          border-radius: 999px;

          background:
            rgba(16,243,255,.07);

          border:
            1px solid rgba(16,243,255,.16);

          color: #10f3ff;

          font-size: 9px;
          font-weight: 900;

          white-space: nowrap;
        }

        .slotGrid {
          display: grid;

          grid-template-columns:
            repeat(
              3,
              minmax(0,1fr)
            );

          gap: 10px;

          margin-top: 14px;
        }

        .slotChoice {
          min-height: 92px;

          padding: 13px;

          display: flex;

          align-items: flex-start;

          gap: 9px;

          border-radius: 14px;

          border:
            1px solid rgba(255,255,255,.09);

          background:
            rgba(0,0,0,.17);

          color: white;

          cursor: pointer;

          text-align: left;
        }

        .slotChoice:hover {
          border-color:
            rgba(16,243,255,.25);
        }

        .slotChoiceActive {
          border-color:
            rgba(16,243,255,.5);

          background:
            rgba(16,243,255,.075);
        }

        .slotRadio {
          width: 26px;
          height: 26px;

          min-width: 26px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          border:
            1px solid rgba(16,243,255,.25);

          color: #10f3ff;

          font-size: 9px;
          font-weight: 900;
        }

        .slotChoiceActive .slotRadio {
          background: #10f3ff;

          color: #07111a;
        }

        .slotChoice > div {
          display: grid;

          gap: 3px;
        }

        .slotChoice strong {
          font-size: 10px;

          line-height: 1.35;
        }

        .slotChoice span:not(.slotRadio):not(.choicePreference) {
          color: #b2c0cf;

          font-size: 9px;
        }

        .slotChoice small {
          color: #ffd249;

          font-size: 8px;
        }

        .choicePreference {
          color: #10f3ff;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: .1em;
        }

        .noAvailability {
          margin-top: 13px;

          padding: 17px;

          border-radius: 13px;

          border:
            1px dashed rgba(255,255,255,.13);

          color: #8e99a8;

          font-size: 10px;

          text-align: center;
        }

        /* =================================================
           UPLOADS
        ================================================= */

        .uploadBox {
          margin-top: 20px;

          padding: 18px;

          border-radius: 16px;

          background:
            rgba(255,255,255,.025);

          border:
            1px solid rgba(255,255,255,.08);

          display: grid;

          gap: 11px;
        }

        .uploadBox h3 {
          margin: 3px 0 5px;

          font-size: 17px;
        }

        .uploadBox p:not(.eyebrow) {
          margin: 0;

          color: #9da7b4;

          font-size: 10px;

          line-height: 1.5;
        }

        .uploadTrackingNote {
          display: block;

          margin-top: 7px;

          color: #86efac;

          font-size: 9px;
          font-weight: 700;
        }

        .uploadButton {
          width: fit-content;

          padding: 10px 14px;

          border-radius: 11px;

          border:
            1px solid rgba(16,243,255,.18);

          background:
            rgba(16,243,255,.06);

          color: #c3fbff;

          cursor: pointer;

          font-size: 10px;
          font-weight: 850;
        }

        .uploadButton input {
          display: none;
        }

        .fileList {
          display: grid;

          gap: 7px;
        }

        .fileItem {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 10px;

          padding: 10px 11px;

          border-radius: 10px;

          background:
            rgba(255,255,255,.035);

          border:
            1px solid rgba(255,255,255,.065);

          font-size: 9px;
        }

        .fileItem button {
          border: none;

          background: transparent;

          color: #fca5a5;

          cursor: pointer;

          font-size: 8px;
          font-weight: 800;
        }

        /* =================================================
           POLICY
        ================================================= */

        .policyBox {
          margin-top: 20px;

          padding: 20px;

          border-radius: 17px;

          background:
            linear-gradient(
              135deg,
              rgba(255,210,73,.065),
              rgba(16,243,255,.025)
            );

          border:
            1px solid rgba(255,210,73,.2);
        }

        .policyHeader {
          display: flex;

          align-items: center;

          gap: 12px;

          margin-bottom: 13px;
        }

        .policyIcon {
          width: 36px;
          height: 36px;

          min-width: 36px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 50%;

          background:
            rgba(255,210,73,.11);

          border:
            1px solid rgba(255,210,73,.24);

          color: #ffd249;

          font-size: 15px;
          font-weight: 900;
        }

        .policyEyebrow {
          margin: 0 0 2px;

          color: #ffd249;

          font-size: 7px;
          font-weight: 900;

          letter-spacing: .14em;
        }

        .policyHeader h3 {
          margin: 0;

          font-size: 16px;
        }

        .policyBox > p {
          color: #bcc3cd;

          font-size: 10px;

          line-height: 1.62;
        }

        .agreementCheck {
          display: flex;

          align-items: flex-start;

          gap: 10px;

          margin-top: 14px;

          padding: 13px;

          border-radius: 12px;

          background:
            rgba(0,0,0,.18);

          border:
            1px solid rgba(255,255,255,.09);

          cursor: pointer;
        }

        .agreementCheck input {
          width: 17px;
          height: 17px;

          margin: 1px 0 0;

          accent-color: #10f3ff;
        }

        .agreementCheck span {
          color: #eef1f5;

          font-size: 10px;

          line-height: 1.5;

          font-weight: 700;
        }

        /* =================================================
           MESSAGES
        ================================================= */

        .pageMessage,
        .messageBox,
        .successBox {
          margin-top: 14px;

          padding: 12px 13px;

          border-radius: 12px;

          font-size: 10px;

          line-height: 1.5;
        }

        .pageMessage,
        .messageBox {
          background:
            rgba(250,204,21,.055);

          border:
            1px solid rgba(250,204,21,.14);

          color: #fde68a;
        }

        .successPageMessage,
        .successBox {
          background:
            rgba(34,197,94,.06);

          border:
            1px solid rgba(34,197,94,.16);

          color: #9df3b7;
        }

        /* =================================================
           BOTTOM ACTION
        ================================================= */

        .bottomAction {
          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;

          margin-top: 20px;

          padding-top: 18px;

          border-top:
            1px solid rgba(255,255,255,.07);
        }

        .bottomAction strong {
          font-size: 12px;
        }

        .bottomAction p {
          margin: 4px 0 0;

          color: #929caa;

          font-size: 9px;
        }

        .primaryBtn {
          padding: 13px 19px;

          border: none;

          border-radius: 999px;

          background:
            linear-gradient(
              135deg,
              #10f3ff,
              #ffd249
            );

          color: #06111f;

          font-weight: 950;

          cursor: pointer;

          flex-shrink: 0;
        }

        .primaryBtn:disabled {
          opacity: .42;

          cursor: not-allowed;
        }

        /* =================================================
           RIGHT
        ================================================= */

        .right {
          padding: 20px;
        }

        .rightEyebrow {
          margin: 0 0 6px;

          color: #10f3ff;

          font-size: 8px;
          font-weight: 900;

          letter-spacing: .13em;
        }

        .right h2 {
          margin: 0 0 15px;

          font-size: 20px;
        }

        .openRoomTitle {
          margin: 0 0 12px;

          color: #ffd249;

          font-size: 18px;
        }

        .detail {
          padding: 12px;

          margin-bottom: 10px;

          border-radius: 12px;

          background:
            rgba(255,255,255,.04);

          border:
            1px solid rgba(255,255,255,.07);

          display: grid;

          gap: 4px;
        }

        .detail strong {
          color: #aab2c0;

          font-size: 9px;
        }

        .detail span {
          font-size: 10px;

          line-height: 1.4;
        }

        .detailHighlight {
          border-color:
            rgba(255,210,73,.15);
        }

        .divider {
          height: 1px;

          background:
            rgba(255,255,255,.08);

          margin: 18px 0;
        }

        .rightInfoBox {
          margin-top: 12px;

          padding: 13px;

          border-radius: 12px;

          background:
            rgba(16,243,255,.035);

          border:
            1px solid rgba(16,243,255,.1);
        }

        .rightInfoBox p {
          margin: 0;

          color: #a8b4c3;

          line-height: 1.5;

          font-size: 9px;
        }

        /* =================================================
           RESPONSIVE
        ================================================= */

        @media(max-width:1150px) {
          .page {
            grid-template-columns:
              200px
              minmax(0,1fr);
          }

          .right {
            grid-column:
              1 /
              -1;
          }
        }

        @media(max-width:850px) {
          .page {
            grid-template-columns:
              1fr;

            padding: 12px;
          }

          .main {
            padding: 19px;
          }

          .choiceGrid,
          .serviceGrid,
          .slotGrid {
            grid-template-columns:
              1fr;
          }

          .panelHeader,
          .contentHeader,
          .availabilityHeader,
          .bottomAction {
            flex-direction: column;

            align-items: stretch;
          }

          .mainChoice {
            min-height: 0;
          }

          .primaryBtn {
            width: 100%;
          }

          .formActionRow {
            flex-direction: column;
          }

          .formActionRow button {
            width: 100%;
          }

          .meetingActions {
            flex-direction: column;
          }

          .meetingActions button,
          .meetingActions a {
            width: 100%;

            text-align: center;
          }

          .appointmentTimeLarge {
            font-size: 20px;
          }

          .side .exit {
            margin-top: 20px;
          }
        }
      `}</style>
    </main>
  );
}
