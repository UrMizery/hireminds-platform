import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

type Section = "opening" | "experience" | "value" | "closing";

function clean(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function serializeResumeContext(value: unknown) {
  if (!value || typeof value !== "object") return "No resume uploaded.";

  const resume = value as Record<string, unknown>;
  const summary = clean(resume.summaryText);
  const accomplishments = clean(resume.accomplishments);

  const skills = Array.isArray(resume.skills)
    ? resume.skills
        .map((item) => clean(item))
        .filter(Boolean)
        .slice(0, 12)
    : [];

  const experiences = Array.isArray(resume.experiences)
    ? resume.experiences.slice(0, 8).map((item: any) => {
        const bullets = Array.isArray(item?.bullets)
          ? item.bullets
              .map((bullet: any) => clean(bullet?.text))
              .filter(Boolean)
              .slice(0, 6)
          : [];

        return [
          `Role: ${clean(item?.roleTitle) || "Not stated"}`,
          `Company: ${clean(item?.companyName) || "Not stated"}`,
          bullets.length ? `Bullets: ${bullets.join(" | ")}` : "",
        ]
          .filter(Boolean)
          .join("\n");
      })
    : [];

  const education = Array.isArray(resume.educationItems)
    ? resume.educationItems.slice(0, 5).map((item: any) =>
        [clean(item?.degree), clean(item?.schoolName)].filter(Boolean).join(" — ")
      )
    : [];

  const certificates = Array.isArray(resume.certificateItems)
    ? resume.certificateItems.slice(0, 8).map((item: any) =>
        [clean(item?.certificateName), clean(item?.organizationName)]
          .filter(Boolean)
          .join(" — ")
      )
    : [];

  return [
    summary ? `Professional summary: ${summary}` : "",
    skills.length ? `Skills: ${skills.join(", ")}` : "",
    experiences.length ? `Experience:\n${experiences.join("\n\n")}` : "",
    education.length ? `Education: ${education.join(" | ")}` : "",
    certificates.length ? `Certifications: ${certificates.join(" | ")}` : "",
    accomplishments ? `Accomplishments: ${accomplishments}` : "",
  ]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 14000);
}

function buildContext(body: Record<string, unknown>) {
  const jobDescription = clean(body.jobDescription).slice(0, 12000);
  const resumeContext = serializeResumeContext(body.resumeContext);

  return [
    `Applicant name: ${clean(body.fullName) || "Not provided"}`,
    `Target job title: ${clean(body.jobTitle) || "Not provided"}`,
    `Company: ${clean(body.companyName) || "Not provided"}`,
    `Employer/contact: ${clean(body.employerName) || "Not provided"}`,
    `Hiring manager: ${clean(body.hiringManager) || "Not provided"}`,
    "",
    "JOB DESCRIPTION:",
    jobDescription || "Not provided.",
    "",
    "RESUME CONTEXT:",
    resumeContext,
  ].join("\n");
}

function sectionInstruction(section: Section) {
  if (section === "opening") {
    return "Write one polished opening paragraph expressing interest in the role and company. Keep it specific, confident, and professional without sounding generic or overly enthusiastic.";
  }

  if (section === "experience") {
    return "Write one polished experience/fit paragraph connecting the applicant's existing information to the target role. Do not invent employers, years, metrics, credentials, systems, or accomplishments that were not provided.";
  }

  if (section === "value") {
    return "Write one polished value paragraph explaining the professional strengths and contribution the applicant can bring. Do not invent facts. Keep the language mature, specific, and credible.";
  }

  return "Write one polished closing paragraph that thanks the employer, reinforces interest, and invites a conversation. Avoid clichés, begging, or excessive enthusiasm.";
}

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
      max_tokens: 900,
      temperature: 0.45,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const message =
      data?.error?.message ||
      "Anthropic could not generate the cover letter content.";
    throw new Error(message);
  }

  const text =
    Array.isArray(data?.content)
      ? data.content
          .filter((item: any) => item?.type === "text")
          .map((item: any) => item.text)
          .join("\n")
          .trim()
      : "";

  if (!text) {
    throw new Error("Anthropic returned an empty response.");
  }

  return text;
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "cover-letter-ai",
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    model: MODEL,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const action = clean(body.action);
    const context = buildContext(body);

    if (action === "section") {
      const section = clean(body.section) as Section;

      if (!["opening", "experience", "value", "closing"].includes(section)) {
        return NextResponse.json(
          { error: "Invalid cover letter section." },
          { status: 400 }
        );
      }

      const currentText = clean(body.currentText);
      const existingDraft = [
        `Current opening: ${clean(body.openingLine) || "Blank"}`,
        `Current experience paragraph: ${clean(body.experienceLine) || "Blank"}`,
        `Current value paragraph: ${clean(body.valueLine) || "Blank"}`,
        `Current closing: ${clean(body.closingLine) || "Blank"}`,
      ].join("\n");

      const prompt = `
You are the writing assistant inside HireMinds, a professional career platform.

Create professional cover-letter content for the requested section.

RULES:
- Never invent work history, employers, dates, education, licenses, certifications, accomplishments, numbers, software, or credentials.
- Use the uploaded resume as the factual source for the applicant's background.
- Use the job description to identify the employer's priorities, responsibilities, qualifications, and useful keywords.
- Connect ONLY real resume evidence to relevant job requirements.
- Do not claim a skill simply because it appears in the job description.
- If details are limited, use transferable language without pretending facts exist.
- Keep the tone sophisticated, natural, concise, and human.
- Avoid buzzword stuffing, clichés, exaggerated claims, and robotic wording.
- Do not use placeholders like [Company Name] if the actual company name is provided.
- Return ONLY the paragraph. No heading, bullets, notes, quotation marks, or explanation.
- Aim for 2-4 sentences.

APPLICANT / ROLE CONTEXT:
${context}

EXISTING COVER LETTER CONTENT:
${existingDraft}

REQUESTED SECTION:
${sectionInstruction(section)}

${currentText ? `CURRENT PARAGRAPH TO IMPROVE:\n${currentText}` : "No current paragraph exists. Create one from the available information."}
`.trim();

      const text = await callAnthropic(prompt);

      return NextResponse.json({ text });
    }

    if (action === "all") {
      const prompt = `
You are the writing assistant inside HireMinds, a professional career platform.

Draft four concise cover-letter paragraphs using ONLY the information provided.

RULES:
- Never invent work history, employers, dates, education, licenses, certifications, accomplishments, numbers, systems, or credentials.
- Treat the uploaded resume as the factual source for the applicant's experience and skills.
- Analyze the job description for the employer's strongest priorities and connect those priorities to actual resume evidence.
- Do not copy large phrases from the job description.
- Do not claim qualifications that appear only in the job description and not in the resume or user-entered content.
- If the applicant has not provided enough experience details, use careful transferable language rather than fake specifics.
- Tone: sophisticated, professional, warm, concise, modern, and human.
- Avoid clichés and generic filler.
- Each paragraph should normally be 2-4 sentences.
- Return ONLY valid JSON. No markdown and no explanation.

JSON FORMAT:
{
  "opening": "...",
  "experience": "...",
  "value": "...",
  "closing": "..."
}

CONTEXT:
${context}

CURRENT CONTENT, IF ANY:
Opening: ${clean(body.openingLine) || "Blank"}
Experience / Fit: ${clean(body.experienceLine) || "Blank"}
Value / Why You: ${clean(body.valueLine) || "Blank"}
Closing: ${clean(body.closingLine) || "Blank"}
`.trim();

      const raw = await callAnthropic(prompt);

      let parsed: {
        opening?: string;
        experience?: string;
        value?: string;
        closing?: string;
      };

      try {
        parsed = JSON.parse(raw);
      } catch {
        const match = raw.match(/\{[\s\S]*\}/);
        if (!match) {
          throw new Error("AI returned an invalid cover letter draft.");
        }
        parsed = JSON.parse(match[0]);
      }

      return NextResponse.json({
        opening: clean(parsed.opening),
        experience: clean(parsed.experience),
        value: clean(parsed.value),
        closing: clean(parsed.closing),
      });
    }

    return NextResponse.json(
      { error: "Invalid AI action." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Cover letter AI error:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate cover letter content.",
      },
      { status: 500 }
    );
  }
}
