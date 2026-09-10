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
    return JSON.parse(
      cleaned.slice(firstBrace, lastBrace + 1)
    );
  }

  throw new Error(
    "The AI response could not be converted into the required analysis format."
  );
}

function score(value: unknown) {
  const n = Number(value);

  if (!Number.isFinite(n)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(100, Math.round(n))
  );
}

function list(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) =>
      String(item ?? "").trim()
    )
    .filter(Boolean)
    .slice(0, 10);
}

function normalize(data: any) {
  const breakdown = data?.breakdown ?? {};

  return {
    overallMatch: score(data?.overallMatch),

    matchLabel:
      String(
        data?.matchLabel ||
          "Career Coach Assessment"
      ).trim(),

    recommendation:
      String(
        data?.recommendation ||
          "REVIEW BEFORE APPLYING"
      ).trim(),

    recommendationReason:
      String(
        data?.recommendationReason || ""
      ).trim(),

    breakdown: {
      requiredQualifications: score(
        breakdown.requiredQualifications
      ),

      experienceAlignment: score(
        breakdown.experienceAlignment
      ),

      skillsAlignment: score(
        breakdown.skillsAlignment
      ),

      preferredQualifications: score(
        breakdown.preferredQualifications
      ),

      educationCertifications: score(
        breakdown.educationCertifications
      ),

      keywordsTerminology: score(
        breakdown.keywordsTerminology
      ),

      resumeAtsStructure: score(
        breakdown.resumeAtsStructure
      ),
    },

    areYouQualified:
      String(
        data?.areYouQualified || ""
      ).trim(),

    competitivePosition:
      String(
        data?.competitivePosition || ""
      ).trim(),

    employerFirstImpression:
      String(
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
    ).slice(0, 6),

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
    ).slice(0, 8),

    concernsToPrepareFor: list(
      data?.concernsToPrepareFor
    ),

    nextMove:
      String(
        data?.nextMove || ""
      ).trim(),

    coachingSummary:
      String(
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
      body?.resumeMetadata || {};

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
      Keep the request compact.

      Resume + JD are already large.
      We do NOT need an enormous system prompt
      or a 6,000-token response.
    */

    const prompt = `
You are HireMinds Job Match Analyzer, an ATS-style screening and career coaching system.

Analyze ONE resume against ONE job description.

IMPORTANT RULES:

- Never invent candidate experience, skills, certifications, licenses, education, accomplishments, dates, software, or credentials.
- "Not found on the resume" does NOT mean the candidate does not possess it.
- Use "not clearly demonstrated on the resume" when appropriate.
- Required qualifications carry more importance than preferred qualifications.
- Do not reward keyword stuffing.
- Recognize legitimate synonyms and transferable experience.
- Evaluate career-change experience fairly.
- A missing preferred qualification should not automatically make someone unqualified.
- A mandatory missing credential can materially affect the recommendation even when keyword overlap is strong.
- The recommendation must NOT be determined only by the overall percentage.

SCORING WEIGHTS:

Required Qualifications: 30%
Experience Alignment: 20%
Skills Alignment: 15%
Preferred Qualifications: 10%
Education / Certifications: 10%
Keywords / Terminology: 5%
Resume / ATS Structure: 10%

Use genuine 0-100 scores.
Do not artificially force minimum or maximum scores.

RECOMMENDATION OPTIONS:

APPLY NOW
APPLY AFTER REVISING
APPLY, BUT PREPARE TO EXPLAIN GAPS
RESEARCH / VERIFY REQUIREMENTS FIRST
SIGNIFICANT GAPS — CONSIDER A DIFFERENT ROLE
BUILD QUALIFICATIONS BEFORE APPLYING

CAREER COACH REVIEW:

Explain:
- whether the candidate is reasonably qualified
- competitive position
- recruiter first impression
- strongest evidence of fit
- required qualifications met
- required qualifications unclear
- required qualifications not demonstrated
- preferred qualifications met
- preferred qualifications missing
- matched skills and terminology
- missing or underrepresented skills/terminology
- what is working
- possible screen-out risks
- resume quality/ATS concerns
- what should be fixed FIRST
- how to tailor the resume truthfully
- what the candidate should NOT invent
- cover letter strategy
- interview readiness
- likely interview questions
- concerns the candidate should prepare to discuss
- the best next move

RESUME QUALITY:

Only comment on formatting/structure that can actually be determined from the supplied text or metadata.

Resume metadata:
${JSON.stringify(resumeMetadata)}

Return ONLY valid JSON.

Use exactly:

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

JOB TITLE:
${jobTitle || "Not provided"}

JOB DESCRIPTION:
${jobDescription.slice(0, 16000)}

RESUME:
${resumeText.slice(0, 16000)}
`.trim();

    const anthropicResponse =
      await fetch(
        "https://api.anthropic.com/v1/messages",
        {
          method: "POST",

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
              3,500 is plenty for this report
              and significantly lighter than 6,000.
            */
            max_tokens: 3500,

            temperature: 0.15,

            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
          }),
        }
      );

    /*
      IMPORTANT:
      Read Anthropic as TEXT first.

      That prevents another JSON parser crash
      if the upstream service ever returns
      something unexpected.
    */

    const anthropicText =
      await anthropicResponse.text();

    if (!anthropicResponse.ok) {
      console.error(
        "Anthropic status:",
        anthropicResponse.status
      );

      console.error(
        "Anthropic response:",
        anthropicText
      );

      let message =
        "The AI analysis could not be completed.";

      try {
        const parsedError =
          JSON.parse(anthropicText);

        message =
          parsedError?.error?.message ||
          message;
      } catch {}

      return NextResponse.json(
        {
          error: message,
        },
        {
          status:
            anthropicResponse.status >= 400 &&
            anthropicResponse.status < 600
              ? anthropicResponse.status
              : 502,
        }
      );
    }

    let anthropicData: any;

    try {
      anthropicData =
        JSON.parse(anthropicText);
    } catch {
      console.error(
        "Anthropic returned non-JSON:",
        anthropicText
      );

      return NextResponse.json(
        {
          error:
            "The AI service returned an unreadable response. Please try again.",
        },
        { status: 502 }
      );
    }

    const aiText =
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
                String(
                  block?.text || ""
                )
            )
            .join("\n")
        : "";

    if (!aiText.trim()) {
      return NextResponse.json(
        {
          error:
            "The Job Match Analyzer did not return an analysis. Please try again.",
        },
        { status: 502 }
      );
    }

    let analysis;

    try {
      analysis =
        extractJson(aiText);
    } catch (error) {
      console.error(
        "Invalid Job Match JSON:",
        aiText
      );

      return NextResponse.json(
        {
          error:
            "The career coach completed the review, but the report format could not be read. Please try again.",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      normalize(analysis)
    );
  } catch (error: any) {
    console.error(
      "Job Match Analyzer API error:",
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
