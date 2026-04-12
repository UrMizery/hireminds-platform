// app/api/optimize-resume/route.ts
import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_HEADERS = () => ({
  "Content-Type": "application/json",
  "x-api-key": process.env.ANTHROPIC_API_KEY!,
  "anthropic-version": "2023-06-01",
});

async function claude(prompt: string, maxTokens = 800) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: ANTHROPIC_HEADERS(),
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const data = await res.json();
  const text = data.content?.map((b: any) => b.text || "").join("") || "";
  return text.replace(/```json|```/g, "").trim();
}

function safeJson(text: string, fallback: any = {}) {
  try { return JSON.parse(text); } catch { return fallback; }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, resumeText, jobDescription, sectionKey, sectionContent, imageBase64, mediaType } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    // ── Extract text from image ───────────────────────────────────────────────
    if (action === "extractImage") {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS(),
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/png", data: imageBase64 } },
              { type: "text", text: "Extract all text from this resume image. Return only the raw text, preserving structure. No commentary." }
            ]
          }]
        }),
      });
      const data = await res.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      return NextResponse.json({ text });
    }

    // ── CALL 1: Analyze match + extract structure ─────────────────────────────
    if (action === "analyze") {
      const text = await claude(`You are an expert resume analyst.

RESUME:
${resumeText?.slice(0, 3000)}

JOB DESCRIPTION:
${jobDescription?.slice(0, 2000)}

Analyze and output ONLY valid JSON:
{
  "matchScore": 72,
  "matchSummary": "1-2 sentence explanation",
  "jobs": [{"id":"job1","title":"Title","company":"Company","dates":"2020-2023","location":"City, ST","relevant":true,"relevanceReason":"Why","bullets":["bullet1","bullet2"]}],
  "education": [{"id":"edu1","degree":"Degree","school":"School","dates":"2020","relevant":true,"relevanceReason":"Why"}],
  "skills": ["skill1","skill2","skill3"],
  "keywords": ["kw1","kw2","kw3","kw4","kw5"],
  "recommendedFormat": "chronological",
  "formatReason": "Brief reason",
  "professionalTitle": "Suggested Title",
  "hasMultipleCareerTracks": false,
  "careerTracks": []
}
Output ONLY the JSON.`, 1200);

      return NextResponse.json(safeJson(text, {
        matchScore: 0, matchSummary: "", jobs: [], education: [],
        skills: [], keywords: [], recommendedFormat: "chronological",
        formatReason: "", professionalTitle: "", hasMultipleCareerTracks: false, careerTracks: []
      }));
    }

    // ── CALL 2: Generate summary + skills ─────────────────────────────────────
    if (action === "generateSummarySkills") {
      const { selectedJobs, resumeTitle, candidateInfo } = body;

      const text = await claude(`You are an expert resume writer.

CANDIDATE: ${candidateInfo.fullName}
JOB DESCRIPTION: ${jobDescription?.slice(0, 1500)}
SELECTED JOBS: ${JSON.stringify(selectedJobs?.slice(0, 3))}
RESUME TITLE: ${resumeTitle}

Generate ONLY valid JSON:
{
  "professionalTitle": "${resumeTitle}",
  "summary": "2-3 sentence professional summary tailored to the job using candidate's actual experience",
  "skills": ["skill1","skill2","skill3","skill4","skill5","skill6","skill7","skill8","skill9"]
}
Only use skills the candidate actually has. Output ONLY the JSON.`, 600);

      return NextResponse.json(safeJson(text, { professionalTitle: resumeTitle, summary: "", skills: [] }));
    }

    // ── CALL 3: Generate experience + education ───────────────────────────────
    if (action === "generateExperience") {
      const { selectedJobs, selectedEducation, format, candidateInfo } = body;

      const text = await claude(`You are an expert resume writer.

CANDIDATE: ${candidateInfo.fullName}
JOB DESCRIPTION: ${jobDescription?.slice(0, 1000)}
FORMAT: ${format}
SELECTED JOBS: ${JSON.stringify(selectedJobs)}
SELECTED EDUCATION: ${JSON.stringify(selectedEducation)}

Generate ONLY valid JSON:
{
  "experience": [
    {
      "company": "Company Name",
      "location": "City, ST",
      "title": "Job Title",
      "dates": "2020 – Present",
      "bullets": ["Strong action verb + achievement", "bullet2", "bullet3"]
    }
  ],
  "education": [
    {"degree": "Degree", "school": "School", "dates": "2020"}
  ]
}
Use strong action verbs. Quantify achievements. Only real experience. Output ONLY the JSON.`, 800);

      return NextResponse.json(safeJson(text, { experience: [], education: [] }));
    }

    // ── CALL 4: Generate alternate resume summary + skills ────────────────────
    if (action === "generateAltSummarySkills") {
      const { alternatejobs, candidateInfo } = body;

      const text = await claude(`You are an expert resume writer.

CANDIDATE: ${candidateInfo.fullName}
JOBS FOR ALTERNATE RESUME: ${JSON.stringify(alternatejobs?.slice(0, 3))}

Generate ONLY valid JSON for an alternate career track resume:
{
  "professionalTitle": "Best title for these roles",
  "summary": "2-3 sentence professional summary for this career track",
  "skills": ["skill1","skill2","skill3","skill4","skill5","skill6"]
}
Output ONLY the JSON.`, 500);

      return NextResponse.json(safeJson(text, { professionalTitle: "", summary: "", skills: [] }));
    }

    // ── CALL 5: Generate alternate resume experience ──────────────────────────
    if (action === "generateAltExperience") {
      const { alternatejobs, selectedEducation } = body;

      const text = await claude(`You are an expert resume writer.

JOBS: ${JSON.stringify(alternatejobs)}
EDUCATION: ${JSON.stringify(selectedEducation)}

Generate ONLY valid JSON:
{
  "experience": [
    {
      "company": "Company",
      "location": "City, ST",
      "title": "Job Title",
      "dates": "2020 – Present",
      "bullets": ["bullet1","bullet2","bullet3"]
    }
  ],
  "education": [
    {"degree": "Degree", "school": "School", "dates": "2020"}
  ]
}
Output ONLY the JSON.`, 700);

      return NextResponse.json(safeJson(text, { experience: [], education: [] }));
    }

    // ── Flag a section ────────────────────────────────────────────────────────
    if (action === "flagSection") {
      const text = await claude(`A job seeker flagged the "${sectionKey}" section of their resume because it may contain unfamiliar terms.

Current content: "${sectionContent}"
Original resume (context): "${resumeText?.slice(0, 500) || ""}"

Identify what looks unfamiliar and suggest a safer revision using only what they clearly have.

Output ONLY JSON:
{"issue": "What was flagged and why", "revised": "Revised content only"}`, 400);

      return NextResponse.json(safeJson(text, { issue: "Could not generate suggestion.", revised: sectionContent }));
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error." }, { status: 500 });
  }
}
