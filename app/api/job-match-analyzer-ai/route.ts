import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

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
    return JSON.parse(cleaned.slice(first, last + 1));
  }

  throw new Error("Unable to read the career coach response.");
}

function clamp(value: unknown) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(n)));
}

function list(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, 8);
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
    ).slice(0, 5),

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
    ).slice(0, 6),

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

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "job-match-analyzer-ai",
    configured: Boolean(
      process.env.ANTHROPIC_API_KEY
    ),
    model: MODEL,
  });
}

export async function POST(
  req: NextRequest
) {
  const controller = new AbortController();

  /*
    Stop our Anthropic request BEFORE
    Vercel kills the entire function.
  */
  const timeout = setTimeout(() => {
    controller.abort();
  }, 45000);

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

    const jobTitle =
      String(
        body?.jobTitle || ""
      ).trim();

    const jobDescription =
      String(
        body?.jobDescription || ""
      ).trim();

    const resumeText =
      String(
        body?.resumeText || ""
      ).trim();

    const resumeMetadata =
      body?.resumeMetadata ?? {};

    if (jobDescription.length < 80) {
      return NextResponse.json(
        {
          error:
            "Please provide a complete job description.",
        },
        { status: 400 }
      );
    }

    if (resumeText.length < 80) {
      return NextResponse.json(
        {
          error:
            "Please provide a readable resume.",
        },
        { status: 400 }
      );
    }

    /*
      Keep input controlled so a very long
      resume or posting doesn't slow the route.
    */
    const trimmedJob =
      jobDescription.slice(0, 10000);

    const trimmedResume =
      resumeText.slice(0, 10000);

    const prompt = `
You are the HireMinds Career Coach.

Compare ONE resume to ONE job description.

Your job is to provide:
- ATS-style screening
- qualification analysis
- resume strategy
- job-fit guidance
- interview preparation

TRUTH RULES

Never invent:
experience, skills, certifications, licenses,
education, job titles, dates, software,
accomplishments, or qualifications.

"Not found on the resume" does NOT mean
the candidate does not possess it.

Required qualifications matter more than
preferred qualifications.

Recognize legitimate transferable experience.

Do not reward keyword stuffing.

A missing preferred qualification should not
automatically make someone unqualified.

A mandatory missing credential or qualification
must be treated as a major concern.

SCORING

Required Qualifications = 30%
Experience Alignment = 20%
Skills Alignment = 15%
Preferred Qualifications = 10%
Education / Certifications = 10%
Keywords / Terminology = 5%
Resume / ATS Structure = 10%

Use real 0-100 scores.

Do not artificially inflate or cap scores.

RECOMMENDATION

Choose the most appropriate:

APPLY NOW
APPLY AFTER REVISING
APPLY, BUT PREPARE TO EXPLAIN GAPS
RESEARCH / VERIFY REQUIREMENTS FIRST
SIGNIFICANT GAPS — CONSIDER A DIFFERENT ROLE
BUILD QUALIFICATIONS BEFORE APPLYING

The recommendation must consider the actual
importance of missing qualifications, not only
the overall percentage.

COACHING

Be specific.

Tell the candidate:
- whether they are reasonably qualified
- their competitive position
- what the employer may notice first
- strongest evidence of fit
- required qualifications met
- required qualifications unclear
- required qualifications not found
- preferred qualifications met
- preferred qualifications not found
- matched skills and keywords
- missing or weakly represented skills
- what is working
- what could screen them out
- resume / ATS concerns
- what to fix first
- how to tailor the resume truthfully
- what NOT to invent
- cover letter strategy
- interview readiness
- likely interview questions
- concerns to prepare for
- best next move

Keep each list concise.
Do not generate essays.

Return ONLY valid JSON.

Use exactly this structure:

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

JOB TITLE

${jobTitle || "Not provided"}

JOB DESCRIPTION

${trimmedJob}

RESUME

${trimmedResume}

RESUME METADATA

${JSON.stringify({
  fileName:
    resumeMetadata?.fileName ?? null,

  pageCount:
    resumeMetadata?.pageCount ?? null,

  hasImage:
    resumeMetadata?.hasImage ?? null,

  imageCount:
    resumeMetadata?.imageCount ?? null,
})}
`.trim();

    const anthropic =
      await fetch(
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

            /*
              We do not need a 6000-token answer.
              Shorter output = faster response.
            */
            max_tokens: 2200,

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

    const raw =
      await anthropic.text();

    if (!anthropic.ok) {
      console.error(
        "Anthropic error:",
        anthropic.status,
        raw
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

      return NextResponse.json(
        {
          error: message,
        },
        { status: 502 }
      );
    }

    let data: any;

    try {
      data = JSON.parse(raw);
    } catch {
      console.error(
        "Unreadable Anthropic response:",
        raw
      );

      return NextResponse.json(
        {
          error:
            "The AI service returned an unreadable response.",
        },
        { status: 502 }
      );
    }

    const output =
      Array.isArray(data?.content)
        ? data.content
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
      return NextResponse.json(
        {
          error:
            "No career coach analysis was returned.",
        },
        { status: 502 }
      );
    }

    const parsed =
      extractJson(output);

    return NextResponse.json(
      normalize(parsed)
    );
  } catch (error: any) {
    clearTimeout(timeout);

    if (
      error?.name === "AbortError"
    ) {
      console.error(
        "Job Match Analyzer timed out waiting for Anthropic."
      );

      return NextResponse.json(
        {
          error:
            "The career coach analysis took too long. Please try again.",
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
