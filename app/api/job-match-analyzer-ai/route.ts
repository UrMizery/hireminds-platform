import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

/*
  Keep the route comfortably inside Vercel's 60-second limit.
  The previous version aborted at 45 seconds, which is the
  exact message you were seeing on the page.
*/
const ANTHROPIC_TIMEOUT_MS = 52000;

function clamp(value: unknown) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(n)));
}

function list(value: unknown, max = 5) {
  if (!Array.isArray(value)) {
    return [];
  }

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
      data?.strongestEvidence,
      5
    ),

    requiredQualificationsMet: list(
      data?.requiredQualificationsMet,
      5
    ),

    requiredQualificationsUnclear: list(
      data?.requiredQualificationsUnclear,
      4
    ),

    requiredQualificationsNotFound: list(
      data?.requiredQualificationsNotFound,
      4
    ),

    preferredQualificationsMet: list(
      data?.preferredQualificationsMet,
      4
    ),

    preferredQualificationsNotFound: list(
      data?.preferredQualificationsNotFound,
      4
    ),

    matchedSkillsKeywords: list(
      data?.matchedSkillsKeywords,
      5
    ),

    missingSkillsKeywords: list(
      data?.missingSkillsKeywords,
      5
    ),

    whatIsWorking: list(
      data?.whatIsWorking,
      4
    ),

    screenOutRisks: list(
      data?.screenOutRisks,
      4
    ),

    resumeQualityFlags: list(
      data?.resumeQualityFlags,
      4
    ),

    fixFirst: list(
      data?.fixFirst,
      4
    ),

    tailoringRecommendations: list(
      data?.tailoringRecommendations,
      5
    ),

    doNotInvent: list(
      data?.doNotInvent,
      4
    ),

    coverLetterStrategy: list(
      data?.coverLetterStrategy,
      4
    ),

    interviewReadiness: list(
      data?.interviewReadiness,
      4
    ),

    likelyInterviewQuestions: list(
      data?.likelyInterviewQuestions,
      4
    ),

    concernsToPrepareFor: list(
      data?.concernsToPrepareFor,
      4
    ),

    nextMove: String(
      data?.nextMove || ""
    ).trim(),

    coachingSummary: String(
      data?.coachingSummary || ""
    ).trim(),
  };
}

/*
  Preserve both the beginning and end of longer text.
  Job requirements are often near the bottom of postings,
  while resume education/certifications are often near the end.
*/
function trimForModel(
  value: string,
  maxChars = 7500
) {
  if (value.length <= maxChars) {
    return value;
  }

  const endChars = 1800;
  const startChars =
    maxChars - endChars;

  return [
    value.slice(0, startChars),
    "\n\n[...middle shortened for analysis speed...]\n\n",
    value.slice(-endChars),
  ].join("");
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

<task>
You are the HireMinds Career Coach.

Compare this ONE resume to this ONE job description.

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
- likely screen-out concerns
- truthful tailoring opportunities
- interview readiness

Truth rules:
- Never invent experience, skills, certifications, licenses,
  education, job titles, dates, software, accomplishments,
  or qualifications.
- "Not found on the resume" does not mean the candidate
  does not possess it.
- Required qualifications matter more than preferred ones.
- Recognize legitimate transferable experience.
- Do not reward keyword stuffing.
- A mandatory missing credential or qualification is a
  major concern.

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

Keep the response concise:
- narrative fields: 1-2 short sentences
- list fields: no more than 4-5 concise items
- no essays
- return ONLY valid JSON
- do not wrap JSON in markdown

Use exactly these keys:

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
</task>
  `.trim();
}

function extractJson(text: string) {
  const cleaned = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {}

  const first =
    cleaned.indexOf("{");

  const last =
    cleaned.lastIndexOf("}");

  if (
    first >= 0 &&
    last > first
  ) {
    return JSON.parse(
      cleaned.slice(
        first,
        last + 1
      )
    );
  }

  throw new Error(
    "Unable to read the career coach response."
  );
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route:
      "job-match-analyzer-ai",
    configured: Boolean(
      process.env.ANTHROPIC_API_KEY
    ),
    model: MODEL,
    maxDuration,
    timeoutMs:
      ANTHROPIC_TIMEOUT_MS,
  });
}

export async function POST(
  req: NextRequest
) {
  const controller =
    new AbortController();

  const timeout =
    setTimeout(() => {
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
        {
          status: 500,
        }
      );
    }

    const body =
      await req.json();

    const jobTitle =
      String(
        body?.jobTitle || ""
      ).trim();

    const rawJobDescription =
      String(
        body?.jobDescription || ""
      ).trim();

    const rawResumeText =
      String(
        body?.resumeText || ""
      ).trim();

    const resumeMetadata =
      body?.resumeMetadata ?? {};

    if (
      rawJobDescription.length <
      80
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a complete job description.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      rawResumeText.length <
      80
    ) {
      return NextResponse.json(
        {
          error:
            "Please provide a readable resume.",
        },
        {
          status: 400,
        }
      );
    }

    const jobDescription =
      trimForModel(
        rawJobDescription,
        7500
      );

    const resumeText =
      trimForModel(
        rawResumeText,
        7500
      );

    const prompt =
      buildPrompt({
        jobTitle,
        jobDescription,
        resumeText,
        resumeMetadata,
      });

    const startedAt =
      Date.now();

    const anthropic =
      await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",

          signal:
            controller.signal,

          headers: {
            "Content-Type":
              "application/json",

            "x-api-key":
              apiKey,

            "anthropic-version":
              "2023-06-01",
          },

          body:
            JSON.stringify({
              model: MODEL,

              /*
                The original route allowed 2200 output tokens.
                This analyzer asks for concise coaching, so
                1600 is enough and reduces generation time.
              */
              max_tokens: 1600,

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

    const raw =
      await anthropic.text();

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

      /*
        Give the participant a useful message for
        provider overload/rate-limit conditions.
      */
      if (
        anthropic.status ===
        429
      ) {
        message =
          "The Job Match Analyzer is receiving a lot of requests right now. Please wait a moment and try again.";
      }

      if (
        anthropic.status ===
        529
      ) {
        message =
          "The AI service is temporarily busy. Please try the analysis again in a moment.";
      }

      return NextResponse.json(
        {
          error: message,
          requestId,
        },
        {
          status:
            anthropic.status ===
            429
              ? 429
              : 502,
        }
      );
    }

    let envelope: any;

    try {
      envelope =
        JSON.parse(raw);
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
        {
          status: 502,
        }
      );
    }

    const output =
      Array.isArray(
        envelope?.content
      )
        ? envelope.content
            .filter(
              (block: any) =>
                block?.type ===
                "text"
            )
            .map(
              (block: any) =>
                String(
                  block?.text ||
                    ""
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
        {
          status: 502,
        }
      );
    }

    /*
      If max_tokens was hit, the JSON may be cut off.
      Return a clearer error instead of a mysterious parse failure.
    */
    if (
      envelope?.stop_reason ===
      "max_tokens"
    ) {
      console.error(
        "Job Match output hit max_tokens:",
        {
          requestId,
          elapsedMs,
        }
      );

      return NextResponse.json(
        {
          error:
            "The analysis was too long to finish. Please try again with a slightly shorter job description.",
          requestId,
        },
        {
          status: 502,
        }
      );
    }

    let parsed: any;

    try {
      parsed =
        extractJson(output);
    } catch (error) {
      console.error(
        "Unable to parse Job Match JSON:",
        {
          requestId,
          elapsedMs,
          output,
          error,
        }
      );

      return NextResponse.json(
        {
          error:
            "The Job Match Analyzer received an incomplete AI response. Please try again.",
          requestId,
        },
        {
          status: 502,
        }
      );
    }

    console.log(
      "Job Match Analyzer completed:",
      {
        requestId,
        elapsedMs,
        model: MODEL,
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
            "The Job Match Analyzer is taking longer than expected. Please try again. If it happens again, shorten the job description slightly.",
        },
        {
          status: 504,
        }
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
      {
        status: 500,
      }
    );
  }
}
