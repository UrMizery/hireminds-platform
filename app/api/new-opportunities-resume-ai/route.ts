import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value : [];
}

function serializeExperiences(value: unknown) {
  return safeArray(value)
    .slice(0, 6)
    .map((item: any, index) => {
      const bullets = safeArray(item?.bullets)
        .map((bullet: any) => clean(bullet?.text))
        .filter(Boolean)
        .slice(0, 5);

      return [
        `Experience ${index + 1}`,
        `Role/title: ${clean(item?.roleTitle) || "Not provided"}`,
        `Organization/setting: ${clean(item?.organizationName) || "Not provided"}`,
        `Description in user's own words: ${clean(item?.description) || "Not provided"}`,
        bullets.length ? `Existing bullets: ${bullets.join(" | ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n\n");
}

function serializeResumeContext(value: unknown) {
  if (!value || typeof value !== "object") return "No uploaded resume.";

  const resume = value as Record<string, unknown>;

  return [
    clean(resume.summaryText)
      ? `Existing summary: ${clean(resume.summaryText)}`
      : "",
    Array.isArray(resume.skills)
      ? `Existing skills: ${resume.skills
          .map((x) => clean(x))
          .filter(Boolean)
          .join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}

const REENTRY_RULES = `
You are the AI writing assistant inside HireMinds for a REENTRY / SECOND CHANCE resume builder.

This tool is ONLY for people reentering the workforce who may have:
- little or no traditional paid work experience,
- institutional or correctional work assignments,
- training, programs, education, or other limited experience.

RULES:
- Be respectful, practical, clear, and nonjudgmental.
- Never shame, stigmatize, moralize, or use criminal-history language in the resume.
- Never invent employers, dates, duties, accomplishments, metrics, licenses, certificates, education, systems, or skills.
- Institutional/correctional work may be translated into professional transferable language, but it must remain truthful.
- Do not disguise institutional work as a private-sector employer.
- Do not advise the user to falsify, hide, or misrepresent work history.
- Focus on transferable skills supported by what the user actually described.
- Use straightforward professional language. Avoid exaggerated corporate buzzwords.
`.trim();

async function callAnthropic(prompt: string) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Anthropic API is not configured.");
  }

  const response = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1400,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.error?.message || "AI assistance is unavailable right now."
    );
  }

  const text = safeArray(data?.content)
    .filter((item: any) => item?.type === "text")
    .map((item: any) => clean(item?.text))
    .filter(Boolean)
    .join("\n")
    .trim();

  if (!text) {
    throw new Error("AI returned an empty response.");
  }

  return text;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "new-opportunities-resume-ai",
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    model: MODEL,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = clean(body.action);
    const targetRole = clean(body.targetRole);
    const experiences = serializeExperiences(body.experiences);
    const resumeContext = serializeResumeContext(body.resumeContext);

    if (action === "experience-helper") {
      const prompt = `
${REENTRY_RULES}

The user wants help identifying skills gained from ONE experience and converting the work into professional resume bullets.

TARGET JOB:
${targetRole || "Not provided"}

ROLE / ASSIGNMENT TITLE:
${clean(body.roleTitle) || "Not provided"}

ORGANIZATION / SETTING:
${clean(body.organizationName) || "Not provided"}

WHAT THE USER SAID THEY DID:
${clean(body.description) || "Not provided"}

Return ONLY valid JSON:
{
  "skills":["Skill 1","Skill 2","Skill 3"],
  "bullets":["Bullet 1","Bullet 2","Bullet 3","Bullet 4","Bullet 5"]
}

Requirements:
- Give 3 to 7 transferable skills that are directly supported by the user's description/title.
- Give up to 5 resume bullets when enough distinct duties were described.
- Do NOT force 5 bullets if the user did not provide enough information.
- Every bullet must start with a strong action verb.
- Do not add duties that were not described.
- Do not invent numbers, outcomes, or credentials.
- Keep each bullet concise and resume-ready.
- If the setting is institutional, keep wording neutral, professional, and truthful.
`.trim();

      const raw = await callAnthropic(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);

      return NextResponse.json({
        skills: safeArray(parsed?.skills)
          .map((item) => clean(item))
          .filter(Boolean)
          .slice(0, 7),
        bullets: safeArray(parsed?.bullets)
          .map((item) => clean(item))
          .filter(Boolean)
          .slice(0, 5),
      });
    }

    if (action === "skills") {
      const prompt = `
${REENTRY_RULES}

Identify up to 9 resume-ready skills supported by the user's actual entered experience.

TARGET JOB:
${targetRole || "Not provided"}

EXPERIENCE:
${experiences || "No experience entered."}

UPLOADED RESUME CONTEXT:
${resumeContext}

Return ONLY valid JSON:
{"skills":["Skill 1","Skill 2"]}

Do not include a skill unless it is supported by the information provided.
Prefer a useful mix of practical and transferable skills.
`.trim();

      const raw = await callAnthropic(prompt);
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);

      return NextResponse.json({
        skills: safeArray(parsed?.skills)
          .map((item) => clean(item))
          .filter(Boolean)
          .slice(0, 9),
      });
    }

    if (action === "summary") {
      const prompt = `
${REENTRY_RULES}

Write a short professional resume summary.

TARGET JOB:
${targetRole || "Not provided"}

CURRENT SUMMARY:
${clean(body.summaryText) || "None"}

CURRENT SKILLS:
${clean(body.skillsInput) || "None"}

EXPERIENCE:
${experiences || "No experience entered."}

UPLOADED RESUME CONTEXT:
${resumeContext}

Requirements:
- 2 to 4 sentences.
- Do not mention reentry, incarceration, criminal history, "second chance," or legal status.
- Focus on current strengths, transferable skills, reliability, readiness to learn, and the target role only when supported.
- Do not claim years of experience unless explicitly provided.
- Avoid weak filler.
- Return ONLY the summary paragraph.
`.trim();

      const summary = await callAnthropic(prompt);

      return NextResponse.json({ summary });
    }

    return NextResponse.json(
      { error: "Invalid AI action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("New Opportunities Resume AI error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "AI assistance is unavailable right now.",
      },
      { status: 500 }
    );
  }
}
