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

async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".docx")) {
    const mammoth = await import("mammoth");
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  }
  if (name.endsWith(".pdf")) {
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item: any) => item.str).join(" ") + "\n";
    }
    return text;
  }
  if (name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg")) {
    const base64 = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string).split(",")[1]);
      reader.readAsDataURL(file);
    });
    const res = await fetch("/api/optimize-resume", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "extractImage", imageBase64: base64, mediaType: file.type }),
    });
    const data = await res.json();
    return data.text || "";
  }
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.readAsText(file);
  });
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

// ─── Section Flag ─────────────────────────────────────────────────────────────

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

// ─── Resume Preview ───────────────────────────────────────────────────────────

function ResumePreview({ resume, candidateInfo, font, editing, onEdit, onFlagSection, flaggedSections, suggestions, loadingSuggestion, onAcceptSuggestion, onDismissFlag }: {
  resume: GeneratedResume;
  candidateInfo: { fullName: string; email: string; phone: string; linkedinUrl: string; city: string; state: string };
  font: string; editing: boolean;
  onEdit: (field: string, value: any) => void;
  onFlagSection: (key: string) => void;
  flaggedSections: Record<string, boolean>;
  suggestions: Record<string, { issue: string; revised: string } | null>;
  loadingSuggestion: Record<string, boolean>;
  onAcceptSuggestion: (key: string) => void;
  onDismissFlag: (key: string) => void;
}) {
  const pg: CSSProperties = { fontFamily: font, fontSize: "11pt", lineHeight: 1.4, color: "#000", background: "#fff", padding: "1in", maxWidth: "8.5in", margin: "0 auto", boxShadow: "0 4px 24px rgba(0,0,0,0.18)", minHeight: "11in", boxSizing: "border-box" };
  const secHdr: CSSProperties = { textAlign: "center", fontWeight: "bold", fontSize: "11pt", borderBottom: "1px solid #000", marginTop: "10pt", marginBottom: "4pt", paddingBottom: "2pt" };
  const jobHdr: CSSProperties = { display: "flex", justifyContent: "space-between", marginTop: "8pt" };

  return (
    <div style={pg}>
      <div style={{ textAlign: "center", marginBottom: "6pt" }}>
        <p style={{ fontSize: "16pt", fontWeight: "bold", margin: 0 }}>{candidateInfo.fullName || "Your Name"}</p>
        <p style={{ fontSize: "10pt", margin: "4pt 0 0" }}>{[candidateInfo.email, candidateInfo.linkedinUrl, candidateInfo.phone].filter(Boolean).join(" | ")}</p>
        {(candidateInfo.city || candidateInfo.state) && <p style={{ fontSize: "10pt", margin: "2pt 0 0" }}>{[candidateInfo.city, candidateInfo.state].filter(Boolean).join(", ")}</p>}
      </div>
      <hr style={{ border: "none", borderTop: "1px solid #000", margin: "6pt 0" }} />
      <div style={secHdr}>
        {editing ? <input value={resume.professionalTitle} onChange={(e) => onEdit("professionalTitle", e.target.value)} style={{ textAlign: "center", fontWeight: "bold", fontSize: "11pt", border: "1px dashed #aaa", width: "100%", background: "transparent", outline: "none", fontFamily: font }} /> : resume.professionalTitle}
      </div>
      <SectionWithFlag sectionKey="summary" flagged={flaggedSections["summary"]} loading={loadingSuggestion["summary"]} suggestion={suggestions["summary"]} onFlag={() => onFlagSection("summary")} onAccept={() => onAcceptSuggestion("summary")} onDismiss={() => onDismissFlag("summary")}>
        {editing ? <textarea value={resume.summary} onChange={(e) => onEdit("summary", e.target.value)} rows={4} style={{ width: "100%", fontSize: "11pt", fontFamily: font, border: "1px dashed #aaa", padding: "4px", boxSizing: "border-box", resize: "vertical" }} /> : <p style={{ margin: "4pt 0", fontSize: "11pt" }}>{resume.summary}</p>}
      </SectionWithFlag>
      <div style={secHdr}>CORE SKILLS</div>
      <SectionWithFlag sectionKey="skills" flagged={flaggedSections["skills"]} loading={loadingSuggestion["skills"]} suggestion={suggestions["skills"]} onFlag={() => onFlagSection("skills")} onAccept={() => onAcceptSuggestion("skills")} onDismiss={() => onDismissFlag("skills")}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2pt 16pt", margin: "4pt 0" }}>
          {resume.skills.map((skill, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "4pt" }}>
              <span>•</span>
              {editing ? <input value={skill} onChange={(e) => { const u = [...resume.skills]; u[i] = e.target.value; onEdit("skills", u); }} style={{ fontSize: "10pt", fontFamily: font, border: "1px dashed #aaa", width: "100%", background: "transparent" }} /> : <span style={{ fontSize: "10pt" }}>{skill}</span>}
            </div>
          ))}
        </div>
      </SectionWithFlag>
      <div style={secHdr}>EXPERIENCE</div>
      {resume.experience.map((job, ji) => (
        <div key={ji}>
          <div style={jobHdr}>
            <span style={{ fontSize: "11pt" }}>
              {editing ? <span style={{ display: "inline-flex", gap: "6px" }}><input value={job.company} onChange={(e) => { const ex = [...resume.experience]; ex[ji] = { ...ex[ji], company: e.target.value }; onEdit("experience", ex); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font, width: "140px" }} /><input value={job.location} onChange={(e) => { const ex = [...resume.experience]; ex[ji] = { ...ex[ji], location: e.target.value }; onEdit("experience", ex); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font, width: "100px" }} /></span> : `${job.company}${job.location ? `, ${job.location}` : ""}`}
            </span>
            <span style={{ fontSize: "10pt" }}>{editing ? <input value={job.dates} onChange={(e) => { const ex = [...resume.experience]; ex[ji] = { ...ex[ji], dates: e.target.value }; onEdit("experience", ex); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} /> : job.dates}</span>
          </div>
          <p style={{ fontStyle: "italic", margin: 0 }}>{editing ? <input value={job.title} onChange={(e) => { const ex = [...resume.experience]; ex[ji] = { ...ex[ji], title: e.target.value }; onEdit("experience", ex); }} style={{ fontSize: "10pt", fontStyle: "italic", border: "1px dashed #aaa", fontFamily: font, width: "60%" }} /> : job.title}</p>
          <ul style={{ margin: "2pt 0", paddingLeft: "20pt" }}>
            {job.bullets.map((b, bi) => (
              <li key={bi} style={{ margin: "2pt 0", listStyle: "disc" }}>{editing ? <input value={b} onChange={(e) => { const ex = [...resume.experience]; ex[ji].bullets[bi] = e.target.value; onEdit("experience", ex); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font, width: "95%" }} /> : b}</li>
            ))}
          </ul>
        </div>
      ))}
      {resume.education?.length > 0 && (
        <>
          <div style={secHdr}>EDUCATION</div>
          {resume.education.map((edu, ei) => (
            <div key={ei}>
              <div style={jobHdr}>
                <span>{editing ? <input value={edu.school} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], school: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} /> : edu.school}</span>
                <span style={{ fontSize: "10pt" }}>{editing ? <input value={edu.dates} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], dates: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", border: "1px dashed #aaa", fontFamily: font }} /> : edu.dates}</span>
              </div>
              <p style={{ fontStyle: "italic", margin: 0 }}>{editing ? <input value={edu.degree} onChange={(e) => { const ed = [...resume.education]; ed[ei] = { ...ed[ei], degree: e.target.value }; onEdit("education", ed); }} style={{ fontSize: "10pt", fontStyle: "italic", border: "1px dashed #aaa", fontFamily: font, width: "60%" }} /> : edu.degree}</p>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

// ─── Upload Zone ──────────────────────────────────────────────────────────────

function UploadZone({ loaded, onFile, inputId }: { loaded: boolean; onFile: (f: File) => void; inputId: string }) {
  const [drag, setDrag] = useState(false);
  return (
    <>
      <div
        style={{ border: `2px dashed ${drag ? "#6366f1" : "#2a2a2a"}`, borderRadius: "12px", padding: "28px 24px", textAlign: "center", cursor: "pointer", background: drag ? "#0d0d1a" : "#0d0d0d", transition: "all 0.2s" }}
        onClick={() => document.getElementById(inputId)?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) onFile(f); }}
      >
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>📄</div>
        <p style={{ color: loaded ? "#4ade80" : "#9ca3af", margin: "0 0 4px", fontSize: "14px", fontWeight: loaded ? 700 : 400 }}>
          {loaded ? "✅ Resume loaded — click to replace" : "Click to upload or drag & drop"}
        </p>
        <p style={{ color: "#444", margin: 0, fontSize: "12px", fontFamily: "monospace" }}>PDF · DOCX · TXT · PNG</p>
      </div>
      <input id={inputId} type="file" accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
    </>
  );
}

// ─── ISOLATED Optimizer Modal (one instance per slot, fully independent) ──────

function OptimizerModal({ slotId, slotLabel, resumeSlots, candidateInfo, onSave, onClose }: {
  slotId: string;
  slotLabel: string;
  resumeSlots: ResumeSlot[];
  candidateInfo: { fullName: string; email: string; phone: string; linkedinUrl: string; city: string; state: string };
  onSave: (slotId: string, resume: GeneratedResume, label: string) => void;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);
  const [rawResumeText, setRawResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [selectedJobs, setSelectedJobs] = useState<Job[]>([]);
  const [selectedEducation, setSelectedEducation] = useState<Education[]>([]);
  const [chosenFormat, setChosenFormat] = useState<"chronological" | "combination">("chronological");
  const [chosenFont, setChosenFont] = useState(FONTS[0].value);
  const [resumeTitle, setResumeTitle] = useState("");
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResume[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [editing, setEditing] = useState(false);
  const [flaggedSections, setFlaggedSections] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, { issue: string; revised: string } | null>>({});
  const [loadingSugg, setLoadingSugg] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileLoading, setFileLoading] = useState(false);
  const [saveToSlot, setSaveToSlot] = useState(slotId);
  const [generateProgress, setGenerateProgress] = useState("");

  // Each slot gets a unique input ID — prevents cross-slot interference
  const uploadInputId = `opt-upload-${slotId}-${Date.now()}`;

  async function handleResumeFile(file: File) {
    setFileLoading(true);
    setResumeFileName(file.name);
    setError("");
    try {
      const text = await extractTextFromFile(file);
      setRawResumeText(text);
    } catch {
      setError("Could not read file. Try a different format or paste the text.");
    }
    setFileLoading(false);
  }

  async function handleAnalyze() {
    if (!rawResumeText.trim()) { setError("Please upload or paste your resume."); return; }
    if (!jobDescription.trim()) { setError("Please paste a job description."); return; }
    setError(""); setLoading(true);
    try {
      const result = await callApi("analyze", { resumeText: rawResumeText, jobDescription });
      const safeResult = {
        ...result,
        jobs: Array.isArray(result.jobs) ? result.jobs : [],
        education: Array.isArray(result.education) ? result.education : [],
        careerTracks: Array.isArray(result.careerTracks) ? result.careerTracks : [],
        skills: Array.isArray(result.skills) ? result.skills : [],
        keywords: Array.isArray(result.keywords) ? result.keywords : [],
        matchScore: result.matchScore || 0,
        matchSummary: result.matchSummary || "",
        recommendedFormat: result.recommendedFormat || "chronological",
        formatReason: result.formatReason || "",
        professionalTitle: result.professionalTitle || "",
        hasMultipleCareerTracks: result.hasMultipleCareerTracks || false,
      };
      setAnalysis(safeResult);
      setSelectedJobs(safeResult.jobs.filter((j: Job) => j.relevant));
      setSelectedEducation(safeResult.education.filter((e: Education) => e.relevant));
      setChosenFormat(safeResult.recommendedFormat);
      setResumeTitle(safeResult.professionalTitle);
      setStep(2);
    } catch { setError("Analysis failed. Please try again."); }
    setLoading(false);
  }

  async function handleGenerate() {
    setLoading(true); setError(""); setStep(3);
    try {
      // Split into small calls each under 10 seconds to stay within Vercel Hobby limits

      // Call 1: Generate summary + skills
      setGenerateProgress("Building your professional summary...");
      const summaryData = await callApi("generateSummarySkills", {
        resumeText: rawResumeText, jobDescription, selectedJobs, resumeTitle, candidateInfo
      });

      // Call 2: Generate experience + education
      setGenerateProgress("Writing your experience section...");
      const expData = await callApi("generateExperience", {
        resumeText: rawResumeText, jobDescription, selectedJobs, selectedEducation,
        format: chosenFormat, candidateInfo
      });

      const main: GeneratedResume = {
        professionalTitle: summaryData.professionalTitle || resumeTitle,
        summary: summaryData.summary || "",
        skills: Array.isArray(summaryData.skills) ? summaryData.skills : [],
        experience: Array.isArray(expData.experience) ? expData.experience : [],
        education: Array.isArray(expData.education) ? expData.education : [],
      };

      const resumes: GeneratedResume[] = [main];

      // If multiple career tracks, generate alternate resume
      if (analysis?.hasMultipleCareerTracks && (analysis.careerTracks || []).length > 1) {
        const track2Jobs = (analysis.jobs || []).filter((j) =>
          (analysis.careerTracks[1]?.jobIds || []).includes(j.id)
        );
        if (track2Jobs.length > 0) {
          setGenerateProgress("Building your alternate career resume...");
          const altSummary = await callApi("generateAltSummarySkills", {
            alternatejobs: track2Jobs, candidateInfo
          });
          const altExp = await callApi("generateAltExperience", {
            alternatejobs: track2Jobs, selectedEducation
          });
          resumes.push({
            professionalTitle: altSummary.professionalTitle || "Professional Resume",
            summary: altSummary.summary || "",
            skills: Array.isArray(altSummary.skills) ? altSummary.skills : [],
            experience: Array.isArray(altExp.experience) ? altExp.experience : [],
            education: Array.isArray(altExp.education) ? altExp.education : [],
          });
        }
      }

      setGeneratedResumes(resumes);
      setActiveIdx(0);
      setStep(4);
    } catch (err: any) {
      setError("Generation failed. Please try again.");
      setStep(2);
    }
    setGenerateProgress("");
    setLoading(false);
  }

  async function handleFlagSection(key: string) {
    const resume = generatedResumes[activeIdx];
    if (!resume) return;
    setFlaggedSections((f) => ({ ...f, [key]: true }));
    setLoadingSugg((l) => ({ ...l, [key]: true }));
    const sectionContent = key === "summary" ? resume.summary : key === "skills" ? resume.skills.join(", ") : "";
    const result = await callApi("flagSection", { resumeText: rawResumeText, sectionKey: key, sectionContent });
    setSuggestions((s) => ({ ...s, [key]: result }));
    setLoadingSugg((l) => ({ ...l, [key]: false }));
  }

  function handleAcceptSuggestion(key: string) {
    const s = suggestions[key];
    if (!s) return;
    const updated = [...generatedResumes];
    if (key === "summary") updated[activeIdx] = { ...updated[activeIdx], summary: s.revised };
    if (key === "skills") updated[activeIdx] = { ...updated[activeIdx], skills: s.revised.split(",").map((x) => x.trim()) };
    setGeneratedResumes(updated);
    setFlaggedSections((f) => ({ ...f, [key]: false }));
    setSuggestions((sg) => ({ ...sg, [key]: null }));
  }

  function handleEditResume(field: string, value: any) {
    const updated = [...generatedResumes];
    updated[activeIdx] = { ...updated[activeIdx], [field]: value };
    setGeneratedResumes(updated);
  }

  function handleSave() {
    const resume = generatedResumes[activeIdx];
    if (!resume) return;
    const label = resume.professionalTitle + " Resume";
    onSave(saveToSlot, resume, label);
  }

  const pct = [0, 20, 40, 60, 80, 100][step] ?? 100;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.93)", zIndex: 100, overflowY: "auto" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "24px", fontWeight: 700, color: "#f5f5f5" }}>Resume Career Optimizer</h2>
            <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "14px" }}>
              Tailoring for: <strong style={{ color: "#a5b4fc" }}>{slotLabel}</strong>
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "1px solid #3f3f46", color: "#d4d4d8", borderRadius: "10px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>✕ Close</button>
        </div>

        {/* Progress bar */}
        <div style={{ height: "3px", background: "#1e1e1e", borderRadius: "999px", marginBottom: "28px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${pct}%`, background: "#4ade80", transition: "width 0.4s ease" }} />
        </div>

        {/* Steps indicator */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", alignItems: "center" }}>
          {["Input", "Analyze", "Review", "Generate", "Preview & Save"].map((label, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", flex: i < 4 ? 1 : "none" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, background: i < step ? "#4ade80" : i === step ? "#f5f5f5" : "#1a1a1a", color: i <= step ? "#0a0a0a" : "#666", border: i > step ? "1px solid #333" : "none", flexShrink: 0 }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: "10px", color: i === step ? "#f5f5f5" : "#555", fontFamily: "monospace", whiteSpace: "nowrap" }}>{label}</span>
              </div>
              {i < 4 && <div style={{ flex: 1, height: "1px", background: i < step ? "#4ade80" : "#222", margin: "0 6px 16px" }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ background: "#2a0f0f", border: "1px solid #5a1f1f", borderRadius: "10px", padding: "12px 16px", color: "#f87171", fontSize: "13px", fontFamily: "monospace", marginBottom: "16px" }}>{error}</div>}

        {/* STEP 0 — Input */}
        {step === 0 && (
          <div style={optCard}>
            <h3 style={optH3}>Upload your resume & paste a job description</h3>
            <p style={optSub}>This tool tailors your <strong>existing</strong> resume to a specific job — it cannot create a resume from scratch.</p>
            <label style={optLabel}>Your Resume</label>
            <UploadZone loaded={!!rawResumeText} inputId={uploadInputId} onFile={handleResumeFile} />
            {fileLoading && <p style={{ color: "#9ca3af", fontSize: "13px", margin: "8px 0", fontFamily: "monospace" }}>Reading file...</p>}
            {resumeFileName && !fileLoading && <p style={{ color: "#4ade80", fontSize: "12px", margin: "8px 0 0", fontFamily: "monospace" }}>📄 {resumeFileName}</p>}
            <p style={{ color: "#444", fontSize: "12px", textAlign: "center", margin: "12px 0 8px", fontFamily: "monospace" }}>— or paste text below —</p>
            <textarea style={{ ...optTextarea, marginBottom: "20px" }} rows={5} placeholder="Or paste your full resume text here..." value={rawResumeText} onChange={(e) => setRawResumeText(e.target.value)} />
            <label style={optLabel}>Job Description</label>
            <textarea style={optTextarea} rows={8} placeholder="Paste the full job posting here..." value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} />
            <button style={{ ...optBtn, marginTop: "20px", width: "100%" }} onClick={handleAnalyze} disabled={loading || fileLoading}>
              {loading ? "Analyzing..." : "Analyze Match →"}
            </button>
          </div>
        )}

        {/* STEP 1 — Analyzing spinner */}
        {step === 1 && (
          <div style={{ ...optCard, textAlign: "center", padding: "60px" }}>
            <div style={{ width: "44px", height: "44px", border: "2px solid #1e1e1e", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#9ca3af" }}>Analyzing your resume against the job description...</p>
          </div>
        )}

        {/* STEP 2 — Review Analysis */}
        {step === 2 && analysis && (
          <div>
            {/* Match Score */}
            <div style={{ ...optCard, marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "12px" }}>
                <div style={{ fontSize: "52px", fontWeight: 700, color: analysis.matchScore >= 60 ? "#4ade80" : analysis.matchScore >= 40 ? "#facc15" : "#f87171", lineHeight: 1 }}>
                  {analysis.matchScore}%
                </div>
                <div>
                  <p style={{ margin: 0, fontWeight: 700, color: "#f5f5f5", fontSize: "16px" }}>Match Score</p>
                  <p style={{ margin: "4px 0 0", color: "#9ca3af", fontSize: "14px" }}>{analysis.matchSummary}</p>
                </div>
              </div>
              {analysis.matchScore < 40 && (
                <div style={{ background: "#2a1500", border: "1px solid #92400e", borderRadius: "10px", padding: "14px 16px" }}>
                  <p style={{ margin: "0 0 4px", fontWeight: 700, color: "#fb923c" }}>⚠️ Low Match — Less than 40%</p>
                  <p style={{ margin: "0 0 12px", color: "#fdba74", fontSize: "13px" }}>Your background may not closely align with this role based on what we found. You can still proceed and we'll do our best to tailor your resume, but you may want to consider whether this role is a good fit.</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={optBtn} onClick={() => setStep(3)}>Yes, proceed anyway</button>
                    <button style={optBtnGhost} onClick={() => setStep(0)}>← Go back</button>
                  </div>
                </div>
              )}
            </div>

            {/* Format */}
            <div style={{ ...optCard, marginBottom: "16px" }}>
              <h3 style={optH3}>Resume Format</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>
                We recommend <strong style={{ color: "#f5f5f5" }}>{analysis.recommendedFormat}</strong> — {analysis.formatReason}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                {(["chronological", "combination"] as const).map((f) => (
                  <button key={f} onClick={() => setChosenFormat(f)} style={{ padding: "10px 20px", borderRadius: "10px", border: chosenFormat === f ? "2px solid #6366f1" : "1px solid #3f3f46", background: chosenFormat === f ? "#1e1b4b" : "transparent", color: chosenFormat === f ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontWeight: chosenFormat === f ? 700 : 400, fontSize: "14px", textTransform: "capitalize" }}>
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
                  Your resume shows experience in different career areas. We'll generate a tailored resume for this job <strong style={{ color: "#f5f5f5" }}>plus</strong> a separate resume for your other experience automatically.
                </p>
                {(analysis.careerTracks || []).map((track, i) => (
                  <div key={track.trackId} style={{ background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "12px", marginBottom: "8px" }}>
                    <p style={{ margin: 0, fontWeight: 700, color: "#a5b4fc", fontSize: "14px" }}>Resume {i + 1}: {track.label}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Select Jobs */}
            <div style={{ ...optCard, marginBottom: "16px" }}>
              <h3 style={optH3}>Select Jobs to Include</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>We've pre-selected the most relevant jobs. Uncheck any you want to leave out.</p>
              {(analysis.jobs || []).map((job) => {
                const isSel = selectedJobs.some((j) => j.id === job.id);
                return (
                  <div key={job.id} style={{ background: isSel ? "#0d1f16" : "#0d0d0d", border: `1px solid ${isSel ? "#2d5a3d" : "#2a2a2a"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => setSelectedJobs((prev) => isSel ? prev.filter((j) => j.id !== job.id) : [...prev, job])}>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${isSel ? "#4ade80" : "#3f3f46"}`, background: isSel ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
                        {isSel && <span style={{ color: "#0a0a0a", fontSize: "11px", fontWeight: 700 }}>✓</span>}
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
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>Uncheck any education you want to leave out.</p>
              {(analysis.education || []).map((edu) => {
                const isSel = selectedEducation.some((e) => e.id === edu.id);
                return (
                  <div key={edu.id} style={{ background: isSel ? "#0d1f16" : "#0d0d0d", border: `1px solid ${isSel ? "#2d5a3d" : "#2a2a2a"}`, borderRadius: "10px", padding: "14px", marginBottom: "8px", cursor: "pointer" }}
                    onClick={() => setSelectedEducation((prev) => isSel ? prev.filter((e) => e.id !== edu.id) : [...prev, edu])}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <div style={{ width: "18px", height: "18px", borderRadius: "4px", border: `2px solid ${isSel ? "#4ade80" : "#3f3f46"}`, background: isSel ? "#4ade80" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {isSel && <span style={{ color: "#0a0a0a", fontSize: "11px", fontWeight: 700 }}>✓</span>}
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
              <h3 style={optH3}>Professional Title</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>
                This appears centered at the top of your resume. We suggested one based on your experience — feel free to change it to anything you prefer, or use a traditional heading like "Summary".
              </p>
              <input value={resumeTitle} onChange={(e) => setResumeTitle(e.target.value)} style={{ width: "100%", padding: "14px 16px", borderRadius: "12px", border: "1px solid #2a2a2a", background: "#0d0d0d", color: "#f4f4f5", fontSize: "15px", boxSizing: "border-box", outline: "none" }} placeholder="e.g. Professional Truck Driver, Senior Marketing Manager..." />
            </div>

            {/* Font */}
            <div style={{ ...optCard, marginBottom: "24px" }}>
              <h3 style={optH3}>Choose Font</h3>
              <p style={{ color: "#9ca3af", fontSize: "14px", margin: "0 0 12px" }}>Pick the font for your resume. All three are ATS-friendly and professional.</p>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {FONTS.map((f) => (
                  <button key={f.value} onClick={() => setChosenFont(f.value)} style={{ padding: "10px 20px", borderRadius: "10px", border: chosenFont === f.value ? "2px solid #6366f1" : "1px solid #3f3f46", background: chosenFont === f.value ? "#1e1b4b" : "transparent", color: chosenFont === f.value ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontFamily: f.value, fontSize: "14px" }}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button style={optBtn} onClick={handleGenerate} disabled={loading}>
                {loading ? "Generating..." : "Generate Resume →"}
              </button>
              <button style={optBtnGhost} onClick={() => setStep(0)}>← Back</button>
            </div>
          </div>
        )}

        {/* STEP 3 — Generating */}
        {step === 3 && (
          <div style={{ ...optCard, textAlign: "center", padding: "60px" }}>
            <div style={{ width: "44px", height: "44px", border: "2px solid #1e1e1e", borderTop: "2px solid #4ade80", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 20px" }} />
            <p style={{ color: "#9ca3af", marginBottom: "8px" }}>
              {generateProgress || "Generating your tailored resume..."}
            </p>
            <p style={{ color: "#555", fontSize: "13px", fontFamily: "monospace" }}>Each step takes a few seconds</p>
          </div>
        )}

        {/* STEP 4 — Preview & Save */}
        {step === 4 && generatedResumes.length > 0 && (
          <div>
            {generatedResumes.length > 1 && (
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                {generatedResumes.map((r, i) => (
                  <button key={i} onClick={() => setActiveIdx(i)} style={{ padding: "10px 20px", borderRadius: "10px", border: activeIdx === i ? "2px solid #6366f1" : "1px solid #3f3f46", background: activeIdx === i ? "#1e1b4b" : "transparent", color: activeIdx === i ? "#a5b4fc" : "#9ca3af", cursor: "pointer", fontSize: "14px", fontWeight: activeIdx === i ? 700 : 400 }}>
                    Resume {i + 1}: {r.professionalTitle}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
              <button style={optBtn} onClick={() => setEditing((e) => !e)}>{editing ? "✓ Done Editing" : "✏️ Edit Resume"}</button>
              <button style={optBtnGhost} onClick={() => window.print()}>🖨️ Print</button>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "auto" }}>
                <span style={{ color: "#9ca3af", fontSize: "13px" }}>Save to:</span>
                <select value={saveToSlot} onChange={(e) => setSaveToSlot(e.target.value)} style={{ background: "#111", border: "1px solid #3f3f46", color: "#f5f5f5", borderRadius: "8px", padding: "8px 12px", fontSize: "13px" }}>
                  {resumeSlots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
                <button style={optBtn} onClick={handleSave}>Save Resume</button>
              </div>
            </div>
            <div style={{ overflow: "auto" }}>
              <ResumePreview
                resume={generatedResumes[activeIdx]}
                candidateInfo={candidateInfo}
                font={chosenFont}
                editing={editing}
                onEdit={handleEditResume}
                onFlagSection={handleFlagSection}
                flaggedSections={flaggedSections}
                suggestions={suggestions}
                loadingSuggestion={loadingSugg}
                onAcceptSuggestion={handleAcceptSuggestion}
                onDismissFlag={(key) => { setFlaggedSections((f) => ({ ...f, [key]: false })); setSuggestions((sg) => ({ ...sg, [key]: null })); }}
              />
            </div>
          </div>
        )}
      </div>
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

  // Slot 1 direct upload
  const [slot1Uploading, setSlot1Uploading] = useState(false);
  const [slot1FileName, setSlot1FileName] = useState("");

  // Which optimizer is open — null means none, slotId means that slot's optimizer is open
  const [openOptimizerSlot, setOpenOptimizerSlot] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) { window.location.href = "/sign-in"; return; }
      const { data: profile, error: profileError } = await supabase.from("candidate_profiles").select("*").eq("user_id", authData.user.id).single();
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
      if (profile.resume_slots && Array.isArray(profile.resume_slots) && profile.resume_slots.length > 0) {
        setResumeSlots(profile.resume_slots);
      } else {
        setResumeSlots(EMPTY_SLOTS);
      }
      if (!trackedRef.current) {
        trackedRef.current = true;
        await supabase.from("user_activity").insert({ user_id: authData.user.id, full_name: profile.full_name || null, email: profile.email || authData.user.email || null, referral_code: profile.referral_code || null, event_type: "profile_viewed", tool_name: "profile", page_name: "/profile" });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  async function uploadFile(bucket: string, file: File, folder: string) {
    const fileExt = file.name.split(".").pop() || "file";
    const filePath = `${folder}/${Date.now()}.${fileExt}`;
    const { error } = await supabase.storage.from(bucket).upload(filePath, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleSaveProfile(updatedSlots?: ResumeSlot[]) {
    setMessage("");
    if (!userId) { setMessage("You must be signed in."); return; }
    try {
      setSaving(true);
      let nextPhotoUrl = photoUrl;
      if (photoFile) nextPhotoUrl = await uploadFile("profile-photos", photoFile, `${userId}/photo`);
      const slug = slugify(fullName || "career-passport");
      const publicUrl = `${window.location.origin}/passport/${slug}-${userId.slice(0, 8)}`;
      const slots = updatedSlots || resumeSlots;
      const payload = { user_id: userId, full_name: fullName, phone, email, city, state: stateName, bio, headline, linkedin_url: linkedinUrl, photo_url: nextPhotoUrl || null, resume_slots: slots, public_profile_url: publicUrl };
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

  function setVisibleSlot(slotId: string) {
    setResumeSlots((prev) => prev.map((s) => ({ ...s, isVisible: s.id === slotId })));
  }

  function updateSlotLabel(slotId: string, label: string) {
    setResumeSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, label } : s));
  }

  // Remove a resume from any slot
  function handleRemoveResume(slotId: string) {
    if (!confirm("Are you sure you want to remove this resume?")) return;
    setResumeSlots((prev) => prev.map((s) => s.id === slotId ? { ...s, resumeUrl: null, resumeData: null, isVisible: false, createdAt: null } : s));
    if (slotId === "slot1") setSlot1FileName("");
    setMessage("Resume removed.");
  }

  // Slot 1 direct upload
  async function handleSlot1Upload(file: File) {
    try {
      setSlot1Uploading(true);
      setSlot1FileName(file.name);
      const url = await uploadFile("resumes", file, `${userId}/slot1`);
      const updatedSlots = resumeSlots.map((s) => s.id === "slot1" ? { ...s, resumeUrl: url, createdAt: new Date().toISOString() } : s);
      setResumeSlots(updatedSlots);
      setMessage("Resume uploaded to Slot 1!");
      await handleSaveProfile(updatedSlots);
    } catch (err: any) {
      setMessage(err.message || "Upload failed.");
    } finally {
      setSlot1Uploading(false);
    }
  }

  // Called when optimizer saves a resume
  async function handleOptimizerSave(slotId: string, resume: GeneratedResume, label: string) {
    const updated = resumeSlots.map((s) => s.id === slotId ? { ...s, resumeData: resume, label, createdAt: new Date().toISOString() } : s);
    setResumeSlots(updated);
    setOpenOptimizerSlot(null);
    setMessage(`Resume saved to ${label}!`);
    await handleSaveProfile(updated);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/sign-in";
  }

  if (loading) return <main style={st.page}><div style={st.centerWrap}>Loading...</div></main>;

  const candidateInfo = { fullName, email, phone, linkedinUrl, city, state: stateName };
  const openSlot = resumeSlots.find((s) => s.id === openOptimizerSlot);

  return (
    <main style={st.page}>
      <style>{`@media print { .no-print { display: none !important; } body { background: white; } }`}</style>

      <div style={st.shell}>
        {/* Hero */}
        <section style={st.hero}>
          <div style={st.heroLeft}>
            <p style={st.kicker}>Career Passport</p>
            <h1 style={st.title}>Career Passport Editor</h1>
            <p style={st.subtitle}>Update your profile, manage your resumes, and share your Career Passport with employers.</p>
          </div>
          <button onClick={handleSignOut} style={st.secondaryButton}>Sign Out</button>
        </section>

        {/* Profile Strip */}
        <section style={st.profileStrip}>
          <div style={st.profileStripLeft}>
            {photoUrl ? <img src={photoUrl} alt="Profile" style={st.avatar} /> : <div style={st.avatarPlaceholder}>No Photo</div>}
            <div>
              <label style={st.label}>Profile Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files?.[0] || null)} style={st.input} />
            </div>
          </div>
          <div style={st.profileStripRight}>
            <h2 style={st.namePreview}>{fullName || "Your Name"}</h2>
            <p style={st.headlinePreview}>{headline || "Professional Headline"}</p>
            <p style={st.metaPreview}>{[city, stateName].filter(Boolean).join(", ") || "City, State"}</p>
            <p style={st.metaPreview}>{email || "email@example.com"}</p>
            {publicProfileUrl && <a href={publicProfileUrl} target="_blank" rel="noopener noreferrer" style={st.publicLink}>🔗 View Public Profile</a>}
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
            <p style={st.flowText}>Store up to 3 resumes. Choose which one is visible to employers on your public Career Passport.</p>
          </div>

          <div style={{ display: "grid", gap: "16px" }}>
            {resumeSlots.map((slot) => (
              <div key={slot.id} style={{ ...glass, borderRadius: "20px", padding: "24px", display: "grid", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <input value={slot.label} onChange={(e) => updateSlotLabel(slot.id, e.target.value)} style={{ ...st.input, width: "260px", fontSize: "14px", fontWeight: 700, padding: "8px 12px" }} />
                    {slot.isVisible && <span style={{ fontSize: "11px", background: "#1e3a2f", color: "#4ade80", border: "1px solid #2d5a3d", padding: "3px 10px", borderRadius: "999px", fontFamily: "monospace" }}>Visible to Employers</span>}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {!slot.isVisible && (slot.resumeUrl || slot.resumeData) && (
                      <button onClick={() => setVisibleSlot(slot.id)} style={{ ...st.secondaryButton, fontSize: "13px", padding: "8px 14px" }}>Set as Visible</button>
                    )}
                    <button
                      onClick={() => setOpenOptimizerSlot(slot.id)}
                      style={{ ...st.secondaryButton, fontSize: "13px", padding: "8px 14px", borderColor: "#6366f1", color: "#a5b4fc" }}
                    >
                      + Resume Career Optimizer
                    </button>
                  </div>
                </div>

                {/* Slot 1 — direct upload OR optimizer */}
                {slot.id === "slot1" && (
                  <div>
                    <p style={{ margin: "0 0 10px", color: "#9ca3af", fontSize: "13px" }}>
                      Upload a resume directly <span style={{ color: "#6b7280" }}>— or use the optimizer above to tailor it</span>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "10px", padding: "10px 16px", cursor: "pointer", fontSize: "13px", color: "#f5f5f5" }}>
                        📄 {slot1Uploading ? "Uploading..." : slot1FileName ? `Replace: ${slot1FileName}` : slot.resumeUrl ? "Replace Resume" : "Upload Resume"}
                        <input type="file" accept=".pdf,.doc,.docx,.txt,.png" style={{ display: "none" }} onChange={async (e) => { const f = e.target.files?.[0]; if (f) await handleSlot1Upload(f); }} />
                      </label>
                      {slot.resumeUrl && (
                        <>
                          <a href={slot.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#a5b4fc", fontSize: "13px", textDecoration: "underline" }}>View resume</a>
                          <button onClick={() => handleRemoveResume("slot1")} style={{ fontSize: "12px", color: "#f87171", background: "transparent", border: "1px solid #5a1f1f", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}>✕ Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Slots 2 & 3 — optimizer only */}
                {slot.id !== "slot1" && !slot.resumeData && (
                  <p style={{ margin: 0, color: "#6b7280", fontSize: "13px" }}>No resume saved yet. Use the Resume Career Optimizer to generate one.</p>
                )}

                {/* Saved resume data (slots 2 & 3) */}
                {slot.resumeData && (
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                    <p style={{ margin: 0, color: "#9ca3af", fontSize: "13px" }}>
                      {slot.resumeData.professionalTitle} · Saved {slot.createdAt ? new Date(slot.createdAt).toLocaleDateString() : ""}
                    </p>
                    <button
                      onClick={() => setOpenOptimizerSlot(slot.id)}
                      style={{ fontSize: "12px", color: "#f5f5f5", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
                    >
                      Preview / Edit
                    </button>
                    <button
                      onClick={() => handleRemoveResume(slot.id)}
                      style={{ fontSize: "12px", color: "#f87171", background: "transparent", border: "1px solid #5a1f1f", borderRadius: "8px", padding: "6px 12px", cursor: "pointer" }}
                    >
                      ✕ Remove
                    </button>
                  </div>
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

        <section style={st.bottomDock}>
          <button onClick={() => handleSaveProfile()} disabled={saving} style={st.primaryButton}>{saving ? "Saving..." : "Save Profile"}</button>
        </section>

        {message && <p style={st.message}>{message}</p>}
      </div>

      {/* Render optimizer only for the open slot — fully isolated */}
      {openOptimizerSlot && openSlot && (
        <OptimizerModal
          key={openOptimizerSlot}
          slotId={openOptimizerSlot}
          slotLabel={openSlot.label}
          resumeSlots={resumeSlots}
          candidateInfo={candidateInfo}
          onSave={handleOptimizerSave}
          onClose={() => setOpenOptimizerSlot(null)}
        />
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

const glass: CSSProperties = { background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 18px 60px rgba(0,0,0,0.22)", backdropFilter: "blur(14px)" };

const optCard: CSSProperties = { background: "#111", border: "1px solid #1e1e1e", borderRadius: "16px", padding: "28px", marginBottom: "16px" };
const optH3: CSSProperties = { fontSize: "18px", fontWeight: 700, color: "#f5f5f5", margin: "0 0 8px" };
const optSub: CSSProperties = { color: "#9ca3af", fontSize: "14px", margin: "0 0 20px" };
const optLabel: CSSProperties = { fontSize: "11px", color: "#9ca3af", fontFamily: "monospace", letterSpacing: "0.5px", textTransform: "uppercase", display: "block", marginBottom: "8px" };
const optTextarea: CSSProperties = { width: "100%", background: "#0d0d0d", border: "1px solid #2a2a2a", borderRadius: "10px", padding: "14px", color: "#f0ede8", fontSize: "14px", lineHeight: 1.7, fontFamily: "inherit", resize: "vertical", outline: "none", boxSizing: "border-box" };
const optBtn: CSSProperties = { background: "#f0ede8", color: "#0a0a0a", border: "none", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", fontWeight: 700, cursor: "pointer" };
const optBtnGhost: CSSProperties = { background: "transparent", color: "#9ca3af", border: "1px solid #3f3f46", borderRadius: "10px", padding: "12px 24px", fontSize: "14px", cursor: "pointer" };

const st: Record<string, CSSProperties> = {
  page: { minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(59,130,246,0.12) 0%, transparent 20%), linear-gradient(180deg, #040404 0%, #0b0b0d 100%)", color: "#e7e7e7", padding: "34px 24px 64px", fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif" },
  centerWrap: { maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" },
  shell: { maxWidth: "1320px", margin: "0 auto", display: "grid", gap: "24px" },
  hero: { display: "flex", justifyContent: "space-between", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" },
  heroLeft: { maxWidth: "860px" },
  kicker: { margin: "0 0 8px", color: "#9ca3af", fontSize: "12px", letterSpacing: "0.18em", textTransform: "uppercase" },
  title: { margin: "0 0 12px", fontSize: "46px", fontWeight: 700, lineHeight: 1.02, letterSpacing: "-0.04em", color: "#f5f5f5" },
  subtitle: { margin: 0, color: "#d4d4d8", fontSize: "16px", lineHeight: 1.85, maxWidth: "780px" },
  profileStrip: { ...glass, borderRadius: "34px", padding: "26px", display: "grid", gridTemplateColumns: "220px 1fr", gap: "26px", alignItems: "center" },
  profileStripLeft: { display: "grid", gap: "14px" },
  profileStripRight: { minWidth: 0 },
  avatar: { width: "200px", height: "200px", borderRadius: "26px", objectFit: "cover", border: "1px solid rgba(255,255,255,0.08)" },
  avatarPlaceholder: { width: "200px", height: "200px", borderRadius: "26px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,0.04)", color: "#cbd5e1", border: "1px solid rgba(255,255,255,0.08)" },
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
  bottomDock: { display: "grid", gridTemplateColumns: "1fr", gap: "12px", maxWidth: "260px", marginTop: "4px" },
  primaryButton: { width: "100%", padding: "15px 18px", borderRadius: "18px", border: "1px solid #d1d5db", background: "linear-gradient(180deg, #d4d4d8 0%, #a3a3a3 100%)", color: "#09090b", fontSize: "15px", fontWeight: 700, cursor: "pointer" },
  secondaryButton: { padding: "12px 16px", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.04)", color: "#f5f5f5", fontWeight: 700, cursor: "pointer", backdropFilter: "blur(10px)" },
  fieldWrap: { display: "grid", gap: "8px" },
  label: { color: "#d4d4d8", fontSize: "13px", fontWeight: 600 },
  input: { width: "100%", padding: "14px 16px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.035)", color: "#f4f4f5", fontSize: "15px", boxSizing: "border-box", outline: "none", backdropFilter: "blur(10px)" },
  textarea: { width: "100%", minHeight: "130px", padding: "14px 16px", borderRadius: "20px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.035)", color: "#f4f4f5", fontSize: "15px", resize: "vertical", boxSizing: "border-box", outline: "none", backdropFilter: "blur(10px)" },
  message: { marginTop: "2px", color: "#e5e5e5", fontSize: "14px", lineHeight: 1.6 },
};
