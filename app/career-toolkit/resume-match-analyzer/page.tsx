"use client";

import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

type ResumeUploadResponse = {
  ok?: boolean;
  resumeText?: string;
  fileName?: string;
  pageCount?: number | null;
  hasImage?: boolean | null;
  imageCount?: number | null;
  error?: string;
};

const DISCLAIMER =
  "HireMinds Job Match Analyzer is an ATS-style screening and career coaching tool that uses HireMinds' own scoring methodology. It does not replicate or represent the proprietary scoring algorithms used by employer Applicant Tracking Systems (ATS) such as Workday, Greenhouse, iCIMS, or other platforms. ATS configurations and employer screening criteria vary. Match scores, recommendations, and coaching guidance are provided for career development purposes and do not guarantee an interview, job offer, or employment.";

const ACKNOWLEDGEMENT =
  "I understand that HireMinds Job Match Analyzer is an ATS-style screening and career coaching tool and that results do not guarantee an interview, job offer, or employment.";

function clamp(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function cleanList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function normalizeAnalysis(data: any): Analysis {
  const breakdown = data?.breakdown ?? {};

  return {
    overallMatch: clamp(data?.overallMatch),
    matchLabel: String(data?.matchLabel ?? "Career Coach Assessment"),
    recommendation: String(data?.recommendation ?? "REVIEW BEFORE APPLYING"),
    recommendationReason: String(data?.recommendationReason ?? ""),
    breakdown: {
      requiredQualifications: clamp(breakdown.requiredQualifications),
      experienceAlignment: clamp(breakdown.experienceAlignment),
      skillsAlignment: clamp(breakdown.skillsAlignment),
      preferredQualifications: clamp(breakdown.preferredQualifications),
      educationCertifications: clamp(breakdown.educationCertifications),
      keywordsTerminology: clamp(breakdown.keywordsTerminology),
      resumeAtsStructure: clamp(breakdown.resumeAtsStructure),
    },
    areYouQualified: String(data?.areYouQualified ?? ""),
    competitivePosition: String(data?.competitivePosition ?? ""),
    employerFirstImpression: String(data?.employerFirstImpression ?? ""),
    strongestEvidence: cleanList(data?.strongestEvidence),
    requiredQualificationsMet: cleanList(data?.requiredQualificationsMet),
    requiredQualificationsUnclear: cleanList(data?.requiredQualificationsUnclear),
    requiredQualificationsNotFound: cleanList(data?.requiredQualificationsNotFound),
    preferredQualificationsMet: cleanList(data?.preferredQualificationsMet),
    preferredQualificationsNotFound: cleanList(data?.preferredQualificationsNotFound),
    matchedSkillsKeywords: cleanList(data?.matchedSkillsKeywords),
    missingSkillsKeywords: cleanList(data?.missingSkillsKeywords),
    whatIsWorking: cleanList(data?.whatIsWorking),
    screenOutRisks: cleanList(data?.screenOutRisks),
    resumeQualityFlags: cleanList(data?.resumeQualityFlags),
    fixFirst: cleanList(data?.fixFirst),
    tailoringRecommendations: cleanList(data?.tailoringRecommendations),
    doNotInvent: cleanList(data?.doNotInvent),
    coverLetterStrategy: cleanList(data?.coverLetterStrategy),
    interviewReadiness: cleanList(data?.interviewReadiness),
    likelyInterviewQuestions: cleanList(data?.likelyInterviewQuestions),
    concernsToPrepareFor: cleanList(data?.concernsToPrepareFor),
    nextMove: String(data?.nextMove ?? ""),
    coachingSummary: String(data?.coachingSummary ?? ""),
  };
}

async function parseJsonResponse(response: Response) {
  const text = await response.text();

  if (!text.trim()) {
    throw new Error(
      `The server returned an empty response (${response.status}).`
    );
  }

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    console.error("Non-JSON server response:", text);
    throw new Error(
      text.slice(0, 300) ||
        `The server returned an unexpected response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.error ||
        data?.message ||
        `The request failed with status ${response.status}.`
    );
  }

  return data;
}

export default function ResumeMatchAnalyzerPage() {
  const [acknowledged, setAcknowledged] = useState(false);
  const [started, setStarted] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [resumeFileName, setResumeFileName] = useState("");
  const [resumePageCount, setResumePageCount] = useState<number | null>(null);
  const [resumeHasImage, setResumeHasImage] = useState<boolean | null>(null);
  const [resumeImageCount, setResumeImageCount] = useState<number | null>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const trackedOpenRef = useRef(false);

  useEffect(() => {
    async function trackOpen() {
      if (trackedOpenRef.current) return;

      const { data } = await supabase.auth.getUser();
      const user = data.user;

      if (!user) return;

      trackedOpenRef.current = true;

      const { data: profile } = await supabase
        .from("candidate_profiles")
        .select("full_name,email,referral_code")
        .eq("user_id", user.id)
        .maybeSingle();

      await supabase.from("user_activity").insert({
        user_id: user.id,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? user.email ?? null,
        referral_code: profile?.referral_code ?? null,
        event_type: "tool_opened",
        tool_name: "job_match_analyzer",
        page_name: "/career-toolkit/resume-match-analyzer",
      });
    }

    trackOpen();
  }, []);

  const canAnalyze = useMemo(() => {
    return (
      started &&
      acknowledged &&
      !isUploading &&
      !isAnalyzing &&
      jobDescription.trim().length >= 80 &&
      resumeText.trim().length >= 80
    );
  }, [
    started,
    acknowledged,
    isUploading,
    isAnalyzing,
    jobDescription,
    resumeText,
  ]);

  function continueToAnalyzer() {
    if (!acknowledged) return;
    setStarted(true);

    setTimeout(() => {
      document.getElementById("job-match-workspace")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  }

  async function handleResumeUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setAnalysis(null);
    setIsUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase();

      if (!extension || !["pdf", "docx"].includes(extension)) {
        throw new Error("Please upload a PDF or DOCX resume.");
      }

      if (file.size > 8 * 1024 * 1024) {
        throw new Error("Resume file must be 8 MB or smaller.");
      }

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/job-match-resume-parse", {
        method: "POST",
        body: formData,
      });

      const data = (await parseJsonResponse(
        response
      )) as ResumeUploadResponse;

      const extractedText = String(data.resumeText ?? "").trim();

      if (!extractedText) {
        throw new Error(
          "The resume uploaded, but no readable text was returned."
        );
      }

      setResumeText(extractedText);
      setResumeFileName(data.fileName || file.name);
      setResumePageCount(
        typeof data.pageCount === "number" ? data.pageCount : null
      );
      setResumeHasImage(
        typeof data.hasImage === "boolean" ? data.hasImage : null
      );
      setResumeImageCount(
        typeof data.imageCount === "number" ? data.imageCount : null
      );
    } catch (err: any) {
      setResumeText("");
      setResumeFileName("");
      setResumePageCount(null);
      setResumeHasImage(null);
      setResumeImageCount(null);
      setError(err?.message || "Unable to read this resume.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  async function handleAnalyze() {
    if (!canAnalyze) return;

    setError("");
    setAnalysis(null);
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/job-match-analyzer-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim(),
          resumeText: resumeText.trim(),
          resumeMetadata: {
            fileName: resumeFileName || null,
            pageCount: resumePageCount,
            hasImage: resumeHasImage,
            imageCount: resumeImageCount,
          },
        }),
      });

      const data = await parseJsonResponse(response);
      const normalized = normalizeAnalysis(data);

      setAnalysis(normalized);

      const { data: auth } = await supabase.auth.getUser();
      const user = auth.user;

      if (user) {
        const { data: profile } = await supabase
          .from("candidate_profiles")
          .select("full_name,email,referral_code")
          .eq("user_id", user.id)
          .maybeSingle();

        await supabase.from("user_activity").insert({
          user_id: user.id,
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? user.email ?? null,
          referral_code: profile?.referral_code ?? null,
          event_type: "tool_completed",
          tool_name: "job_match_analyzer",
          page_name: "/career-toolkit/resume-match-analyzer",
        });
      }

      setTimeout(() => {
        document.getElementById("analysis-results")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (err: any) {
      setError(err?.message || "Unable to complete the job match analysis.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  function saveAnalysis() {
    if (!analysis) return;

    const lines = [
      "HIREMINDS JOB MATCH ANALYZER",
      jobTitle ? `Job Title: ${jobTitle}` : "",
      "",
      `Overall Match: ${analysis.overallMatch}%`,
      `Match Label: ${analysis.matchLabel}`,
      `Recommendation: ${analysis.recommendation}`,
      analysis.recommendationReason,
      "",
      `Required Qualifications: ${analysis.breakdown.requiredQualifications}%`,
      `Experience Alignment: ${analysis.breakdown.experienceAlignment}%`,
      `Skills Alignment: ${analysis.breakdown.skillsAlignment}%`,
      `Preferred Qualifications: ${analysis.breakdown.preferredQualifications}%`,
      `Education / Certifications: ${analysis.breakdown.educationCertifications}%`,
      `Keywords / Terminology: ${analysis.breakdown.keywordsTerminology}%`,
      `Resume / ATS Structure: ${analysis.breakdown.resumeAtsStructure}%`,
      "",
      "ARE YOU QUALIFIED?",
      analysis.areYouQualified,
      "",
      "COMPETITIVE POSITION",
      analysis.competitivePosition,
      "",
      "EMPLOYER FIRST IMPRESSION",
      analysis.employerFirstImpression,
      "",
      ...textSection("STRONGEST EVIDENCE", analysis.strongestEvidence),
      ...textSection(
        "REQUIRED QUALIFICATIONS MET",
        analysis.requiredQualificationsMet
      ),
      ...textSection(
        "REQUIRED QUALIFICATIONS UNCLEAR",
        analysis.requiredQualificationsUnclear
      ),
      ...textSection(
        "REQUIRED QUALIFICATIONS NOT FOUND",
        analysis.requiredQualificationsNotFound
      ),
      ...textSection(
        "PREFERRED QUALIFICATIONS MET",
        analysis.preferredQualificationsMet
      ),
      ...textSection(
        "PREFERRED QUALIFICATIONS NOT FOUND",
        analysis.preferredQualificationsNotFound
      ),
      ...textSection(
        "MATCHED SKILLS / KEYWORDS",
        analysis.matchedSkillsKeywords
      ),
      ...textSection(
        "MISSING / UNDERREPRESENTED SKILLS / KEYWORDS",
        analysis.missingSkillsKeywords
      ),
      ...textSection("WHAT IS WORKING", analysis.whatIsWorking),
      ...textSection("SCREEN-OUT RISKS", analysis.screenOutRisks),
      ...textSection(
        "RESUME QUALITY / ATS FLAGS",
        analysis.resumeQualityFlags
      ),
      ...textSection("WHAT TO FIX FIRST", analysis.fixFirst),
      ...textSection(
        "TAILORING RECOMMENDATIONS",
        analysis.tailoringRecommendations
      ),
      ...textSection("DO NOT INVENT", analysis.doNotInvent),
      ...textSection(
        "COVER LETTER STRATEGY",
        analysis.coverLetterStrategy
      ),
      ...textSection(
        "INTERVIEW READINESS",
        analysis.interviewReadiness
      ),
      ...textSection(
        "LIKELY INTERVIEW QUESTIONS",
        analysis.likelyInterviewQuestions
      ),
      ...textSection(
        "CONCERNS TO PREPARE FOR",
        analysis.concernsToPrepareFor
      ),
      "",
      "CAREER COACH NEXT MOVE",
      analysis.nextMove,
      "",
      "COACHING SUMMARY",
      analysis.coachingSummary,
      "",
      "IMPORTANT DISCLAIMER",
      DISCLAIMER,
    ].filter((line) => line !== undefined);

    const blob = new Blob([lines.join("\n")], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "hireminds-job-match-analysis.txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <main style={styles.page}>
      <style>{`
        * { box-sizing: border-box; }

        @media (max-width: 980px) {
          .hm-workspace {
            grid-template-columns: 1fr !important;
          }

          .hm-score-grid,
          .hm-two-col {
            grid-template-columns: 1fr !important;
          }

          .hm-results {
            position: static !important;
          }
        }

        @media print {
          body * {
            visibility: hidden !important;
          }

          .print-area,
          .print-area * {
            visibility: visible !important;
          }

          .print-area {
            position: absolute !important;
            inset: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div style={styles.shell}>
        <section style={styles.hero}>
          <div style={styles.heroContent}>
            <div style={styles.kicker}>HireMinds Career Coach</div>
            <h1 style={styles.heroTitle}>
              Job Match <span style={styles.blue}>Analyzer.</span>
            </h1>
            <p style={styles.heroText}>
              Compare your resume to a real job posting and get an ATS-style
              screening, resume strategy, job-fit review, and career-coach
              recommendation before you apply.
            </p>

            <div className="no-print" style={styles.heroActions}>
              <a href="/career-toolkit" style={styles.secondaryButton}>
                Back to Career ToolKit
              </a>

              <button
                type="button"
                disabled={!analysis}
                onClick={saveAnalysis}
                style={{
                  ...styles.secondaryButton,
                  ...(!analysis ? styles.disabledButton : {}),
                }}
              >
                Save Analysis
              </button>

              <button
                type="button"
                disabled={!analysis}
                onClick={() => window.print()}
                style={{
                  ...styles.secondaryButton,
                  ...(!analysis ? styles.disabledButton : {}),
                }}
              >
                Print / Save PDF
              </button>
            </div>
          </div>
        </section>

        <section style={styles.ackCard}>
          <div style={styles.ackBadge}>Required acknowledgement</div>
          <h2 style={styles.ackTitle}>Before you begin</h2>

          <p style={styles.disclaimerText}>{DISCLAIMER}</p>

          <label style={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
              style={styles.checkbox}
            />
            <span>{ACKNOWLEDGEMENT}</span>
          </label>

          <button
            type="button"
            disabled={!acknowledged}
            onClick={continueToAnalyzer}
            className="no-print"
            style={{
              ...styles.primaryButton,
              ...(!acknowledged ? styles.disabledButton : {}),
            }}
          >
            {acknowledged
              ? "Continue to Job Match Analyzer"
              : "Acknowledge to Continue"}
          </button>
        </section>

        {!started ? (
          <section style={styles.lockedCard}>
            <div style={styles.kicker}>One job + one resume</div>
            <h2 style={styles.lockedTitle}>
              A clearer answer than a percentage alone.
            </h2>
            <p style={styles.lockedText}>
              HireMinds reviews required qualifications, preferred
              qualifications, experience, skills, resume presentation, and
              interview readiness together.
            </p>
          </section>
        ) : (
          <section
            id="job-match-workspace"
            className="hm-workspace"
            style={styles.workspace}
          >
            <div className="no-print" style={styles.formCard}>
              <div style={styles.step}>STEP 1</div>
              <h2 style={styles.formTitle}>Add the opportunity</h2>
              <p style={styles.formHelp}>
                Paste the complete job posting whenever possible.
              </p>

              <label style={styles.label}>Job Title (optional)</label>
              <input
                value={jobTitle}
                onChange={(e) => {
                  setJobTitle(e.target.value);
                  setAnalysis(null);
                  setError("");
                }}
                style={styles.input}
                placeholder="Example: Talent Acquisition Manager"
              />

              <label style={styles.label}>Full Job Description</label>
              <textarea
                value={jobDescription}
                onChange={(e) => {
                  setJobDescription(e.target.value);
                  setAnalysis(null);
                  setError("");
                }}
                style={styles.jobTextarea}
                placeholder="Paste the full job description here."
              />

              <div style={styles.divider} />

              <div style={styles.step}>STEP 2</div>
              <h2 style={styles.formTitle}>Add your resume</h2>
              <p style={styles.formHelp}>
                Upload PDF or DOCX. Paste text below only as a backup.
              </p>

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={handleResumeUpload}
                style={{ display: "none" }}
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{
                  ...styles.uploadButton,
                  ...(isUploading ? styles.disabledButton : {}),
                }}
              >
                {isUploading
                  ? "Reading Resume..."
                  : resumeFileName
                    ? "Upload Different Resume"
                    : "Upload Resume — PDF or DOCX"}
              </button>

              {resumeFileName ? (
                <div style={styles.fileCard}>
                  <strong>{resumeFileName}</strong>
                  <span style={styles.fileMeta}>
                    Resume text loaded
                    {resumePageCount
                      ? ` • ${resumePageCount} page${
                          resumePageCount === 1 ? "" : "s"
                        }`
                      : ""}
                  </span>
                </div>
              ) : null}

              <label style={styles.label}>Resume Text</label>
              <textarea
                value={resumeText}
                onChange={(e) => {
                  setResumeText(e.target.value);
                  setAnalysis(null);
                  setError("");
                }}
                style={styles.resumeTextarea}
                placeholder="Uploaded resume text will appear here. You may also paste resume text manually."
              />

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                style={{
                  ...styles.analyzeButton,
                  ...(!canAnalyze ? styles.disabledButton : {}),
                }}
              >
                {isAnalyzing
                  ? "Analyzing Resume + Job..."
                  : "Analyze Resume + Job"}
              </button>
            </div>

            <div
              id="analysis-results"
              className="hm-results print-area"
              style={styles.resultsWrap}
            >
              {!analysis ? (
                <div style={styles.emptyReport}>
                  <div style={styles.reportKicker}>HireMinds Career Coach</div>
                  <h2 style={styles.emptyTitle}>
                    Your assessment will appear here.
                  </h2>
                  <p style={styles.emptyText}>
                    ATS-style screening, resume strategy, job-fit analysis, and
                    career coaching will be reviewed together.
                  </p>
                </div>
              ) : (
                <Report analysis={analysis} jobTitle={jobTitle} />
              )}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

function textSection(title: string, items: string[]) {
  return [
    title,
    ...(items.length ? items.map((item) => `• ${item}`) : ["None noted"]),
    "",
  ];
}

function Report({
  analysis,
  jobTitle,
}: {
  analysis: Analysis;
  jobTitle: string;
}) {
  const b = analysis.breakdown;

  return (
    <div style={styles.report}>
      <div style={styles.reportKicker}>HireMinds Career Coach Assessment</div>
      <h2 style={styles.reportTitle}>{jobTitle || "Job Match Analysis"}</h2>

      <div style={styles.overallCard}>
        <div>
          <div style={styles.overallLabel}>Overall Job Match</div>
          <div style={styles.overallScore}>{analysis.overallMatch}%</div>
        </div>

        <div>
          <div style={styles.matchLabel}>{analysis.matchLabel}</div>
          <h3 style={styles.recommendation}>{analysis.recommendation}</h3>
          <p style={styles.recommendationReason}>
            {analysis.recommendationReason}
          </p>
        </div>
      </div>

      <div className="hm-score-grid" style={styles.scoreGrid}>
        <ScoreCard
          label="Required Qualifications"
          value={b.requiredQualifications}
        />
        <ScoreCard label="Experience Alignment" value={b.experienceAlignment} />
        <ScoreCard label="Skills Alignment" value={b.skillsAlignment} />
        <ScoreCard
          label="Preferred Qualifications"
          value={b.preferredQualifications}
        />
        <ScoreCard
          label="Education / Certifications"
          value={b.educationCertifications}
        />
        <ScoreCard
          label="Keywords / Terminology"
          value={b.keywordsTerminology}
        />
        <ScoreCard label="Resume / ATS Structure" value={b.resumeAtsStructure} />
      </div>

      <Narrative title="Are You Qualified?" text={analysis.areYouQualified} />

      <div className="hm-two-col" style={styles.twoCol}>
        <Narrative
          title="Your Competitive Position"
          text={analysis.competitivePosition}
        />
        <Narrative
          title="What the Employer May See First"
          text={analysis.employerFirstImpression}
        />
      </div>

      <ListSection title="Strongest Evidence" items={analysis.strongestEvidence} />
      <ListSection
        title="Required Qualifications Met"
        items={analysis.requiredQualificationsMet}
      />
      <ListSection
        title="Required Qualifications — Unclear"
        items={analysis.requiredQualificationsUnclear}
        note="Unclear means the resume does not demonstrate the qualification clearly enough. It does not automatically mean you do not have it."
      />
      <ListSection
        title="Required Qualifications Not Found on the Resume"
        items={analysis.requiredQualificationsNotFound}
        note="Not found on the resume is different from not possessing the qualification."
      />
      <ListSection
        title="Preferred Qualifications Met"
        items={analysis.preferredQualificationsMet}
      />
      <ListSection
        title="Preferred Qualifications Not Found"
        items={analysis.preferredQualificationsNotFound}
      />
      <ListSection
        title="Matched Skills + Keywords"
        items={analysis.matchedSkillsKeywords}
      />
      <ListSection
        title="Missing / Underrepresented Skills + Keywords"
        items={analysis.missingSkillsKeywords}
      />
      <ListSection title="What's Working" items={analysis.whatIsWorking} />
      <ListSection
        title="What May Get You Screened Out"
        items={analysis.screenOutRisks}
      />
      <ListSection
        title="Resume Quality + ATS Review"
        items={analysis.resumeQualityFlags}
      />
      <ListSection title="What to Fix First" items={analysis.fixFirst} />
      <ListSection
        title="How to Tailor This Resume"
        items={analysis.tailoringRecommendations}
      />
      <ListSection
        title="Do Not Change / Do Not Invent"
        items={analysis.doNotInvent}
      />
      <ListSection
        title="Cover Letter Strategy"
        items={analysis.coverLetterStrategy}
      />
      <ListSection
        title="Interview Readiness"
        items={analysis.interviewReadiness}
      />
      <ListSection
        title="Questions You Should Be Ready to Answer"
        items={analysis.likelyInterviewQuestions}
      />
      <ListSection
        title="Potential Concerns to Prepare For"
        items={analysis.concernsToPrepareFor}
      />

      <div style={styles.nextMove}>
        <div style={styles.nextMoveLabel}>Career Coach Next Move</div>
        <h3 style={styles.nextMoveTitle}>{analysis.nextMove}</h3>
        <p style={styles.nextMoveText}>{analysis.coachingSummary}</p>
      </div>

      <div style={styles.bottomDisclaimer}>
        <strong>Important Disclaimer:</strong> {DISCLAIMER}
      </div>
    </div>
  );
}

function ScoreCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div style={styles.scoreCard}>
      <div style={styles.scoreHeader}>
        <span style={styles.scoreLabel}>{label}</span>
        <strong>{value}%</strong>
      </div>

      <div style={styles.scoreTrack}>
        <div style={{ ...styles.scoreFill, width: `${value}%` }} />
      </div>
    </div>
  );
}

function Narrative({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <section style={styles.resultCard}>
      <h3 style={styles.resultTitle}>{title}</h3>
      <p style={styles.resultText}>{text || "No note generated."}</p>
    </section>
  );
}

function ListSection({
  title,
  items,
  note,
}: {
  title: string;
  items: string[];
  note?: string;
}) {
  return (
    <section style={styles.resultCard}>
      <h3 style={styles.resultTitle}>{title}</h3>

      {items.length ? (
        <ul style={styles.list}>
          {items.map((item, index) => (
            <li key={`${title}-${index}`} style={styles.listItem}>
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p style={styles.emptySmall}>Nothing significant identified.</p>
      )}

      {note ? <div style={styles.note}>{note}</div> : null}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(ellipse at 12% 8%, rgba(22,119,255,0.12) 0%, transparent 34%), linear-gradient(180deg, #030812 0%, #07111f 52%, #030812 100%)",
    color: "#f8fafc",
    padding: "28px 22px 70px",
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  shell: {
    width: "min(1500px,100%)",
    margin: "0 auto",
    display: "grid",
    gap: "22px",
  },
  hero: {
    border: "1px solid rgba(255,255,255,.08)",
    borderRadius: "28px",
    background:
      "linear-gradient(135deg, rgba(2,8,23,.98), rgba(8,22,44,.96) 58%, rgba(8,18,35,.98))",
    boxShadow: "0 30px 100px rgba(0,0,0,.34)",
  },
  heroContent: {
    padding: "52px",
    maxWidth: "1050px",
  },
  kicker: {
    color: "#93c5fd",
    fontSize: "12px",
    fontWeight: 900,
    letterSpacing: ".16em",
    textTransform: "uppercase",
  },
  heroTitle: {
    margin: "12px 0 0",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "64px",
    lineHeight: 1,
    letterSpacing: "-.04em",
    fontWeight: 500,
  },
  blue: {
    color: "#60a5fa",
  },
  heroText: {
    maxWidth: "880px",
    margin: "22px 0 0",
    color: "#cbd5e1",
    fontSize: "17px",
    lineHeight: 1.75,
  },
  heroActions: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "26px",
  },
  secondaryButton: {
    border: "1px solid rgba(148,163,184,.26)",
    background: "#07111f",
    color: "#fff",
    borderRadius: "12px",
    padding: "11px 15px",
    fontSize: "13px",
    fontWeight: 800,
    textDecoration: "none",
    cursor: "pointer",
  },
  ackCard: {
    border: "1px solid rgba(96,165,250,.25)",
    borderRadius: "22px",
    background: "rgba(8,20,40,.94)",
    padding: "25px",
  },
  ackBadge: {
    display: "inline-block",
    borderRadius: "999px",
    border: "1px solid rgba(96,165,250,.25)",
    background: "rgba(22,119,255,.12)",
    color: "#bfdbfe",
    padding: "6px 10px",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".12em",
    textTransform: "uppercase",
  },
  ackTitle: {
    margin: "13px 0 8px",
    fontSize: "25px",
  },
  disclaimerText: {
    margin: 0,
    color: "#cbd5e1",
    lineHeight: 1.75,
    fontSize: "14px",
    maxWidth: "1200px",
  },
  checkboxRow: {
    display: "flex",
    gap: "12px",
    alignItems: "flex-start",
    marginTop: "18px",
    padding: "15px",
    borderRadius: "14px",
    border: "1px solid rgba(148,163,184,.17)",
    background: "rgba(2,6,23,.55)",
    lineHeight: 1.6,
    fontSize: "14px",
    cursor: "pointer",
  },
  checkbox: {
    width: "19px",
    height: "19px",
    marginTop: "2px",
    accentColor: "#1677FF",
  },
  primaryButton: {
    marginTop: "15px",
    border: "1px solid rgba(147,197,253,.5)",
    background: "linear-gradient(180deg,#1677FF,#0d5fd7)",
    color: "#fff",
    borderRadius: "12px",
    padding: "13px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  disabledButton: {
    opacity: 0.4,
    cursor: "not-allowed",
  },
  lockedCard: {
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,.07)",
    background: "rgba(3,8,18,.68)",
    padding: "46px",
  },
  lockedTitle: {
    margin: "10px 0 0",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "38px",
    fontWeight: 500,
  },
  lockedText: {
    margin: "14px 0 0",
    maxWidth: "850px",
    color: "#94a3b8",
    lineHeight: 1.75,
  },
  workspace: {
    display: "grid",
    gridTemplateColumns: "0.82fr 1.18fr",
    gap: "22px",
    alignItems: "start",
  },
  formCard: {
    borderRadius: "24px",
    border: "1px solid rgba(255,255,255,.08)",
    background: "rgba(5,13,27,.96)",
    padding: "24px",
  },
  step: {
    color: "#60a5fa",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".16em",
  },
  formTitle: {
    margin: "8px 0 0",
    fontSize: "26px",
  },
  formHelp: {
    margin: "9px 0 16px",
    color: "#7890b4",
    fontSize: "13px",
  },
  label: {
    display: "block",
    margin: "14px 0 7px",
    color: "#dbeafe",
    fontSize: "13px",
    fontWeight: 800,
  },
  input: {
    width: "100%",
    borderRadius: "13px",
    border: "1px solid rgba(148,163,184,.22)",
    background: "#030913",
    color: "#fff",
    padding: "13px 14px",
    outline: "none",
  },
  jobTextarea: {
    width: "100%",
    minHeight: "300px",
    borderRadius: "13px",
    border: "1px solid rgba(148,163,184,.22)",
    background: "#030913",
    color: "#fff",
    padding: "13px 14px",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
  },
  resumeTextarea: {
    width: "100%",
    minHeight: "260px",
    borderRadius: "13px",
    border: "1px solid rgba(148,163,184,.22)",
    background: "#030913",
    color: "#fff",
    padding: "13px 14px",
    outline: "none",
    resize: "vertical",
    lineHeight: 1.6,
  },
  divider: {
    height: "1px",
    background: "rgba(148,163,184,.12)",
    margin: "28px 0",
  },
  uploadButton: {
    width: "100%",
    borderRadius: "13px",
    border: "1px solid rgba(96,165,250,.35)",
    background: "rgba(22,119,255,.12)",
    color: "#fff",
    padding: "14px",
    fontWeight: 900,
    cursor: "pointer",
  },
  fileCard: {
    marginTop: "10px",
    padding: "12px 14px",
    borderRadius: "13px",
    border: "1px solid rgba(74,222,128,.2)",
    background: "rgba(22,101,52,.1)",
    display: "grid",
    gap: "4px",
  },
  fileMeta: {
    color: "#4ade80",
    fontSize: "12px",
  },
  errorBox: {
    marginTop: "12px",
    borderRadius: "12px",
    border: "1px solid rgba(248,113,113,.3)",
    background: "rgba(127,29,29,.16)",
    color: "#fecaca",
    padding: "12px 13px",
    fontSize: "13px",
    lineHeight: 1.55,
    whiteSpace: "pre-wrap",
  },
  analyzeButton: {
    width: "100%",
    marginTop: "14px",
    borderRadius: "13px",
    border: "1px solid rgba(147,197,253,.52)",
    background: "linear-gradient(180deg,#1677FF,#0d5fd7)",
    color: "#fff",
    padding: "14px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  resultsWrap: {
    position: "sticky",
    top: "20px",
  },
  emptyReport: {
    minHeight: "700px",
    borderRadius: "24px",
    background: "#fff",
    color: "#0f172a",
    padding: "38px",
    boxShadow: "0 28px 80px rgba(0,0,0,.3)",
  },
  reportKicker: {
    color: "#2563eb",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".14em",
    textTransform: "uppercase",
  },
  emptyTitle: {
    margin: "10px 0 0",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "38px",
    fontWeight: 500,
  },
  emptyText: {
    margin: "14px 0 0",
    color: "#475569",
    lineHeight: 1.7,
  },
  report: {
    borderRadius: "24px",
    background: "#fff",
    color: "#0f172a",
    padding: "36px",
    boxShadow: "0 28px 80px rgba(0,0,0,.3)",
  },
  reportTitle: {
    margin: "8px 0 20px",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "36px",
    fontWeight: 500,
  },
  overallCard: {
    display: "grid",
    gridTemplateColumns: "170px 1fr",
    gap: "22px",
    padding: "21px",
    borderRadius: "18px",
    background: "linear-gradient(135deg,#07111f,#102c52)",
    color: "#fff",
  },
  overallLabel: {
    color: "#bfdbfe",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".1em",
    textTransform: "uppercase",
  },
  overallScore: {
    marginTop: "7px",
    fontSize: "52px",
    lineHeight: 1,
    fontWeight: 900,
  },
  matchLabel: {
    color: "#93c5fd",
    fontSize: "11px",
    fontWeight: 900,
    letterSpacing: ".1em",
    textTransform: "uppercase",
  },
  recommendation: {
    margin: "6px 0",
    fontSize: "22px",
  },
  recommendationReason: {
    margin: 0,
    color: "#cbd5e1",
    fontSize: "13px",
    lineHeight: 1.65,
  },
  scoreGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2,minmax(0,1fr))",
    gap: "10px",
    marginTop: "12px",
  },
  scoreCard: {
    padding: "13px",
    borderRadius: "13px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
  },
  scoreHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "10px",
  },
  scoreLabel: {
    fontSize: "12px",
    fontWeight: 800,
    color: "#334155",
  },
  scoreTrack: {
    height: "6px",
    marginTop: "9px",
    borderRadius: "999px",
    background: "#e2e8f0",
    overflow: "hidden",
  },
  scoreFill: {
    height: "100%",
    background: "linear-gradient(90deg,#1677FF,#60a5fa)",
    borderRadius: "999px",
  },
  twoCol: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  resultCard: {
    marginTop: "12px",
    padding: "17px",
    borderRadius: "15px",
    border: "1px solid #dbe3ee",
    background: "#fff",
  },
  resultTitle: {
    margin: 0,
    fontSize: "17px",
  },
  resultText: {
    margin: "9px 0 0",
    color: "#334155",
    fontSize: "13px",
    lineHeight: 1.7,
  },
  list: {
    margin: "10px 0 0",
    paddingLeft: "20px",
  },
  listItem: {
    marginBottom: "7px",
    color: "#334155",
    fontSize: "13px",
    lineHeight: 1.65,
  },
  emptySmall: {
    margin: "9px 0 0",
    color: "#94a3b8",
    fontSize: "13px",
  },
  note: {
    marginTop: "11px",
    padding: "9px 11px",
    borderRadius: "10px",
    background: "#eff6ff",
    color: "#1e40af",
    fontSize: "11px",
    lineHeight: 1.55,
  },
  nextMove: {
    marginTop: "14px",
    padding: "21px",
    borderRadius: "17px",
    background: "linear-gradient(135deg,#07111f,#143761)",
    color: "#fff",
  },
  nextMoveLabel: {
    color: "#93c5fd",
    fontSize: "10px",
    fontWeight: 900,
    letterSpacing: ".14em",
    textTransform: "uppercase",
  },
  nextMoveTitle: {
    margin: "7px 0",
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontSize: "25px",
    fontWeight: 500,
  },
  nextMoveText: {
    margin: 0,
    color: "#dbeafe",
    fontSize: "13px",
    lineHeight: 1.7,
  },
  bottomDisclaimer: {
    marginTop: "17px",
    paddingTop: "14px",
    borderTop: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "10px",
    lineHeight: 1.55,
  },
};
