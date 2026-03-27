export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { fullName, phone, email, reason, note } = body ?? {};

    if (!fullName || !phone || !email || (!reason && !note)) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (reason === "Other" && !note) {
      return Response.json({ error: "Please add a note for Other." }, { status: 400 });
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return Response.json(
        { error: "Missing RESEND_API_KEY environment variable." },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "HireMinds <noreply@hireminds.app>",
        to: ["info@hireminds.app"],
        reply_to: email,
        subject: `New Contact Form Submission: ${reason || "General Inquiry"}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2>New Contact Form Submission</h2>

            <p><strong>Full Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Reason:</strong> ${escapeHtml(reason || "")}</p>

            <hr style="margin: 20px 0;" />

            <p><strong>Note:</strong></p>
            <p>${escapeHtml(note || "").replace(/\n/g, "<br/>")}</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data?.message || "Unable to send contact form." },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Unable to send contact form." },
      { status: 500 }
    );
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
