// /src/lib/email/templates/reset.ts
export function resetPasswordEmail({ name, link }: { name: string; link: string }) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Password Reset</title>
    <style>
      body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; background:#f6f8fb; margin:0; padding:24px; color:#111827;}
      .card { background: #ffffff; border-radius:12px; max-width:600px; margin:0 auto; padding:28px; box-shadow:0 6px 18px rgba(15,23,42,0.06); }
      .btn { display:inline-block; padding:12px 20px; border-radius:8px; background:#1a73e8; color:#fff; text-decoration:none; font-weight:600; }
      .muted { color:#6b7280; font-size:13px; }
      .footer { margin-top:28px; color:#6b7280; font-size:13px; }
      h1 { margin:0 0 12px 0; font-size:20px; color:#0f172a; }
      p { margin:8px 0; line-height:1.5; }
      .small { font-size:13px; color:#6b7280; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Password reset requested</h1>
      <p class="muted">Hello <strong>${escapeHtml(name)}</strong>,</p>

      <p class="muted">We received a request to reset your password. Click the button below to create a new password for your TaskNity account.</p>

      <p style="margin:18px 0;">
        <a class="btn" href="${link}" target="_blank" rel="noopener noreferrer">Reset Password</a>
      </p>

      <p class="small">This link will expire in <strong>15 minutes</strong>. If you did not request a password reset, please ignore this email or contact your administrator.</p>

      <div class="footer">
        <p>Regards,<br/><strong>Team TaskNity</strong></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

/* Simple HTML-escape to avoid injection in templates */
function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c] as string));
}
