// app/api/resume-builder-ai/route.ts
import { NextRequest, NextResponse } from "next/server";

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

type JsonRecord = Record<string, unknown>;

function anthropicHeaders() {
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();

  if (!apiKey) {
    throw new Error(
      "Resume AI is not configured. Add ANTHROPIC_API_KEY in Vercel → Project Settings → Environment Variables, enable it for Production, and redeploy.",
    );
  }

  return {
    "Content-Type": "application/json",
    "x-api-key": apiKey,
    "anthropic-version": "2023-06-01",
  };
}

async function askClaude(prompt: string, maxTokens = 700) {
  let response: Response;

  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: anthropicHeaders(),
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        temperature: 0.3,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("Anthropic network error:", error);

    throw new Error(
      "Resume AI could not connect to the AI service. Please try again.",
    );
  }

  let data: any = null;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Resume AI received an unreadable response from the AI service (${response.status}).`,
    );
  }

  if (!response.ok) {
    const providerMessage =
      data?.error?.message ||
      data?.message ||
      `Anthropic request failed with status ${response.status}.`;

    console.error("Anthropic API error:", {
      status: response.status,
      model: MODEL,
      error: data,
    });

    if (response.status === 401) {
      throw new Error(
        "Resume AI authentication failed. Check ANTHROPIC_API_KEY in Vercel and redeploy.",
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Resume AI does not have permission to use ${MODEL}. Check your Anthropic account/model access.`,
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Resume AI model "${MODEL}" was not found. Set ANTHROPIC_MODEL to a model available to your Anthropic account.`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        "Resume AI is temporarily rate-limited or the Anthropic account has reached its usage limit. Please try again shortly.",
      );
    }

    throw new Error(providerMessage);
  }

  const text = Array.isArray(data?.content)
    ? data.content
        .filter(
          (block: any) =>
            block &&
            block.type === "text" &&
            typeof block.text === "string",
        )
        .map((block: any) => block.text)
        .join("")
        .trim()
    : "";

  if (!text) {
    console.error("Empty Anthropic response:", data);

    throw new Error(
      "Resume AI returned an empty response. Please try again.",
    );
  }

  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const objectStart = text.indexOf("{");
    const objectEnd = text.lastIndexOf("}");

    if (
      objectStart !== -1 &&
      objectEnd !== -1 &&
      objectEnd > objectStart
    ) {
      try {
        return JSON.parse(
          text.slice(objectStart, objectEnd + 1),
        ) as T;
      } catch {
        // continue
      }
    }

    const arrayStart = text.indexOf("[");
    const arrayEnd = text.lastIndexOf("]");

    if (
      arrayStart !== -1 &&
      arrayEnd !== -1 &&
      arrayEnd > arrayStart
    ) {
      try {
        return JSON.parse(
          text.slice(arrayStart, arrayEnd + 1),
        ) as T;
      } catch {
        // continue
      }
    }

    return fallback;
  }
}

function stringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => String(item || "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeExperiences(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(0, 6).map((experience: any) => ({
    company: String(
      experience?.company ||
        experience?.companyName ||
        "",
    ).trim(),

    role: String(
      experience?.role ||
        experience?.roleTitle ||
        experience?.title ||
        "",
    ).trim(),

    location: String(
      experience?.location || "",
    ).trim(),

    bullets: stringArray(
      experience?.bullets,
      8,
    ),
  }));
}

function errorResponse(message: string, status = 500) {
  return NextResponse.json(
    {
      error: message,
      model: MODEL,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "resume-builder-ai",
      configured: Boolean(
        process.env.ANTHROPIC_API_KEY?.trim(),
      ),
      model: MODEL,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function POST(req: NextRequest) {
  try {
    let body: JsonRecord;

    try {
      body = (await req.json()) as JsonRecord;
    } catch {
      return errorResponse(
        "Resume AI received an invalid request.",
        400,
      );
    }

    const action = String(
      body?.action || "",
    ).trim();

    if (!action) {
      return errorResponse(
        "Resume AI action is missing.",
        400,
      );
    }

    /* =====================================================
       PROFESSIONAL SUMMARY IDEAS
    ===================================================== */

    if (action === "generateSummaryIdeas") {
      const targetJobTitle = String(
        body?.targetJobTitle || "",
      ).trim();

      const skills = stringArray(
        body?.skills,
        12,
      );

      const experiences =
        normalizeExperiences(
          body?.experiences,
        );

      const currentSummary = String(
        body?.currentSummary || "",
      ).trim();

      if (
        !targetJobTitle &&
        skills.length === 0 &&
        experiences.length === 0 &&
        !currentSummary
      ) {
        return errorResponse(
          "Add a target job title, skills, experience, or a current summary before asking AI for summary ideas.",
          400,
        );
      }

      const text = await askClaude(
        `You are a professional resume writer helping a job seeker create an accurate professional summary.

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

CURRENT SUMMARY:
${currentSummary || "Not provided"}

SKILLS THE CANDIDATE ENTERED:
${JSON.stringify(skills)}

EXPERIENCE THE CANDIDATE ENTERED:
${JSON.stringify(experiences)}

Create exactly 3 professional summary options.

REQUIREMENTS:
- Each option should be concise and generally 2-3 sentences.
- Use only facts the candidate actually provided.
- Do not invent years of experience.
- Do not invent certifications, software, equipment, industries, metrics, accomplishments, education, or responsibilities.
- If information is limited, keep the wording broad and truthful.
- Use strong, natural, ATS-friendly language.
- Avoid first-person pronouns.
- If a target job title is provided, align wording toward that role without pretending the candidate has experience they did not provide.
- Do not use objective-statement wording such as "seeking a position where..."

Return ONLY valid JSON in this exact shape:
{"suggestions":["summary 1","summary 2","summary 3"]}`,
        800,
      );

      const parsed =
        parseJson<{
          suggestions?: string[];
        }>(text, {
          suggestions: [],
        });

      const suggestions =
        stringArray(
          parsed.suggestions,
          3,
        );

      if (suggestions.length === 0) {
        throw new Error(
          "Resume AI did not return usable summary suggestions. Please try again.",
        );
      }

      return NextResponse.json(
        {
          suggestions,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    /* =====================================================
       JOB-TITLE / ROLE MEMORY PROMPTS
    ===================================================== */

    if (action === "getRolePrompts") {
      const roleTitle = String(
        body?.roleTitle || "",
      ).trim();

      if (!roleTitle) {
        return errorResponse(
          "Enter a job title first.",
          400,
        );
      }

      const text = await askClaude(
        `A job seeker entered this past job title:

"${roleTitle}"

Give exactly 6 short memory prompts that can help the person remember responsibilities they may ACTUALLY have performed in that role.

IMPORTANT:
- These are brainstorming prompts, not resume claims.
- Never state that the person performed a duty.
- Do not invent software, equipment, certifications, metrics, accomplishments, or responsibilities.
- Phrase every item as a question.
- Begin with wording such as "Did you...", "Were you responsible for...", "Did you help...", or "Did your role include...?"
- Keep each prompt practical and easy to understand.
- Vary the prompts so they cover different common areas of the role.

Return ONLY valid JSON:
{"prompts":["prompt 1","prompt 2","prompt 3","prompt 4","prompt 5","prompt 6"]}`,
        650,
      );

      const parsed =
        parseJson<{
          prompts?: string[];
        }>(text, {
          prompts: [],
        });

      const prompts =
        stringArray(
          parsed.prompts,
          6,
        );

      if (prompts.length === 0) {
        throw new Error(
          "Resume AI did not return usable role prompts. Please try again.",
        );
      }

      return NextResponse.json(
        {
          prompts,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    /* =====================================================
       BULLET IDEAS
    ===================================================== */

    if (action === "generateBulletIdeas") {
      const roleTitle = String(
        body?.roleTitle || "",
      ).trim();

      const companyName = String(
        body?.companyName || "",
      ).trim();

      const targetJobTitle = String(
        body?.targetJobTitle || "",
      ).trim();

      const existingBullets =
        stringArray(
          body?.existingBullets,
          8,
        );

      if (!roleTitle) {
        return errorResponse(
          "Enter the work-experience job title first.",
          400,
        );
      }

      const text = await askClaude(
        `You are helping a job seeker brainstorm accurate resume bullet ideas.

PAST JOB TITLE:
${roleTitle}

COMPANY:
${companyName || "Not provided"}

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

EXISTING BULLETS:
${JSON.stringify(existingBullets)}

Create exactly 5 concise bullet IDEAS commonly associated with the past job title.

IMPORTANT RULES:
- These are ideas for the candidate to review, not claims that they performed the duties.
- Do not invent metrics or numbers.
- Do not invent software, equipment, certifications, responsibilities, achievements, or outcomes.
- Keep ideas broad enough that the candidate can decide whether each one is true.
- Use clear action-oriented resume language.
- Do not repeat existing bullets.
- Do not add a bullet symbol at the beginning.
- Do not exaggerate seniority or responsibility.
- If the target role is provided, favor transferable wording that may be useful for that target role, while remaining truthful to the past role.

Return ONLY valid JSON:
{"suggestions":["bullet 1","bullet 2","bullet 3","bullet 4","bullet 5"]}`,
        800,
      );

      const parsed =
        parseJson<{
          suggestions?: string[];
        }>(text, {
          suggestions: [],
        });

      const suggestions =
        stringArray(
          parsed.suggestions,
          5,
        );

      if (suggestions.length === 0) {
        throw new Error(
          "Resume AI did not return usable bullet ideas. Please try again.",
        );
      }

      return NextResponse.json(
        {
          suggestions,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    /* =====================================================
       STRENGTHEN AN EXISTING BULLET
    ===================================================== */

    if (action === "strengthenBullet") {
      const roleTitle = String(
        body?.roleTitle || "",
      ).trim();

      const currentBullet = String(
        body?.currentBullet || "",
      ).trim();

      const targetJobTitle = String(
        body?.targetJobTitle || "",
      ).trim();

      if (!currentBullet) {
        return errorResponse(
          "Write a bullet first.",
          400,
        );
      }

      const text = await askClaude(
        `Rewrite this resume bullet so it is stronger, clearer, and more professional while preserving the candidate's exact factual meaning.

ROLE TITLE:
${roleTitle || "Not provided"}

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

CURRENT BULLET:
${currentBullet}

RULES:
- Preserve the factual meaning.
- Do not invent numbers or metrics.
- Do not invent software, tools, equipment, certifications, responsibilities, accomplishments, scope, or outcomes.
- Do not add information that is not already present in the original bullet.
- Begin with a strong action verb when appropriate.
- Improve clarity and professionalism.
- Keep it concise.
- Do not add a bullet symbol.
- Return one rewritten version only.

Return ONLY valid JSON:
{"suggestion":"rewritten bullet"}`,
        500,
      );

      const parsed =
        parseJson<{
          suggestion?: string;
        }>(text, {
          suggestion: "",
        });

      const suggestion = String(
        parsed.suggestion || "",
      ).trim();

      if (!suggestion) {
        throw new Error(
          "Resume AI did not return a strengthened bullet. Please try again.",
        );
      }

      return NextResponse.json(
        {
          suggestion,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return errorResponse(
      `Invalid Resume AI action: ${action}`,
      400,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Resume AI is unavailable right now.";

    console.error(
      "Resume Builder AI error:",
      error,
    );

    return errorResponse(
      message,
      500,
    );
  }
}
