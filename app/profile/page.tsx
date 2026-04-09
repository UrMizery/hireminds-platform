"use client";

import { CSSProperties, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type ResumeSlot = {
  id: string;
  label: string;
  resumeUrl: string | null;
  resumeData: GeneratedResume | null;
  isVisible: boolean;
  createdAt: string | null;
};

type Job = {
  id: string;
  title: string;
  company: string;
  dates: string;
  location: string;
  relevant: boolean;
  relevanceReason: string;
  bullets: string[];
};

type Education = {
  id: string;
  degree: string;
  school: string;
  dates: string;
  relevant: boolean;
  relevanceReason: string;
};

type CareerTrack = {
  trackId: string;
  label: string;
  jobIds: string[];
};

type AnalysisResult = {
  matchScore: number;
  matchSummary: string;
  jobs: Job[];
  education: Education[];
  skills: string[];
  keywords: string[];
  recommendedFormat: "chronological" | "combination";
  formatReason: string;
  professionalTitle: string;
  hasMultipleCareerTracks: boolean;
  careerTracks: CareerTrack[];
};

type GeneratedResume = {
  professionalTitle: string;
  summary: string;
  skills: string[];
  experience: {
    company: string;
    location: string;
    title: string;
    dates: string;
    bullets: string[];
  }[];
  education: { degree: string; school: string; dates: string }[];
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

async function callApi(action: string, body: Record<string, any>) {
  const res = await fetch("/api/optimize-resume", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, ...body }),
  });
  return res.json();
}

const FONTS = [
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Calibri", value: "Calibri, 'Gill Sans', sans-serif" },
];

const EMPTY_SLOTS: ResumeSlot[] = [
  { id: "slot1", label: "Resume 1 — General", resumeUrl: null, resumeData: null, isVisible: false, createdAt: null },
  { id: "slot2", label: "Resume 2 — Tailored", resumeUrl: null, resumeData: null, isVisible: false, createdAt: null },
  { id: "slot3", label: "Resume 3 — Alternate", resumeUrl: null, resumeData: null, isVisible: false, createdAt: null },
];

// ─── Resume Preview Component ─────────────────────────────────────────────────

function ResumePreview({
  resume,
  candidateInfo,
  font,
  editing,
  onEdit,
  onFlagSection,
  flaggedSections,
  suggestions,
  loadingSuggestion,
  onAcceptSuggestion,
  onDismissFlag,
}: {
  resume: GeneratedResume;
  candidateInfo: { fullName: string; email: string; phone: string; linkedinUrl: string; city: string; state: string };
  font: string;
  editing: boolean;
  onEdit: (field: string, value: any) => void;
  onFlagSection: (key: string) => void;
  flaggedSections: Record<string, boolean>;
  suggestions: Record<string, { issue: string; revised: string } | null>;
  loadingSuggestion: Record<string, boolean>;
  onAcceptSuggestion: (key: string) => void;
  onDismissFlag: (key: string) => void;
}) {
  const pageStyle: CSSProperties = {
    fontFamily: font,
    fontSize: "11pt",
    lineHeight: 1.4,
    color: "#000",
    background: "#fff",
    padding: "1in 1in 1in 1in",
    maxWidth: "8.5in",
    margin: "0 auto",
    boxShadow: "0 4px 24px rgba(0,0,0,0.18)",
    minHeight: "11in",
    boxSizing: "border-box",
  };

  const headerStyle: CSSProperties = { textAlign: "center", marginBottom: "6pt" };
  const nameStyle: CSSProperties = { fontSize: "16pt", fontWeight: "bold", margin: 0 };
  const contactStyle: CSSProperties = { fontSize: "10pt", margin: "4pt 0 0", textAlign: "center" };
  const sectionHeaderStyle: CSSProperties = { textAlign: "center", fontWeight: "bold", fontSize: "11pt", borderBottom: "1px solid #000", marginTop: "10pt", marginBottom: "4pt", paddingBottom: "2pt" };
  const jobHeaderStyle: CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: "8pt" };
  const jobTitleStyle: CSSProperties = { fontStyle: "italic", margin: 0 };
  const bulletStyle: CSSProperties = { marginLeft: "16pt", margin: "2pt 0 2pt 16pt" };

  return (
    <div style={pageStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <p style={nameStyle}>{candidateInfo.fullName || "Your Name"}</p>
        <p style={contactStyle}>
          {candidateInfo.email || "email@example.com"}
          {candidateInfo.linkedinUrl ? ` | ${candidateInfo.linkedinUrl}` : ""}
          {candidateInfo.phone ? ` | ${candidateInfo.phone}` : ""}
        </p>
        {(candidateInfo.city || candidateInfo.state) && (
          <p style={{ ...contactStyle, marginTop: "2pt" }}>
            {[candidateInfo.city, candidateInfo.state].filter(Boolean).join(", ")}
          </p>
        )}
      </div>

      <hr style={{ border: "none", borderTop: "1px solid #000", margin: "6pt 0" }} />

      {/* Professional Title */}
      <div style={sectionHeaderStyle}>
        {editing ? (
          <input
            value={resume.professionalTitle}
            onChange={(e) => onEdit("professionalTitle", e.target.value)}
            style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", border: "1px dashed #aaa", width: "100%", background: "transparent", outline: "none" }}
          />
        ) : (
          resume.professionalTitle
        )}
      </div>

      {/* Summary */}
      <div>
        <SectionWithFlag sectionKey="summary" flagged={flaggedSections["summary"]} loading={loadingSuggestion["summary"]} suggestion={suggestions["summary"]} onFlag={() => onFlagSection("summary")} onAccept={() => onAcceptSuggestion("summary")} onDismiss={() => onDismissFlag("summary")}>
          {editing ? (
            <textarea
              value={resume.summary}
              onChange={(e) => onEdit("summary", e.target.value)}
              rows={4}
              style={{ width: "100%", fontSize: "11pt", fontFamily: font, border: "1px dashed #aaa", padding: "4px", boxSizing: "border-box", resize: "vertical" }}
            />
          ) : (
            <p style={{ margin: "4pt 0", fontSize: "11pt" }}>{resume.summary}</p>
          )}
        </SectionWithFlag>
      </div>

      {/* Core Skills */}
      <div style={sectionHeaderStyle}>CORE SKILLS</div>
      <SectionWithFlag sectionKey="skills" flagged={flaggedSections["skills"]} loading={loadingSuggestion["skills"]} suggestion={suggestions["skills"]} onFlag={() => onFlagSection("skills")} onAccept={() => onAcceptSuggestion("skills")} onDismiss={() => onDismissFlag("skills")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2pt 16pt", margin: "4pt 0" }}>
          {resume.skills.map((skill, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "4pt" }}>
              <span>•</span>
              {editing ? (
                <input
                  value={skill}
                  onChange={(e) => {
                    const updated = [...resume.skills];
                    updated[i] = e.target.value;
                    onEdit("skills", updated);
                  }}
                  style={{ fontSize: "10pt", fontFamily: font, border: "1px dashed #aaa", width: "100%", background: "transparent" }}
                />
              ) : (
                <span style={{ fontSize: "10pt" }}>{skill}</span>
              )}
            </div>
          ))}
        </div>
      </SectionWithFlag>

      {/* Experience */}
      <div style={sectionHeaderStyle}>EXPERIENCE</div>
      {resume.experience.map((job, ji) => (
        <div key={ji}>
          <div style={jobHeaderStyle}>
            <span style={{ fontWeight: "normal", fontSize: "11pt" }}>
              {editing ? (
                <span style={{ display: "flex", gap: "8px" }}>
                  <input value={job.company} onChange={(e) => { const exp = [...resume.experience]; exp[ji] = { ...exp[ji], company: e.target.value }; onEdit("experience", exp); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} />
                  <input value={job.location} onChange={(e) => { const exp = [...resume.experience]; exp[ji] = { ...exp[ji], location: e.target.value }; onEdit("experience", exp); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} />
                </span>
              ) : (
                `${job.company}${job.location ? `, ${job.location}` : ""}`
              )}
            </span>
            <span style={{ fontSize: "10pt" }}>
              {editing ? (
                <input value={job.dates} onChange={(e) => { const exp = [...resume.experience]; exp[ji] = { ...exp[ji], dates: e.target.value }; onEdit("experience", exp); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} />
              ) : job.dates}
            </span>
          </div>
          <p style={jobTitleStyle}>
            {editing ? (
              <input value={job.title} onChange={(e) => { const exp = [...resume.experience]; exp[ji] = { ...exp[ji], title: e.target.value }; onEdit("experience", exp); }} style={{ fontSize: "10pt", fontStyle: "italic", border: "1px dashed #aaa", fontFamily: font, width: "60%" }} />
            ) : job.title}
          </p>
          <ul style={{ margin: "2pt 0", paddingLeft: "20pt" }}>
            {job.bullets.map((b, bi) => (
              <li key={bi} style={{ ...bulletStyle, listStyle: "disc" }}>
                {editing ? (
                  <input value={b} onChange={(e) => { const exp = [...resume.experience]; exp[ji].bullets[bi] = e.target.value; onEdit("experience", exp); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font, width: "95%" }} />
                ) : b}
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Education */}
      {resume.education?.length > 0 && (
        <>
          <div style={sectionHeaderStyle}>EDUCATION</div>
          {resume.education.map((edu, ei) => (
            <div key={ei}>
              <div style={jobHeaderStyle}>
                <span style={{ fontSize: "11pt" }}>
                  {editing ? (
                    <input value={edu.school} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], school: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} />
                  ) : edu.school}
                </span>
                <span style={{ fontSize: "10pt" }}>
                  {editing ? (
                    <input value={edu.dates} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], dates: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} />
                  ) : edu.dates}
                </span>
              </div>
              <p style={jobTitleStyle}>
                {editing ? (
                  <input value={edu.degree} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], degree: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", fontStyle: "italic", border: "1px dashed #aaa", fontFamily: font, width: "60%" }} />
                ) : edu.degree}
              </p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

function SectionWithFlag({ sectionKey, flagged, loading, suggestion, onFlag, onAccept, onDismiss, children }: {
  sectionKey: string; flagged: boolean; loading: boolean;
  suggestion: { issue: string; revised: string } | null;
  onFlag: () => void; onAccept: () => void; onDismiss: () => void; children: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {children}
      <button onClick={onFlag} style={{ position: "absolute", top: 0, right: 0, fontSize: "10px", background: flagged ? "#fef3c7" : "#f5f5f5", border: "1px solid #ddd", borderRadius: "4px", padding: "2px 6px", cursor: "pointer", color: "#666" }}>
        {flagged ? "⚑ Flagged" : "⚑ Flag"}
      </button>
      {flagged && (
        <div style={{ background: "#fffbeb", border: "1px solid #fcd34d", borderRadius: "8px", padding: "12px", marginTop: "8px" }}>
          {loading ? <p style={{ margin: 0, fontSize: "12px", color: "#92400e" }}>Getting suggestion...</p> : suggestion ? (
            <>
              <p style={{ margin: "0 0 6px", fontSize: "12px", color: "#92400e", fontWeight: 600 }}>⚑ {suggestion.issue}</p>
              <p style={{ margin: "0 0 8px", fontSize: "12px", color: "#065f46" }}><strong>Suggested:</strong> {suggestion.revised}</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={onAccept} style={{ fontSize: "11px", background: "#065f46", color: "#fff", border: "none", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}>✓ Use this</button>
                <button onClick={onDismiss} style={{ fontSize: "11px", background: "transparent", color: "#666", border: "1px solid #ddd", borderRadius: "4px", padding: "4px 10px", cursor: "pointer" }}>Keep mine</button>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

// ─── Main Profile Page ────────────────────────────────────────────────────────

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState("");
  const [profileId, setProfileId] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [bio, setBio] = useState("");
  const [headline, setHeadline] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [resumeSlots, setResumeSlots] = useState<ResumeSlot[]>(EMPTY_SLOTS);
  const [publicProfileUrl, setPublicProfileUrl] = useState("");
  const trackedRef = useRef(false);

  // ── Optimizer State ──
  const [showOptimizer, setShowOptimizer] = useState(false);
  const [optimizerStep, setOptimizerStep] = useState(0);
  const [rawResumeText, setRawResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<Education[]>([]);
  const [chosenFormat, setChosenFormat] = useState<"chronological" | "combination">("chronological");
  const [chosenFont, setChosenFont] = useState(FONTS[0].value);
  const [resumeTitle, setResumeTitle] = useState("");
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>([]);
  const [activeResumeIdx, setActiveResumeIdx] = useState(0);
  const [editingResume, setEditingResume] = useState(false);
  const [flaggedSections, setFlaggedSections] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, { issue: string; revised: string } | null>>({});
  const [loadingSuggestion, setLoadingSuggestion] = useState<Record<string, boolean>>({});
  const [optimizerLoading, setOptimizerLoading] = useState(false);
  const [optimizerError, setOptimizerError] = useState("");
  const [targetSlot, setTargetSlot] = useState<string>("slot1");
  const [slotLabel, setSlotLabel] = useState("");

  // ── Load Profile ──
  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) { window.location.href = "/sign-in"; return; }

      const { data: profile, error: profileError } = await supabase
        .from("candidate_profiles").select("*").eq("user_id", authData.user.id).single();

      if (profileError || !profile) { setMessage(profileError?.message || "Profile not found."); setLoading(false); return; }

      setUserId(authData.user.id || "");
      setProfileId(profile.id || "");
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
      setEmail(profile.email || authData.user.email || "");
      setCity(profile.city || "");
      setStateName(profile.state || "");
      setBio(profile.bio || "");
      setHeadline(profile.headline || "");
      setLinkedinUrl(profile.linkedin_url || "");
      setPhotoUrl(profile.photo_url || "");
      setPublicProfileUrl(profile.public_profile_url || "");

      // Load resume slots from profile
      if (profile.resume_slots) {
        setResumeSlots(profile.resume_slots);
      }

      if (!trackedRef.current) {
        trackedRef.current = true;
        await supabase.from("user_activity").insert({
          user_id: authData.user.id, full_name: profile.full_name || null,
          email: profile.email || authData.user.email || null,
          referral_code: profile.referral_code || null,
          event_type: "profile_viewed", tool_name: "profile", page_name: "/profile",
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // ── Upload File ──
  async function uploadFile(bucket: string, file: File, folder: string) {
    const fileExt = file.name.split(".").pop() || "file";
    const filePath = `${folder}/${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  // ── Save Profile ──
  async function handleSaveProfile() {
    setMessage("");
    if (!userId) { setMessage("You must be signed in."); return; }
    try {
      setSaving(true);
      let nextPhotoUrl = photoUrl;
      if (photoFile) nextPhotoUrl = await uploadFile("profile-photos", photoFile, `${userId}/photo`);

      const slug = slugify(fullName || "career-passport");
      const publicUrl = `${window.location.origin}/passport/${slug}-${userId.slice(0, 8)}`;

      const payload = {
        user_id: userId, full_name: fullName, phone, email, city,
        state: stateName, bio, headline, linkedin_url: linkedinUrl,
        photo_url: nextPhotoUrl || null,
        resume_slots: resumeSlots,
        public_profile_url: publicUrl,
      };

      if (profileId) {
        const { error } = await supabase.from("candidate_profiles").update(payload).eq("id", profileId);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from("candidate_profiles").insert(payload).select().single();
        if (error) throw error;
        setProfileId(data.id);
      }

      setPhotoUrl(nextPhotoUrl);
      setPublicProfileUrl(publicUrl);
      setMessage("Profile saved successfully.");
    } catch (err: any) {
      setMessage(err.message || "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  // ── Resume Slot Actions ──
  function setVisibleSlot(slotId: string) {
    setResumeSlots((prev) => prev.map((s) => ({ ...s, isVisible: s.id === slotId })));
  }

  function updateSlotLabel(slotId: string, label: string) {
    setResumeSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, label } : s));
  }

  // ── Optimizer: Analyze ──
  async function handleAnalyze() {
    if (!rawResumeText.trim()) { setOptimizerError("Please paste your resume text."); return; }
    if (!jobDescription.trim()) { setOptimizerError("Please paste the job description."); return; }
    setOptimizerError(""); setOptimizerLoading(true);
    try {
      const result = await callApi("analyze", { resumeText: rawResumeText, jobDescription });
      setAnalysis(result);
      setSelectedJobs(result.jobs?.filter((j: Job) => j.relevant) || []);
      setSelectedEducation(result.education?.filter((e: Education) => e.relevant) || []);
      setChosenFormat(result.recommendedFormat || "chronological");
      setResumeTitle(result.professionalTitle || "");
      setOptimizerStep(2);
    } catch { setOptimizerError("Analysis failed. Please try again."); }
    setOptimizerLoading(false);
  }

  // ── Optimizer: Generate ──
  async function handleGenerate() {
    setOptimizerLoading(true); setOptimizerError("");
    try {
      const candidateInfo = { fullName, email, phone, linkedinUrl, city, state: stateName };
      const main = await callApi("generate", { resumeText: rawResumeText, jobDescription, selectedJobs, selectedEducation, format: chosenFormat, font: chosenFont, resumeTitle, candidateInfo });
      const resumes: GeneratedResume[] = [main];

      // Generate alternate resume if multiple career tracks
      if (analysis?.hasMultipleCareerTracks && analysis.careerTracks?.length > 1) {
        const track2Jobs = analysis.jobs.filter((j) =>
          analysis.careerTracks[1]?.jobIds.includes(j.id)
        );
        if (track2Jobs.length > 0) {
          const alt = await callApi("generateAlternate", { resumeText: rawResumeText, jobDescription, alternatejobs: track2Jobs, selectedEducation, candidateInfo });
          resumes.push(alt);
        }
      }

      setGeneratedResumes(resumes);
      setActiveResumeIdx(0);
      setOptimizerStep(4);
    } catch { setOptimizerError("Generation failed. Please try again."); }
    setOptimizerLoading(false);
  }

  // ── Flag Section ──
  async function handleFlagSection(key: string) {
    const resume = generatedResumes[activeResumeIdx];
    if (!resume) return;
    setFlaggedSections((f) => ({ ...f, [key]: true }));
    setLoadingSuggestion((l) => ({ ...l, [key]: true }));
    const sectionContent = key === "summary" ? resume.summary : key === "skills" ? resume.skills.join(", ") : "";
    const result = await callApi("flagSection", { resumeText: rawResumeText, sectionKey: key, sectionContent });
    setSuggestions((s) => ({ ...s, [key]: result }));
    setLoadingSuggestion((l) => ({ ...l, [key]: false }));
  }

  function handleAcceptSuggestion(key: string) {
    const suggestion = suggestions[key];
    if (!suggestion) return;
    const updated = [...generatedResumes];
    if (key === "summary") updated[activeResumeIdx] = { ...updated[activeResumeIdx], summary: suggestion.revised };
    if (key === "skills") updated[activeResumeIdx] = { ...updated[activeResumeIdx], skills: suggestion.revised.split(",").map((s) => s.trim()) };
    setGeneratedResumes(updated);
    setFlaggedSections((f) => ({ ...f, [key]: false }));
    setSuggestions((s) => ({ ...s, [key]: null }));
  }

  function handleEditResume(field: string, value: any) {
    const updated = [...generatedResumes];
    updated[activeResumeIdx] = { ...updated[activeResumeIdx], [field]: value };
    setGeneratedResumes(updated);
  }

  // ── Save Resume to Slot ──
  async function handleSaveToSlot() {
    const resume = generatedResumes[activeResumeIdx];
    if (!resume) return;
    const label = slotLabel || `${resume.professionalTitle} Resume`;
    setResumeSlots((prev) => prev.map((s) =>
      s.id === targetSlot ? { ...s, resumeData: resume, label, createdAt: new Date().toISOString() } : s
    ));
    setShowOptimizer(false);
    setOptimizerStep(0);
    setMessage(`Resume saved to ${label}!`);
    await handleSaveProfile();
  }

  // ── Print ──
  function handlePrint() {
    window.print();
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  if (loading) return <main style={st.page}><div style={st.centerWrap}>Loading...</div></main>;

  const candidateInfo = { fullName, email, phone, linkedinUrl, city, state: stateName };

  return (
    <main style={st.page}>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-page { box-shadow: none !important; margin: 0 !important; }
          body { background: white; }
        }
      `}</style>

      <div style={st.shell}>
        {/* Hero */}
        <section style={st.hero}>
          <div style={st.heroLeft}>
            <p style={st.kicker}>Career Passport</p>
            <h1 style={st.title}>Career Passport Editor</h1>
            <p style={st.subtitle}>Update your profile, manage your resumes, and share your Career Passport with employers.</p>
          </div>
          <div style={st.heroRight}>
            <button onClick={handleSignOut} style={st.secondaryButton}>Sign Out</button>
          </div>
        </section>

        {/* Profile Strip */}
        <section style={st.profileStrip}>
          <div style={st.profileStripLeft}>
            {photoUrl ? <img src={photoUrl} alt="Profile" style={st.avatar} /> : <div style={st.avatarPlaceholder}>No Photo</div>}
            <div style={st.photoUploadWrap}>
              <label style={st.label}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} style={st.input} />
            </div>
          </div>
          <div style={st.profileStripRight}>
            <h2 style={st.namePreview}>{fullName || "Your Name"}</h2>
            <p style={st.headlinePreview}>{headline || "Professional Headline"}</p>
            <p style={st.metaPreview}>{[city, stateName].filter(Boolean).join(", ") || "City, State"}</p>
            <p style={st.metaPreview}>{email || "email@example.com"}</p>
            {publicProfileUrl && (
              <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" style={st.publicLink}>
                🔗 View Public Profile
              </a>
            )}
          </div>
        </section>

        {/* Basic Info */}
        <section style={st.formFlow}>
          <div style={st.flowIntro}>
            <p style={st.sectionKicker}>Profile Details</p>
            <h2 style={st.sectionTitle}>Basic Information</h2>
          </div>
          <div style={st.formGrid}>
            <Field label="Full Name" value={fullName} onChange={setFullName} />
            <Field label="Phone" value={phone} onChange={setPhone} />
            <Field label="Email" value={email} onChange={setEmail} type="email" />
            <Field label="LinkedIn" value={linkedinUrl} onChange={setLinkedinUrl} />
            <Field label="City" value={city} onChange={setCity} />
            <Field label="State" value={stateName} onChange={setStateName} />
          </div>
          <div style={st.singleField}>
            <Field label="Professional Headline" value={headline} onChange={setHeadline} placeholder="Example: Recruiter | Workforce Development | Employer Relations" />
          </div>
          <div style={st.singleField}>
            <TextAreaField label="Short Bio" value={bio} onChange={setBio} placeholder="Write a short professional bio." />
          </div>
        </section>

        {/* Resume Slots */}
        <section style={st.assetFlow}>
          <div style={st.flowIntro}>
            <p style={st.sectionKicker}>Resumes</p>
            <h2 style={st.sectionTitle}>My Resumes</h2>
            <p style={st.flowText}>You can store up to 3 resumes. Choose which one is visible to employers on your public Career Passport.</p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {resumeSlots.map((slot) => (
              <div key={slot.id} style={{ ...glass, borderRadius: "20px", padding: "20px", display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input
                      value={slot.label}
                      onChange={(e) => updateSlotLabel(slot.id, e.target.value)}
                      style={{ ...st.input, width: "280px", fontSize: "15px", fontWeight: 700, padding: "8px 12px" }}
                    />
                    {slot.isVisible && <span style={{ fontSize: "11px", background: "#1e3a2f", color: "#4ade80", border: "1px solid #2d5a3d", padding: "3px 10px", borderRadius: "999px", fontFamily: "monospace" }}>Visible to Employers</span>}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {!slot.isVisible && (
                      <button onClick={() => setVisibleSlot(slot.id)} style={{ ...st.secondaryButton, fontSize: "13px", padding: "8px 14px" }}>
                        Set as Visible
                      </button>
                    )}
                    <button onClick={() => { setTargetSlot(slot.id); setSlotLabel(slot.label); setShowOptimizer(true); setOptimizerStep(0); }}
                      style={{ ...st.secondaryButton, fontSize: "13px", padding: "8px 14px", borderColor: "#6366f1", color: "#a5b4fc" }}>
                      + Use Optimizer
                    </button>
                  </div>
                </div>

                {slot.resumeData ? (
                  <div>
                    <p style={{ margin: "0 0 4px", color: "#9ca3af", fontSize: "13px" }}>
                      {slot.resumeData.professionalTitle} · Saved {slot.createdAt ? new Date(slot.createdAt).toLocaleDateString() : ""}
                    </p>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => { setGeneratedResumes([slot.resumeData!]); setActiveResumeIdx(0); setShowOptimizer(true); setOptimizerStep(4); }}
                        style={{ fontSize: "12px", color: "#f5f5f5", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>
                        Preview / Edit
                      </button>
                    </div>
                  </div>
                ) : (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>No resume saved yet. Use the optimizer to generate one.</p>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Notices */}
        <section style={st.noticeFloat}>
          <p style={st.noticeTitle}>Public Profile Note</p>
          <p style={st.noticeText}>Your photo, headline, location, LinkedIn, and selected resume appear on your Career Passport once completed.</p>
        </section>
        <section style={st.noticeFloat}>
          <p style={st.noticeTitle}>Privacy Notice</p>
          <p style={st.noticeText}>Your information is stored securely and is not sold or shared outside platform and reporting purposes.</p>
        </section>

        {/* Bottom Actions */}
        <section style={st.bottomDock}>
          <button onClick={handleSaveProfile} disabled={saving} style={st.primaryButton}>{saving ? "Saving..." : "Save Profile"}</button>
          <a href="/career-toolkit" style={st.linkButton}>Career Toolkit</a>
        </section>

        {message && <p style={st.message}>{message}</p>}
      </div>

      {/* ── Resume Career Optimizer Modal ── */}
      {showOptimizer && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 100, overflowY: "auto" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

            {/* Optimizer Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }} className="no-print">
              <div>
                <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#f5f5f5" }}>Resume Career Optimizer</h2>
                <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "14px" }}>Tailoring for: <strong style={{ color: "#a5b4fc" }}>{resumeSlots.find((s) => s.id === targetSlot)?.label}</strong></p>
              </div>
              <button onClick={() => { setShowOptimizer(false); setOptimizerStep(0); }} style={{ background: "transparent", border: "1px solid #3f3f46", color: "#d4d4d8", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>
                ✕ Close
              </button>
            </div>

            {/* Progress */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "32px", alignItems: "center" }} className="no-print">
              {["Input", "Analyze", "Review", "Format", "Preview & Save"].map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 4 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, background: i < optimizerStep ? "#4ade80" : i === optimizerStep ? "#f5f5f5" : "#1a1a1a", color: i <= optimizerStep ? "#0a0a0a" : "#666", border: i > optimizerStep ? "1px solid #333" : "none", flexShrink: 0 }}>
                      {i < optimizerStep ? "✓" : i + 1}
                    </div>
                    <span style={{ fontSize: "10px", color: i === optimizerStep ? "#f5f5f5" : "#555", fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
                  </div>
                  {i < 4 && <div style={{ flex: 1, height: "1px", background: i < optimizerStep ? "#4ade80" : "#222", margin: "0 6px 16px" }} />}
                </div>
              ))}
            </div>

            {optimizerError && <div style={{ background: "#2a0f0f", border: "1px solid #5a1f1f", borderRadius: "10px", padding: "12px 16px", color: "#f87171", fontSize: "13px", fontFamily: "monospace", marginBottom: "16px" }} className="no-print">{optimizerError}</div>}

            {/* STEP 0 — Input */}
            {optimizerStep === 0 && (
              <div style={optCard} className="no-print">
                <h3 style={optH3}>Paste your resume & job description</h3>
                <p style={optSub}>This tool tailors your existing resume — it cannot create a resume from scratch.</p>
                <label style={optLabel}>Your Resume (paste full text)</label>
                <textarea style={optTextarea} rows={10} placeholder="Paste your entire resume text here..." value={rawResumeText} onChange={(e) => setRawResumeText(e.target.value)} />
                <label style={{ ...optLabel, marginTop: "20px" }}>Job Description</label>
                <textarea style={optTextarea} rows={8} placeholder="Paste the full job posting here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
                <button style={optBtn} onClick={handleAnalyze} disabled={optimizerLoading}>
                  {optimizerLoading ? "Analyzing..." : "Analyze Match →"}
                </button>
              </div>
            )}

            {/* STEP 1 — Loading */}
            {optimizerStep === 1 && (
              <div style={{ ...optCard, textAlign: "center", padding: "60px" }} className="no-print">
                <div style={{ width: "44px", height: "44px", border: "2px solid #1e1e1e", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <p style={{ color: "#9ca3af" }}>Analyzing your resume against the job description...</p>
              </div>
            )}

            {/* STEP 2 — Review Analysis */}
            {optimizerStep === 2 && analysis && (
              <div className="no-print">
                {/* Match Score */}
                <div style={{ ...optCard, marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                    <div style={{ fontSize: "48px", fontWeight: 700, color: analysis.matchScore >= 60 ? "#4ade80" : analysis.matchScore >= 40 ? "#facc15" : "#f87171" }}>
                      {analysis.matchScore}%
                    </div>
                    <div>
                      <p style={{ margin: 0, fontWeight: 700, color: "#f5f5f5" }}>Match Score</p>
                      <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "14px" }}>{analysis.matchSummary}</p>
                    </div>
                  </div>
                  {analysis.matchScore < 40 && (
                    <div style={{ background: "#2a1500", border: "1px solid #92400e", borderRadius: "10px", padding: "12px 16px", display: "flex", alignItems: "flex-start", gap: "10px" }}>
                      <span style={{ fontSize: "20px" }}>⚠️</span>
                      <div>
                        <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#fb923c" }}>Low Match — Less than 40%</p>
                        <p style={{ margin: "0 0 10px", color: "#fdba74", fontSize: "13px" }}>Your background may not align closely with this role. Would you still like to proceed?</p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button style={optBtn} onClick={() => setOptimizerStep(3)}>Yes, proceed anyway</button>
                          <button style={optBtnGhost} onClick={() => setOptimizerStep(0)}>Go back</button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Format Recommendation */}
                <div style={{ ...optCard, marginBottom: "16px" }}>
                  <h3 style={optH3}>Resume Format</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>
                    We recommend <strong style={{ color: "#f5f5f5" }}>{analysis.recommendedFormat}</strong> — {analysis.formatReason}
                  </p>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {(["chronological", "combination"] as const).map((f) => (
                      <button key={f} onClick={() => setChosenFormat(f)}
                        style={{ padding: "10px 20px", borderRadius: "10px", border: chosenFormat === f ? "2px solid #6366f1" : "1px solid #3f3f46", background: chosenFormat === f ? "#1e1b4b" : "transparent", color: chosenFormat === f ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontWeight: chosenFormat === f ? 700 : 400, fontSize: "14px", textTransform: "capitalize" }}>
                        {f} {f === analysis.recommendedFormat ? "⭐ Recommended" : ""}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Career Tracks */}
                {analysis.hasMultipleCareerTracks && analysis.careerTracks?.length > 1 && (
                  <div style={{ ...optCard, marginBottom: "16px", border: "1px solid #3730a3" }}>
                    <h3 style={optH3}>Multiple Career Tracks Detected</h3>
                    <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>
                      Your resume shows experience in different areas. We'll generate a tailored resume for the job + a separate resume for your other experience.
                    </p>
                    {analysis.careerTracks.map((track, i) => (
                      <div key={track.trackId} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
                        <p style={{ margin: 0, fontWeight: 700, color: "#a5b4fc", fontSize: "14px" }}>Resume {i + 1}: {track.label}</p>
                        <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "12px", fontFamily: "monospace" }}>{track.jobIds.join(", ")}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Select Jobs */}
                <div style={{ ...optCard, marginBottom: "16px" }}>
                  <h3 style={optH3}>Select Jobs to Include</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>Pre-selected based on relevance. Uncheck any job you want to exclude.</p>
                  {analysis.jobs.map((job) => {
                    const isSelected = selectedJobs.some((j) => j.id === job.id);
                    return (
                      <div key={job.id} style={{ background: isSelected ? "#0d1f16" : "#0d0d0d", border: `1px solid ${isSelected ? "#2d5a3d" : "#2a2a2a"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px", cursor: "pointer" }}
                        onClick={() => setSelectedJobs((prev) => isSelected ? prev.filter((j) => j.id !== job.id) : [...prev, job])}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${isSelected ? "#4ade80" : "#3f3f46"}`, background: isSelected ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                            {isSelected && <span style={{ color: "#0a0a0a", fontSize: "12px", fontWeight: 700 }}>✓</span>}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "#f5f5f5", fontSize: "14px" }}>{job.title} — {job.company}</p>
                            <p style={{ margin: "2px 0", color: "#9ca3af", fontSize: "12px" }}>{job.dates} · {job.location}</p>
                            <p style={{ margin: "4px 0 0", color: job.relevant ? "#4ade80" : "#f87171", fontSize: "12px", fontFamily: "monospace" }}>
                              {job.relevant ? "✓ Relevant" : "✗ Not relevant"} — {job.relevanceReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Select Education */}
                <div style={{ ...optCard, marginBottom: "16px" }}>
                  <h3 style={optH3}>Select Education to Include</h3>
                  {analysis.education.map((edu) => {
                    const isSelected = selectedEducation.some((e) => e.id === edu.id);
                    return (
                      <div key={edu.id} style={{ background: isSelected ? "#0d1f16" : "#0d0d0d", border: `1px solid ${isSelected ? "#2d5a3d" : "#2a2a2a"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px", cursor: "pointer" }}
                        onClick={() => setSelectedEducation((prev) => isSelected ? prev.filter((e) => e.id !== edu.id) : [...prev, edu])}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${isSelected ? "#4ade80" : "#3f3f46"}`, background: isSelected ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {isSelected && <span style={{ color: "#0a0a0a", fontSize: "12px", fontWeight: 700 }}>✓</span>}
                          </div>
                          <div>
                            <p style={{ margin: 0, fontWeight: 700, color: "#f5f5f5", fontSize: "14px" }}>{edu.degree} — {edu.school}</p>
                            <p style={{ margin: "2px 0 0", color: "#9ca3af", fontSize: "12px" }}>{edu.dates}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Professional Title */}
                <div style={{ ...optCard, marginBottom: "16px" }}>
                  <h3 style={optH3}>Resume Title / Professional Title</h3>
                  <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>This will appear centered at the top of your resume instead of "Summary". You can change it to anything you like.</p>
                  <input value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} style={{ ...st.input, fontSize: "15px" }} placeholder="e.g. Professional Truck Driver, Senior Marketing Manager..." />
                </div>

                {/* Font */}
                <div style={{ ...optCard, marginBottom: "24px" }}>
                  <h3 style={optH3}>Choose Font</h3>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {FONTS.map((f) => (
                      <button key={f.value} onClick={() => setChosenFont(f.value)}
                        style={{ padding: "10px 20px", borderRadius: "10px", border: chosenFont === f.value ? "2px solid #6366f1" : "1px solid #3f3f46", background: chosenFont === f.value ? "#1e1b4b" : "transparent", color: chosenFont === f.value ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontFamily: f.value, fontSize: "14px" }}>
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "12px" }}>
                  <button style={optBtn} onClick={handleGenerate} disabled={optimizerLoading}>
                    {optimizerLoading ? "Generating..." : "Generate Resume →"}
                  </button>
                  <button style={optBtnGhost} onClick={() => setOptimizerStep(0)}>← Back</button>
                </div>
              </div>
            )}

            {/* STEP 3 — Generating */}
            {optimizerStep === 3 && (
              <div style={{ ...optCard, textAlign: "center", padding: "60px" }} className="no-print">
                <div style={{ width: "44px", height: "44px", border: "2px solid #1e1e1e", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
                <p style={{ color: "#9ca3af" }}>Generating your tailored resume{analysis?.hasMultipleCareerTracks ? "s" : ""}...</p>
              </div>
            )}

            {/* STEP 4 — Preview & Save */}
            {optimizerStep === 4 && generatedResumes.length > 0 && (
              <div>
                {/* Resume Tabs */}
                {generatedResumes.length > 1 && (
                  <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }} className="no-print">
                    {generatedResumes.map((r, i) => (
                      <button key={i} onClick={() => setActiveResumeIdx(i)}
                        style={{ padding: "10px 20px", borderRadius: "10px", border: activeResumeIdx === i ? "2px solid #6366f1" : "1px solid #3f3f46", background: activeResumeIdx === i ? "#1e1b4b" : "transparent", color: activeResumeIdx === i ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontSize: "14px", fontWeight: activeResumeIdx === i ? 700 : 400 }}>
                        Resume {i + 1}: {r.professionalTitle}
                      </button>
                    ))}
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }} className="no-print">
                  <button style={optBtn} onClick={() => setEditingResume((e) => !e)}>
                    {editingResume ? "✓ Done Editing" : "✏️ Edit Resume"}
                  </button>
                  <button style={optBtnGhost} onClick={handlePrint}>🖨️ Print</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                    <span style={{ color: "#9ca3af", fontSize: "13px" }}>Save to:</span>
                    <select value={targetSlot} onChange={(e) => setTargetSlot(e.target.value)}
                      style={{ background: "#111", border: "1px solid #3f3f46", color: "#f5f5f5", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}>
                      {resumeSlots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                    </select>
                    <button style={optBtn} onClick={handleSaveToSlot}>Save Resume</button>
                  </div>
                </div>

                {/* Live Preview */}
                <div style={{ overflow: "auto" }} className="print-page">
                  <ResumePreview
                    resume={generatedResumes[activeResumeIdx]}
                    candidateInfo={candidateInfo}
                    font={chosenFont}
                    editing={editingResume}
                    onEdit={handleEditResume}
                    onFlagSection={handleFlagSection}
                    flaggedSections={flaggedSections}
                    suggestions={suggestions}
                    loadingSuggestion={loadingSuggestion}
                    onAcceptSuggestion={handleAcceptSuggestion}
                    onDismissFlag={(key) => { setFlaggedSections((f) => ({ ...f, [key]: false })); setSuggestions((s) => ({ ...s, [key]: null })); }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

// ─── Field Components ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div style={st.fieldWrap}>
      <label style={st.label}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={st.input} />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div style={st.fieldWrap}>
      <label style={st.label}>{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={st.textarea} />
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const glass: CSSProperties = {
  background: "rgba(255,255,255,0.035)",
  border: "1px solid rgba(255,255,255,0.06)",
  boxShadow: "0 18px 60px rgba(0,0,0,0.22)",
  backdropFilter: "blur(14px)",
};

const optCard: CSSProperties = { background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "28px", marginBottom: "16px" };
const optH3: CSSProperties = { fontSize: "18px", fontWeight: 700, color: "#f5f5f5", margin: "0 0 8px" };
const optSub: CSSProperties = { color: "#9ca3af", fontSize: "14px", margin: "0 0 20px" };
const optLabel: CSSProperties = { fontSize: "11px", color: "#9ca3af", fontFamily: "monospace", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" };
const optTextarea: CSSProperties = { width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "14px", color: "#f0ede8", fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" };
const optBtn: CSSProperties = { background: "#f0ede8", color: "#0a0a0a", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" };
const optBtnGhost: CSSProperties = { background: "transparent", color: "#9ca3af", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", cursor: "pointer" };

const st: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(59,130,246,0.12) 0%, transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)", color: "#e7e7e7", padding: "34px 24px 64px", fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' },
  centerWrap: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" },
  shell: { maxWidth: "1320px", margin: "0 auto", display: "grid", gap: "24px" },
  hero: { display: "flex", justifyContent: "space-between", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },
  heroLeft: { maxWidth: "860px" },
  heroRight: { display: "flex", alignItems: "flex-start" },
  kicker: { margin: "0 0 8px", color: "#9ca3af", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" },
  title: { margin: "0 0 12px", fontSize: "46px", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.04em", color: "#f5f5f5" },
  subtitle: { margin: 0, color: "#d4d4d8", fontSize: "16px", lineHeight: 1.85, maxWidth: "780px" },
  profileStrip: { ...glass, borderRadius: "34px", padding: "26px", display: "grid", gridTemplateColumns: "220px 1fr", gap: "26px", alignItems: "center" },
  profileStripLeft: { display: "grid", gap: "14px" },
  profileStripRight: { minWidth: 0 },
  avatar: { width: "200px", height: "200px", borderRadius: "26px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)" },
  avatarPlaceholder: { width: "200px", height: "200px", borderRadius: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.08)" },
  photoUploadWrap: { display: "grid", gap: "8px" },
  namePreview: { margin: "0 0 10px", fontSize: "34px", lineHeight: 1.08, fontWeight: 700, color: "#f5f5f5" },
  headlinePreview: { margin: "0 0 8px", fontSize: "18px", lineHeight: 1.6, color: "#e5e7eb" },
  metaPreview: { margin: "0 0 6px", color: "#bdbdbd", lineHeight: 1.6, fontSize: "15px" },
  publicLink: { display: "inline-block", marginTop: "12px", color: "#a5b4fc", textDecoration: "underline", fontSize: "14px" },
  formFlow: { display: "grid", gap: "16px" },
  assetFlow: { display: "grid", gap: "16px" },
  flowIntro: { display: "grid", gap: "6px" },
  flowText: { margin: 0, color: "#a1a1aa", fontSize: "15px", lineHeight: 1.75, maxWidth: "920px" },
  sectionKicker: { margin: 0, color: "#9ca3af", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" },
  sectionTitle: { margin: 0, fontSize: "30px", fontWeight: 700, lineHeight: 1.08, color: "#f5f5f5" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "14px" },
  singleField: { maxWidth: "100%" },
  noticeFloat: { ...glass, borderRadius: "24px", padding: "18px 20px" },
  noticeTitle: { margin: "0 0 8px", color: "#f3f4f6", fontWeight: 700, fontSize: "14px" },
  noticeText: { margin: 0, color: "#b8b8b8", fontSize: "14px", lineHeight: 1.7 },
  bottomDock: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", maxWidth: "520px", marginTop: "4px" },
  primaryButton: { width: "100%", padding: "15px 18px", borderRadius: "18px", border: "1px solid #d1d5db", background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)", color: "#09090b", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#f5f5f5", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(10px)" },
  linkButton: { display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none", padding: "15px 18px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#f5f5f5", fontWeight: 700, backdropFilter: "blur(10px)" },
  fieldWrap: { display: "grid", gap: "8px" },
  label: { color: "#d4d4d8", fontSize: "13px", fontWeight: 600 },
  input: { width: "100%", padding: "14px 16px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.035)", color: "#f4f4f5", fontSize: "15px", boxSizing: "border-box", outline: "none", backdropFilter: "blur(10px)" },
  textarea: { width: "100%", minHeight: "130px", padding: "14px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.035)", color: "#f4f4f5", fontSize: "15px", resize: "vertical", boxSizing: "border-box", outline: "none", backdropFilter: "blur(10px)" },
  message: { marginTop: "2px", color: "#e5e5e5", fontSize: "14px", lineHeight: 1.6 },
};
