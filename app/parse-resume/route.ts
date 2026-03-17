import { NextResponse } from "next/server";
import OpenAI from "openai";
import pdfParse from "pdf-parse";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const resumeText = pdfData.text;

    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Send to AI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You extract structured resume data and return JSON only.",
        },
        {
          role: "user",
          content: `
Extract:

- summary
- skills (array)
- education
- certifications

From FIRST 4 jobs:
- company
- city
- state
- start_date
- end_date
- title
- max 4 bullet points

Also give suggestions:
- summary_improvement
- skills_improvement
- bullets_improvement

Return ONLY valid JSON.

Resume:
${resumeText}
          `,
        },
      ],
    });

    const result = completion.choices[0].message.content;

    return NextResponse.json(JSON.parse(result || "{}"));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Parsing failed" }, { status: 500 });
  }
}
