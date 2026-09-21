export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = clean(body?.fullName);
    const phone = clean(body?.phone);
    const email = clean(body?.email);
    const reason = clean(body?.reason);
    const note = clean(body?.note, 5000);

    if (!fullName || !phone || !email || (!reason && !note)) {
      return Response.json(
        {
          error: "Missing required fields.",
        },
        {
          status: 400,
        }
      );
    }

    if (reason === "Other" && !note) {
      return Response.json(
        {
          error: "Please add a note for Other.",
        },
        {
          status: 400,
        }
      );
    }

    const resendApiKey = process.env.RESEND_API_KEY;

    if (!resendApiKey) {
      return Response.json(
        {
          error: "Missing RESEND_API_KEY environment variable.",
        },
        {
          status: 500,
        }
      );
    }

    const isCancellation =
      reason.toLowerCase() === "cancel subscription";

    const submittedAt = new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone: "America/New_York",
        dateStyle: "full",
        timeStyle: "long",
      }
    ).format(new Date());

    const subject = isCancellation
      ? `CANCEL SUBSCRIPTION REQUEST: ${fullName}`
      : `New Contact Form Submission: ${reason || "General Inquiry"}`;

    const cancellationSection = isCancellation
      ? `
        <div
          style="
            margin: 20px 0;
            padding: 16px;
            background: #fff4e5;
            border: 1px solid #e6b96b;
            border-radius: 8px;
          "
        >
          <h3 style="margin-top: 0; color: #8a5200;">
            Subscription Cancellation Request
          </h3>

          <p>
            This subscriber is requesting cancellation of their
            HireMinds subscription.
          </p>

          <p>
            <strong>Cancellation cutoff:</strong>
            Requests should be submitted no later than
            <strong>6:00 PM Eastern Time on the day before the next
            scheduled billing date</strong>.
          </p>

          <p>
            This applies to both:
          </p>

          <ul>
            <li>
              The first $24.99 automatic charge following the
              5-day introductory period
            </li>

            <li>
              Future $24.99 monthly subscription renewals
            </li>
          </ul>

          <p>
            Requests submitted after the cutoff may not be processed
            before Stripe completes the scheduled automatic charge.
          </p>

          <p style="margin-bottom: 0;">
            <strong>Action:</strong>
            Locate the subscriber in Stripe and cancel the subscription
            at the end of the current billing period.
          </p>
        </div>
      `
      : "";

    const response = await fetch(
      "https://api.resend.com/emails",
      {
        method: "POST",

        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          from: "HireMinds <noreply@hireminds.app>",

          to: [
            "info@hireminds.app",
            "rei@hireminds.app",
],

          reply_to: email,

          subject,

          html: `
            <div
              style="
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #111;
                max-width: 700px;
                margin: 0 auto;
              "
            >
              <h2>
                ${
                  isCancellation
                    ? "Subscription Cancellation Request"
                    : "New Contact Form Submission"
                }
              </h2>

              <p>
                <strong>Submitted:</strong>
                ${escapeHtml(submittedAt)}
              </p>

              <p>
                <strong>Full Name:</strong>
                ${escapeHtml(fullName)}
              </p>

              <p>
                <strong>Phone:</strong>
                ${escapeHtml(phone)}
              </p>

              <p>
                <strong>Email:</strong>
                ${escapeHtml(email)}
              </p>

              <p>
                <strong>Reason:</strong>
                ${escapeHtml(reason || "")}
              </p>

              ${cancellationSection}

              <hr
                style="
                  margin: 20px 0;
                  border: 0;
                  border-top: 1px solid #ddd;
                "
              />

              <p>
                <strong>Note:</strong>
              </p>

              <p>
                ${
                  note
                    ? escapeHtml(note).replace(/\n/g, "<br/>")
                    : "No additional note provided."
                }
              </p>
            </div>
          `,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return Response.json(
        {
          error:
            data?.message ||
            "Unable to send contact form.",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json({
      success: true,

      message: isCancellation
        ? "Your cancellation request has been submitted."
        : "Your message has been submitted.",
    });
  } catch (error: any) {
    return Response.json(
      {
        error:
          error?.message ||
          "Unable to send contact form.",
      },
      {
        status: 500,
      }
    );
  }
}

function clean(
  value: unknown,
  max = 500
) {
  return String(value ?? "")
    .trim()
    .slice(0, max);
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
