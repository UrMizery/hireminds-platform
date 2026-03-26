import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { companyName, fullName, title, phone, email, message } = body ?? {};

    if (!companyName || !fullName || !email || !message) {
      return Response.json({ error: "Missing required fields." }, { status: 400 });
    }

    const { error } = await resend.emails.send({
      from: "HireMinds <noreply@hireminds.app>",
      to: ["info@hireminds.app"],
      replyTo: email,
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
    });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
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
