// app/api/resume-builder-ai/route.ts
import { NextRequest, NextResponse } from "next/server";

/*
  IMPORTANT:
  This route intentionally uses the same Anthropic model and request pattern
  already used by HireMinds' existing working /api/optimize-resume route.
*/
const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() ||
  "claude-sonnet-4-20250514";

type JsonRecord = Record<string, unknown>;

function jsonError(message: string, status = 500, extra: JsonRecord = {}) {
  return NextResponse.json(
    {
      error: message,
      ...extra,
    },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() || "";
}

async function claude(prompt: string, maxTokens = 800) {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing in Vercel. Add it under Project Settings → Environment Variables for Production, then redeploy.",
    );
  }

  let response: Response;

  try {
    response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      cache: "no-store",
      body: JSON.stringify({
        model: MODEL,
        max_tokens: maxTokens,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });
  } catch (error) {
    console.error("resume-builder-ai network error:", error);
    throw new Error(
      "Resume AI could not connect to Anthropic. Please try again.",
    );
  }

  const raw = await response.text();

  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    console.error("resume-builder-ai non-JSON response:", raw);
    throw new Error(
      `Resume AI received an unreadable response (${response.status}).`,
    );
  }

  if (!response.ok) {
    console.error("resume-builder-ai Anthropic error:", {
      status: response.status,
      model: MODEL,
      data,
    });

    const providerMessage =
      data?.error?.message ||
      data?.message ||
      `Anthropic returned HTTP ${response.status}.`;

    if (response.status === 401) {
      throw new Error(
        "Resume AI authentication failed. Check ANTHROPIC_API_KEY in Vercel and redeploy.",
      );
    }

    if (response.status === 403) {
      throw new Error(
        `Resume AI does not have access to model "${MODEL}". ${providerMessage}`,
      );
    }

    if (response.status === 404) {
      throw new Error(
        `Resume AI could not find model "${MODEL}". ${providerMessage}`,
      );
    }

    if (response.status === 429) {
      throw new Error(
        `Resume AI reached an Anthropic rate/usage limit. ${providerMessage}`,
      );
    }

    throw new Error(providerMessage);
  }

  const text =
    Array.isArray(data?.content)
      ? data.content
          .filter(
            (block: any) =>
              block?.type === "text" &&
              typeof block?.text === "string",
          )
          .map((block: any) => block.text)
          .join("")
          .trim()
      : "";

  if (!text) {
    console.error("resume-builder-ai empty Anthropic response:", data);
    throw new Error("Resume AI returned an empty response.");
  }

  return text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function safeJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const objectStart = text.indexOf("{");
    const objectEnd = text.lastIndexOf("}");

    if (
      objectStart >= 0 &&
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

    return fallback;
  }
}

function cleanStringArray(value: unknown, limit: number) {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => String(item ?? "").trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeExperiences(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value.slice(0, 8).map((experience: any) => ({
    companyName: String(
      experience?.companyName ||
        experience?.company ||
        "",
    ).trim(),

    roleTitle: String(
      experience?.roleTitle ||
        experience?.role ||
        experience?.title ||
        "",
    ).trim(),

    bullets: cleanStringArray(
      experience?.bullets,
      8,
    ),
  }));
}

/*
  Open /api/resume-builder-ai in the browser after deploy.
  "configured": true confirms Vercel can see ANTHROPIC_API_KEY.
*/
export async function GET() {
  return NextResponse.json(
    {
      ok: true,
      route: "resume-builder-ai",
      configured: Boolean(getApiKey()),
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
    if (!getApiKey()) {
      return jsonError(
        "ANTHROPIC_API_KEY is missing in Vercel. Add it for Production and redeploy.",
        500,
        {
          model: MODEL,
        },
      );
    }

    let body: JsonRecord;

    try {
      body = (await req.json()) as JsonRecord;
    } catch {
      return jsonError(
        "Resume AI received an invalid request.",
        400,
      );
    }

    const action = String(
      body.action || "",
    ).trim();

    if (!action) {
      return jsonError(
        "Resume AI action is missing.",
        400,
      );
    }

    /* =====================================================
       SUMMARY IDEAS
    ===================================================== */

    if (action === "generateSummaryIdeas") {
      const targetJobTitle = String(
        body.targetJobTitle || "",
      ).trim();

      const currentSummary = String(
        body.currentSummary || "",
      ).trim();

      const skills = cleanStringArray(
        body.skills,
        12,
      );

      const experiences =
        normalizeExperiences(
          body.experiences,
        );

      if (
        !targetJobTitle &&
        !currentSummary &&
        skills.length === 0 &&
        experiences.length === 0
      ) {
        return jsonError(
          "Add a target job title, skills, experience, or a current summary first.",
          400,
        );
      }

      const text = await claude(
        `You are a professional resume writer.

Create exactly 3 concise professional summary options using ONLY the candidate information below.

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

CURRENT SUMMARY:
${currentSummary || "Not provided"}

SKILLS:
${JSON.stringify(skills)}

EXPERIENCE:
${JSON.stringify(experiences)}

RULES:
- 2 to 3 concise sentences per option.
- ATS-friendly and natural.
- Never invent years of experience.
- Never invent certifications, education, software, equipment, duties, metrics, accomplishments, industries, or skills.
- Do not use first-person pronouns.
- Do not write an objective statement.
- Align to the target job only when the entered information supports it.

Return ONLY valid JSON:
{"suggestions":["summary 1","summary 2","summary 3"]}`,
        900,
      );

      const parsed = safeJson<{
        suggestions?: string[];
      }>(text, {
        suggestions: [],
      });

      const suggestions =
        cleanStringArray(
          parsed.suggestions,
          3,
        );

      if (!suggestions.length) {
        throw new Error(
          "Resume AI did not return usable summary ideas. Please try again.",
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
       ROLE PROMPTS
    ===================================================== */

    if (action === "getRolePrompts") {
      const roleTitle = String(
        body.roleTitle || "",
      ).trim();

      if (!roleTitle) {
        return jsonError(
          "Enter a job title first.",
          400,
        );
      }

      const text = await claude(
        `The candidate entered this previous job title:

"${roleTitle}"

Create exactly 6 short memory-jogging questions that help the candidate remember responsibilities they MAY have actually performed.

RULES:
- These are prompts only, not resume claims.
- Phrase each as a question.
- Use wording such as "Did you...", "Did your role include...", "Were you responsible for...", or "Did you help..."
- Do not invent facts.
- Do not invent metrics, software, equipment, certifications, achievements, or responsibilities.
- Keep each prompt simple and practical.

Return ONLY valid JSON:
{"prompts":["prompt 1","prompt 2","prompt 3","prompt 4","prompt 5","prompt 6"]}`,
        700,
      );

      const parsed = safeJson<{
        prompts?: string[];
      }>(text, {
        prompts: [],
      });

      const prompts =
        cleanStringArray(
          parsed.prompts,
          6,
        );

      if (!prompts.length) {
        throw new Error(
          "Resume AI did not return usable role ideas. Please try again.",
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
        body.roleTitle || "",
      ).trim();

      const companyName = String(
        body.companyName || "",
      ).trim();

      const targetJobTitle = String(
        body.targetJobTitle || "",
      ).trim();

      const existingBullets =
        cleanStringArray(
          body.existingBullets,
          8,
        );

      if (!roleTitle) {
        return jsonError(
          "Enter the work-experience job title first.",
          400,
        );
      }

      const text = await claude(
        `Help a job seeker brainstorm resume bullet ideas.

PAST JOB TITLE:
${roleTitle}

COMPANY:
${companyName || "Not provided"}

TARGET JOB:
${targetJobTitle || "Not provided"}

EXISTING BULLETS:
${JSON.stringify(existingBullets)}

Create exactly 5 concise bullet IDEAS associated with this type of role.

RULES:
- These are suggestions the candidate must verify before using.
- Do not claim the candidate definitely performed them.
- Do not invent metrics, software, equipment, certifications, achievements, or outcomes.
- Do not repeat the existing bullets.
- Do not add bullet symbols.
- Use strong, resume-friendly wording.
- Favor transferable wording for the target job only when appropriate.

Return ONLY valid JSON:
{"suggestions":["bullet 1","bullet 2","bullet 3","bullet 4","bullet 5"]}`,
        900,
      );

      const parsed = safeJson<{
        suggestions?: string[];
      }>(text, {
        suggestions: [],
      });

      const suggestions =
        cleanStringArray(
          parsed.suggestions,
          5,
        );

      if (!suggestions.length) {
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
       STRENGTHEN BULLET
    ===================================================== */

    if (action === "strengthenBullet") {
      const roleTitle = String(
        body.roleTitle || "",
      ).trim();

      const currentBullet = String(
        body.currentBullet || "",
      ).trim();

      const targetJobTitle = String(
        body.targetJobTitle || "",
      ).trim();

      if (!currentBullet) {
        return jsonError(
          "Write a bullet first.",
          400,
        );
      }

      const text = await claude(
        `Rewrite this resume bullet to be clearer and stronger WITHOUT adding any new facts.

ROLE:
${roleTitle || "Not provided"}

TARGET JOB:
${targetJobTitle || "Not provided"}

ORIGINAL BULLET:
${currentBullet}

RULES:
- Preserve the exact factual meaning.
- Never invent numbers, metrics, software, tools, equipment, certifications, responsibilities, achievements, scope, or outcomes.
- Do not add information not already present.
- Begin with a strong action verb when appropriate.
- Keep it concise.
- Do not add a bullet symbol.

Return ONLY valid JSON:
{"suggestion":"rewritten bullet"}`,
        600,
      );

      const parsed = safeJson<{
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

    return jsonError(
      `Invalid Resume AI action: ${action}`,
      400,
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Resume AI is unavailable right now.";

    console.error(
      "resume-builder-ai error:",
      error,
    );

    return jsonError(
      message,
      500,
      {
        model: MODEL,
      },
    );
  }
}
