// api/send-email.js — Vercel Serverless Function
// Emails the client's Brock Book Guide reflection (as a PDF attachment) to Brock,
// using Resend. Requires env vars:  RESEND_API_KEY,  TO_EMAIL,  FROM_EMAIL
//
// FROM_EMAIL must be on a domain you've verified in Resend.
// (resend.dev's onboarding@ only delivers to the account owner.)

export const config = { runtime: "nodejs" };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const TO_EMAIL   = process.env.TO_EMAIL   || "hello@brockjohn.com";
  const FROM_EMAIL = process.env.FROM_EMAIL || "Brock Book Guide <guide@brockjohn.com>";

  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: "Email service not configured" });
  }

  try {
    const { name, email, phone, time, answers = [], pdfBase64, fileName } = req.body || {};

    const safe = (s) => String(s || "").replace(/[<>]/g, "");
    const rows = answers
      .map(
        (item, i) => `
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid #E4D6BB;vertical-align:top;">
            <div style="font:600 13px Helvetica,Arial,sans-serif;color:#2E1F0E;">${i + 1}. ${safe(item.q)}</div>
            <div style="font:14px Helvetica,Arial,sans-serif;color:#523F2A;margin-top:4px;white-space:pre-wrap;">${safe(item.a) || "—"}</div>
          </td>
        </tr>`
      )
      .join("");

    const html = `
      <div style="max-width:600px;margin:0 auto;background:#FAF7E8;border:1px solid #E4D6BB;border-radius:6px;padding:32px;">
        <div style="text-align:center;font:italic 22px Georgia,serif;color:#C9A96E;">bj</div>
        <div style="text-align:center;font:600 10px Helvetica,Arial,sans-serif;letter-spacing:.25em;color:#6B4C2A;margin:6px 0 4px;">
          BROCK&nbsp;JOHN · SOMATIC&nbsp;EDUCATION
        </div>
        <h1 style="text-align:center;font:400 26px Georgia,serif;color:#2E1F0E;margin:8px 0 2px;">New Brock Book Guide reflection</h1>
        <hr style="border:none;border-top:1px solid #C9A96E;width:120px;margin:14px auto 22px;" />
        <table style="width:100%;font:14px Helvetica,Arial,sans-serif;color:#2E1F0E;margin-bottom:18px;">
          <tr><td style="padding:3px 0;"><b>Name:</b> ${safe(name)}</td></tr>
          <tr><td style="padding:3px 0;"><b>Email:</b> ${safe(email)}</td></tr>
          ${phone ? `<tr><td style="padding:3px 0;"><b>Phone / app:</b> ${safe(phone)}</td></tr>` : ""}
          ${time ? `<tr><td style="padding:3px 0;"><b>Best time:</b> ${safe(time)}</td></tr>` : ""}
        </table>
        <table style="width:100%;border-collapse:collapse;">${rows}</table>
        <p style="text-align:center;font:12px Helvetica,Arial,sans-serif;color:#6B4C2A;margin-top:24px;">
          A formatted PDF is attached. · brockjohn.com
        </p>
      </div>`;

    const payload = {
      from: FROM_EMAIL,
      to: [TO_EMAIL],
      reply_to: email || undefined,
      subject: `Brock Book Guide — ${name || "new reflection"}`,
      html,
      attachments: pdfBase64
        ? [{ filename: fileName || "BBG-Reflection.pdf", content: pdfBase64 }]
        : undefined,
    };

    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: "Email send failed", detail });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: "Server error", detail: String(err) });
  }
}
