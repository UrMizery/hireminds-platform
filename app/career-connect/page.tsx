"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type VisitMode = "attend" | "request" | "";

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
  participant_confirmed_at?: string | null;
  created_at?: string | null;
};

type MeetingChoice = {
  id: string;
  request_id: string;
  slot_id: string;
  preference_order: number;
};

const SERVICE_OPTIONS = [
  { value: "resume_support", label: "Resume Support", description: "Resume review, revisions, development, and recommendations." },
  { value: "cover_letter_review", label: "Cover Letter Review", description: "Review your cover letter for clarity, relevance, and presentation." },
  { value: "career_coaching", label: "1:1 Career Coaching", description: "Individual career planning, preparation, and support." },
  { value: "mock_interview", label: "Mock Interview", description: "Practice questions, answers, and interview preparation." },
  { value: "workforce_training", label: "Workforce Development Training", description: "A scheduled HireMinds workforce-development session." },
  { value: "job_search_assistance", label: "Job Search Assistance", description: "Job-search guidance, opportunities, and application support." },
  { value: "other", label: "Other", description: "Another scheduled HireMinds career-support service." },
];

const REQUEST_OPTIONS = SERVICE_OPTIONS.filter((item) => item.value !== "workforce_training");
const FALLBACK_MEETING_LINK = "https://hire-minds.whereby.com/hireminds-open-room";

export default function CareerConnectPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [meetingLink, setMeetingLink] = useState(FALLBACK_MEETING_LINK);

  const [visitMode, setVisitMode] = useState<VisitMode>("");
  const [availabilitySlots, setAvailabilitySlots] = useState<AvailabilitySlot[]>([]);
  const [meetingRequests, setMeetingRequests] = useState<MeetingRequest[]>([]);
  const [meetingChoices, setMeetingChoices] = useState<MeetingChoice[]>([]);

  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [otherService, setOtherService] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");

  const [requestService, setRequestService] = useState("");
  const [requestOtherService, setRequestOtherService] = useState("");
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [requestNotes, setRequestNotes] = useState("");
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

  useEffect(() => {
    void loadPage();
  }, []);

  async function loadPage() {
    setLoading(true);

    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError || !authData.user) {
      router.push("/sign-in");
      return;
    }

    const user = authData.user;
    setUserId(user.id);

    const { data: profile } = await supabase
      .from("candidate_profiles")
      .select("full_name,email,referral_code")
      .eq("user_id", user.id)
      .maybeSingle();

    setFullName(profile?.full_name || user.user_metadata?.full_name || user.email || "Participant");
    setEmail(profile?.email || user.email || "");
    setReferralCode(profile?.referral_code || user.user_metadata?.referral_code || "");

    await Promise.all([loadSettings(), loadAvailability(), loadMyMeetings(user.id)]);
    setLoading(false);
  }

  async function loadSettings() {
    const { data, error } = await supabase
      .from("career_connect_settings")
      .select("meeting_link")
      .eq("id", "default")
      .maybeSingle();

    if (!error && data?.meeting_link) setMeetingLink(data.meeting_link);
  }

  async function loadAvailability() {
    const { data, error } = await supabase
      .from("availability_slots")
      .select("id,start_time,end_time,label,booked_request_id")
      .eq("is_active", true)
      .order("start_time", { ascending: true });

    if (error) {
      console.error("Availability load error:", error);
      return;
    }

    setAvailabilitySlots((data as AvailabilitySlot[]) || []);
  }

  async function loadMyMeetings(uid?: string) {
    const id = uid || userId;
    if (!id) return;

    const [requestsResult, choicesResult] = await Promise.all([
      supabase.from("meeting_requests").select("*").eq("user_id", id).order("created_at", { ascending: false }),
      supabase.from("meeting_request_choices").select("*").eq("user_id", id).order("preference_order", { ascending: true }),
    ]);

    if (!requestsResult.error) setMeetingRequests((requestsResult.data as MeetingRequest[]) || []);
    if (!choicesResult.error) setMeetingChoices((choicesResult.data as MeetingChoice[]) || []);
  }

  function getSlot(id?: string | null) {
    if (!id) return undefined;
    return availabilitySlots.find((slot) => slot.id === id);
  }

  function getRequestChoices(requestId: string) {
    return meetingChoices.filter((choice) => choice.request_id === requestId).sort((a, b) => a.preference_order - b.preference_order);
  }

  function formatDate(slot: AvailabilitySlot) {
    return new Date(slot.start_time).toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  function formatTime(value: string | null) {
    if (!value) return "";
    return new Date(value).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  function formatSlot(slot: AvailabilitySlot) {
    return `${formatDate(slot)} • ${formatTime(slot.start_time)}${slot.end_time ? ` – ${formatTime(slot.end_time)}` : ""}`;
  }

  function serviceLabel(value: string, other?: string | null) {
    if (value === "other") return other || "Other";
    return SERVICE_OPTIONS.find((item) => item.value === value)?.label || value;
  }

  const availableAppointmentSlots = useMemo(() => {
    const now = Date.now();
    return availabilitySlots.filter((slot) => !slot.booked_request_id && new Date(slot.start_time).getTime() > now);
  }, [availabilitySlots]);

  const activeMeetingRequests = useMemo(
    () => meetingRequests.filter((request) => !["completed", "declined", "cancelled"].includes(request.status)),
    [meetingRequests]
  );

  function chooseMode(mode: VisitMode) {
    setVisitMode(mode);
    setCheckInMessage("");
    setRequestMessage("");
    window.setTimeout(() => {
      document.getElementById("career-connect-action")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  }

  function toggleScheduledService(value: string) {
    setCheckInMessage("");
    setSelectedServices((previous) =>
      previous.includes(value) ? previous.filter((item) => item !== value) : [...previous, value]
    );
  }

  async function handleCheckInAndEnter() {
    if (!selectedServices.length) {
      setCheckInMessage("Please select at least one service.");
      return;
    }

    if (selectedServices.includes("other") && !otherService.trim()) {
      setCheckInMessage("Please tell us what additional service you are attending.");
      return;
    }

    setCheckingIn(true);
    setCheckInMessage("");

    const now = new Date();
    const selectedLabels = selectedServices.map((service) => serviceLabel(service, otherService));

    const { data: session, error: sessionError } = await supabase
      .from("workforce_sessions")
      .insert({
        service_type: selectedServices[0],
        session_title: selectedLabels.join(" + "),
        referral_code: referralCode || null,
        session_date: now.toISOString().slice(0, 10),
        start_time: now.toISOString(),
        location_type: "virtual",
        meeting_link: meetingLink,
        created_by: userId,
      })
      .select("id")
      .single();

    if (sessionError || !session) {
      setCheckingIn(false);
      setCheckInMessage(sessionError?.message || "Could not check in.");
      return;
    }

    await supabase.from("workforce_session_services").insert(
      selectedServices.map((service) => ({
        session_id: session.id,
        user_id: userId,
        service_type: service,
        service_label: serviceLabel(service, otherService),
      }))
    );

    await supabase.from("workforce_attendance").insert({
      session_id: session.id,
      user_id: userId,
      participant_name: fullName,
      participant_email: email,
      referral_code: referralCode || null,
      status: "checked_in",
      check_in_time: now.toISOString(),
    });

    for (const service of selectedServices) {
      await supabase.from("user_activity").insert({
        user_id: userId,
        full_name: fullName,
        email,
        referral_code: referralCode || null,
        event_type: "workforce_service_check_in",
        tool_name: serviceLabel(service, otherService),
        page_name: "career-connect",
      });
    }

    setCheckingIn(false);
    window.open(meetingLink, "_blank", "noopener,noreferrer");
  }

  function toggleAvailabilitySlot(slotId: string) {
    setRequestMessage("");

    setSelectedSlots((previous) => {
      if (previous.includes(slotId)) return previous.filter((id) => id !== slotId);
      if (previous.length >= 3) {
        setRequestMessage("You can select up to 3 appointment choices.");
        return previous;
      }
      return [...previous, slotId];
    });
  }

  async function handleMeetingRequest() {
    if (!requestService) {
      setRequestMessage("Please select the service you are requesting.");
      return;
    }

    if (requestService === "other" && !requestOtherService.trim()) {
      setRequestMessage("Please tell us what type of support you are requesting.");
      return;
    }

    if (!selectedSlots.length) {
      setRequestMessage("Please select at least one appointment preference.");
      return;
    }

    if (!policyAgreed) {
      setRequestMessage("Please agree to the Scheduling & Cancellation Agreement.");
      return;
    }

    setRequestSubmitting(true);
    setRequestMessage("");

    const { data: request, error: requestError } = await supabase
      .from("meeting_requests")
      .insert({
        user_id: userId,
        participant_name: fullName,
        participant_email: email,
        referral_code: referralCode || null,
        service_type: requestService,
        other_service: requestService === "other" ? requestOtherService.trim() : null,
        notes: requestNotes.trim() || null,
        status: "pending",
        policy_agreed: true,
        policy_agreed_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (requestError || !request) {
      setRequestSubmitting(false);
      setRequestMessage(requestError?.message || "Could not submit request.");
      return;
    }

    const choiceRows = selectedSlots.map((slotId, index) => ({
      request_id: request.id,
      user_id: userId,
      slot_id: slotId,
      preference_order: index + 1,
    }));

    const { error: choiceError } = await supabase.from("meeting_request_choices").insert(choiceRows);

    if (choiceError) {
      setRequestSubmitting(false);
      setRequestMessage(choiceError.message);
      return;
    }

    await supabase.from("user_activity").insert({
      user_id: userId,
      full_name: fullName,
      email,
      referral_code: referralCode || null,
      event_type: "meeting_requested",
      tool_name: REQUEST_OPTIONS.find((item) => item.value === requestService)?.label || requestService,
      page_name: "career-connect",
    });

    setRequestService("");
    setRequestOtherService("");
    setSelectedSlots([]);
    setRequestNotes("");
    setPolicyAgreed(false);
    setRequestSubmitting(false);
    setRequestMessage("✓ Your meeting request was submitted.");

    await Promise.all([loadMyMeetings(), loadAvailability()]);
  }

  async function confirmAppointment(requestId: string) {
    setRequestMessage("");

    const { error } = await supabase.rpc("participant_confirm_meeting", {
      p_request_id: requestId,
    });

    if (error) {
      setRequestMessage(error.message);
      return;
    }

    await supabase.from("user_activity").insert({
      user_id: userId,
      full_name: fullName,
      email,
      referral_code: referralCode || null,
      event_type: "appointment_confirmed",
      tool_name: "Career Connect Appointment",
      page_name: "career-connect",
    });

    setRequestMessage("✓ Your appointment is confirmed.");
    await Promise.all([loadMyMeetings(), loadAvailability()]);
  }

  if (loading) {
    return (
      <main className="loadingPage">
        <div className="loadingMark">HM</div>
        <strong>Loading Career Connect...</strong>

        <style jsx>{`
          .loadingPage { min-height: 100vh; display: flex; flex-direction: column; gap: 14px; align-items: center; justify-content: center; background: #eef3f6; color: #112330; font-family: Inter, Arial, sans-serif; }
          .loadingMark { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 16px; background: #123a52; color: white; font-weight: 950; }
        `}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="shell">
        <button type="button" className="backButton" onClick={() => router.push("/profile")}>← My Profile</button>

        <section className="hero">
          <div>
            <p className="eyebrow">HIREMINDS™ CAREER SERVICES</p>
            <h1>Career <span>& Connect</span></h1>
            <p className="intro">Manage your career-support appointments, request a meeting, or check in and enter a scheduled session.</p>
          </div>

          <div className="participant">
            <span>PARTICIPANT</span>
            <strong>{fullName}</strong>
            <small>{referralCode ? `Referral Code: ${referralCode}` : "HireMinds Career Passport"}</small>
          </div>
        </section>

        {activeMeetingRequests.length > 0 ? (
          <section className="meetings">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">YOUR SCHEDULE</p>
                <h2>My Meetings & Requests</h2>
              </div>
              <button type="button" className="refresh" onClick={async () => { await Promise.all([loadMyMeetings(), loadAvailability()]); }}>Refresh</button>
            </div>

            <div className="meetingList">
              {activeMeetingRequests.map((request) => {
                const confirmedSlot = getSlot(request.confirmed_slot_id);
                const preferences = getRequestChoices(request.id);

                return (
                  <article className="meetingRow" key={request.id}>
                    <div>
                      <span className={`status status-${request.status}`}>{request.status.replaceAll("_", " ")}</span>
                      <strong className="meetingTitle">{serviceLabel(request.service_type, request.other_service)}</strong>

                      {request.status === "pending" ? <p className="meetingNote">Waiting for HireMinds to approve one of your preferred appointment times.</p> : null}

                      {request.status === "approved" && confirmedSlot ? (
                        <div className="approvedTime"><span>APPROVED APPOINTMENT</span><strong>{formatSlot(confirmedSlot)}</strong></div>
                      ) : null}

                      {request.status === "confirmed" && confirmedSlot ? (
                        <div className="approvedTime confirmedTime"><span>CONFIRMED APPOINTMENT</span><strong>{formatSlot(confirmedSlot)}</strong></div>
                      ) : null}

                      {request.status === "pending" && preferences.length > 0 ? (
                        <div className="preferenceLine">
                          {preferences.map((choice) => {
                            const slot = getSlot(choice.slot_id);
                            return <span key={choice.id}>{choice.preference_order}. {slot ? formatSlot(slot) : "Time unavailable"}</span>;
                          })}
                        </div>
                      ) : null}
                    </div>

                    <div className="meetingActions">
                      {request.status === "approved" ? (
                        <button type="button" className="primarySmall" onClick={() => confirmAppointment(request.id)}>Confirm Appointment</button>
                      ) : null}

                      {request.status === "confirmed" ? (
                        <a className="primarySmall" href={meetingLink} target="_blank" rel="noreferrer">Enter Meeting →</a>
                      ) : null}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        {requestMessage ? <div className={requestMessage.startsWith("✓") ? "message success" : "message"}>{requestMessage}</div> : null}

        <section className="choiceSection">
          <div className="sectionHeader">
            <div>
              <p className="eyebrow">CAREER CONNECT</p>
              <h2>What would you like to do today?</h2>
              <p className="sectionText">Choose the option that matches what you need.</p>
            </div>
          </div>

          <div className="choiceGrid">
            <button type="button" className={`choiceCard ${visitMode === "attend" ? "choiceSelected" : ""}`} onClick={() => chooseMode("attend")}>
              <div className="choiceIcon">✓</div>
              <div>
                <span className="cardEyebrow">SCHEDULED SESSION</span>
                <strong>I have a scheduled session / I&apos;m attending today</strong>
                <p>Check in for Resume Support, Career Coaching, a Mock Interview, Workforce Development Training, Job Search Assistance, or another scheduled service.</p>
              </div>
              <span className="cardArrow">→</span>
            </button>

            <button type="button" className={`choiceCard requestCard ${visitMode === "request" ? "choiceSelected" : ""}`} onClick={() => chooseMode("request")}>
              <div className="choiceIcon plusIcon">+</div>
              <div>
                <span className="cardEyebrow">CAREER SUPPORT</span>
                <strong>I need to request a meeting</strong>
                <p>Request Resume Support, Career Coaching, a Mock Interview, Job Search Assistance, Cover Letter Review, or another career-support service.</p>
              </div>
              <span className="cardArrow">→</span>
            </button>
          </div>
        </section>

        <div id="career-connect-action" />

        {visitMode === "attend" ? (
          <section className="actionPanel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">CHECK IN</p>
                <h2>What are you attending today?</h2>
                <p className="sectionText">Select every service included in your scheduled meeting.</p>
              </div>
            </div>

            <div className="serviceGrid">
              {SERVICE_OPTIONS.map((service) => {
                const selected = selectedServices.includes(service.value);
                return (
                  <button key={service.value} type="button" className={`serviceOption ${selected ? "serviceSelected" : ""}`} onClick={() => toggleScheduledService(service.value)}>
                    <span className="serviceCheck">{selected ? "✓" : ""}</span>
                    <div><strong>{service.label}</strong><p>{service.description}</p></div>
                  </button>
                );
              })}
            </div>

            {selectedServices.includes("other") ? (
              <label className="field"><span>Additional Service</span><input value={otherService} onChange={(e) => setOtherService(e.target.value)} placeholder="Example: Career planning meeting" /></label>
            ) : null}

            {checkInMessage ? <div className="message">{checkInMessage}</div> : null}

            <div className="bottomAction">
              <div><strong>Ready to join?</strong><p>Your selected career services will be recorded when you check in.</p></div>
              <button type="button" className="primaryButton" disabled={checkingIn || selectedServices.length === 0} onClick={handleCheckInAndEnter}>{checkingIn ? "Checking In..." : "Check In & Enter Meeting →"}</button>
            </div>
          </section>
        ) : null}

        {visitMode === "request" ? (
          <section className="actionPanel">
            <div className="sectionHeader">
              <div>
                <p className="eyebrow">MEETING REQUEST</p>
                <h2>Request Career Support</h2>
                <p className="sectionText">Choose the service you need and select up to three preferred appointment times.</p>
              </div>
            </div>

            <label className="field">
              <span>Service Requested</span>
              <select value={requestService} onChange={(e) => setRequestService(e.target.value)}>
                <option value="">Select service</option>
                {REQUEST_OPTIONS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>

            {requestService === "other" ? (
              <label className="field"><span>What type of support do you need?</span><input value={requestOtherService} onChange={(e) => setRequestOtherService(e.target.value)} placeholder="Example: Career planning" /></label>
            ) : null}

            <div className="availability">
              <div className="availabilityTop">
                <div><span className="cardEyebrow">APPOINTMENT PREFERENCES</span><h3>Select up to 3 times</h3><p>These are preferences. Your appointment is not confirmed until HireMinds approves one.</p></div>
                <strong className="counter">{selectedSlots.length}/3</strong>
              </div>

              {availableAppointmentSlots.length === 0 ? (
                <div className="empty">There are currently no appointment times available. Please check back later.</div>
              ) : (
                <div className="slotGrid">
                  {availableAppointmentSlots.map((slot) => {
                    const selected = selectedSlots.includes(slot.id);
                    const preference = selectedSlots.indexOf(slot.id) + 1;
                    return (
                      <button key={slot.id} type="button" className={`slot ${selected ? "slotSelected" : ""}`} onClick={() => toggleAvailabilitySlot(slot.id)}>
                        <span className="slotNumber">{selected ? preference : ""}</span>
                        <div>
                          {selected ? <small>CHOICE {preference}</small> : null}
                          <strong>{formatDate(slot)}</strong>
                          <span>{formatTime(slot.start_time)}{slot.end_time ? ` – ${formatTime(slot.end_time)}` : ""}</span>
                          {slot.label ? <em>{slot.label}</em> : null}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <label className="field"><span>Anything we should know?</span><textarea value={requestNotes} onChange={(e) => setRequestNotes(e.target.value)} placeholder="Optional notes about what you would like help with." /></label>

            <label className="policy">
              <input type="checkbox" checked={policyAgreed} onChange={(e) => setPolicyAgreed(e.target.checked)} />
              <span>I understand my selected times are preferences and my appointment is not confirmed until HireMinds approves one. I will provide at least 48 hours&apos; notice for cancellations or rescheduling whenever possible.</span>
            </label>

            {requestMessage ? <div className={requestMessage.startsWith("✓") ? "message success" : "message"}>{requestMessage}</div> : null}

            <div className="bottomAction">
              <div><strong>Submit your request</strong><p>You&apos;ll see the request above once it is submitted.</p></div>
              <button type="button" className="primaryButton" disabled={requestSubmitting || !policyAgreed} onClick={handleMeetingRequest}>{requestSubmitting ? "Submitting..." : "Submit Meeting Request →"}</button>
            </div>
          </section>
        ) : null}
      </div>

      <style jsx>{`
        * { box-sizing: border-box; }
        .page { min-height: 100vh; padding: 26px 20px 54px; background: radial-gradient(circle at 88% 8%, rgba(31,130,188,.12), transparent 25%), linear-gradient(180deg,#eef3f6 0%,#f8fafb 46%,#fff 100%); color:#101820; font-family:Inter,Arial,Helvetica,sans-serif; }
        .shell { width:min(1240px,100%); margin:0 auto; }
        .backButton { margin-bottom:17px; padding:9px 0; border:none; background:transparent; color:#355365; font-size:12px; font-weight:850; cursor:pointer; }
        .hero { display:flex; justify-content:space-between; align-items:flex-end; gap:28px; padding:42px 46px; border-radius:28px; background:linear-gradient(135deg,#0d1d28 0%,#143d56 67%,#176f9f 140%); color:#fff; box-shadow:0 22px 55px rgba(19,48,67,.18); }
        .eyebrow,.cardEyebrow { margin:0; color:#61b7e6; font-size:10px; font-weight:950; letter-spacing:.15em; }
        h1 { margin:8px 0 0; font-size:clamp(48px,7vw,79px); line-height:.94; letter-spacing:-.055em; font-weight:950; }
        h1 span { color:#62b6e4; }
        .intro { max-width:680px; margin:17px 0 0; color:#d1dce2; font-size:15px; line-height:1.65; }
        .participant { min-width:245px; padding:16px 18px; border-radius:17px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); }
        .participant span { display:block; color:#78bde4; font-size:9px; font-weight:950; letter-spacing:.12em; }
        .participant strong { display:block; margin-top:5px; font-size:15px; }
        .participant small { display:block; margin-top:4px; color:#b9cad4; font-size:10px; }
        .meetings,.choiceSection,.actionPanel { margin-top:22px; padding:28px; border-radius:24px; background:rgba(255,255,255,.92); border:1px solid #ced9e1; box-shadow:0 14px 34px rgba(23,52,70,.06); }
        .sectionHeader { display:flex; justify-content:space-between; align-items:flex-start; gap:20px; }
        .sectionHeader h2 { margin:4px 0 0; font-size:clamp(27px,4vw,38px); line-height:1.02; letter-spacing:-.035em; }
        .sectionText { margin:8px 0 0; color:#687681; font-size:13px; line-height:1.6; }
        .refresh { padding:9px 13px; border-radius:999px; border:1px solid #bdccd6; background:#fff; color:#294a5e; font-size:10px; font-weight:850; cursor:pointer; }
        .meetingList { margin-top:20px; border-top:1px solid #d8e1e7; }
        .meetingRow { display:grid; grid-template-columns:minmax(0,1fr) auto; gap:20px; align-items:center; padding:18px 2px; border-bottom:1px solid #d8e1e7; }
        .status { display:inline-block; margin-bottom:8px; padding:5px 8px; border-radius:999px; background:#edf3f6; color:#496170; font-size:8px; font-weight:950; text-transform:uppercase; letter-spacing:.06em; }
        .status-approved { background:#e8f6ed; color:#237348; }
        .status-confirmed { background:#e8f3fa; color:#176fa8; }
        .meetingTitle { display:block; color:#15212a; font-size:16px; }
        .meetingNote { margin:6px 0 0; color:#77838c; font-size:11px; }
        .approvedTime { display:grid; gap:4px; margin-top:9px; }
        .approvedTime span { color:#237348; font-size:8px; font-weight:950; letter-spacing:.08em; }
        .approvedTime strong { color:#172832; font-size:12px; }
        .confirmedTime span { color:#176fa8; }
        .preferenceLine { display:flex; flex-direction:column; gap:3px; margin-top:8px; color:#6d7c86; font-size:10px; }
        .meetingActions { display:flex; align-items:center; }
        .primarySmall { display:inline-flex; align-items:center; justify-content:center; padding:10px 13px; border:none; border-radius:10px; background:#176fa8; color:white; text-decoration:none; font-size:10px; font-weight:900; cursor:pointer; }
        .message { margin-top:17px; padding:13px 15px; border-radius:12px; border:1px solid #ddb4b4; background:#fff2f2; color:#8a3434; font-size:12px; font-weight:750; }
        .message.success { border-color:#abd1b9; background:#edf8f1; color:#286644; }
        .choiceGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:14px; margin-top:22px; }
        .choiceCard { position:relative; min-height:180px; display:grid; grid-template-columns:54px minmax(0,1fr) auto; gap:17px; align-items:start; padding:25px; text-align:left; border-radius:20px; border:1px solid #c7d4dd; background:linear-gradient(145deg,#fff 0%,#f5f8fa 100%); color:#16232c; cursor:pointer; box-shadow:0 12px 28px rgba(19,45,62,.05); transition:transform .18s ease,border-color .18s ease,box-shadow .18s ease; }
        .choiceCard:hover,.choiceSelected { transform:translateY(-3px); border-color:#4da5d5; box-shadow:0 18px 34px rgba(23,111,168,.12); }
        .requestCard { background:linear-gradient(145deg,#f7fbfd 0%,#eaf5fa 100%); }
        .choiceIcon { width:52px; height:52px; display:grid; place-items:center; border-radius:50%; background:#123e57; color:white; font-size:24px; font-weight:950; }
        .plusIcon { background:#187caf; }
        .choiceCard strong { display:block; margin-top:7px; font-size:18px; line-height:1.18; }
        .choiceCard p { margin:8px 0 0; color:#64737e; font-size:11px; line-height:1.55; }
        .cardArrow { color:#176fa8; font-size:20px; }
        .serviceGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:11px; margin-top:22px; }
        .serviceOption { display:flex; align-items:flex-start; gap:12px; padding:16px; border-radius:14px; border:1px solid #d0dbe2; background:#f8fafb; color:#15242d; text-align:left; cursor:pointer; }
        .serviceSelected { border-color:#3998c9; background:#eaf6fb; }
        .serviceCheck { width:24px; height:24px; flex:0 0 24px; display:grid; place-items:center; border-radius:7px; border:1px solid #9fb8c7; color:#176fa8; font-weight:950; }
        .serviceOption strong { font-size:12px; }
        .serviceOption p { margin:4px 0 0; color:#71808a; font-size:10px; line-height:1.45; }
        .field { display:flex; flex-direction:column; gap:7px; margin-top:19px; color:#273a46; font-size:11px; font-weight:900; }
        .field input,.field select,.field textarea { width:100%; padding:13px 14px; border-radius:11px; border:1px solid #b9c8d2; background:#fff; color:#14232c; font:inherit; font-weight:500; outline:none; }
        .field textarea { min-height:100px; resize:vertical; }
        .availability { margin-top:22px; padding-top:20px; border-top:1px solid #d8e1e7; }
        .availabilityTop { display:flex; justify-content:space-between; gap:20px; }
        .availabilityTop h3 { margin:5px 0 0; font-size:20px; }
        .availabilityTop p { margin:6px 0 0; color:#74818b; font-size:11px; }
        .counter { color:#176fa8; font-size:13px; }
        .slotGrid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:16px; }
        .slot { display:flex; align-items:flex-start; gap:11px; padding:14px; border-radius:13px; border:1px solid #d0dbe2; background:#fff; color:#172630; text-align:left; cursor:pointer; }
        .slotSelected { border-color:#318fbd; background:#eaf6fb; }
        .slotNumber { width:27px; height:27px; flex:0 0 27px; display:grid; place-items:center; border-radius:50%; border:1px solid #a7bdca; color:#176fa8; font-size:10px; font-weight:950; }
        .slot div { display:grid; gap:3px; }
        .slot small { color:#176fa8; font-size:8px; font-weight:950; letter-spacing:.08em; }
        .slot strong { font-size:11px; }
        .slot span:not(.slotNumber) { color:#61727d; font-size:10px; }
        .slot em { color:#75838c; font-size:9px; font-style:normal; }
        .empty { margin-top:15px; padding:18px; border-radius:12px; background:#f3f6f8; color:#687781; font-size:11px; }
        .policy { display:flex; gap:11px; align-items:flex-start; margin-top:19px; padding:15px; border-radius:13px; background:#eef5f8; border:1px solid #c9dce6; color:#425762; font-size:11px; line-height:1.6; }
        .policy input { width:17px; height:17px; margin-top:1px; accent-color:#176fa8; }
        .bottomAction { display:flex; justify-content:space-between; align-items:center; gap:20px; margin-top:23px; padding-top:20px; border-top:1px solid #d8e1e7; }
        .bottomAction strong { font-size:13px; }
        .bottomAction p { margin:4px 0 0; color:#74818a; font-size:10px; }
        .primaryButton { padding:13px 17px; border:none; border-radius:11px; background:linear-gradient(90deg,#123a52,#1778ae); color:#fff; font-size:11px; font-weight:950; cursor:pointer; }
        .primaryButton:disabled { opacity:.45; cursor:not-allowed; }
        @media (max-width:800px) {
          .page { padding:16px 13px 38px; }
          .hero { flex-direction:column; align-items:flex-start; padding:30px 24px; }
          .participant { width:100%; }
          .choiceGrid,.serviceGrid,.slotGrid { grid-template-columns:1fr; }
          .meetingRow { grid-template-columns:1fr; }
          .bottomAction,.sectionHeader,.availabilityTop { flex-direction:column; align-items:stretch; }
        }
      `}</style>
    </main>
  );
}
