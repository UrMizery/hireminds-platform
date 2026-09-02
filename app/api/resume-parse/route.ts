import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 60;

const MODEL = "claude-sonnet-4-6";

function cleanJson(text: string) {
  return text.replace(/```json|```/gi, "").trim();
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "resume-parse",
    configured: Boolean(process.env.ANTHROPIC_API_KEY),
    model: MODEL,
  });
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "Resume parser is not configured." }, { status: 500 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Please upload a PDF or DOCX resume." }, { status: 400 });
    }

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json({ error: "Only PDF and DOCX resumes are supported." }, { status: 400 });
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json({ error: "Resume file must be 8 MB or smaller." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let resumeText = "";

    if (isPdf) {
      const parsed = await pdf(buffer);
      resumeText = parsed.text || "";
    } else {
      const parsed = await mammoth.extractRawText({ buffer });
      resumeText = parsed.value || "";
    }

    resumeText = resumeText.replace(/\u0000/g, "").replace(/[ \t]+\n/g, "\n").trim();
    if (resumeText.length < 40) {
      return NextResponse.json(
        { error: "We could not read enough text from this resume. Try a text-based PDF or DOCX file." },
        { status: 422 }
      );
    }

    const prompt = `You are a resume data extraction engine for HireMinds.
Extract ONLY information explicitly present in the resume. Never invent, improve, infer, or rewrite facts.
Return ONLY valid JSON matching the schema below.

Rules:
- Preserve the candidate's wording for summary and bullets.
- Maximum 9 skills.
- Maximum 5 bullets per job and volunteer role.
- Use 3-letter English months: Jan, Feb, Mar, Apr, May, Jun, Jul, Aug, Sep, Oct, Nov, Dec.
- If a month is not stated, use an empty string.
- Years are four digits when available.
- For current roles set isPresent true and leave endMonth/endYear empty.
- Separate city and state when clearly stated. Otherwise leave them empty.
- LinkedIn should be the URL/text actually present.
- Do not treat ordinary training as a degree.
- If a section is absent, return an empty array/string.

JSON schema:
{
  "fullName":"",
  "phone":"",
  "email":"",
  "city":"",
  "stateName":"",
  "linkedinUrl":"",
  "summaryText":"",
  "skills":[""],
  "experiences":[{
    "companyName":"","city":"","state":"","roleTitle":"",
    "startMonth":"","startYear":"","endMonth":"","endYear":"","isPresent":false,
    "bullets":[{"text":""}]
  }],
  "educationItems":[{
    "schoolName":"","city":"","state":"","degree":"","gpa":"",
    "startMonth":"","startYear":"","endMonth":"","endYear":"","isPresent":false
  }],
  "certificateItems":[{
    "organizationName":"","city":"","state":"","certificateName":"",
    "startMonth":"","startYear":"","endMonth":"","endYear":"","isPresent":false
  }],
  "volunteerItems":[{
    "organizationName":"","city":"","state":"","roleTitle":"",
    "startMonth":"","startYear":"","endMonth":"","endYear":"","isPresent":false,
    "bullets":[{"text":""}]
  }],
  "accomplishments":""
}

RESUME TEXT:\n${resumeText.slice(0, 18000)}`;

    const anthropic = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4000,
        temperature: 0,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await anthropic.json();
    if (!anthropic.ok) {
      console.error("Resume parser Anthropic error:", data);
      return NextResponse.json({ error: data?.error?.message || "Unable to analyze this resume." }, { status: 502 });
    }

    const output = data.content?.map((block: any) => block?.text || "").join("") || "";
    let parsedResume: any;
    try {
      parsedResume = JSON.parse(cleanJson(output));
    } catch {
      console.error("Resume parser returned invalid JSON:", output);
      return NextResponse.json({ error: "The resume was read, but its structure could not be parsed. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ ok: true, parsedResume });
  } catch (error: any) {
    console.error("Resume parser error:", error);
    return NextResponse.json({ error: error?.message || "Unable to parse resume." }, { status: 500 });
  }
}
