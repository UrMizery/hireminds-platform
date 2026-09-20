import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MODEL =
  process.env.ANTHROPIC_MODEL?.trim() || "claude-sonnet-4-6";

function getApiKey() {
  return process.env.ANTHROPIC_API_KEY?.trim() || "";
}

function cleanJsonText(text: string) {
  return text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function extractAnthropicText(data: any) {
  if (!Array.isArray(data?.content)) return "";

  return data.content
    .filter(
      (item: any) =>
        item?.type === "text" &&
        typeof item?.text === "string"
    )
    .map((item: any) => item.text)
    .join("\n")
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "HireMinds AI is not configured. ANTHROPIC_API_KEY is missing.",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const jobTitle = String(body?.jobTitle || "").trim();

    if (!jobTitle) {
      return NextResponse.json(
        {
          error: "Enter a job title to continue.",
        },
        { status: 400 }
      );
    }

    if (jobTitle.length > 120) {
      return NextResponse.json(
        {
          error: "Please enter a shorter job title.",
        },
        { status: 400 }
      );
    }

    const prompt = `
You are the career intelligence assistant inside HireMinds.

A participant entered this job title:

"${jobTitle}"

Create a concise, practical Career Snapshot for that occupation.

IMPORTANT:
- Do NOT mention O*NET.
- Do NOT mention that you are an AI.
- Do NOT add sections beyond those requested.
- Do NOT include tasks, work context, knowledge categories, education requirements, personality tests, or unrelated career information.
- Use clear participant-friendly language.
- Avoid unnecessary jargon.
- Do not invent obscure software, certifications, equipment, wages, or statistics.
- Interpret common abbreviations and informal job titles when reasonable.
- If the title is broad, use the most common occupational interpretation.
- Return ONLY valid JSON.
- Do not use markdown.
- Do not wrap the response in a code block.

Return EXACTLY this JSON structure:

{
  "occupationTitle": "",
  "overview": "",
  "coreSkills": [],
  "softSkills": [],
  "transferableSkills": [
    {
      "skill": "",
      "explanation": ""
    }
  ],
  "technologySkills": [],
  "technologyNote": "",
  "wageTrends": {
    "medianHourly": "",
    "medianAnnual": "",
    "employmentLevel": "",
    "projectedGrowth": "",
    "projectedOpenings": ""
  },
  "workAttire": "",
  "interviewAttire": ""
}

CONTENT REQUIREMENTS

OCCUPATION OVERVIEW
Write 2–3 concise sentences explaining what this occupation is and what the person typically does.

CORE SKILLS
Provide 6–9 job-specific hard, technical, operational, or occupational skills.

Do not fill this section with generic soft skills.

SOFT SKILLS
Provide 6–9 workplace and people skills relevant to this occupation.

Examples may include:
communication,
active listening,
organization,
adaptability,
attention to detail,
problem solving,
teamwork,
professionalism,
time management.

Only include skills relevant to the occupation.

TRANSFERABLE SKILLS
Provide 5–7 transferable skills.

For each:
- give the skill name
- briefly explain how the skill can transfer into other occupations or industries

Keep each explanation concise.

SOFTWARE & TECHNOLOGY SKILLS
Provide relevant:
- software
- platforms
- systems
- technology
- tools
- machinery
- equipment

that are commonly associated with the occupation.

Do NOT invent specialized software.

If the occupation does not normally require specialized software or technology:
- return an empty technologySkills array
- explain that briefly in technologyNote

WAGE & EMPLOYMENT TRENDS
Provide general NATIONAL U.S. occupational information.

Include:
- median hourly wage
- median annual wage
- employment level
- projected growth or decline
- projected job openings

IMPORTANT:
You do not have live labor-market access.

Do not describe the figures as live, current-day, or real-time data.

Use reasonable established national occupational information when you are confident.

If a precise statistic is uncertain, clearly qualify it instead of fabricating precision.

For employmentLevel, use a concise description or approximate national employment figure when reasonably known.

For projectedGrowth, state the approximate percentage and whether it represents growth or decline when reasonably known.

For projectedOpenings, provide approximate annual openings when reasonably known.

WORK ATTIRE
Describe typical clothing worn while performing this job.

Account for the occupation.

Examples:
- office/admin: business casual
- healthcare: scrubs or clinical attire
- warehouse: work clothing and safety footwear
- construction: workwear, boots and required PPE
- HR/recruiting: business casual to professional
- food service: uniform and non-slip footwear

Mention PPE or safety requirements when relevant.

INTERVIEW ATTIRE
Give one concise recommendation describing appropriate interview attire specifically for this occupation.

QUALITY CHECK
Before returning the JSON:
- make sure coreSkills contains 6–9 items
- make sure softSkills contains 6–9 items
- make sure transferableSkills contains 5–7 items
- make sure every required field exists
- make sure the response is valid JSON
`;

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2200,
          temperature: 0.3,
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
        }),
        cache: "no-store",
      }
    );

    const rawProviderResponse = await response.text();

    let providerData: any = null;

    try {
      providerData = JSON.parse(rawProviderResponse);
    } catch {
      providerData = null;
    }

    if (!response.ok) {
      console.error(
        "Industry Core Skills AI error:",
        response.status,
        rawProviderResponse
      );

      if (response.status === 401) {
        return NextResponse.json(
          {
            error:
              "HireMinds AI authentication failed.",
          },
          { status: 500 }
        );
      }

      if (response.status === 403) {
        return NextResponse.json(
          {
            error:
              "HireMinds AI does not currently have permission to complete this request.",
          },
          { status: 500 }
        );
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error:
              "HireMinds AI is receiving a high number of requests. Please try again shortly.",
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error:
            providerData?.error?.message ||
            "HireMinds could not generate this career snapshot.",
        },
        { status: 500 }
      );
    }

    const aiText = extractAnthropicText(providerData);

    if (!aiText) {
      return NextResponse.json(
        {
          error:
            "HireMinds did not receive career information for that job title.",
        },
        { status: 500 }
      );
    }

    let result: any;

    try {
      result = JSON.parse(cleanJsonText(aiText));
    } catch (error) {
      console.error(
        "Industry Core Skills JSON parse error:",
        error,
        aiText
      );

      return NextResponse.json(
        {
          error:
            "HireMinds received an incomplete career snapshot. Please generate it again.",
        },
        { status: 500 }
      );
    }

    const requiredArrays = [
      result?.coreSkills,
      result?.softSkills,
      result?.transferableSkills,
      result?.technologySkills,
    ];

    if (
      !result?.occupationTitle ||
      !result?.overview ||
      !result?.wageTrends ||
      !result?.workAttire ||
      !result?.interviewAttire ||
      requiredArrays.some((item) => !Array.isArray(item))
    ) {
      console.error(
        "Industry Core Skills invalid result:",
        result
      );

      return NextResponse.json(
        {
          error:
            "HireMinds received an incomplete career snapshot. Please generate it again.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Industry Core Skills route error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "HireMinds could not generate your career snapshot. Please try again.",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: "industry-core-skills",
    configured: Boolean(getApiKey()),
    model: MODEL,
  });
}
