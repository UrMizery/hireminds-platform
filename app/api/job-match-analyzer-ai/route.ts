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

  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1));
  }

  throw new Error("AI response did not contain valid JSON.");
}

function clampScore(value: unknown) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  return Math.max(0, Math.min(100, Math.round(number)));
}

function cleanArray(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, 12);
}

function normalizeAnalysis(data: any) {
  const breakdown = data?.breakdown || {};

  return {
    overallMatch: clampScore(data?.overallMatch),

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
      requiredQualifications: clampScore(
        breakdown.requiredQualifications
      ),

      experienceAlignment: clampScore(
        breakdown.experienceAlignment
      ),

      skillsAlignment: clampScore(
        breakdown.skillsAlignment
      ),

      preferredQualifications: clampScore(
        breakdown.preferredQualifications
      ),

      educationCertifications: clampScore(
        breakdown.educationCertifications
      ),

      keywordsTerminology: clampScore(
        breakdown.keywordsTerminology
      ),

      resumeAtsStructure: clampScore(
        breakdown.resumeAtsStructure
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

    strongestEvidence: cleanArray(
      data?.strongestEvidence
    ),

    requiredQualificationsMet: cleanArray(
      data?.requiredQualificationsMet
    ),

    requiredQualificationsUnclear: cleanArray(
      data?.requiredQualificationsUnclear
    ),

    requiredQualificationsNotFound: cleanArray(
      data?.requiredQualificationsNotFound
    ),

    preferredQualificationsMet: cleanArray(
      data?.preferredQualificationsMet
    ),

    preferredQualificationsNotFound: cleanArray(
      data?.preferredQualificationsNotFound
    ),

    matchedSkillsKeywords: cleanArray(
      data?.matchedSkillsKeywords
    ),

    missingSkillsKeywords: cleanArray(
      data?.missingSkillsKeywords
    ),

    whatIsWorking: cleanArray(
      data?.whatIsWorking
    ),

    screenOutRisks: cleanArray(
      data?.screenOutRisks
    ),

    resumeQualityFlags: cleanArray(
      data?.resumeQualityFlags
    ),

    fixFirst: cleanArray(
      data?.fixFirst
    ).slice(0, 6),

    tailoringRecommendations: cleanArray(
      data?.tailoringRecommendations
    ),

    doNotInvent: cleanArray(
      data?.doNotInvent
    ),

    coverLetterStrategy: cleanArray(
      data?.coverLetterStrategy
    ),

    interviewReadiness: cleanArray(
      data?.interviewReadiness
    ),

    likelyInterviewQuestions: cleanArray(
      data?.likelyInterviewQuestions
    ).slice(0, 8),

    concernsToPrepareFor: cleanArray(
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

export async function POST(req: NextRequest) {
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

    const jobDescription = String(
      body?.jobDescription || ""
    ).trim();

    const resumeText = String(
      body?.resumeText || ""
    ).trim();

    const resumeMetadata =
      body?.resumeMetadata || {};

    if (jobDescription.length < 80) {
      return NextResponse.json(
        {
          error:
            "Please provide a more complete job description.",
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

    const systemPrompt = `
You are HireMinds Job Match Analyzer and Career Coach.

You are reviewing one real resume against one real job description.

You are NOT a generic keyword scanner.

You combine:

1. ATS-style screening
2. recruiter judgment
3. resume strategy
4. career coaching
5. interview preparation

IMPORTANT TRUTH RULES:

- Never invent experience.
- Never invent credentials.
- Never invent education.
- Never invent certifications.
- Never invent licenses.
- Never invent accomplishments.
- Never invent dates.
- Never invent job titles.
- Never invent software or tools.
- Never invent skills.

If something is not clearly shown on the resume, say:

"Not clearly demonstrated on the resume"

or

"Not found on the resume"

Do NOT automatically say the candidate does not have it.

Required qualifications matter more than preferred qualifications.

A candidate may still be a strong applicant even if preferred qualifications are missing.

A candidate may still be a weak applicant even with many matching keywords if a mandatory qualification is missing.

Do not reward keyword stuffing.

Recognize reasonable synonyms and transferable experience.

When the candidate appears to be changing careers, evaluate transferable experience rather than automatically treating different job titles as unrelated.

If the candidate appears overqualified, explain whether this may be a concern and how the candidate may prepare to address genuine interest in the role.

Do not infer protected characteristics.

--------------------------------------------------

SCORING

Score each category from 0 to 100.

Use approximately these weights:

Required Qualifications: 30%

Experience Alignment: 20%

Skills Alignment: 15%

Preferred Qualifications: 10%

Education / Certifications: 10%

Keywords / Terminology: 5%

Resume / ATS Structure: 10%

Overall score must be a real score.

Do not artificially force a minimum score.

Do not artificially cap a strong candidate below 100.

The overall recommendation must NOT be based only on the percentage.

--------------------------------------------------

CRITICAL REQUIREMENT RULE

If the job requires a mandatory:

- license
- certification
- degree
- security clearance
- legal qualification
- schedule requirement
- location requirement
- physical requirement
- specific professional credential
- or another clear hard requirement

and the resume does not demonstrate it, identify it prominently.

Do not allow keyword overlap to hide a major qualification concern.

--------------------------------------------------

CAREER COACH RECOMMENDATIONS

Use one of these recommendations when appropriate:

APPLY NOW

APPLY AFTER REVISING

APPLY, BUT PREPARE TO EXPLAIN GAPS

RESEARCH / VERIFY REQUIREMENTS FIRST

SIGNIFICANT GAPS — CONSIDER A DIFFERENT ROLE

BUILD QUALIFICATIONS BEFORE APPLYING

--------------------------------------------------

CAREER COACHING QUESTIONS TO ANSWER

The candidate should understand:

- Am I reasonably qualified?
- What is my competitive position?
- What will the recruiter probably notice first?
- What is working in my resume?
- What could screen me out?
- What is actually missing?
- What is simply not clearly presented?
- What should I fix first?
- How should I tailor this resume?
- What should I NOT add or invent?
- Is a cover letter worthwhile?
- What should I prepare for in an interview?
- What concerns might the employer raise?
- Should I apply now, revise first, research first, or redirect my search?

--------------------------------------------------

RESUME QUALITY REVIEW

Assess only what the provided resume text and metadata support.

Review:

- page count if supplied
- detected images if supplied
- contact information
- section headings
- summary length
- skill section length
- overly dense writing
- weak or generic bullets
- measurable accomplishments
- chronology clarity
- repetition
- obvious missing dates
- obvious missing employers
- ATS-friendly organization when reasonably inferable

Do NOT claim you detected visual formatting that is not available in the supplied data.

If metadata does not confirm images, do not claim a photo exists.

If page count is unavailable, do not invent one.

--------------------------------------------------

PRIORITY

Do not overwhelm the candidate with a random list.

The "fixFirst" section must contain only the most important 3 to 6 actions.

Prioritize changes that could materially improve screening or recruiter understanding.

--------------------------------------------------

OUTPUT

Return ONLY valid JSON.

No Markdown.

No explanations outside the JSON.

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

Write like a strong professional career coach.

Be specific to the candidate and the actual job.

Do not use generic filler.

Do not be patronizing.

Do not exaggerate certainty.
`.trim();

    const metadata = {
      fileName:
        resumeMetadata?.fileName || null,

      pageCount:
        typeof resumeMetadata?.pageCount ===
        "number"
          ? resumeMetadata.pageCount
          : null,

      hasImage:
        typeof resumeMetadata?.hasImage ===
        "boolean"
          ? resumeMetadata.hasImage
          : null,

      imageCount:
        typeof resumeMetadata?.imageCount ===
        "number"
          ? resumeMetadata.imageCount
          : null,
    };

    const userPrompt = `
JOB TITLE:

${jobTitle || "Not provided"}

--------------------------------------------------

JOB DESCRIPTION:

${jobDescription}

--------------------------------------------------

RESUME:

${resumeText}

--------------------------------------------------

RESUME METADATA:

${JSON.stringify(metadata)}

--------------------------------------------------

Analyze this candidate against this specific job.

Follow all truth rules.

Separate required qualifications from preferred qualifications.

Do not treat "not shown on the resume" as proof the candidate does not possess something.

Return ONLY the required JSON.
`.trim();

    const anthropicResponse =
      await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "x-api-key": apiKey,

            "anthropic-version":
              "2023-06-01",
          },

          body: JSON.stringify({
            model: MODEL,

            max_tokens: 6000,

            temperature: 0.2,

            system: systemPrompt,

            messages: [
              {
                role: "user",
                content: userPrompt,
              },
            ],
          }),
        }
      );

    const anthropicData =
      await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      console.error(
        "Job Match Analyzer Anthropic error:",
        anthropicData
      );

      return NextResponse.json(
        {
          error:
            anthropicData?.error?.message ||
            "The Job Match Analyzer could not complete the analysis.",
        },
        { status: 502 }
      );
    }

    const output =
      Array.isArray(
        anthropicData?.content
      )
        ? anthropicData.content
            .filter(
              (block: any) =>
                block?.type === "text"
            )
            .map(
              (block: any) =>
                block?.text || ""
            )
            .join("\n")
        : "";

    if (!output.trim()) {
      return NextResponse.json(
        {
          error:
            "The Job Match Analyzer returned an empty response.",
        },
        { status: 502 }
      );
    }

    let parsed;

    try {
      parsed = extractJson(output);
    } catch (error) {
      console.error(
        "Job Match Analyzer invalid JSON:",
        output
      );

      return NextResponse.json(
        {
          error:
            "The analysis was generated, but the response format could not be read. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      normalizeAnalysis(parsed)
    );
  } catch (error: any) {
    console.error(
      "Job Match Analyzer route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Something went wrong while analyzing the resume and job description.",
      },
      { status: 500 }
    );
  }
}
