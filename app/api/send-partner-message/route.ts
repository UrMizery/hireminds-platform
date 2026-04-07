import { NextResponse } from "next/server";

export async function POST(request: Request) {
try {
const body = await request.json();

const {
to,
participantName,
subject,
body: messageBody,
partnerOrganization,
partnerEmail,
} = body ?? {};

if (!to || !subject || !messageBody) {
return NextResponse.json(
{ error: "Missing required email fields." },
{ status: 400 }
);
}

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail =
process.env.PARTNER_MESSAGES_FROM_EMAIL || "HireMinds <info@hireminds.app>";

if (!resendApiKey) {
return NextResponse.json(
{ error: "Missing RESEND_API_KEY environment variable." },
{ status: 500 }
);
}

const emailHtml = `
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
<p>Hi ${participantName || "there"},</p>

<p>You received a message from ${partnerOrganization || "your HireMinds partner"}.</p>

<div style="margin: 20px 0; padding: 16px; border: 1px solid #e5e7eb; border-radius: 12px; background: #f9fafb;">
${String(messageBody)
.split("\n")
.map((line: string) => `<p style="margin: 0 0 10px;">${line || "&nbsp;"}</p>`)
.join("")}
</div>

${
partnerEmail
? `<p style="color: #6b7280; font-size: 14px;">Partner contact: ${partnerEmail}</p>`
: ""
}

<p style="margin-top: 24px;">— HireMinds</p>
</div>
`;

const resendResponse = await fetch("https://api.resend.com/emails", {
method: "POST",
headers: {
Authorization: `Bearer ${resendApiKey}`,
"Content-Type": "application/json",
},
body: JSON.stringify({
from: fromEmail,
to: [to],
subject,
html: emailHtml,
}),
});

const resendData = await resendResponse.json();

if (!resendResponse.ok) {
return NextResponse.json(
{ error: resendData?.message || "Email provider failed." },
{ status: 500 }
);
}

return NextResponse.json({ success: true, id: resendData?.id || null });
} catch (error) {
const errorMessage =
error instanceof Error ? error.message : "Unexpected server error.";

return NextResponse.json({ error: errorMessage }, { status: 500 });
}
}
