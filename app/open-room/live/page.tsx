"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const WHEREBY_ROOM =
  "https://hire-minds.whereby.com/hireminds-open-room";

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

export default function OpenRoomLivePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(false);

  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");

  const [selectedService, setSelectedService] = useState("");
  const [otherService, setOtherService] = useState("");

  const [message, setMessage] = useState("");
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
    setMessage("");

    const { data: authData, error: authError } =
      await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/login");
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

  function getSelectedServiceLabel() {
    if (selectedService === "other") {
      return otherService.trim() || "Other";
    }

    return (
      SERVICE_OPTIONS.find(
        (service) => service.value === selectedService
      )?.label || ""
    );
  }

  async function handleCheckInAndEnter() {
    if (!selectedService) {
      setMessage("Please select what you are checking in for.");
      return;
    }

    if (selectedService === "other" && !otherService.trim()) {
      setMessage(
        "Please enter the type of meeting or support session."
      );
      return;
    }

    if (!userId) {
      setMessage("We could not verify your HireMinds account.");
      return;
    }

    setCheckingIn(true);
    setMessage("");
    setCheckedIn(false);

    const serviceLabel = getSelectedServiceLabel();
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

      setMessage(
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

      setMessage(
        attendanceError.message ||
          "We could not record your attendance."
      );

      setCheckingIn(false);
      return;
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: fullName,
        email: email,
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
      setRequestMessage(
        "We could not verify your HireMinds account."
      );
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage("");

    const serviceLabel =
      SERVICE_OPTIONS.find(
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
          requestNotes
            ? `Request Notes: ${requestNotes}`
            : "",
        ]
          .filter(Boolean)
          .join("\n"),
      });

    if (error) {
      console.error("Meeting request error:", error);

      setRequestMessage(
        error.message ||
          "We could not submit your meeting request."
      );

      setRequestSubmitting(false);
      return;
    }

    const { error: activityError } = await supabase
      .from("user_activity")
      .insert({
        user_id: userId,
        full_name: fullName,
        email: email,
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
      "✓ Meeting request submitted. Your requested date and time are not confirmed until you receive confirmation."
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
          <p>Loading Career Connect...</p>
        </div>

        <style jsx>{`
          .loadingPage {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #050814;
            color: white;
            font-family: system-ui, Arial, sans-serif;
          }

          .loadingCard {
            padding: 30px;
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.06);
            border: 1px solid rgba(255, 255, 255, 0.12);
          }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      {/* LEFT SIDEBAR */}

      <aside className="side">
        <div>
          <p className="brand">HIREMINDS™</p>
          <h2>CAREER CONNECT</h2>
          <p className="live">● LIVE SERVICES</p>
        </div>

        <button className="active">
          🏠 Career Connect
        </button>

        <button>💬 Live Support</button>
        <button>👥 Networking</button>
        <button>📁 Resources</button>
        <button>💼 Opportunities</button>
        <button>⭐ Highlights</button>

        <button
          className="exit"
          onClick={() => router.push("/profile")}
        >
          🚪 Exit Career Connect
        </button>
      </aside>

      {/* MAIN CONTENT */}

      <section className="main">
        {/* VERY VISIBLE MEETING BANNER */}

        <div className="meetingAlert">
          <div className="meetingArrow">➜</div>

          <div className="meetingAlertText">
            <span>SCHEDULED MEETING?</span>

            <strong>
              YOUR LIVE MEETING IS HERE
            </strong>

            <p>
              Resume Support • 1:1 Career Coaching • Mock Interviews •
              Open Room • Other Scheduled Meetings
            </p>
          </div>

          <a
            href="#career-connect-checkin"
            className="topMeetingButton"
          >
            CHECK IN & JOIN →
          </a>
        </div>

        <p className="eyebrow">
          HireMinds™ Live Career Services
        </p>

        <h1>CAREER CONNECT</h1>

        <p className="tagline">
          Check in. Connect. Keep moving.
        </p>

        <p className="intro">
          Career Connect is your entry point for live HireMinds career
          support. If you already have a scheduled meeting, select the
          service you are attending, check in, and enter the live room.
          If you need an appointment, you can request a meeting below.
        </p>

        {/* PARTICIPANT INFO */}

        <div className="participantBar">
          <div>
            <span>CHECKING IN AS</span>
            <strong>{fullName}</strong>
          </div>

          {referralCode ? (
            <div>
              <span>PROGRAM / CODE</span>
              <strong>{referralCode}</strong>
            </div>
          ) : null}
        </div>

        {/* CHECK-IN */}

        <div
          className="checkInBox"
          id="career-connect-checkin"
        >
          <div className="checkHeader">
            <div>
              <p className="eyebrow">
                Scheduled Meeting Check-In
              </p>

              <h2>What are you here for today?</h2>

              <p>
                Select the service or meeting you are attending. Your
                attendance will be recorded before the live meeting
                room opens.
              </p>
            </div>

            <div className="stepBadge">
              STEP 1
            </div>
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
                    selected
                      ? "selectedService"
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedService(service.value);
                    setMessage("");
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
                  setOtherService(
                    e.target.value
                  )
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
                {getSelectedServiceLabel()}
              </strong>
            </div>
          ) : null}

          {message ? (
            <div className="message">
              {message}
            </div>
          ) : null}

          {checkedIn ? (
            <div className="success">
              ✓ You're checked in. Your live meeting room has been
              opened in a new tab.
            </div>
          ) : null}

          <div className="enterArea">
            <div>
              <p className="eyebrow">
                Step 2
              </p>

              <h3>
                Enter Your Live Meeting
              </h3>

              <p>
                Check in first, then Career Connect will open your
                HireMinds live meeting room.
              </p>
            </div>

            <button
              type="button"
              className="joinBtn"
              onClick={handleCheckInAndEnter}
              disabled={
                checkingIn ||
                !selectedService
              }
            >
              {checkingIn
                ? "Checking In..."
                : "Check In & Enter →"}
            </button>
          </div>
        </div>

        {/* REQUEST MEETING */}

        <div className="requestBox">
          <div className="requestHeader">
            <div>
              <p className="eyebrow">
                Need an Appointment?
              </p>

              <h2>
                Request a Meeting
              </h2>

              <p>
                Request Resume Support, a 1:1 Career Coaching session,
                Mock Interview, Job Search Assistance, or another
                career-support meeting.
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
                  setRequestService(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Select meeting type
                </option>

                <option value="resume_support">
                  Resume Support
                </option>

                <option value="career_coaching">
                  1:1 Career Coaching
                </option>

                <option value="mock_interview">
                  Mock Interview
                </option>

                <option value="job_search_assistance">
                  Job Search Assistance
                </option>

                <option value="other">
                  Other
                </option>
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
                  setRequestDate(
                    e.target.value
                  )
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
                  setRequestTime(
                    e.target.value
                  )
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
                setRequestNotes(
                  e.target.value
                )
              }
              placeholder="Optional notes about what you would like help with."
            />
          </label>

          <div className="requestBottom">
            <p>
              Requested dates and times are subject to confirmation.
            </p>

            <button
              type="button"
              className="requestButton"
              onClick={handleMeetingRequest}
              disabled={requestSubmitting}
            >
              {requestSubmitting
                ? "Submitting..."
                : "Request Meeting →"}
            </button>
          </div>

          {requestMessage ? (
            <div className="requestMessage">
              {requestMessage}
            </div>
          ) : null}
        </div>

        {/* SERVICE INFORMATION */}

        <div className="infoTitle">
          <p className="eyebrow">
            Career Connect
          </p>

          <h2>
            Live support when you need it.
          </h2>
        </div>

        <div className="cards">
          <div>
            <span className="cardIcon">
              📄
            </span>

            <h3>
              Resume Support
            </h3>

            <p>
              Resume reviews, revisions, development, and individual
              guidance.
            </p>
          </div>

          <div>
            <span className="cardIcon">
              🎤
            </span>

            <h3>
              Mock Interviews
            </h3>

            <p>
              Practice answering questions and prepare for upcoming
              interviews.
            </p>
          </div>

          <div>
            <span className="cardIcon">
              💬
            </span>

            <h3>
              Career Coaching
            </h3>

            <p>
              Individual conversations about your goals, job search,
              and next steps.
            </p>
          </div>

          <div>
            <span className="cardIcon">
              🚪
            </span>

            <h3>
              Open Room
            </h3>

            <p>
              Monthly live Q&A, networking, resource drops,
              opportunities, and career conversations.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL */}

      <section className="right">
        <p className="rightEyebrow">
          CAREER CONNECT
        </p>

        <h2>
          Today's Check-In
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

        <div className="detail">
          <strong>
            Service
          </strong>

          <span>
            {selectedService
              ? getSelectedServiceLabel()
              : "Select a service"}
          </span>
        </div>

        <div className="meetingRoomCard">
          <span>
            LIVE MEETING ROOM
          </span>

          <strong>
            HireMinds Career Connect
          </strong>

          <p>
            Resume Support, 1:1 meetings, Mock Interviews, Open Room,
            and other scheduled live services use the Career Connect
            meeting room.
          </p>

          <a
            href="#career-connect-checkin"
          >
            Check In to Enter →
          </a>
        </div>

        <div className="divider" />

        <h2 className="openRoomTitle">
          Open Room
        </h2>

        <p className="openRoomText">
          Open Room remains the monthly HireMinds live community
          session available through Career Connect.
        </p>

        <div className="detail">
          <strong>
            Schedule
          </strong>

          <span>
            Last Tuesday monthly
          </span>
        </div>

        <div className="detail">
          <strong>
            Time
          </strong>

          <span>
            6:00 PM – 7:00 PM
          </span>
        </div>

        <div className="detail">
          <strong>
            Doors Open
          </strong>

          <span>
            5:50 PM
          </span>
        </div>

        <div className="detail closeDetail">
          <strong>
            Doors Close
          </strong>

          <span>
            6:15 PM
          </span>
        </div>

        <div className="openNote">
          <strong>
            Open Room
          </strong>

          <p>
            Live Q&A, networking, resource drops, opportunities,
            career conversations, and HireMinds community support.
          </p>
        </div>
      </section>

      <style jsx>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        .page {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 235px minmax(0, 1fr) 330px;
          gap: 22px;
          padding: 26px;

          background:
            radial-gradient(
              circle at top right,
              rgba(0, 229, 255, 0.11),
              transparent 28%
            ),
            radial-gradient(
              circle at bottom left,
              rgba(59, 130, 246, 0.08),
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
          border-radius: 26px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* SIDEBAR */

        .side {
          display: flex;
          flex-direction: column;
          gap: 11px;
          padding: 22px;
        }

        .brand {
          margin: 0 0 7px;
          color: #10f3ff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.14em;
        }

        .side h2 {
          margin: 0;
          font-size: 21px;
        }

        .live {
          margin: 8px 0 20px;
          color: #3cff82;
          font-size: 12px;
          font-weight: 900;
        }

        .side button {
          width: 100%;
          padding: 13px 14px;
          border-radius: 14px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.045);
          color: white;
          font-size: 13px;
          font-weight: 750;
          text-align: left;
          cursor: pointer;
        }

        .side .active {
          background: rgba(0, 229, 255, 0.13);
          border-color: rgba(16, 243, 255, 0.25);
          color: #10f3ff;
        }

        .side .exit {
          margin-top: auto;
          color: #ff8b8b;
          border-color: rgba(255, 116, 116, 0.25);
        }

        /* MAIN */

        .main {
          min-width: 0;
          padding: 32px;
        }

        /* TOP MEETING ALERT */

        .meetingAlert {
          display: flex;
          align-items: center;
          gap: 17px;
          margin-bottom: 30px;
          padding: 19px 20px;
          border-radius: 20px;

          background:
            linear-gradient(
              135deg,
              rgba(16, 243, 255, 0.16),
              rgba(255, 210, 73, 0.08)
            ),
            rgba(255, 255, 255, 0.04);

          border: 2px solid rgba(16, 243, 255, 0.4);

          box-shadow:
            0 0 40px rgba(16, 243, 255, 0.09);
        }

        .meetingArrow {
          flex-shrink: 0;
          color: #ffd249;
          font-size: 43px;
          line-height: 1;
          font-weight: 950;
        }

        .meetingAlertText {
          flex: 1;
          display: grid;
          gap: 5px;
        }

        .meetingAlertText span {
          color: #10f3ff;
          font-size: 10px;
          font-weight: 950;
          letter-spacing: 0.15em;
        }

        .meetingAlertText strong {
          color: white;
          font-size: 18px;
          font-weight: 950;
        }

        .meetingAlertText p {
          margin: 0;
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          line-height: 1.5;
        }

        .topMeetingButton {
          flex-shrink: 0;
          padding: 14px 20px;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #10f3ff,
            #ffd249
          );
          color: #06111f;
          text-decoration: none;
          font-size: 12px;
          font-weight: 950;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #10f3ff;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(3rem, 6vw, 5.5rem);
          line-height: 0.95;
          letter-spacing: -0.04em;
          color: #10f3ff;
        }

        .tagline {
          margin: 14px 0 0;
          color: #ffd249;
          font-size: 18px;
          font-weight: 850;
        }

        .intro {
          max-width: 800px;
          margin: 14px 0 0;
          color: rgba(255, 255, 255, 0.76);
          line-height: 1.7;
          font-size: 15px;
        }

        /* PARTICIPANT */

        .participantBar {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 25px;
        }

        .participantBar div {
          min-width: 180px;
          padding: 12px 15px;
          border-radius: 13px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.09);
          display: grid;
          gap: 4px;
        }

        .participantBar span {
          color: rgba(255, 255, 255, 0.5);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .participantBar strong {
          font-size: 13px;
        }

        /* CHECK IN */

        .checkInBox {
          scroll-margin-top: 25px;
          margin: 26px 0 36px;
          padding: 26px;
          border-radius: 24px;

          background:
            linear-gradient(
              135deg,
              rgba(0, 229, 255, 0.07),
              rgba(255, 210, 73, 0.035)
            ),
            rgba(255, 255, 255, 0.035);

          border: 1px solid rgba(0, 229, 255, 0.17);
        }

        .checkHeader {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 20px;
        }

        .checkHeader h2 {
          margin: 0 0 7px;
          font-size: 27px;
        }

        .checkHeader p:not(.eyebrow) {
          margin: 0;
          color: rgba(255, 255, 255, 0.68);
          line-height: 1.55;
          font-size: 14px;
        }

        .stepBadge {
          flex-shrink: 0;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(16, 243, 255, 0.1);
          border: 1px solid rgba(16, 243, 255, 0.2);
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
        }

        .serviceGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 11px;
        }

        .serviceCard {
          width: 100%;
          display: flex;
          gap: 12px;
          align-items: flex-start;
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.18);
          color: white;
          text-align: left;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .serviceCard:hover {
          border-color: rgba(16, 243, 255, 0.3);
        }

        .selectedService {
          background: rgba(16, 243, 255, 0.09);
          border-color: rgba(16, 243, 255, 0.48);
        }

        .radio {
          width: 22px;
          height: 22px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #06111f;
          font-size: 12px;
          font-weight: 900;
        }

        .selectedService .radio {
          background: #10f3ff;
          border-color: #10f3ff;
        }

        .serviceCard strong {
          display: block;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .serviceCard p {
          margin: 0;
          color: rgba(255, 255, 255, 0.58);
          line-height: 1.45;
          font-size: 11px;
        }

        .otherWrap {
          display: grid;
          gap: 8px;
          margin-top: 16px;
        }

        .otherWrap label {
          color: rgba(255, 255, 255, 0.72);
          font-size: 12px;
          font-weight: 700;
        }

        .otherWrap input {
          width: 100%;
          padding: 13px 15px;
          border-radius: 13px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          background: rgba(0, 0, 0, 0.28);
          color: white;
          outline: none;
        }

        .selectionConfirmation {
          margin-top: 16px;
          padding: 13px 15px;
          border-radius: 13px;
          background: rgba(255, 210, 73, 0.07);
          border: 1px solid rgba(255, 210, 73, 0.15);
          display: grid;
          gap: 3px;
        }

        .selectionConfirmation span {
          color: rgba(255, 255, 255, 0.48);
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .selectionConfirmation strong {
          color: #ffd249;
          font-size: 14px;
        }

        .message {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(255, 90, 90, 0.08);
          border: 1px solid rgba(255, 90, 90, 0.2);
          color: #ffaaaa;
          font-size: 12px;
        }

        .success {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(60, 255, 130, 0.08);
          border: 1px solid rgba(60, 255, 130, 0.2);
          color: #8dffb5;
          font-size: 12px;
          font-weight: 700;
        }

        .enterArea {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          margin-top: 22px;
          padding-top: 20px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }

        .enterArea h3 {
          margin: 0 0 5px;
          font-size: 18px;
        }

        .enterArea p:not(.eyebrow) {
          margin: 0;
          color: rgba(255, 255, 255, 0.58);
          font-size: 12px;
        }

        .joinBtn {
          flex-shrink: 0;
          padding: 14px 21px;
          border: none;
          border-radius: 999px;
          background: linear-gradient(
            135deg,
            #10f3ff,
            #ffd249
          );
          color: #06111f;
          font-size: 13px;
          font-weight: 950;
          cursor: pointer;
        }

        .joinBtn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* REQUEST MEETING */

        .requestBox {
          margin: 0 0 36px;
          padding: 26px;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .requestHeader {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 20px;
        }

        .requestHeader h2 {
          margin: 0 0 7px;
          font-size: 26px;
        }

        .requestHeader p:not(.eyebrow) {
          margin: 0;
          max-width: 720px;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.6;
          font-size: 13px;
        }

        .requestBadge {
          height: fit-content;
          padding: 8px 11px;
          border-radius: 999px;
          background: rgba(255, 210, 73, 0.08);
          border: 1px solid rgba(255, 210, 73, 0.2);
          color: #ffd249;
          font-size: 10px;
          font-weight: 900;
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

        .requestGrid label span,
        .requestNotes span {
          color: rgba(255, 255, 255, 0.68);
          font-size: 11px;
          font-weight: 800;
        }

        .requestGrid select,
        .requestGrid input,
        .requestNotes textarea {
          width: 100%;
          padding: 13px 14px;
          border-radius: 13px;
          border: 1px solid rgba(255, 255, 255, 0.13);
          background: #0a0e18;
          color: #ffffff;
          outline: none;
        }

        .requestGrid select option {
          background: #0a0e18;
          color: white;
        }

        .requestNotes {
          margin-top: 14px;
        }

        .requestNotes textarea {
          min-height: 90px;
          resize: vertical;
        }

        .requestBottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-top: 16px;
        }

        .requestBottom p {
          margin: 0;
          color: rgba(255, 255, 255, 0.54);
          font-size: 11px;
        }

        .requestButton {
          padding: 13px 20px;
          border: 1px solid rgba(16, 243, 255, 0.26);
          border-radius: 999px;
          background: rgba(16, 243, 255, 0.1);
          color: #10f3ff;
          font-weight: 900;
          cursor: pointer;
        }

        .requestButton:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .requestMessage {
          margin-top: 14px;
          padding: 12px 14px;
          border-radius: 12px;
          background: rgba(60, 255, 130, 0.07);
          border: 1px solid rgba(60, 255, 130, 0.16);
          color: #a7f3c2;
          font-size: 12px;
          line-height: 1.5;
        }

        /* SERVICE CARDS */

        .infoTitle {
          margin-bottom: 16px;
        }

        .infoTitle h2 {
          margin: 0;
          font-size: 25px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 13px;
        }

        .cards > div {
          padding: 18px;
          border-radius: 18px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .cardIcon {
          font-size: 20px;
        }

        .cards h3 {
          margin: 10px 0 6px;
          font-size: 15px;
        }

        .cards p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          line-height: 1.55;
          font-size: 12px;
        }

        /* RIGHT */

        .right {
          padding: 22px;
        }

        .rightEyebrow {
          margin: 0 0 7px;
          color: #10f3ff;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .right h2 {
          margin: 0 0 17px;
          font-size: 20px;
        }

        .detail {
          display: grid;
          gap: 5px;
          margin-bottom: 10px;
          padding: 13px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .detail strong {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.54);
        }

        .detail span {
          color: white;
          font-size: 12px;
          line-height: 1.4;
        }

        .meetingRoomCard {
          margin-top: 18px;
          padding: 17px;
          border-radius: 16px;
          background: rgba(16, 243, 255, 0.07);
          border: 1px solid rgba(16, 243, 255, 0.18);
          display: grid;
          gap: 7px;
        }

        .meetingRoomCard span {
          color: #10f3ff;
          font-size: 9px;
          font-weight: 900;
          letter-spacing: 0.12em;
        }

        .meetingRoomCard strong {
          font-size: 14px;
        }

        .meetingRoomCard p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 11px;
          line-height: 1.5;
        }

        .meetingRoomCard a {
          margin-top: 5px;
          color: #ffd249;
          text-decoration: none;
          font-size: 11px;
          font-weight: 900;
        }

        .divider {
          height: 1px;
          margin: 22px 0;
          background: rgba(255, 255, 255, 0.09);
        }

        .openRoomTitle {
          color: #ffd249;
        }

        .openRoomText {
          margin: -8px 0 15px;
          color: rgba(255, 255, 255, 0.62);
          line-height: 1.55;
          font-size: 12px;
        }

        .closeDetail {
          border-color: rgba(255, 210, 73, 0.18);
        }

        .openNote {
          margin-top: 15px;
          padding: 15px;
          border-radius: 15px;
          background: rgba(255, 210, 73, 0.055);
          border: 1px solid rgba(255, 210, 73, 0.14);
        }

        .openNote strong {
          color: #ffd249;
          font-size: 12px;
        }

        .openNote p {
          margin: 6px 0 0;
          color: rgba(255, 255, 255, 0.62);
          line-height: 1.5;
          font-size: 11px;
        }

        /* RESPONSIVE */

        @media (max-width: 1200px) {
          .page {
            grid-template-columns: 210px minmax(0, 1fr);
          }

          .right {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 850px) {
          .page {
            grid-template-columns: 1fr;
            padding: 14px;
          }

          .side,
          .main,
          .right {
            border-radius: 20px;
          }

          .main {
            padding: 22px;
          }

          .meetingAlert {
            align-items: stretch;
            flex-direction: column;
          }

          .meetingArrow {
            transform: rotate(90deg);
            width: fit-content;
          }

          .topMeetingButton {
            text-align: center;
          }

          .serviceGrid,
          .cards,
          .requestGrid {
            grid-template-columns: 1fr;
          }

          .enterArea,
          .requestBottom {
            align-items: stretch;
            flex-direction: column;
          }

          .joinBtn,
          .requestButton {
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
