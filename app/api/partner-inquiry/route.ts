export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { companyName, fullName, title, phone, email, message } = body ?? {};

    if (!companyName || !fullName || !email || !message) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
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
        subject: `New Partner Inquiry from ${companyName}`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
            <h2>New Partner Inquiry</h2>

            <p><strong>Company Name:</strong> ${escapeHtml(companyName)}</p>
            <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
            <p><strong>Title:</strong> ${escapeHtml(title || "")}</p>
            <p><strong>Phone:</strong> ${escapeHtml(phone || "")}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>

            <hr style="margin: 20px 0;" />

            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
          </div>
        `,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        { error: data?.message || "Unable to send inquiry." },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error: any) {
    return Response.json(
      { error: error?.message || "Unable to send inquiry." },
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
