"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const WHEREBY_ROOM =
  "https://hire-minds.whereby.com/hireminds-open-room";

type VisitMode = "attend" | "request" | "";

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

export default function OpenRoomLivePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [visitMode, setVisitMode] = useState<VisitMode>("");

  const [selectedService, setSelectedService] = useState("");
  const [otherService, setOtherService] = useState("");

  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);

  const [requestService, setRequestService] = useState("");
  const [requestDate, setRequestDate] = useState("");
  const [requestTime, setRequestTime] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    loadParticipant();
  }, []);

  async function loadParticipant() {
    setLoading(true);

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/sign-in");
      return;
    }

    const user = authData.user;

    setUserId(user.id);
    setEmail(user.email || "");

    const { data: profile, error: profileError } = await supabase
      .from("candidate_profiles")
      .select("full_name, email, referral_code")
      .eq("user_id", user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Profile error:", profileError);
    }

    setFullName(
      profile?.full_name ||
        user.user_metadata?.full_name ||
        user.email ||
        "Participant"
    );

    setEmail(profile?.email || user.email || "");

    setReferralCode(
      profile?.referral_code ||
        user.user_metadata?.referral_code ||
        ""
    );

    setLoading(false);
  }

  function getServiceLabel(value: string) {
    if (value === "other") {
      return otherService.trim() || "Other";
    }

    return (
      SERVICE_OPTIONS.find((service) => service.value === value)?.label || ""
    );
  }

  function chooseMode(mode: VisitMode) {
    setVisitMode(mode);

    setCheckInMessage("");
    setRequestMessage("");
    setCheckedIn(false);

    if (mode === "attend") {
      setRequestService("");
      setRequestDate("");
      setRequestTime("");
      setRequestNotes("");
    }

    if (mode === "request") {
      setSelectedService("");
      setOtherService("");
    }
  }

  async function handleCheckInAndEnter() {
    if (!selectedService) {
      setCheckInMessage("Please select the session you are attending.");
      return;
    }

    if (selectedService === "other" && !otherService.trim()) {
      setCheckInMessage(
        "Please enter the type of meeting or support session."
      );
      return;
    }

    if (!userId) {
      setCheckInMessage("We could not verify your HireMinds account.");
      return;
    }

    setCheckingIn(true);
    setCheckInMessage("");
    setCheckedIn(false);

    const serviceLabel = getServiceLabel(selectedService);
    const now = new Date();

    const { data: session, error: sessionError } = await supabase
      .from("workforce_sessions")
      .insert({
        service_type: selectedService,
        session_title: serviceLabel,
        referral_code: referralCode || null,
        session_date: now.toISOString().slice(0, 10),
        start_time: now.toISOString(),
        location_type: "virtual",
        meeting_link: WHEREBY_ROOM,
        created_by: userId,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      console.error("Session error:", sessionError);

      setCheckInMessage(
        sessionError?.message ||
          "We could not record your check-in. Please try again."
      );

      setCheckingIn(false);
      return;
    }

    const { error: attendanceError } = await supabase
      .from("workforce_attendance")
      .insert({
        session_id: session.id,
        user_id: userId,
        participant_name: fullName,
        participant_email: email,
        referral_code: referralCode || null,
        status: "checked_in",
        check_in_time: now.toISOString(),
      });

    if (attendanceError) {
      console.error("Attendance error:", attendanceError);

      setCheckInMessage(
        attendanceError.message || "We could not record your attendance."
      );

      setCheckingIn(false);
      return;
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        referral_code: referralCode || null,
        event_type: "workforce_service_check_in",
        tool_name: serviceLabel,
        page_name: "career-connect",
      });

    if (activityError) {
      console.error("Activity tracking error:", activityError);
    }

    setCheckedIn(true);
    setCheckingIn(false);

    window.open(
      WHEREBY_ROOM,
      "_blank",
      "noopener,noreferrer"
    );
  }

  async function handleMeetingRequest() {
    if (!requestService) {
      setRequestMessage(
        "Please select the type of meeting you are requesting."
      );
      return;
    }

    if (!requestDate) {
      setRequestMessage("Please select your preferred date.");
      return;
    }

    if (!requestTime) {
      setRequestMessage("Please select your preferred time.");
      return;
    }

    if (!userId) {
      setRequestMessage("We could not verify your HireMinds account.");
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage("");

    const serviceLabel =
      REQUEST_OPTIONS.find(
        (service) => service.value === requestService
      )?.label || requestService;

    const requestedStart = new Date(
      `${requestDate}T${requestTime}:00`
    );

    const { error } = await supabase
      .from("workforce_sessions")
      .insert({
        service_type: requestService,
        session_title: `Meeting Request - ${serviceLabel}`,
        referral_code: referralCode || null,
        session_date: requestDate,
        start_time: requestedStart.toISOString(),
        location_type: "virtual",
        meeting_link: WHEREBY_ROOM,
        created_by: userId,
        notes: [
          "STATUS: REQUESTED",
          `Participant: ${fullName}`,
          `Email: ${email}`,
          `Referral Code: ${referralCode || "Not Assigned"}`,
          requestNotes ? `Request Notes: ${requestNotes}` : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });

    if (error) {
      console.error("Meeting request error:", error);

      setRequestMessage(
        error.message || "We could not submit your meeting request."
      );

      setRequestSubmitting(false);
      return;
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: fullName,
        email,
        referral_code: referralCode || null,
        event_type: "meeting_requested",
        tool_name: serviceLabel,
        page_name: "career-connect",
      });

    if (activityError) {
      console.error(
        "Meeting request activity error:",
        activityError
      );
    }

    setRequestMessage(
      "✓ Meeting request submitted. Your requested date and time are pending confirmation."
    );

    setRequestService("");
    setRequestDate("");
    setRequestTime("");
    setRequestNotes("");

    setRequestSubmitting(false);
  }

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
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <aside className="side">
        <p className="brand">HIREMINDS™</p>

        <h2>CAREER CONNECT</h2>

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
          onClick={() => router.push("/profile")}
        >
          🚪 Exit Career Connect
        </button>
      </aside>

      <section className="main">
        <div className="meetingAlert">
          <div className="meetingArrow">
            ➜
          </div>

          <div className="meetingAlertText">
            <span>CAREER CONNECT</span>

            <strong>
              Live career support starts here.
            </strong>

            <p>
              Attend a scheduled session or request a meeting with
              HireMinds.
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
            <span>PARTICIPANT</span>

            <strong>
              {fullName}
            </strong>
          </div>

          <div>
            <span>PROGRAM / CODE</span>

            <strong>
              {referralCode || "Not Assigned"}
            </strong>
          </div>
        </div>

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
                visitMode === "attend"
                  ? "mainChoiceActive"
                  : ""
              }`}
              onClick={() =>
                chooseMode("attend")
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
                  Check in for Resume Support, Career Coaching, a Mock
                  Interview, Workforce Training, Job Search Assistance,
                  Open Room, or another scheduled session.
                </p>
              </div>
            </button>

            <button
              type="button"
              className={`mainChoice ${
                visitMode === "request"
                  ? "mainChoiceActive"
                  : ""
              }`}
              onClick={() =>
                chooseMode("request")
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
                  Request Resume Support, Career Coaching, a Mock
                  Interview, Job Search Assistance, or another
                  career-support meeting.
                </p>
              </div>
            </button>
          </div>
        </section>

        {visitMode === "attend" ? (
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
                  Select your session, then check in and enter the live
                  meeting room.
                </p>
              </div>

              <span className="stepBadge">
                CHECK IN
              </span>
            </div>

            <div className="serviceGrid">
              {SERVICE_OPTIONS.map((service) => {
                const selected =
                  selectedService === service.value;

                return (
                  <button
                    key={service.value}
                    type="button"
                    className={`serviceCard ${
                      selected ? "selectedService" : ""
                    }`}
                    onClick={() => {
                      setSelectedService(service.value);
                      setCheckInMessage("");
                      setCheckedIn(false);
                    }}
                  >
                    <div className="radio">
                      {selected ? "✓" : ""}
                    </div>

                    <div>
                      <strong>
                        {service.label}
                      </strong>

                      <p>
                        {service.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedService === "other" ? (
              <div className="otherWrap">
                <label>
                  What type of meeting or support are you attending?
                </label>

                <input
                  value={otherService}
                  onChange={(e) =>
                    setOtherService(e.target.value)
                  }
                  placeholder="Example: Career planning meeting"
                />
              </div>
            ) : null}

            {selectedService ? (
              <div className="selectionConfirmation">
                <span>
                  YOU SELECTED
                </span>

                <strong>
                  {getServiceLabel(selectedService)}
                </strong>
              </div>
            ) : null}

            {checkInMessage ? (
              <div className="errorMessage">
                {checkInMessage}
              </div>
            ) : null}

            {checkedIn ? (
              <div className="successMessage">
                ✓ You&apos;re checked in. Your live meeting room opened
                in a new tab.
              </div>
            ) : null}

            <div className="actionBottom">
              <div>
                <strong>
                  Ready to join?
                </strong>

                <p>
                  Your attendance is recorded when you check in.
                </p>
              </div>

              <button
                type="button"
                className="primaryButton"
                onClick={handleCheckInAndEnter}
                disabled={
                  checkingIn ||
                  !selectedService
                }
              >
                {checkingIn
                  ? "Checking In..."
                  : "Check In & Enter Meeting →"}
              </button>
            </div>
          </section>
        ) : null}

        {visitMode === "request" ? (
          <section className="contentBox requestBox">
            <div className="contentHeader">
              <div>
                <p className="eyebrow">
                  Meeting Request
                </p>

                <h2>
                  Request a Meeting
                </h2>

                <p>
                  Tell us what type of support you need and your
                  preferred date and time.
                </p>
              </div>

              <span className="requestBadge">
                REQUEST
              </span>
            </div>

            <div className="requestGrid">
              <label>
                <span>
                  Meeting Type
                </span>

                <select
                  value={requestService}
                  onChange={(e) =>
                    setRequestService(e.target.value)
                  }
                >
                  <option value="">
                    Select meeting type
                  </option>

                  {REQUEST_OPTIONS.map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>
                  Preferred Date
                </span>

                <input
                  type="date"
                  value={requestDate}
                  onChange={(e) =>
                    setRequestDate(e.target.value)
                  }
                />
              </label>

              <label>
                <span>
                  Preferred Time
                </span>

                <input
                  type="time"
                  value={requestTime}
                  onChange={(e) =>
                    setRequestTime(e.target.value)
                  }
                />
              </label>
            </div>

            <label className="requestNotes">
              <span>
                Anything we should know?
              </span>

              <textarea
                value={requestNotes}
                onChange={(e) =>
                  setRequestNotes(e.target.value)
                }
                placeholder="Optional notes about what you would like help with."
              />
            </label>

            {requestMessage ? (
              <div
                className={
                  requestMessage.startsWith("✓")
                    ? "successMessage"
                    : "errorMessage"
                }
              >
                {requestMessage}
              </div>
            ) : null}

            <div className="actionBottom">
              <div>
                <strong>
                  Request status
                </strong>

                <p>
                  Your preferred date and time are not confirmed until
                  HireMinds approves the request.
                </p>
              </div>

              <button
                type="button"
                className="primaryButton"
                onClick={handleMeetingRequest}
                disabled={requestSubmitting}
              >
                {requestSubmitting
                  ? "Submitting..."
                  : "Submit Meeting Request →"}
              </button>
            </div>
          </section>
        ) : null}
      </section>

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
            {referralCode || "Not Assigned"}
          </span>
        </div>

        <div className="detail">
          <strong>
            Your Selection
          </strong>

          <span>
            {visitMode === "attend"
              ? "Attend Scheduled Session"
              : visitMode === "request"
                ? "Request a Meeting"
                : "Choose an option"}
          </span>
        </div>

        {visitMode === "attend" &&
        selectedService ? (
          <div className="detail highlightDetail">
            <strong>
              Session
            </strong>

            <span>
              {getServiceLabel(selectedService)}
            </span>
          </div>
        ) : null}

        <div className="infoCard">
          <strong>
            Scheduled session?
          </strong>

          <p>
            Choose the attendance option, select your session, then
            check in and enter.
          </p>
        </div>

        <div className="infoCard">
          <strong>
            Need support?
          </strong>

          <p>
            Choose Request a Meeting and submit your preferred date and
            time.
          </p>
        </div>
      </aside>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 220px minmax(0, 1fr) 310px;
          gap: 20px;
          padding: 22px;

          background:
            radial-gradient(
              circle at top right,
              rgba(0, 229, 255, 0.1),
              transparent 28%
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
            rgba(
              255,
              255,
              255,
              0.04
            );

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.09
            );
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
          letter-spacing: 0.14em;
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
            1px solid rgba(
              255,
              255,
              255,
              0.09
            );

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          color: white;
          text-align: left;
          font-weight: 750;
          cursor: pointer;
        }

        .side .active {
          color: #10f3ff;

          background:
            rgba(
              16,
              243,
              255,
              0.08
            );

          border-color:
            rgba(
              16,
              243,
              255,
              0.2
            );
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
              rgba(
                16,
                243,
                255,
                0.12
              ),
              rgba(
                255,
                210,
                73,
                0.04
              )
            );

          border:
            1px solid rgba(
              16,
              243,
              255,
              0.25
            );
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
          letter-spacing: 0.14em;
        }

        .meetingAlertText strong {
          font-size: 15px;
        }

        .meetingAlertText p {
          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.64
            );

          font-size: 11px;
        }

        .eyebrow {
          margin: 0 0 7px;
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.13em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          color: #10f3ff;
          font-size: clamp(2.8rem, 5vw, 5rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
        }

        .tagline {
          margin: 13px 0 0;
          color: #ffd249;
          font-weight: 850;
        }

        .intro {
          max-width: 800px;

          color:
            rgba(
              255,
              255,
              255,
              0.72
            );

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
            rgba(
              255,
              255,
              255,
              0.04
            );

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.08
            );

          display: grid;
          gap: 3px;
        }

        .participantBar span {
          color:
            rgba(
              255,
              255,
              255,
              0.48
            );

          font-size: 8px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .participantBar strong {
          font-size: 12px;
        }

        .choiceBox,
        .contentBox {
          margin-top: 20px;
          padding: 24px;
          border-radius: 22px;

          background:
            rgba(
              255,
              255,
              255,
              0.035
            );

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.09
            );
        }

        .choiceHeader h2,
        .contentHeader h2 {
          margin: 0 0 6px;
          font-size: 25px;
        }

        .choiceHeader p:not(.eyebrow),
        .contentHeader p:not(.eyebrow) {
          margin: 0;

          color:
            rgba(
              255,
              255,
              255,
              0.62
            );

          font-size: 12px;
          line-height: 1.5;
        }

        .choiceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .mainChoice {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 20px;
          border-radius: 17px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.1
            );

          background:
            rgba(
              0,
              0,
              0,
              0.18
            );

          color: white;
          text-align: left;
          cursor: pointer;
        }

        .mainChoiceActive {
          border-color:
            rgba(
              16,
              243,
              255,
              0.48
            );

          background:
            rgba(
              16,
              243,
              255,
              0.08
            );
        }

        .choiceIcon {
          width: 32px;
          height: 32px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;

          border:
            1px solid rgba(
              16,
              243,
              255,
              0.32
            );

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

          color:
            rgba(
              255,
              255,
              255,
              0.58
            );

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

          border:
            1px solid rgba(
              16,
              243,
              255,
              0.25
            );

          background:
            rgba(
              16,
              243,
              255,
              0.08
            );
        }

        .requestBadge {
          color: #ffd249;

          border:
            1px solid rgba(
              255,
              210,
              73,
              0.25
            );

          background:
            rgba(
              255,
              210,
              73,
              0.07
            );
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .serviceCard {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          padding: 14px;
          border-radius: 14px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.09
            );

          background:
            rgba(
              0,
              0,
              0,
              0.16
            );

          color: white;
          text-align: left;
          cursor: pointer;
        }

        .selectedService {
          border-color:
            rgba(
              16,
              243,
              255,
              0.5
            );

          background:
            rgba(
              16,
              243,
              255,
              0.08
            );
        }

        .radio {
          width: 21px;
          height: 21px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.3
            );

          flex-shrink: 0;
          font-size: 11px;
        }

        .selectedService .radio {
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

          color:
            rgba(
              255,
              255,
              255,
              0.55
            );

          font-size: 10px;
          line-height: 1.45;
        }

        .otherWrap {
          display: grid;
          gap: 7px;
          margin-top: 14px;
        }

        .otherWrap label,
        .requestGrid span,
        .requestNotes span {
          color:
            rgba(
              255,
              255,
              255,
              0.67
            );

          font-size: 11px;
          font-weight: 800;
        }

        .otherWrap input,
        .requestGrid select,
        .requestGrid input,
        .requestNotes textarea {
          width: 100%;
          padding: 12px 13px;
          border-radius: 12px;

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.12
            );

          background: #090d17;
          color: white;
          outline: none;
        }

        .requestGrid select option {
          background: #090d17;
          color: white;
        }

        .selectionConfirmation {
          margin-top: 14px;
          padding: 12px 13px;
          border-radius: 12px;

          background:
            rgba(
              255,
              210,
              73,
              0.06
            );

          border:
            1px solid rgba(
              255,
              210,
              73,
              0.15
            );

          display: grid;
          gap: 3px;
        }

        .selectionConfirmation span {
          color:
            rgba(
              255,
              255,
              255,
              0.45
            );

          font-size: 8px;
          font-weight: 900;
        }

        .selectionConfirmation strong {
          color: #ffd249;
          font-size: 12px;
        }

        .requestGrid {
          display: grid;
          grid-template-columns: 1.4fr 1fr 1fr;
          gap: 12px;
        }

        .requestGrid label,
        .requestNotes {
          display: grid;
          gap: 7px;
        }

        .requestNotes {
          margin-top: 14px;
        }

        .requestNotes textarea {
          min-height: 100px;
          resize: vertical;
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

          background:
            rgba(
              255,
              90,
              90,
              0.07
            );

          border:
            1px solid rgba(
              255,
              90,
              90,
              0.18
            );
        }

        .successMessage {
          color: #a8f5c3;

          background:
            rgba(
              60,
              255,
              130,
              0.07
            );

          border:
            1px solid rgba(
              60,
              255,
              130,
              0.18
            );
        }

        .actionBottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-top: 20px;
          padding-top: 18px;

          border-top:
            1px solid rgba(
              255,
              255,
              255,
              0.07
            );
        }

        .actionBottom strong {
          font-size: 13px;
        }

        .actionBottom p {
          margin: 4px 0 0;

          color:
            rgba(
              255,
              255,
              255,
              0.52
            );

          font-size: 10px;
        }

        .primaryButton {
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

        .primaryButton:disabled {
          opacity: 0.42;
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
          letter-spacing: 0.13em;
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

          background:
            rgba(
              255,
              255,
              255,
              0.04
            );

          border:
            1px solid rgba(
              255,
              255,
              255,
              0.08
            );
        }

        .detail {
          display: grid;
          gap: 4px;
        }

        .detail strong,
        .infoCard strong {
          color:
            rgba(
              255,
              255,
              255,
              0.55
            );

          font-size: 10px;
        }

        .detail span {
          font-size: 11px;
        }

        .highlightDetail {
          border-color:
            rgba(
              255,
              210,
              73,
              0.22
            );
        }

        .infoCard {
          margin-top: 14px;
        }

        .infoCard p {
          margin: 6px 0 0;

          color:
            rgba(
              255,
              255,
              255,
              0.58
            );

          font-size: 10px;
          line-height: 1.5;
        }

        @media (max-width: 1150px) {
          .page {
            grid-template-columns: 200px minmax(0, 1fr);
          }

          .right {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 800px) {
          .page {
            grid-template-columns: 1fr;
            padding: 12px;
          }

          .main {
            padding: 20px;
          }

          .choiceGrid,
          .serviceGrid,
          .requestGrid {
            grid-template-columns: 1fr;
          }

          .actionBottom {
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
