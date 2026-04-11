// app/api/optimize-resume/route.ts
import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, resumeText, jobDescription, sectionKey, sectionContent, imageBase64, mediaType } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    const ANTHROPIC_HEADERS = {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    };

    // ── Extract text from image (PNG/JPG resume) ──────────────────────────────
    if (action === "extractImage") {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType || "image/png", data: imageBase64 } },
              { type: "text", text: "Extract all the text from this resume image. Return only the raw text content, preserving the structure (name, contact info, experience, education, skills) as much as possible. Do not add any commentary." }
            ]
          }]
        }),
      });
      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      return NextResponse.json({ text });
    }

    // ── Analyze resume vs job description ─────────────────────────────────────
    if (action === "analyze") {
      const prompt = `You are an expert resume writer and ATS specialist.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Perform a thorough analysis. Output ONLY valid JSON in this exact shape:
{
  "matchScore": 72,
  "matchSummary": "Brief 1-2 sentence explanation of the match score",
  "jobs": [
    {
      "id": "job1",
      "title": "Job Title",
      "company": "Company Name",
      "dates": "2020-2023",
      "location": "City, ST",
      "relevant": true,
      "relevanceReason": "Why this is or is not relevant to the job description",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    {
      "id": "edu1",
      "degree": "Degree Name",
      "school": "School Name",
      "dates": "2016-2020",
      "relevant": true,
      "relevanceReason": "Why relevant or not"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "recommendedFormat": "chronological",
  "formatReason": "Brief reason why chronological or combination is better for this candidate",
  "professionalTitle": "Suggested Professional Title Based On Their Experience",
  "hasMultipleCareerTracks": true,
  "careerTracks": [
    { "trackId": "track1", "label": "e.g. Logistics & Transportation", "jobIds": ["job1", "job2"] },
    { "trackId": "track2", "label": "e.g. Sales & Customer Service", "jobIds": ["job3"] }
  ]
}

Rules:
- matchScore is 0-100 integer
- relevant = true only if the job/education directly helps with this specific job description
- Only include careerTracks if hasMultipleCareerTracks is true and there are genuinely different career paths
- recommendedFormat must be exactly "chronological" or "combination"
- Output ONLY the JSON object, no markdown, no extra text`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      try { return NextResponse.json(JSON.parse(clean)); }
      catch { return NextResponse.json({ raw: text }); }
    }

    // ── Generate tailored resume ───────────────────────────────────────────────
    if (action === "generate") {
      const { selectedJobs, selectedEducation, format, resumeTitle, candidateInfo } = body;

      const prompt = `You are an expert resume writer and ATS specialist.

CANDIDATE INFO:
Name: ${candidateInfo.fullName}
Email: ${candidateInfo.email}
Phone: ${candidateInfo.phone}
LinkedIn: ${candidateInfo.linkedinUrl}
City/State: ${candidateInfo.city}, ${candidateInfo.state}

SELECTED JOBS TO INCLUDE:
${JSON.stringify(selectedJobs, null, 2)}

SELECTED EDUCATION:
${JSON.stringify(selectedEducation, null, 2)}

JOB DESCRIPTION:
${jobDescription}

FORMAT: ${format}
RESUME TITLE: ${resumeTitle}

Generate a tailored ATS-optimized resume. Output ONLY valid JSON:
{
  "professionalTitle": "${resumeTitle}",
  "summary": "2-3 sentence professional summary tailored to the job description using the candidate's actual experience",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8", "skill9"],
  "experience": [
    {
      "company": "Company Name",
      "location": "City, ST",
      "title": "Job Title",
      "dates": "2020 – Present",
      "bullets": [
        "Strong action verb + specific achievement + quantified result",
        "Second bullet with impact",
        "Third bullet"
      ]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "dates": "2016 – 2020"
    }
  ]
}

Rules:
- ONLY use skills and experience the candidate actually has from their resume
- Tailor bullets to match job description keywords naturally
- Use strong action verbs (Led, Managed, Developed, Achieved, etc.)
- Quantify achievements wherever possible
- ATS friendly — no tables, no text boxes, no columns in the JSON values
- Output ONLY the JSON, no markdown fences, no extra text`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      try { return NextResponse.json(JSON.parse(clean)); }
      catch { return NextResponse.json({ raw: text }); }
    }

    // ── Generate alternate resume for second career track ─────────────────────
    if (action === "generateAlternate") {
      const { alternatejobs, selectedEducation, candidateInfo } = body;

      const prompt = `You are an expert resume writer.

CANDIDATE INFO:
Name: ${candidateInfo.fullName}
Email: ${candidateInfo.email}
Phone: ${candidateInfo.phone}
LinkedIn: ${candidateInfo.linkedinUrl}
City/State: ${candidateInfo.city}, ${candidateInfo.state}

JOBS FOR THIS RESUME (alternate career track):
${JSON.stringify(alternatejobs, null, 2)}

EDUCATION:
${JSON.stringify(selectedEducation, null, 2)}

Generate a strong general resume for this alternate career track (not job-description specific).
Output ONLY valid JSON:
{
  "professionalTitle": "Best professional title based on these roles",
  "summary": "2-3 sentence professional summary highlighting this career track",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "experience": [
    {
      "company": "Company Name",
      "location": "City, ST",
      "title": "Job Title",
      "dates": "2020 – Present",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "dates": "2016 – 2020"
    }
  ]
}
Output ONLY the JSON, no markdown, no extra text.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      try { return NextResponse.json(JSON.parse(clean)); }
      catch { return NextResponse.json({ raw: text }); }
    }

    // ── Flag a section for Claude suggestion ──────────────────────────────────
    if (action === "flagSection") {
      const prompt = `A job seeker flagged the "${sectionKey}" section of their tailored resume because it may contain unfamiliar terms, software, or skills they don't recognize.

Current section content:
"${sectionContent}"

Original resume (for context):
"${resumeText?.slice(0, 800) || ""}"

Please:
1. Identify what specifically looks unfamiliar or potentially inaccurate based on their original resume
2. Suggest a revised version of just this section that only uses skills and experience they clearly have

Output ONLY valid JSON:
{
  "issue": "Clear explanation of what was flagged and why it may be unfamiliar",
  "revised": "The revised section content using only what they actually have"
}
Output ONLY the JSON, no markdown, no extra text.`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: ANTHROPIC_HEADERS,
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });

      const data = await response.json();
      const text = data.content?.map((b: any) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      try { return NextResponse.json(JSON.parse(clean)); }
      catch { return NextResponse.json({ issue: "Could not generate suggestion.", revised: sectionContent }); }
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error." }, { status: 500 });
  }
}
