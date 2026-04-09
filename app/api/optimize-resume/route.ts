// app/api/optimize-resume/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeText, jobDescription, action, sectionKey, sectionContent } = body;

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: "API key not configured." }, { status: 500 });
    }

    let prompt = "";

    // ── Action: analyze match score + parse resume sections ──
    if (action === "analyze") {
      prompt = `You are an expert resume writer and ATS specialist.

CANDIDATE RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}

Perform a thorough analysis. Output ONLY valid JSON in this exact shape:
{
  "matchScore": 72,
  "matchSummary": "Brief 1-2 sentence explanation of the match score",
  "jobs": [
    { "id": "job1", "title": "Job Title", "company": "Company Name", "dates": "2020-2023", "location": "City, ST", "relevant": true, "relevanceReason": "Why this is/isn't relevant to the job description", "bullets": ["bullet 1", "bullet 2"] }
  ],
  "education": [
    { "id": "edu1", "degree": "Degree Name", "school": "School Name", "dates": "2016-2020", "relevant": true, "relevanceReason": "Why relevant or not" }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "recommendedFormat": "chronological",
  "formatReason": "Brief reason why chronological or combination is better for this candidate",
  "professionalTitle": "Suggested Professional Title Based On Their Experience",
  "hasMultipleCareerTracks": true,
  "careerTracks": [
    { "trackId": "track1", "label": "Track label e.g. Logistics & Transportation", "jobIds": ["job1", "job2"] },
    { "trackId": "track2", "label": "Track label e.g. Sales & Customer Service", "jobIds": ["job3"] }
  ]
}

Rules:
- matchScore is 0-100 integer
- relevant = true if the job/education helps with this specific job description
- Only include careerTracks if hasMultipleCareerTracks is true
- recommendedFormat must be "chronological" or "combination"
- Output ONLY the JSON, no other text`;
    }

    // ── Action: generate tailored resume from selected jobs ──
    else if (action === "generate") {
      const { selectedJobs, selectedEducation, format, font, resumeTitle, candidateInfo } = body;
      prompt = `You are an expert resume writer and ATS specialist.

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
      "bullets": ["Strong action verb + achievement + quantified result", "bullet 2", "bullet 3"]
    }
  ],
  "education": [
    {
      "degree": "Degree",
      "school": "School Name",
      "dates": "2016 – 2020"
    }
  ]
}

Rules:
- Only use experience and skills the candidate ACTUALLY has
- Tailor bullets to match job description keywords
- Use strong action verbs
- Quantify achievements where possible
- ATS friendly - no tables, no text boxes
- Output ONLY the JSON`;
    }

    // ── Action: flag a section for suggestion ──
    else if (action === "flagSection") {
      prompt = `A job seeker flagged the "${sectionKey}" section of their tailored resume because it may contain unfamiliar terms or skills.

Current content: "${sectionContent}"

Original resume context: "${resumeText?.slice(0, 600) || ""}"

Identify what looks unfamiliar or potentially inaccurate. Suggest a revised version using only what they clearly have.

Output ONLY JSON:
{"issue": "What was flagged and why", "revised": "Revised section content only"}`;
    }

    // ── Action: generate second resume from alternate career track ──
    else if (action === "generateAlternate") {
      const { alternatejobs, selectedEducation, candidateInfo } = body;
      prompt = `You are an expert resume writer.

CANDIDATE INFO:
Name: ${candidateInfo.fullName}
Email: ${candidateInfo.email}
Phone: ${candidateInfo.phone}
LinkedIn: ${candidateInfo.linkedinUrl}
City/State: ${candidateInfo.city}, ${candidateInfo.state}

JOBS FOR THIS RESUME:
${JSON.stringify(alternatejobs, null, 2)}

EDUCATION:
${JSON.stringify(selectedEducation, null, 2)}

Generate a strong general resume (not job-description specific) for these roles. Output ONLY valid JSON:
{
  "professionalTitle": "Best title based on these roles",
  "summary": "2-3 sentence professional summary",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"],
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
      "degree": "Degree",
      "school": "School Name",
      "dates": "2016 – 2020"
    }
  ]
}
Output ONLY the JSON.`;
    }

    else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const text = data.content?.map((b: any) => b.text || "").join("") || "";
    const clean = text.replace(/```json|```/g, "").trim();

    try {
      const parsed = JSON.parse(clean);
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ raw: text });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error." }, { status: 500 });
  }
}
