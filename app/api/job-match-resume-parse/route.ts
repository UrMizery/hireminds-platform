import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import pdf from "pdf-parse";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "job-match-resume-parse",
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Please upload a PDF or DOCX resume." },
        { status: 400 }
      );
    }

    const lowerName = file.name.toLowerCase();

    const isPdf =
      file.type === "application/pdf" ||
      lowerName.endsWith(".pdf");

    const isDocx =
      file.type ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      lowerName.endsWith(".docx");

    if (!isPdf && !isDocx) {
      return NextResponse.json(
        { error: "Only PDF and DOCX resumes are supported." },
        { status: 400 }
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Resume file must be 8 MB or smaller." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    let resumeText = "";
    let pageCount: number | null = null;

    if (isPdf) {
      const parsed = await pdf(buffer);

      resumeText = parsed.text || "";

      if (typeof parsed.numpages === "number") {
        pageCount = parsed.numpages;
      }
    }

    if (isDocx) {
      const parsed =
        await mammoth.extractRawText({
          buffer,
        });

      resumeText = parsed.value || "";
    }

    resumeText = resumeText
      .replace(/\u0000/g, "")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{4,}/g, "\n\n\n")
      .trim();

    if (resumeText.length < 40) {
      return NextResponse.json(
        {
          error:
            "We could not read enough text from this resume. Try a text-based PDF or DOCX file.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({
      ok: true,
      resumeText,
      fileName: file.name,
      pageCount,
    });
  } catch (error: any) {
    console.error(
      "Job Match resume upload error:",
      error
    );

    return NextResponse.json(
      {
        error:
          error?.message ||
          "Unable to read this resume.",
      },
      { status: 500 }
    );
  }
}
