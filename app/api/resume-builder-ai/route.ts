// app/api/resume-builder-ai/route.ts
import { NextRequest, NextResponse } from "next/server";

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6";

function anthropicHeaders() {
  return {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY || "",
    "anthropic-version": "2023-06-01",
  };
}

async function askClaude(prompt: string, maxTokens = 700) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Resume AI is not configured yet. Add ANTHROPIC_API_KEY to your Vercel environment variables.",
    );
  }

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: anthropicHeaders(),
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0.35,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const detail =
      data?.error?.message || data?.message || "The AI provider returned an error.";
    throw new Error(detail);
  }

  const text =
    data?.content
      ?.map((block: { type?: string; text?: string }) => block?.text || "")
      .join("")
      .trim() || "";

  if (!text) {
    throw new Error("The AI returned an empty response. Please try again.");
  }

  return text.replace(/```json|```/gi, "").trim();
}

function parseJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T;
      } catch {
        return fallback;
      }
    }

    return fallback;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = String(body?.action || "");

    if (action === "generateSummaryIdeas") {
      const targetJobTitle = String(body?.targetJobTitle || "").trim();
      const skills = Array.isArray(body?.skills) ? body.skills.slice(0, 12) : [];
      const experiences = Array.isArray(body?.experiences)
        ? body.experiences.slice(0, 6)
        : [];

      const text = await askClaude(
        `You are a professional resume writer helping a job seeker create an accurate summary.

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

SKILLS THE CANDIDATE ENTERED:
${JSON.stringify(skills)}

EXPERIENCE THE CANDIDATE ENTERED:
${JSON.stringify(experiences)}

Create exactly 3 professional summary options.

Requirements:
- Each option should be 2-3 concise sentences.
- Use only information the candidate actually provided.
- Do not invent years of experience.
- Do not invent certifications, software, equipment, industries, metrics, accomplishments, or responsibilities.
- If information is limited, keep the language broad and truthful.
- Use strong, natural, ATS-friendly language.
- If a target job title is provided, align the wording toward that role without pretending the candidate has experience they did not enter.

Return ONLY valid JSON in this exact shape:
{"suggestions":["summary 1","summary 2","summary 3"]}`,
        750,
      );

      const parsed = parseJson<{ suggestions?: string[] }>(text, {
        suggestions: [],
      });

      return NextResponse.json({
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.filter(Boolean).slice(0, 3)
          : [],
      });
    }

    if (action === "getRolePrompts") {
      const roleTitle = String(body?.roleTitle || "").trim();

      if (!roleTitle) {
        return NextResponse.json(
          { error: "Enter a job title first." },
          { status: 400 },
        );
      }

      const text = await askClaude(
        `A job seeker entered this past job title: "${roleTitle}".

Give exactly 6 short memory prompts that may help the person remember responsibilities they ACTUALLY performed in that role.

Important:
- These are brainstorming prompts, not resume claims.
- Do not assume the person performed any duty.
- Phrase each item as a question beginning with language such as "Did you...", "Were you responsible for...", or "Did your role include...".
- Keep each prompt practical and easy to understand.

Return ONLY valid JSON:
{"prompts":["prompt 1","prompt 2","prompt 3","prompt 4","prompt 5","prompt 6"]}`,
        550,
      );

      const parsed = parseJson<{ prompts?: string[] }>(text, { prompts: [] });

      return NextResponse.json({
        prompts: Array.isArray(parsed.prompts)
          ? parsed.prompts.filter(Boolean).slice(0, 6)
          : [],
      });
    }

    if (action === "generateBulletIdeas") {
      const roleTitle = String(body?.roleTitle || "").trim();
      const companyName = String(body?.companyName || "").trim();
      const targetJobTitle = String(body?.targetJobTitle || "").trim();
      const existingBullets = Array.isArray(body?.existingBullets)
        ? body.existingBullets.filter(Boolean).slice(0, 8)
        : [];

      if (!roleTitle) {
        return NextResponse.json(
          { error: "Enter the job title first." },
          { status: 400 },
        );
      }

      const text = await askClaude(
        `You are helping a job seeker brainstorm stronger resume bullet ideas.

PAST JOB TITLE:
${roleTitle}

COMPANY:
${companyName || "Not provided"}

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

EXISTING BULLETS:
${JSON.stringify(existingBullets)}

Create exactly 5 concise bullet IDEAS appropriate for the past job title.

Rules:
- Do not invent metrics or numbers.
- Do not invent software, equipment, certifications, responsibilities, achievements, or outcomes.
- Keep the ideas broad enough that the candidate can decide whether each one is true for them.
- Use action-oriented resume wording.
- Do not repeat the existing bullets.
- Do not add a bullet symbol at the beginning.

Return ONLY valid JSON:
{"suggestions":["bullet 1","bullet 2","bullet 3","bullet 4","bullet 5"]}`,
        700,
      );

      const parsed = parseJson<{ suggestions?: string[] }>(text, {
        suggestions: [],
      });

      return NextResponse.json({
        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions.filter(Boolean).slice(0, 5)
          : [],
      });
    }

    if (action === "strengthenBullet") {
      const roleTitle = String(body?.roleTitle || "").trim();
      const currentBullet = String(body?.currentBullet || "").trim();
      const targetJobTitle = String(body?.targetJobTitle || "").trim();

      if (!currentBullet) {
        return NextResponse.json(
          { error: "Write a bullet first." },
          { status: 400 },
        );
      }

      const text = await askClaude(
        `Rewrite this resume bullet so it is stronger, clearer, and more professional while preserving the candidate's facts.

ROLE TITLE:
${roleTitle || "Not provided"}

TARGET JOB TITLE:
${targetJobTitle || "Not provided"}

CURRENT BULLET:
${currentBullet}

Rules:
- Preserve the factual meaning.
- Do not invent numbers, metrics, software, tools, equipment, certifications, responsibilities, achievements, or outcomes.
- Do not add information that is not already present in the original bullet.
- Start with a strong action verb when appropriate.
- Keep it concise.
- Do not include a bullet symbol.

Return ONLY valid JSON:
{"suggestion":"rewritten bullet"}`,
        400,
      );

      const parsed = parseJson<{ suggestion?: string }>(text, {
        suggestion: currentBullet,
      });

      return NextResponse.json({
        suggestion: String(parsed.suggestion || currentBullet).trim(),
      });
    }

    return NextResponse.json({ error: "Invalid resume AI action." }, { status: 400 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Resume AI is unavailable right now.";

    console.error("Resume Builder AI error:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
