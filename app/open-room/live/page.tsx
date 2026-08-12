"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

type VisitMode = "attend" | "request" | "";

type AvailabilitySlot = {
  id: string;
  start_time: string;
  end_time: string | null;
  label: string | null;
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

const DEFAULT_SETTINGS: CareerConnectSettings = {
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

const SERVICE_OPTIONS = [
  {
    value: "open_room",
    label: "Open Room",
    description:
      "Live Q&A, networking, resource drops, opportunities, and career conversations.",
  },

  {
    value: "resume_support",
    label: "Resume Support",
    description:
      "Resume review, development, revisions, and recommendations.",
  },

  {
    value: "cover_letter_review",
    label: "Cover Letter Review",
    description:
      "Review your cover letter for clarity, relevance, and overall presentation.",
  },

  {
    value: "career_coaching",
    label: "1:1 Career Coaching",
    description:
      "Individual career planning, preparation, and support.",
  },

  {
    value: "mock_interview",
    label: "Mock Interview",
    description:
      "Practice interview questions, answers, and interview preparation.",
  },

  {
    value: "workforce_training",
    label: "Workforce Development Training",
    description:
      "Scheduled HireMinds workforce development training session.",
  },

  {
    value: "job_search_assistance",
    label: "Job Search Assistance",
    description:
      "Job search guidance, opportunities, and application support.",
  },

  {
    value: "other",
    label: "Other",
    description:
      "Another scheduled HireMinds meeting or career-support session.",
  },
];

const REQUEST_OPTIONS = [
  {
    value: "resume_support",
    label: "Resume Support",
  },

  {
    value: "cover_letter_review",
    label: "Cover Letter Review",
  },

  {
    value: "career_coaching",
    label: "1:1 Career Coaching",
  },

  {
    value: "mock_interview",
    label: "Mock Interview",
  },

  {
    value: "job_search_assistance",
    label: "Job Search Assistance",
  },

  {
    value: "other",
    label: "Other",
  },
];

const MAX_ATTACHMENTS = 3;

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function OpenRoomLivePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");

  const [fullName, setFullName] = useState("");

  const [email, setEmail] = useState("");

  const [referralCode, setReferralCode] = useState("");

  const [settings, setSettings] =
    useState<CareerConnectSettings>(DEFAULT_SETTINGS);

  const [availabilitySlots, setAvailabilitySlots] =
    useState<AvailabilitySlot[]>([]);

  const [visitMode, setVisitMode] =
    useState<VisitMode>("");

  /*
    SCHEDULED SESSION
  */

  const [selectedServices, setSelectedServices] =
    useState<string[]>([]);

  const [otherService, setOtherService] =
    useState("");

  const [checkingIn, setCheckingIn] =
    useState(false);

  const [checkInMessage, setCheckInMessage] =
    useState("");

  const [checkedIn, setCheckedIn] =
    useState(false);

  /*
    REQUEST MEETING
  */

  const [requestService, setRequestService] =
    useState("");

  const [requestOtherService, setRequestOtherService] =
    useState("");

  const [selectedSlots, setSelectedSlots] =
    useState<string[]>([]);

  const [requestNotes, setRequestNotes] =
    useState("");

  const [requestFiles, setRequestFiles] =
    useState<File[]>([]);

  const [requestSubmitting, setRequestSubmitting] =
    useState(false);

  const [requestMessage, setRequestMessage] =
    useState("");

  /*
    INITIAL LOAD
  */

  useEffect(() => {
    loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

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

    const user =
      authData.user;

    setUserId(user.id);

    setEmail(
      user.email || ""
    );

    const {
      data: profile,
      error: profileError,
    } = await supabase
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

    if (profileError) {
      console.error(
        "Profile error:",
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
    ]);

    setLoading(false);
  }

  /*
    LOAD CAREER CONNECT SETTINGS
  */

  async function loadSettings() {
    const {
      data,
      error,
    } = await supabase
      .from(
        "career_connect_settings"
      )
      .select(
        `
        meeting_link,
        open_room_title,
        open_room_schedule,
        open_room_time,
        doors_open,
        doors_close,
        open_room_note
        `
      )
      .eq(
        "id",
        "default"
      )
      .maybeSingle();

    if (error) {
      console.error(
        "Career Connect settings error:",
        error
      );

      return;
    }

    if (data) {
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

  /*
    LOAD ADMIN-CREATED AVAILABILITY
  */

  async function loadAvailability() {
    const now =
      new Date().toISOString();

    const {
      data,
      error,
    } = await supabase
      .from(
        "availability_slots"
      )
      .select(
        `
        id,
        start_time,
        end_time,
        label
        `
      )
      .eq(
        "is_active",
        true
      )
      .gte(
        "start_time",
        now
      )
      .order(
        "start_time",
        {
          ascending: true,
        }
      );

    if (error) {
      console.error(
        "Availability error:",
        error
      );

      return;
    }

    setAvailabilitySlots(
      data || []
    );
  }

  /*
    SERVICE LABEL
  */

  function getServiceLabel(
    value: string
  ) {
    if (
      value === "other"
    ) {
      return (
        otherService.trim() ||
        "Other"
      );
    }

    return (
      SERVICE_OPTIONS.find(
        (service) =>
          service.value ===
          value
      )?.label || value
    );
  }

  /*
    REQUEST SERVICE LABEL
  */

  function getRequestServiceLabel() {
    if (
      requestService ===
      "other"
    ) {
      return (
        requestOtherService.trim() ||
        "Other"
      );
    }

    return (
      REQUEST_OPTIONS.find(
        (service) =>
          service.value ===
          requestService
      )?.label ||
      requestService
    );
  }

  /*
    MAIN MODE
  */

  function chooseMode(
    mode: VisitMode
  ) {
    setVisitMode(mode);

    setCheckInMessage("");

    setRequestMessage("");

    setCheckedIn(false);
  }

  /*
    MULTI-SERVICE CHECK-IN
  */

  function toggleScheduledService(
    serviceValue: string
  ) {
    setSelectedServices(
      (previous) => {
        if (
          previous.includes(
            serviceValue
          )
        ) {
          return previous.filter(
            (value) =>
              value !==
              serviceValue
          );
        }

        return [
          ...previous,
          serviceValue,
        ];
      }
    );

    setCheckInMessage("");

    setCheckedIn(false);
  }

  /*
    CHECK-IN
  */

  async function handleCheckInAndEnter() {
    if (
      selectedServices.length ===
      0
    ) {
      setCheckInMessage(
        "Please select at least one service you are attending."
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
        "Please tell us what the additional service or meeting is."
      );

      return;
    }

    if (!userId) {
      setCheckInMessage(
        "We could not verify your HireMinds account."
      );

      return;
    }

    setCheckingIn(true);

    setCheckInMessage("");

    setCheckedIn(false);

    const now =
      new Date();

    const selectedLabels =
      selectedServices.map(
        (service) =>
          getServiceLabel(
            service
          )
      );

    /*
      ONE SESSION
    */

    const {
      data: session,
      error: sessionError,
    } = await supabase
      .from(
        "workforce_sessions"
      )
      .insert({
        service_type:
          selectedServices[0],

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
            .slice(0, 10),

        start_time:
          now.toISOString(),

        location_type:
          "virtual",

        meeting_link:
          settings.meeting_link,

        created_by:
          userId,
      })
      .select("id")
      .single();

    if (
      sessionError ||
      !session
    ) {
      console.error(
        "Session error:",
        sessionError
      );

      setCheckInMessage(
        sessionError?.message ||
          "We could not record your check-in."
      );

      setCheckingIn(false);

      return;
    }

    /*
      RECORD EACH SERVICE
    */

    const serviceRows =
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
      );

    const {
      error:
        servicesError,
    } = await supabase
      .from(
        "workforce_session_services"
      )
      .insert(
        serviceRows
      );

    if (
      servicesError
    ) {
      console.error(
        "Service tracking error:",
        servicesError
      );

      setCheckInMessage(
        servicesError.message
      );

      setCheckingIn(false);

      return;
    }

    /*
      ONE ATTENDANCE RECORD
    */

    const {
      error:
        attendanceError,
    } = await supabase
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
        "Attendance error:",
        attendanceError
      );

      setCheckInMessage(
        attendanceError.message
      );

      setCheckingIn(false);

      return;
    }

    /*
      ACTIVITY TRACKING
    */

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

    setCheckedIn(true);

    setCheckingIn(false);

    window.open(
      settings.meeting_link,
      "_blank",
      "noopener,noreferrer"
    );
  }

  /*
    APPOINTMENT SLOT SELECTION

    Require at least 2.
    Allow maximum 3.
  */

  function toggleAvailabilitySlot(
    slotId: string
  ) {
    setRequestMessage("");

    setSelectedSlots(
      (previous) => {
        if (
          previous.includes(
            slotId
          )
        ) {
          return previous.filter(
            (id) =>
              id !== slotId
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

  /*
    REQUEST FILES
  */

  function handleFilesSelected(
    files:
      FileList | null
  ) {
    if (!files) {
      return;
    }

    const selected =
      Array.from(files);

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
        (file) =>
          file.size >
          MAX_FILE_SIZE
      );

    if (tooLarge) {
      setRequestMessage(
        `${tooLarge.name} is larger than 10 MB.`
      );

      return;
    }

    setRequestFiles(
      selected
    );

    setRequestMessage("");
  }

  /*
    SAFE FILE NAME
  */

  function safeFileName(
    name: string
  ) {
    return name.replace(
      /[^a-zA-Z0-9._-]/g,
      "_"
    );
  }

  /*
    SUBMIT REQUEST
  */

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
      2
    ) {
      setRequestMessage(
        "Please select at least 2 appointment choices."
      );

      return;
    }

    if (
      selectedSlots.length >
      3
    ) {
      setRequestMessage(
        "Please select no more than 3 appointment choices."
      );

      return;
    }

    if (!userId) {
      setRequestMessage(
        "We could not verify your HireMinds account."
      );

      return;
    }

    setRequestSubmitting(
      true
    );

    setRequestMessage(
      ""
    );

    /*
      CREATE REQUEST
    */

    const {
      data: request,
      error:
        requestError,
    } = await supabase
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
      })
      .select("id")
      .single();

    if (
      requestError ||
      !request
    ) {
      console.error(
        "Meeting request error:",
        requestError
      );

      setRequestMessage(
        requestError?.message ||
          "We could not submit your meeting request."
      );

      setRequestSubmitting(
        false
      );

      return;
    }

    /*
      SAVE 2-3 PREFERRED SLOTS
    */

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
            index + 1,
        })
      );

    const {
      error:
        choicesError,
    } = await supabase
      .from(
        "meeting_request_choices"
      )
      .insert(
        choiceRows
      );

    if (
      choicesError
    ) {
      console.error(
        "Appointment choice error:",
        choicesError
      );

      setRequestMessage(
        choicesError.message
      );

      setRequestSubmitting(
        false
      );

      return;
    }

    /*
      UPLOAD ATTACHMENTS
    */

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
      } = await supabase.storage
        .from(
          "meeting-request-files"
        )
        .upload(
          path,
          file,
          {
            upsert: false,
          }
        );

      if (
        uploadError
      ) {
        console.error(
          "Attachment upload error:",
          uploadError
        );

        setRequestMessage(
          `Your meeting request was created, but ${file.name} could not be uploaded: ${uploadError.message}`
        );

        setRequestSubmitting(
          false
        );

        return;
      }

      const {
        error:
          attachmentError,
      } = await supabase
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
    }

    /*
      TRACK REQUEST
    */

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
          getRequestServiceLabel(),

        page_name:
          "career-connect",
      });

    setRequestMessage(
      "✓ Meeting request submitted. Your selected appointment times are preferences and are pending confirmation."
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

    setRequestSubmitting(
      false
    );
  }

  /*
    FORMAT APPOINTMENT
  */

  function formatSlot(
    slot:
      AvailabilitySlot
  ) {
    const date =
      new Date(
        slot.start_time
      );

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

  /*
    SORT SELECTED SLOT PREFERENCES
  */

  const selectedSlotDetails =
    useMemo(
      () =>
        selectedSlots
          .map(
            (
              id
            ) =>
              availabilitySlots.find(
                (
                  slot
                ) =>
                  slot.id ===
                  id
              )
          )
          .filter(
            Boolean
          ) as AvailabilitySlot[],
      [
        selectedSlots,
        availabilitySlots,
      ]
    );

  /*
    LOADING
  */

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingCard">
          Loading Career Connect...
        </div>

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

          .loadingCard {
            padding: 28px;
            border-radius: 22px;
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.12);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside className="side">
        <p className="brand">
          HIREMINDS™
        </p>

        <h2>
          CAREER CONNECT
        </h2>

        <p className="live">
          ● LIVE CAREER SERVICES
        </p>

        <button className="active">
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

      {/* =====================================================
          MAIN
      ====================================================== */}

      <section className="main">
        <div className="meetingAlert">
          <div className="meetingArrow">
            ➜
          </div>

          <div className="meetingAlertText">
            <span>
              CAREER CONNECT
            </span>

            <strong>
              Live career support starts here.
            </strong>

            <p>
              Attend a scheduled session or request support from HireMinds.
            </p>
          </div>
        </div>

        <p className="eyebrow">
          HireMinds™ Live Career Services
        </p>

        <h1>
          CAREER CONNECT
        </h1>

        <p className="tagline">
          Connect. Prepare. Keep moving.
        </p>

        <p className="intro">
          Career Connect gives you one place to attend scheduled
          sessions, check in for live support, or request a meeting
          when you need one.
        </p>

        <div className="participantBar">
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
            START HERE
        ================================================== */}

        <section className="choiceBox">
          <div className="choiceHeader">
            <p className="eyebrow">
              Start Here
            </p>

            <h2>
              What would you like to do today?
            </h2>

            <p>
              Choose one option below.
            </p>
          </div>

          <div className="choiceGrid">
            <button
              type="button"
              className={`mainChoice ${
                visitMode ===
                "attend"
                  ? "mainChoiceActive"
                  : ""
              }`}
              onClick={() =>
                chooseMode(
                  "attend"
                )
              }
            >
              <div className="choiceIcon">
                ✓
              </div>

              <div>
                <strong>
                  I have a scheduled session / I&apos;m attending today
                </strong>

                <p>
                  Check in for the service or services included in
                  your scheduled meeting.
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
                chooseMode(
                  "request"
                )
              }
            >
              <div className="choiceIcon">
                +
              </div>

              <div>
                <strong>
                  I need to request a meeting
                </strong>

                <p>
                  Request career support and choose 2–3 available
                  appointment times that work for you.
                </p>
              </div>
            </button>
          </div>
        </section>

        {/* =================================================
            ATTEND SCHEDULED SESSION
        ================================================== */}

        {visitMode ===
        "attend" ? (
          <section className="contentBox">
            <div className="contentHeader">
              <div>
                <p className="eyebrow">
                  Scheduled Session
                </p>

                <h2>
                  What are you attending today?
                </h2>

                <p>
                  Select all services that apply to your scheduled
                  meeting.
                </p>

                <p className="importantText">
                  If your meeting includes more than one service —
                  for example Resume Support and a Mock Interview —
                  select each service before checking in.
                </p>
              </div>

              <span className="stepBadge">
                CHECK IN
              </span>
            </div>

            <div className="serviceGrid">
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
                          ? "selectedService"
                          : ""
                      }`}
                      onClick={() =>
                        toggleScheduledService(
                          service.value
                        )
                      }
                    >
                      <div className="checkbox">
                        {selected
                          ? "✓"
                          : ""}
                      </div>

                      <div>
                        <strong>
                          {
                            service.label
                          }
                        </strong>

                        <p>
                          {
                            service.description
                          }
                        </p>
                      </div>
                    </button>
                  );
                }
              )}
            </div>

            {selectedServices.includes(
              "other"
            ) ? (
              <div className="otherWrap">
                <label>
                  What additional service or meeting are you attending?
                </label>

                <input
                  value={
                    otherService
                  }
                  onChange={(
                    e
                  ) =>
                    setOtherService(
                      e.target
                        .value
                    )
                  }
                  placeholder="Example: Cover letter review"
                />
              </div>
            ) : null}

            {selectedServices.length >
            0 ? (
              <div className="selectionConfirmation">
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
              <div className="errorMessage">
                {
                  checkInMessage
                }
              </div>
            ) : null}

            {checkedIn ? (
              <div className="successMessage">
                ✓ You&apos;re checked in. Your live meeting room
                opened in a new tab.
              </div>
            ) : null}

            <div className="actionBottom">
              <div>
                <strong>
                  Ready to join?
                </strong>

                <p>
                  One attendance is recorded for this meeting, and each
                  selected service is tracked separately.
                </p>
              </div>

              <button
                type="button"
                className="primaryButton"
                onClick={
                  handleCheckInAndEnter
                }
                disabled={
                  checkingIn ||
                  selectedServices.length ===
                    0
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
            REQUEST MEETING
        ================================================== */}

        {visitMode ===
        "request" ? (
          <section className="contentBox">
            <div className="contentHeader">
              <div>
                <p className="eyebrow">
                  Meeting Request
                </p>

                <h2>
                  Request Career Support
                </h2>

                <p>
                  Select the service you need, choose 2–3 available
                  appointment options, and attach any files you want
                  reviewed.
                </p>
              </div>

              <span className="requestBadge">
                REQUEST
              </span>
            </div>

            {/* SERVICE */}

            <div className="requestService">
              <label>
                Service Requested
              </label>

              <select
                value={
                  requestService
                }
                onChange={(
                  e
                ) =>
                  setRequestService(
                    e.target
                      .value
                  )
                }
              >
                <option value="">
                  Select service
                </option>

                {REQUEST_OPTIONS.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {requestService ===
            "other" ? (
              <div className="otherWrap">
                <label>
                  What type of support are you requesting?
                </label>

                <input
                  value={
                    requestOtherService
                  }
                  onChange={(
                    e
                  ) =>
                    setRequestOtherService(
                      e.target
                        .value
                    )
                  }
                  placeholder="Example: Career planning"
                />
              </div>
            ) : null}

            {/* AVAILABILITY */}

            <div className="availabilitySection">
              <div className="availabilityHeader">
                <div>
                  <p className="eyebrow">
                    Appointment Preferences
                  </p>

                  <h3>
                    Select 2–3 times that work for you
                  </h3>

                  <p>
                    These are your preferred times. Your appointment
                    is not confirmed until HireMinds approves one.
                  </p>
                </div>

                <div className="choiceCount">
                  {
                    selectedSlots.length
                  }
                  /3 selected
                </div>
              </div>

              {availabilitySlots.length ===
              0 ? (
                <div className="noAvailability">
                  There are currently no appointment times available.
                  Please check back later.
                </div>
              ) : (
                <div className="availabilityGrid">
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
                        );

                      return (
                        <button
                          key={
                            slot.id
                          }
                          type="button"
                          className={`slotCard ${
                            selected
                              ? "slotSelected"
                              : ""
                          }`}
                          onClick={() =>
                            toggleAvailabilitySlot(
                              slot.id
                            )
                          }
                        >
                          <div className="slotCheck">
                            {selected
                              ? preference +
                                1
                              : ""}
                          </div>

                          <div>
                            <strong>
                              {formatSlot(
                                slot
                              )}
                            </strong>

                            {slot.label ? (
                              <p>
                                {
                                  slot.label
                                }
                              </p>
                            ) : null}
                          </div>
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* SELECTED PREFERENCES */}

            {selectedSlotDetails.length >
            0 ? (
              <div className="preferenceSummary">
                <span>
                  YOUR PREFERENCES
                </span>

                {selectedSlotDetails.map(
                  (
                    slot,
                    index
                  ) => (
                    <div
                      key={
                        slot.id
                      }
                    >
                      <strong>
                        Choice{" "}
                        {index +
                          1}:
                      </strong>{" "}
                      {formatSlot(
                        slot
                      )}
                    </div>
                  )
                )}
              </div>
            ) : null}

            {/* FILE UPLOAD */}

            <div className="attachmentBox">
              <div>
                <p className="eyebrow">
                  Supporting Files
                </p>

                <h3>
                  Attach files for review
                </h3>

                <p>
                  You may attach up to 3 files. For example, upload
                  your resume for Resume Support, a cover letter for
                  Cover Letter Review, or a resume/job description for
                  Mock Interview preparation.
                </p>
              </div>

              <label className="uploadButton">
                📎 Choose Files

                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                  onChange={(
                    e
                  ) =>
                    handleFilesSelected(
                      e.target
                        .files
                    )
                  }
                />
              </label>

              {requestFiles.length >
              0 ? (
                <div className="fileList">
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
                          📄{" "}
                          {
                            file.name
                          }
                        </span>

                        <button
                          type="button"
                          onClick={() =>
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

            {/* NOTES */}

            <label className="requestNotes">
              <span>
                Anything we should know?
              </span>

              <textarea
                value={
                  requestNotes
                }
                onChange={(
                  e
                ) =>
                  setRequestNotes(
                    e.target
                      .value
                  )
                }
                placeholder="Optional notes about what you would like help with."
              />
            </label>

            {requestMessage ? (
              <div
                className={
                  requestMessage.startsWith(
                    "✓"
                  )
                    ? "successMessage"
                    : "errorMessage"
                }
              >
                {
                  requestMessage
                }
              </div>
            ) : null}

            <div className="actionBottom">
              <div>
                <strong>
                  Request status
                </strong>

                <p>
                  You are submitting preferred appointment options.
                  Your meeting is pending until one is confirmed.
                </p>
              </div>

              <button
                type="button"
                className="primaryButton"
                onClick={
                  handleMeetingRequest
                }
                disabled={
                  requestSubmitting
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

      {/* =====================================================
          RIGHT PANEL
      ====================================================== */}

      <aside className="right">
        <p className="rightEyebrow">
          CAREER CONNECT
        </p>

        <h2>
          Today
        </h2>

        <div className="detail">
          <strong>
            Participant
          </strong>

          <span>
            {fullName}
          </span>
        </div>

        <div className="detail">
          <strong>
            Referral Code
          </strong>

          <span>
            {referralCode ||
              "Not Assigned"}
          </span>
        </div>

        {visitMode ===
          "attend" &&
        selectedServices.length >
          0 ? (
          <div className="detail highlightDetail">
            <strong>
              Services
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

        <div className="divider" />

        <h2 className="openTitle">
          {
            settings.open_room_title
          }
        </h2>

        <div className="detail">
          <strong>
            Schedule
          </strong>

          <span>
            {
              settings.open_room_schedule
            }
          </span>
        </div>

        <div className="detail">
          <strong>
            Time
          </strong>

          <span>
            {
              settings.open_room_time
            }
          </span>
        </div>

        <div className="detail">
          <strong>
            Doors Open
          </strong>

          <span>
            {
              settings.doors_open
            }
          </span>
        </div>

        <div className="detail">
          <strong>
            Doors Close
          </strong>

          <span>
            {
              settings.doors_close
            }
          </span>
        </div>

        <div className="infoCard">
          <p>
            {
              settings.open_room_note
            }
          </p>
        </div>
      </aside>

      {/* =====================================================
          STYLES
      ====================================================== */}

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 220px minmax(0,1fr) 310px;
          gap: 20px;
          padding: 22px;
          background:
            radial-gradient(circle at top right, rgba(0,229,255,.1), transparent 28%),
            linear-gradient(135deg,#050814,#0b1220,#05060d);
          color: white;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .side,
        .main,
        .right {
          border-radius: 24px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.09);
        }

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
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(255,255,255,.04);
          color: white;
          text-align: left;
          font-weight: 750;
          cursor: pointer;
        }

        .side .active {
          color: #10f3ff;
          background: rgba(16,243,255,.08);
          border-color: rgba(16,243,255,.2);
        }

        .side .exit {
          margin-top: auto;
          color: #ff8c8c;
        }

        .main {
          padding: 26px;
          min-width: 0;
        }

        .meetingAlert {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 26px;
          padding: 17px 18px;
          border-radius: 18px;
          background:
            linear-gradient(
              135deg,
              rgba(16,243,255,.12),
              rgba(255,210,73,.04)
            );
          border: 1px solid rgba(16,243,255,.25);
        }

        .meetingArrow {
          color: #ffd249;
          font-size: 34px;
        }

        .meetingAlertText {
          display: grid;
          gap: 4px;
        }

        .meetingAlertText span {
          color: #10f3ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .14em;
        }

        .meetingAlertText strong {
          font-size: 15px;
        }

        .meetingAlertText p {
          margin: 0;
          color: rgba(255,255,255,.64);
          font-size: 11px;
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
          font-size: clamp(2.8rem,5vw,5rem);
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
          color: rgba(255,255,255,.72);
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
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
          display: grid;
          gap: 3px;
        }

        .participantBar span {
          color: rgba(255,255,255,.48);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .12em;
        }

        .participantBar strong {
          font-size: 12px;
        }

        .choiceBox,
        .contentBox {
          margin-top: 20px;
          padding: 24px;
          border-radius: 22px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.09);
        }

        .choiceHeader h2,
        .contentHeader h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .choiceHeader p:not(.eyebrow),
        .contentHeader p:not(.eyebrow) {
          margin: 0;
          color: rgba(255,255,255,.62);
          font-size: 12px;
          line-height: 1.5;
        }

        .importantText {
          margin-top: 10px !important;
          padding: 10px 12px;
          border-radius: 11px;
          color: #cdeff5 !important;
          background: rgba(16,243,255,.06);
          border: 1px solid rgba(16,243,255,.13);
          font-weight: 700;
        }

        .choiceGrid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .mainChoice {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border-radius: 17px;
          border: 1px solid rgba(255,255,255,.1);
          background: rgba(0,0,0,.18);
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .mainChoiceActive {
          border-color: rgba(16,243,255,.48);
          background: rgba(16,243,255,.08);
        }

        .choiceIcon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(16,243,255,.32);
          color: #10f3ff;
          font-size: 18px;
          font-weight: 900;
        }

        .mainChoice strong {
          display: block;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .mainChoice p {
          margin: 0;
          color: rgba(255,255,255,.58);
          font-size: 11px;
          line-height: 1.5;
        }

        .contentHeader {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          align-items: flex-start;
          margin-bottom: 20px;
        }

        .stepBadge,
        .requestBadge {
          padding: 7px 10px;
          border-radius: 999px;
          font-size: 9px;
          font-weight: 900;
          flex-shrink: 0;
        }

        .stepBadge {
          color: #10f3ff;
          border: 1px solid rgba(16,243,255,.25);
          background: rgba(16,243,255,.08);
        }

        .requestBadge {
          color: #ffd249;
          border: 1px solid rgba(255,210,73,.25);
          background: rgba(255,210,73,.07);
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 10px;
        }

        .serviceCard {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(0,0,0,.16);
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .selectedService {
          border-color: rgba(16,243,255,.5);
          background: rgba(16,243,255,.08);
        }

        .checkbox {
          width: 21px;
          height: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 7px;
          border: 1px solid rgba(255,255,255,.3);
          flex-shrink: 0;
          font-size: 11px;
        }

        .selectedService .checkbox {
          background: #10f3ff;
          color: #07111c;
        }

        .serviceCard strong {
          display: block;
          margin-bottom: 4px;
          font-size: 13px;
        }

        .serviceCard p {
          margin: 0;
          color: rgba(255,255,255,.55);
          font-size: 10px;
          line-height: 1.45;
        }

        .otherWrap,
        .requestService,
        .requestNotes {
          display: grid;
          gap: 7px;
          margin-top: 14px;
        }

        .otherWrap label,
        .requestService label,
        .requestNotes span {
          color: rgba(255,255,255,.67);
          font-size: 11px;
          font-weight: 800;
        }

        .otherWrap input,
        .requestService select,
        .requestNotes textarea {
          width: 100%;
          padding: 12px 13px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,.12);
          background: #090d17;
          color: white;
          outline: none;
        }

        .requestService select option {
          background: #090d17;
          color: white;
        }

        .requestNotes textarea {
          min-height: 100px;
          resize: vertical;
        }

        .selectionConfirmation,
        .preferenceSummary {
          margin-top: 14px;
          padding: 12px 13px;
          border-radius: 12px;
          background: rgba(255,210,73,.06);
          border: 1px solid rgba(255,210,73,.15);
          display: grid;
          gap: 6px;
        }

        .selectionConfirmation span,
        .preferenceSummary > span {
          color: rgba(255,255,255,.45);
          font-size: 8px;
          font-weight: 900;
          letter-spacing: .1em;
        }

        .selectionConfirmation strong {
          color: #ffd249;
          font-size: 12px;
        }

        .preferenceSummary div {
          color: #f7eaa4;
          font-size: 11px;
        }

        .availabilitySection {
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .availabilityHeader {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 14px;
        }

        .availabilityHeader h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .availabilityHeader p:not(.eyebrow) {
          margin: 0;
          color: rgba(255,255,255,.57);
          font-size: 11px;
        }

        .choiceCount {
          height: fit-content;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(16,243,255,.07);
          border: 1px solid rgba(16,243,255,.17);
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
        }

        .availabilityGrid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 10px;
        }

        .slotCard {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          border-radius: 14px;
          border: 1px solid rgba(255,255,255,.09);
          background: rgba(0,0,0,.15);
          color: white;
          text-align: left;
          cursor: pointer;
        }

        .slotSelected {
          border-color: rgba(16,243,255,.45);
          background: rgba(16,243,255,.07);
        }

        .slotCheck {
          width: 25px;
          height: 25px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 50%;
          border: 1px solid rgba(16,243,255,.3);
          color: #10f3ff;
          font-weight: 900;
          font-size: 10px;
        }

        .slotSelected .slotCheck {
          background: #10f3ff;
          color: #051119;
        }

        .slotCard strong {
          font-size: 11px;
        }

        .slotCard p {
          margin: 4px 0 0;
          color: rgba(255,255,255,.53);
          font-size: 9px;
        }

        .noAvailability {
          padding: 18px;
          border-radius: 14px;
          background: rgba(255,255,255,.035);
          border: 1px dashed rgba(255,255,255,.14);
          color: rgba(255,255,255,.6);
          font-size: 11px;
        }

        .attachmentBox {
          display: grid;
          gap: 13px;
          margin-top: 24px;
          padding: 20px;
          border-radius: 17px;
          background: rgba(255,255,255,.025);
          border: 1px solid rgba(255,255,255,.08);
        }

        .attachmentBox h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .attachmentBox p:not(.eyebrow) {
          margin: 0;
          color: rgba(255,255,255,.57);
          line-height: 1.55;
          font-size: 11px;
        }

        .uploadButton {
          width: fit-content;
          padding: 11px 15px;
          border-radius: 12px;
          border: 1px solid rgba(16,243,255,.2);
          background: rgba(16,243,255,.07);
          color: #bffaff;
          font-size: 11px;
          font-weight: 850;
          cursor: pointer;
        }

        .uploadButton input {
          display: none;
        }

        .fileList {
          display: grid;
          gap: 8px;
        }

        .fileItem {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 11px;
          background: rgba(255,255,255,.035);
          border: 1px solid rgba(255,255,255,.07);
          font-size: 10px;
        }

        .fileItem button {
          border: none;
          background: transparent;
          color: #ff9494;
          cursor: pointer;
          font-size: 9px;
          font-weight: 800;
        }

        .errorMessage,
        .successMessage {
          margin-top: 14px;
          padding: 12px 13px;
          border-radius: 12px;
          font-size: 11px;
          line-height: 1.5;
        }

        .errorMessage {
          color: #ffb0b0;
          background: rgba(255,90,90,.07);
          border: 1px solid rgba(255,90,90,.18);
        }

        .successMessage {
          color: #a8f5c3;
          background: rgba(60,255,130,.07);
          border: 1px solid rgba(60,255,130,.18);
        }

        .actionBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 20px;
          padding-top: 18px;
          border-top: 1px solid rgba(255,255,255,.07);
        }

        .actionBottom strong {
          font-size: 13px;
        }

        .actionBottom p {
          margin: 4px 0 0;
          color: rgba(255,255,255,.52);
          font-size: 10px;
        }

        .primaryButton {
          padding: 13px 19px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(135deg,#10f3ff,#ffd249);
          color: #06111f;
          font-weight: 950;
          cursor: pointer;
          flex-shrink: 0;
        }

        .primaryButton:disabled {
          opacity: .42;
          cursor: not-allowed;
        }

        .right {
          padding: 20px;
        }

        .rightEyebrow {
          margin: 0 0 7px;
          color: #10f3ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: .13em;
        }

        .right h2 {
          margin: 0 0 15px;
          font-size: 20px;
        }

        .detail,
        .infoCard {
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 13px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.08);
        }

        .detail {
          display: grid;
          gap: 4px;
        }

        .detail strong {
          color: rgba(255,255,255,.55);
          font-size: 10px;
        }

        .detail span {
          font-size: 11px;
        }

        .highlightDetail {
          border-color: rgba(255,210,73,.22);
        }

        .divider {
          height: 1px;
          margin: 20px 0;
          background: rgba(255,255,255,.08);
        }

        .openTitle {
          color: #ffd249;
        }

        .infoCard p {
          margin: 0;
          color: rgba(255,255,255,.58);
          font-size: 10px;
          line-height: 1.5;
        }

        @media(max-width:1150px) {
          .page {
            grid-template-columns: 200px minmax(0,1fr);
          }

          .right {
            grid-column: 1 / -1;
          }
        }

        @media(max-width:850px) {
          .page {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .main {
            padding: 20px;
          }

          .choiceGrid,
          .serviceGrid,
          .availabilityGrid {
            grid-template-columns: 1fr;
          }

          .actionBottom,
          .availabilityHeader {
            align-items: stretch;
            flex-direction: column;
          }

          .primaryButton {
            width: 100%;
          }

          .side .exit {
            margin-top: 20px;
          }
        }
      `}</style>
    </main>
  );
}
