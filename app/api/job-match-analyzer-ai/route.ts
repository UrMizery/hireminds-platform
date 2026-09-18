import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_TIMEOUT_MS = 54000;

function clamp(value: unknown) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, Math.round(n)));
}

function list(value: unknown, max = 3) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function normalize(data: any) {
  const b = data?.breakdown ?? {};

  return {
    overallMatch: clamp(data?.overallMatch),
    matchLabel: String(
      data?.matchLabel || "Career Coach Assessment"
    ).trim(),
    recommendation: String(
      data?.recommendation || "REVIEW BEFORE APPLYING"
    ).trim(),
    recommendationReason: String(
      data?.recommendationReason || ""
    ).trim(),

    breakdown: {
      requiredQualifications: clamp(
        b.requiredQualifications
      ),
      experienceAlignment: clamp(
        b.experienceAlignment
      ),
      skillsAlignment: clamp(
        b.skillsAlignment
      ),
      preferredQualifications: clamp(
        b.preferredQualifications
      ),
      educationCertifications: clamp(
        b.educationCertifications
      ),
      keywordsTerminology: clamp(
        b.keywordsTerminology
      ),
      resumeAtsStructure: clamp(
        b.resumeAtsStructure
      ),
    },

    areYouQualified: String(
      data?.areYouQualified || ""
    ).trim(),
    competitivePosition: String(
      data?.competitivePosition || ""
    ).trim(),
    employerFirstImpression: String(
      data?.employerFirstImpression || ""
    ).trim(),

    strongestEvidence: list(
      data?.strongestEvidence
    ),
    requiredQualificationsMet: list(
      data?.requiredQualificationsMet
    ),
    requiredQualificationsUnclear: list(
      data?.requiredQualificationsUnclear
    ),
    requiredQualificationsNotFound: list(
      data?.requiredQualificationsNotFound
    ),
    preferredQualificationsMet: list(
      data?.preferredQualificationsMet
    ),
    preferredQualificationsNotFound: list(
      data?.preferredQualificationsNotFound
    ),
    matchedSkillsKeywords: list(
      data?.matchedSkillsKeywords
    ),
    missingSkillsKeywords: list(
      data?.missingSkillsKeywords
    ),
    whatIsWorking: list(
      data?.whatIsWorking
    ),
    screenOutRisks: list(
      data?.screenOutRisks
    ),
    resumeQualityFlags: list(
      data?.resumeQualityFlags
    ),
    fixFirst: list(
      data?.fixFirst
    ),
    tailoringRecommendations: list(
      data?.tailoringRecommendations
    ),
    doNotInvent: list(
      data?.doNotInvent
    ),
    coverLetterStrategy: list(
      data?.coverLetterStrategy
    ),
    interviewReadiness: list(
      data?.interviewReadiness
    ),
    likelyInterviewQuestions: list(
      data?.likelyInterviewQuestions
    ),
    concernsToPrepareFor: list(
      data?.concernsToPrepareFor
    ),

    nextMove: String(
      data?.nextMove || ""
    ).trim(),
    coachingSummary: String(
      data?.coachingSummary || ""
    ).trim(),
  };
}

function trimForModel(
  value: string,
  maxChars = 7000
) {
  if (value.length <= maxChars) return value;

  const tailChars = 1700;
  const headChars = maxChars - tailChars;

  return [
    value.slice(0, headChars),
    "\n\n[...middle shortened...]\n\n",
    value.slice(-tailChars),
  ].join("");
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first = cleaned.indexOf("{");
  const last = cleaned.lastIndexOf("}");

  if (first >= 0 && last > first) {
    return JSON.parse(
      cleaned.slice(first, last + 1)
    );
  }

  throw new Error(
    "Unable to read the career coach response."
  );
}

function buildPrompt({
  jobTitle,
  jobDescription,
  resumeText,
  resumeMetadata,
}: {
  jobTitle: string;
  jobDescription: string;
  resumeText: string;
  resumeMetadata: any;
}) {
  return `
<job_description>
${jobDescription}
</job_description>

<resume>
${resumeText}
</resume>

<resume_metadata>
file_name: ${resumeMetadata?.fileName ?? "unknown"}
page_count: ${resumeMetadata?.pageCount ?? "unknown"}
has_image: ${resumeMetadata?.hasImage ?? "unknown"}
image_count: ${resumeMetadata?.imageCount ?? "unknown"}
</resume_metadata>

<instructions>
You are the HireMinds Career Coach.

Compare ONE resume to ONE job description.

Job title:
${jobTitle || "Not provided"}

Evaluate:
- required qualifications
- experience alignment
- skills alignment
- preferred qualifications
- education and certifications
- keywords and terminology
- resume / ATS structure
- screen-out concerns
- truthful tailoring opportunities
- interview readiness

Truth rules:
- Never invent experience, skills, certifications, licenses, education, job titles, dates, software, accomplishments, or qualifications.
- "Not found on the resume" does not mean the candidate does not possess it.
- Required qualifications matter more than preferred qualifications.
- Recognize legitimate transferable experience.
- Do not reward keyword stuffing.
- A mandatory missing credential or qualification is a major concern.

Scoring weights:
- Required Qualifications: 30%
- Experience Alignment: 20%
- Skills Alignment: 15%
- Preferred Qualifications: 10%
- Education / Certifications: 10%
- Keywords / Terminology: 5%
- Resume / ATS Structure: 10%

Recommendation must be exactly one of:
- APPLY NOW
- APPLY AFTER REVISING
- APPLY, BUT PREPARE TO EXPLAIN GAPS
- RESEARCH / VERIFY REQUIREMENTS FIRST
- SIGNIFICANT GAPS — CONSIDER A DIFFERENT ROLE
- BUILD QUALIFICATIONS BEFORE APPLYING

STRICT LENGTH RULES:
- Return ONLY valid JSON.
- No markdown.
- Every narrative string: maximum 30 words.
- recommendationReason: maximum 35 words.
- coachingSummary: maximum 45 words.
- nextMove: maximum 20 words.
- EVERY array: maximum 3 items.
- EVERY array item: maximum 16 words.
- Do not repeat the same point in multiple fields.
- Keep the entire response under 1400 output tokens.

Return exactly these keys:

{
  "overallMatch": 0,
  "matchLabel": "",
  "recommendation": "",
  "recommendationReason": "",
  "breakdown": {
    "requiredQualifications": 0,
    "experienceAlignment": 0,
    "skillsAlignment": 0,
    "preferredQualifications": 0,
    "educationCertifications": 0,
    "keywordsTerminology": 0,
    "resumeAtsStructure": 0
  },
  "areYouQualified": "",
  "competitivePosition": "",
  "employerFirstImpression": "",
  "strongestEvidence": [],
  "requiredQualificationsMet": [],
  "requiredQualificationsUnclear": [],
  "requiredQualificationsNotFound": [],
  "preferredQualificationsMet": [],
  "preferredQualificationsNotFound": [],
  "matchedSkillsKeywords": [],
  "missingSkillsKeywords": [],
  "whatIsWorking": [],
  "screenOutRisks": [],
  "resumeQualityFlags": [],
  "fixFirst": [],
  "tailoringRecommendations": [],
  "doNotInvent": [],
  "coverLetterStrategy": [],
  "interviewReadiness": [],
  "likelyInterviewQuestions": [],
  "concernsToPrepareFor": [],
  "nextMove": "",
  "coachingSummary": ""
}
</instructions>
  `.trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "job-match-analyzer-ai",
    configured: Boolean(
      process.env.ANTHROPIC_API_KEY
    ),
    model: MODEL,
    maxDuration,
    timeoutMs: ANTHROPIC_TIMEOUT_MS,
  });
}

export async function POST(
  req: NextRequest
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, ANTHROPIC_TIMEOUT_MS);

  try {
    const apiKey =
      process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "Job Match Analyzer AI is not configured.",
        },
        { status: 500 }
      );
    }

    const body = await req.json();

    const jobTitle = String(
      body?.jobTitle || ""
    ).trim();

    const rawJobDescription = String(
      body?.jobDescription || ""
    ).trim();

    const rawResumeText = String(
      body?.resumeText || ""
    ).trim();

    const resumeMetadata =
      body?.resumeMetadata ?? {};

    if (rawJobDescription.length < 80) {
      return NextResponse.json(
        {
          error:
            "Please provide a complete job description.",
        },
        { status: 400 }
      );
    }

    if (rawResumeText.length < 80) {
      return NextResponse.json(
        {
          error:
            "Please provide a readable resume.",
        },
        { status: 400 }
      );
    }

    const jobDescription =
      trimForModel(
        rawJobDescription,
        7000
      );

    const resumeText =
      trimForModel(
        rawResumeText,
        7000
      );

    const prompt = buildPrompt({
      jobTitle,
      jobDescription,
      resumeText,
      resumeMetadata,
    });

    const startedAt = Date.now();

    const anthropic = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        signal: controller.signal,

        headers: {
          "Content-Type":
            "application/json",
          "x-api-key":
            apiKey,
          "anthropic-version":
            "2023-06-01",
        },

        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2400,
          temperature: 0.1,

          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
      }
    );

    clearTimeout(timeout);

    const elapsedMs =
      Date.now() - startedAt;

    const requestId =
      anthropic.headers.get(
        "request-id"
      ) ||
      anthropic.headers.get(
        "x-request-id"
      ) ||
      null;

    const raw = await anthropic.text();

    if (!anthropic.ok) {
      console.error(
        "Anthropic Job Match error:",
        {
          status:
            anthropic.status,
          requestId,
          elapsedMs,
          raw,
        }
      );

      let message =
        "The AI career coach could not complete the analysis.";

      try {
        const parsed =
          JSON.parse(raw);

        message =
          parsed?.error?.message ||
          message;
      } catch {}

      if (anthropic.status === 429) {
        message =
          "The Job Match Analyzer is receiving a lot of requests right now. Please wait a moment and try again.";
      }

      if (anthropic.status === 529) {
        message =
          "The AI service is temporarily busy. Please try again in a moment.";
      }

      return NextResponse.json(
        {
          error: message,
          requestId,
        },
        {
          status:
            anthropic.status === 429
              ? 429
              : 502,
        }
      );
    }

    let envelope: any;

    try {
      envelope = JSON.parse(raw);
    } catch {
      console.error(
        "Unreadable Anthropic envelope:",
        {
          requestId,
          elapsedMs,
          raw,
        }
      );

      return NextResponse.json(
        {
          error:
            "The AI service returned an unreadable response.",
          requestId,
        },
        { status: 502 }
      );
    }

    const output =
      Array.isArray(envelope?.content)
        ? envelope.content
            .filter(
              (block: any) =>
                block?.type === "text"
            )
            .map(
              (block: any) =>
                String(
                  block?.text || ""
                )
            )
            .join("\n")
        : "";

    if (!output.trim()) {
      console.error(
        "Empty Anthropic output:",
        {
          requestId,
          elapsedMs,
          stopReason:
            envelope?.stop_reason,
        }
      );

      return NextResponse.json(
        {
          error:
            "No career coach analysis was returned.",
          requestId,
        },
        { status: 502 }
      );
    }

    let parsed: any;

    try {
      parsed = extractJson(output);
    } catch (parseError) {
      console.error(
        "Unable to parse Job Match JSON:",
        {
          requestId,
          elapsedMs,
          stopReason:
            envelope?.stop_reason,
          output,
          parseError,
        }
      );

      if (
        envelope?.stop_reason ===
        "max_tokens"
      ) {
        return NextResponse.json(
          {
            error:
              "The Job Match Analyzer response was cut off before it finished. Please click Analyze Resume + Job again.",
            requestId,
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          error:
            "The Job Match Analyzer received an incomplete AI response. Please try again.",
          requestId,
        },
        { status: 502 }
      );
    }

    console.log(
      "Job Match Analyzer completed:",
      {
        requestId,
        elapsedMs,
        model: MODEL,
        stopReason:
          envelope?.stop_reason,
        jobChars:
          jobDescription.length,
        resumeChars:
          resumeText.length,
      }
    );

    return NextResponse.json(
      normalize(parsed)
    );
  } catch (error: any) {
    clearTimeout(timeout);

    if (
      error?.name ===
      "AbortError"
    ) {
      console.error(
        "Job Match Analyzer timed out waiting for Anthropic after",
        ANTHROPIC_TIMEOUT_MS,
        "ms"
      );

      return NextResponse.json(
        {
          error:
            "The Job Match Analyzer is taking longer than expected. Please click Analyze Resume + Job again.",
        },
        { status: 504 }
      );
    }

    console.error(
      "Job Match Analyzer error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to complete the Job Match analysis.",
      },
      { status: 500 }
    );
  }
}
