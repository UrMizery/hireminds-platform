"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { supabase } from "../../lib/supabase";

type Analysis = {
  overallMatch: number;
  matchLabel: string;
  recommendation: string;
  recommendationReason: string;
  breakdown: {
    requiredQualifications: number;
    experienceAlignment: number;
    skillsAlignment: number;
    preferredQualifications: number;
    educationCertifications: number;
    keywordsTerminology: number;
    resumeAtsStructure: number;
  };
  areYouQualified: string;
  competitivePosition: string;
  employerFirstImpression: string;
  strongestEvidence: string[];
  requiredQualificationsMet: string[];
  requiredQualificationsUnclear: string[];
  requiredQualificationsNotFound: string[];
  preferredQualificationsMet: string[];
  preferredQualificationsNotFound: string[];
  matchedSkillsKeywords: string[];
  missingSkillsKeywords: string[];
  whatIsWorking: string[];
  screenOutRisks: string[];
  resumeQualityFlags: string[];
  fixFirst: string[];
  tailoringRecommendations: string[];
  doNotInvent: string[];
  coverLetterStrategy: string[];
  interviewReadiness: string[];
  likelyInterviewQuestions: string[];
  concernsToPrepareFor: string[];
  nextMove: string;
  coachingSummary: string;
};

const DISCLAIMER =
  "HireMinds Job Match Analyzer is an ATS-style screening and career coaching tool that uses HireMinds' own scoring methodology. It does not replicate or represent the proprietary scoring algorithms used by employer Applicant Tracking Systems (ATS) such as Workday, Greenhouse, iCIMS, or other platforms. ATS configurations and employer screening criteria vary. Match scores, recommendations, and coaching guidance are provided for career development purposes and do not guarantee an interview, job offer, or employment.";

const ACKNOWLEDGEMENT =
  "I understand that HireMinds Job Match Analyzer is an ATS-style screening and career coaching tool and that results do not guarantee an interview, job offer, or employment.";

export default function JobMatchAnalyzerPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [started, setStarted] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [hasImage, setHasImage] = useState<boolean | null>(null);
  const [imageCount, setImageCount] = useState<number | null>(null);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loadingResume, setLoadingResume] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [userId, setUserId] = useState("");
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    async function trackOpen() {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user || trackedRef.current) return;
      trackedRef.current = true;
      setUserId(data.user.id);

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("full_name, email, referral_code")
        .eq("user_id", data.user.id)
        .maybeSingle();

      setReferralCode(profile?.referral_code || null);

      await supabase.from("user_activity").insert({
        user_id: data.user.id,
        full_name: profile?.full_name || null,
        email: profile?.email || data.user.email || null,
        referral_code: profile?.referral_code || null,
        event_type: "tool_opened",
        tool_name: "job_match_analyzer",
        page_name: "/career-toolkit/job-description-analyzer",
      });
    }
    trackOpen();
  }, []);

  async function uploadResume(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setAnalysis(null);
    setLoadingResume(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["pdf", "docx"].includes(ext)) {
        throw new Error("Please upload a PDF or DOCX resume.");
      }
      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Resume files must be 8MB or smaller.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/job-match-resume-parse", {
        method: "POST",
        body: formData,
      });
      const responseText = await response.text();

let data: any;

try {
  data = JSON.parse(responseText);
} catch {
  console.error(
    "Job Match Analyzer returned non-JSON:",
    responseText
  );

  throw new Error(
    responseText?.slice(0, 300) ||
      "The Job Match Analyzer server returned an unexpected response."
  );
}
      if (!response.ok) throw new Error(data?.error || "Unable to read the resume.");

      const text = String(data?.text || data?.parsedText || data?.resumeText || "").trim();
      if (!text) {
        throw new Error("No readable resume text was found. Try DOCX or paste the resume text below.");
      }

      setResumeText(text);
      setResumeFileName(data?.fileName || file.name);
      setPageCount(typeof data?.pageCount === "number" ? data.pageCount : null);
      setHasImage(typeof data?.hasImage === "boolean" ? data.hasImage : null);
      setImageCount(typeof data?.imageCount === "number" ? data.imageCount : null);
    } catch (e: any) {
      setError(e?.message || "Unable to upload the resume.");
    } finally {
      setLoadingResume(false);
      event.target.value = "";
    }
  }

  async function analyze() {
    if (!acknowledged || !started || jobDescription.trim().length < 80 || resumeText.trim().length < 80) return;

    setError("");
    setAnalysis(null);
    setAnalyzing(true);

    try {
      const response = await fetch("/api/job-match-analyzer-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle,
          jobDescription,
          resumeText,
          resumeMetadata: { fileName: resumeFileName || null, pageCount, hasImage, imageCount },
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "The analysis could not be completed.");
      setAnalysis(data);

      if (userId) {
        await supabase.from("user_activity").insert({
          user_id: userId,
          full_name: null,
          email: null,
          referral_code: referralCode,
          event_type: "tool_completed",
          tool_name: "job_match_analyzer",
          page_name: "/career-toolkit/job-description-analyzer",
        });
      }
    } catch (e: any) {
      setError(e?.message || "The analysis could not be completed.");
    } finally {
      setAnalyzing(false);
    }
  }

  function saveAnalysis() {
    if (!analysis) return;
    const list = (title: string, items: string[]) => `${title}\n${items.length ? items.map(x => `• ${x}`).join("\n") : "None noted"}`;
    const b = analysis.breakdown;
    const text = `
HIREMINDS JOB MATCH ANALYZER
${jobTitle ? `Job Title: ${jobTitle}` : ""}

OVERALL MATCH
${analysis.overallMatch}% — ${analysis.matchLabel}

CAREER COACH RECOMMENDATION
${analysis.recommendation}
${analysis.recommendationReason}

SCORE BREAKDOWN
Required Qualifications: ${b.requiredQualifications}%
Experience Alignment: ${b.experienceAlignment}%
Skills Alignment: ${b.skillsAlignment}%
Preferred Qualifications: ${b.preferredQualifications}%
Education / Certifications: ${b.educationCertifications}%
Keywords / Terminology: ${b.keywordsTerminology}%
Resume / ATS Structure: ${b.resumeAtsStructure}%

ARE YOU QUALIFIED?
${analysis.areYouQualified}

COMPETITIVE POSITION
${analysis.competitivePosition}

WHAT THE EMPLOYER MAY SEE FIRST
${analysis.employerFirstImpression}

${list("STRONGEST EVIDENCE", analysis.strongestEvidence)}

${list("REQUIRED QUALIFICATIONS MET", analysis.requiredQualificationsMet)}

${list("REQUIRED QUALIFICATIONS UNCLEAR", analysis.requiredQualificationsUnclear)}

${list("REQUIRED QUALIFICATIONS NOT FOUND ON RESUME", analysis.requiredQualificationsNotFound)}

${list("PREFERRED QUALIFICATIONS MET", analysis.preferredQualificationsMet)}

${list("PREFERRED QUALIFICATIONS NOT FOUND", analysis.preferredQualificationsNotFound)}

${list("MATCHED SKILLS / KEYWORDS", analysis.matchedSkillsKeywords)}

${list("MISSING / UNDERREPRESENTED SKILLS / KEYWORDS", analysis.missingSkillsKeywords)}

${list("WHAT IS WORKING", analysis.whatIsWorking)}

${list("WHAT MAY GET YOU SCREENED OUT", analysis.screenOutRisks)}

${list("RESUME QUALITY / ATS FLAGS", analysis.resumeQualityFlags)}

${list("WHAT TO FIX FIRST", analysis.fixFirst)}

${list("HOW TO TAILOR THIS RESUME", analysis.tailoringRecommendations)}

${list("DO NOT CHANGE / DO NOT INVENT", analysis.doNotInvent)}

${list("COVER LETTER STRATEGY", analysis.coverLetterStrategy)}

${list("INTERVIEW READINESS", analysis.interviewReadiness)}

${list("LIKELY INTERVIEW QUESTIONS", analysis.likelyInterviewQuestions)}

${list("CONCERNS TO PREPARE FOR", analysis.concernsToPrepareFor)}

CAREER COACH NEXT MOVE
${analysis.nextMove}

COACHING SUMMARY
${analysis.coachingSummary}

DISCLAIMER
${DISCLAIMER}`.trim();

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hireminds-job-match-analysis.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  const canAnalyze = acknowledged && started && jobDescription.trim().length >= 80 && resumeText.trim().length >= 80 && !analyzing && !loadingResume;

  return (
    <main className="jm-page">
      <style>{css}</style>
      <div className="jm-shell">
        <section className="jm-hero">
          <p className="jm-kicker">Career ToolKit • HireMinds Career Coach</p>
          <h1>Job Match <span>Analyzer.</span></h1>
          <p>Compare your resume to a real job posting, understand how your background may be screened, identify what to strengthen, and get clear career-coach guidance before you apply.</p>
          <div className="jm-actions no-print">
            <a href="/career-toolkit">Back to Career ToolKit</a>
            <button disabled={!analysis} onClick={saveAnalysis}>Save Analysis</button>
            <button disabled={!analysis} onClick={() => window.print()}>Print / Save PDF</button>
          </div>
        </section>

        <section className="jm-disclaimer">
          <div className="jm-badge">Required acknowledgement</div>
          <h2>Before you begin</h2>
          <p>{DISCLAIMER}</p>
          <label className="jm-check">
            <input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} />
            <span>{ACKNOWLEDGEMENT}</span>
          </label>
          <button className="jm-primary no-print" disabled={!acknowledged} onClick={() => setStarted(true)}>
            {acknowledged ? "Continue to Job Match Analyzer" : "Acknowledge to Continue"}
          </button>
        </section>

        {!started ? (
          <section className="jm-intro">
            <p className="jm-kicker">Career coaching starts with context</p>
            <h2>One job. One resume. A clearer next move.</h2>
            <p>The percentage supports the coaching decision. It does not replace it.</p>
          </section>
        ) : (
          <div className="jm-grid">
            <section className="jm-input no-print">
              <p className="jm-kicker">Step 1</p>
              <h2>Add the opportunity</h2>
              <label>Job Title (optional)</label>
              <input value={jobTitle} onChange={e => { setJobTitle(e.target.value); setAnalysis(null); }} placeholder="Example: HR Coordinator" />
              <label>Full Job Description</label>
              <textarea className="jm-job" value={jobDescription} onChange={e => { setJobDescription(e.target.value); setAnalysis(null); }} placeholder="Paste the complete job description here." />

              <hr />
              <p className="jm-kicker">Step 2</p>
              <h2>Add your resume</h2>
              <p className="jm-muted">Upload PDF or DOCX. Paste text below only as a backup.</p>
              <input ref={fileRef} type="file" hidden accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={uploadResume} />
              <button className="jm-upload" onClick={() => fileRef.current?.click()} disabled={loadingResume}>
                {loadingResume ? "Reading Resume..." : resumeFileName ? "Upload Different Resume" : "Upload Resume — PDF or DOCX"}
              </button>
              {resumeFileName && <div className="jm-file"><strong>{resumeFileName}</strong><span>Resume text loaded{pageCount ? ` • ${pageCount} page${pageCount === 1 ? "" : "s"}` : ""}</span></div>}
              <label>Resume Text</label>
              <textarea className="jm-resume" value={resumeText} onChange={e => { setResumeText(e.target.value); setAnalysis(null); }} placeholder="Uploaded resume text will appear here. You may also paste resume text manually." />
              {error && <div className="jm-error">{error}</div>}
              <button className="jm-primary" disabled={!canAnalyze} onClick={analyze}>
                {analyzing ? "HireMinds Career Coach is reviewing..." : "Analyze Resume + Job"}
              </button>
            </section>

            <section className="jm-results print-wrap">
              {!analysis ? <EmptyState /> : <Results analysis={analysis} jobTitle={jobTitle} />}
            </section>
          </div>
        )}
      </div>
    </main>
  );
}

function EmptyState() {
  return <div className="jm-paper jm-empty"><p className="jm-kicker">HireMinds Career Coach</p><h2>Your assessment will appear here.</h2><p>ATS-style screening, resume strategy, job-fit analysis, and career coaching will be reviewed together.</p></div>;
}

function Results({ analysis, jobTitle }: { analysis: Analysis; jobTitle: string }) {
  const b = analysis.breakdown;
  const scores = [
    ["Required Qualifications", b.requiredQualifications],
    ["Experience Alignment", b.experienceAlignment],
    ["Skills Alignment", b.skillsAlignment],
    ["Preferred Qualifications", b.preferredQualifications],
    ["Education / Certifications", b.educationCertifications],
    ["Keywords / Terminology", b.keywordsTerminology],
    ["Resume / ATS Structure", b.resumeAtsStructure],
  ] as const;

  return <div className="jm-paper">
    <p className="jm-kicker">HireMinds Career Coach Assessment</p>
    <h2>{jobTitle || "Job Match Analysis"}</h2>
    <div className="jm-overall"><div><small>Overall Job Match</small><strong>{analysis.overallMatch}%</strong></div><div><b>{analysis.matchLabel}</b><h3>{analysis.recommendation}</h3><p>{analysis.recommendationReason}</p></div></div>
    <div className="jm-score-grid">{scores.map(([label, value]) => <Score key={label} label={label} value={value} />)}</div>

    <Narrative title="Are You Qualified?" text={analysis.areYouQualified} />
    <Narrative title="Your Competitive Position" text={analysis.competitivePosition} />
    <Narrative title="What the Employer May See First" text={analysis.employerFirstImpression} />

    <List title="Strongest Evidence" items={analysis.strongestEvidence} />
    <List title="Required Qualifications Met" items={analysis.requiredQualificationsMet} />
    <List title="Required Qualifications — Unclear" items={analysis.requiredQualificationsUnclear} note="Unclear means the qualification was not demonstrated clearly enough in the resume. It does not automatically mean you do not have it." />
    <List title="Required Qualifications Not Found on the Resume" items={analysis.requiredQualificationsNotFound} note="Not found on the resume is different from not having the qualification. Verify your actual background before making any change." />
    <List title="Preferred Qualifications Met" items={analysis.preferredQualificationsMet} />
    <List title="Preferred Qualifications Not Found" items={analysis.preferredQualificationsNotFound} />
    <List title="Matched Skills + Keywords" items={analysis.matchedSkillsKeywords} />
    <List title="Missing / Underrepresented Skills + Keywords" items={analysis.missingSkillsKeywords} />
    <List title="What's Working" items={analysis.whatIsWorking} />
    <List title="What May Get You Screened Out" items={analysis.screenOutRisks} />
    <List title="Resume Quality + ATS Review" items={analysis.resumeQualityFlags} />
    <List title="What to Fix First" items={analysis.fixFirst} />
    <List title="How to Tailor This Resume" items={analysis.tailoringRecommendations} />
    <List title="Do Not Change / Do Not Invent" items={analysis.doNotInvent} />
    <List title="Cover Letter Strategy" items={analysis.coverLetterStrategy} />
    <List title="Interview Readiness" items={analysis.interviewReadiness} />
    <List title="Questions You Should Be Ready to Answer" items={analysis.likelyInterviewQuestions} />
    <List title="Potential Concerns to Prepare For" items={analysis.concernsToPrepareFor} />

    <div className="jm-next"><small>Career Coach Next Move</small><h3>{analysis.nextMove}</h3><p>{analysis.coachingSummary}</p></div>
    <div className="jm-final-disclaimer"><strong>Important Disclaimer:</strong> {DISCLAIMER}</div>
  </div>;
}

function Score({ label, value }: { label: string; value: number }) {
  return <div className="jm-score"><div><span>{label}</span><b>{value}%</b></div><div className="jm-track"><i style={{ width: `${value}%` }} /></div></div>;
}

function Narrative({ title, text }: { title: string; text: string }) {
  return <section className="jm-card"><h3>{title}</h3><p>{text || "No clear coaching note was generated."}</p></section>;
}

function List({ title, items, note }: { title: string; items: string[]; note?: string }) {
  return <section className="jm-card"><h3>{title}</h3>{items?.length ? <ul>{items.map((x, i) => <li key={`${title}-${i}`}>{x}</li>)}</ul> : <p className="jm-muted">Nothing significant was identified in this area.</p>}{note && <div className="jm-note">{note}</div>}</section>;
}

const css = `
*{box-sizing:border-box}.jm-page{min-height:100vh;background:radial-gradient(ellipse at 12% 8%,rgba(22,119,255,.12),transparent 34%),linear-gradient(180deg,#030812 0%,#07111f 52%,#030812 100%);color:#f8fafc;padding:28px 22px 70px;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.jm-shell{width:min(1500px,100%);margin:auto;display:grid;gap:22px}.jm-hero{border:1px solid rgba(255,255,255,.08);border-radius:30px;padding:54px 52px;background:linear-gradient(135deg,rgba(2,8,23,.98),rgba(8,22,44,.96) 58%,rgba(8,18,35,.98));box-shadow:0 30px 100px rgba(0,0,0,.34)}.jm-kicker{margin:0 0 12px;color:#60a5fa;font-size:11px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.jm-hero h1{margin:0;font-family:Georgia,"Times New Roman",serif;font-size:68px;line-height:.98;font-weight:500;letter-spacing:-.045em}.jm-hero h1 span{color:#60a5fa}.jm-hero>p:not(.jm-kicker){max-width:900px;color:#cbd5e1;font-size:17px;line-height:1.75}.jm-actions{display:flex;flex-wrap:wrap;gap:11px;margin-top:28px}.jm-actions a,.jm-actions button{padding:12px 16px;border-radius:12px;border:1px solid rgba(148,163,184,.28);background:#08111f;color:#f8fafc;text-decoration:none;font-size:13px;font-weight:800;cursor:pointer}.jm-actions button:disabled{opacity:.35;cursor:not-allowed}.jm-disclaimer{border-radius:24px;border:1px solid rgba(96,165,250,.28);background:linear-gradient(135deg,rgba(15,23,42,.94),rgba(8,20,40,.96));padding:26px}.jm-badge{display:inline-flex;padding:6px 10px;border-radius:999px;background:rgba(22,119,255,.13);border:1px solid rgba(96,165,250,.28);color:#bfdbfe;font-size:11px;font-weight:900;text-transform:uppercase}.jm-disclaimer h2,.jm-input h2,.jm-intro h2{margin:14px 0 8px}.jm-disclaimer>p{color:#cbd5e1;line-height:1.75;font-size:14px}.jm-check{display:flex;gap:12px;align-items:flex-start;margin-top:20px;padding:16px;border-radius:16px;background:rgba(2,6,23,.62);border:1px solid rgba(148,163,184,.17);font-size:14px;line-height:1.65;cursor:pointer}.jm-check input{width:19px;height:19px;margin-top:2px;accent-color:#1677FF}.jm-primary{margin-top:16px;width:100%;padding:14px 18px;border-radius:13px;border:1px solid rgba(147,197,253,.5);background:linear-gradient(180deg,#1677FF,#0d5fd7);color:#fff;font-weight:900;cursor:pointer}.jm-primary:disabled{opacity:.35;cursor:not-allowed}.jm-intro{padding:52px;border-radius:26px;border:1px solid rgba(255,255,255,.07);background:rgba(3,8,18,.68)}.jm-intro h2{font-family:Georgia,"Times New Roman",serif;font-size:38px;font-weight:500}.jm-intro>p:not(.jm-kicker){color:#94a3b8}.jm-grid{display:grid;grid-template-columns:.82fr 1.18fr;gap:22px;align-items:start}.jm-input{border-radius:24px;border:1px solid rgba(255,255,255,.08);background:linear-gradient(180deg,rgba(9,18,33,.96),rgba(4,11,23,.98));padding:24px}.jm-input label{display:block;margin:16px 0 8px;color:#cbd5e1;font-size:13px;font-weight:800}.jm-input input,.jm-input textarea{width:100%;padding:14px 15px;border-radius:14px;border:1px solid rgba(148,163,184,.22);background:#050b15;color:#f8fafc;font-size:14px;line-height:1.6;outline:none}.jm-job{min-height:300px;resize:vertical}.jm-resume{min-height:260px;resize:vertical}.jm-input hr{border:0;border-top:1px solid rgba(148,163,184,.12);margin:26px 0}.jm-muted{color:#64748b!important;font-size:13px}.jm-upload{width:100%;padding:15px;border-radius:14px;border:1px solid rgba(96,165,250,.36);background:rgba(22,119,255,.12);color:#dbeafe;font-weight:900;cursor:pointer}.jm-file{display:flex;flex-direction:column;gap:3px;margin-top:10px;padding:12px 14px;border-radius:12px;border:1px solid rgba(74,222,128,.18);background:rgba(22,101,52,.1)}.jm-file span{font-size:12px;color:#86efac}.jm-error{margin-top:12px;padding:12px 14px;border-radius:12px;border:1px solid rgba(248,113,113,.26);background:rgba(127,29,29,.16);color:#fecaca;font-size:13px}.jm-results{position:sticky;top:20px}.jm-paper{border-radius:24px;background:#fff;color:#0f172a;padding:38px;box-shadow:0 28px 80px rgba(0,0,0,.3)}.jm-empty{min-height:720px}.jm-paper>h2{margin:0 0 20px;font-family:Georgia,"Times New Roman",serif;font-size:36px;font-weight:500}.jm-overall{display:grid;grid-template-columns:170px 1fr;gap:22px;padding:22px;border-radius:20px;background:linear-gradient(135deg,#07111f,#0c1e38 65%,#102c52);color:#fff}.jm-overall small{display:block;color:#bfdbfe;font-weight:900;text-transform:uppercase;letter-spacing:.1em}.jm-overall strong{display:block;margin-top:6px;font-size:54px}.jm-overall h3{margin:6px 0}.jm-overall p{margin:0;color:#cbd5e1;line-height:1.6}.jm-score-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px;margin-top:14px}.jm-score{padding:13px 14px;border-radius:14px;border:1px solid #e2e8f0;background:#f8fafc}.jm-score>div:first-child{display:flex;justify-content:space-between;gap:10px;font-size:12px}.jm-track{height:6px;margin-top:9px;border-radius:999px;background:#e2e8f0;overflow:hidden}.jm-track i{display:block;height:100%;border-radius:999px;background:linear-gradient(90deg,#1677FF,#60a5fa)}.jm-card{margin-top:12px;padding:18px;border-radius:16px;border:1px solid #dbe3ee;background:#fff}.jm-card h3{margin:0;color:#0f172a;font-size:17px}.jm-card p,.jm-card li{color:#334155;font-size:13px;line-height:1.7}.jm-card ul{margin:12px 0 0;padding-left:20px}.jm-note{margin-top:12px;padding:10px 12px;border-radius:11px;background:#eff6ff;color:#1e40af;font-size:11px;line-height:1.6}.jm-next{margin-top:14px;padding:22px;border-radius:18px;background:linear-gradient(135deg,#07111f,#0e2648 72%,#143761);color:#fff}.jm-next small{color:#93c5fd;font-weight:900;text-transform:uppercase;letter-spacing:.14em}.jm-next h3{margin:7px 0 8px;font-family:Georgia,"Times New Roman",serif;font-size:25px;font-weight:500}.jm-next p{margin:0;color:#dbeafe;line-height:1.7;font-size:13px}.jm-final-disclaimer{margin-top:18px;padding-top:16px;border-top:1px solid #e2e8f0;color:#64748b;font-size:10px;line-height:1.55}@media(max-width:980px){.jm-grid{grid-template-columns:1fr}.jm-results{position:static}}@media(max-width:620px){.jm-hero{padding:36px 24px}.jm-hero h1{font-size:46px}.jm-score-grid{grid-template-columns:1fr}.jm-overall{grid-template-columns:1fr}}@media print{body *{visibility:hidden!important}.print-wrap,.print-wrap *{visibility:visible!important}.print-wrap{position:absolute!important;top:0!important;left:0!important;width:100%!important;background:white!important}.no-print{display:none!important}}
`;
