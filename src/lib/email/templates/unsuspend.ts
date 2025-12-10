// /src/lib/email/templates/unsuspend.ts
export function unsuspendEmail({ name }: { name: string }) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Welcome Back</title>
    <style>
      body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#f7fbff; padding:22px; color:#0f172a; }
      .card { max-width:600px; margin:0 auto; background:#fff; padding:24px; border-radius:12px; box-shadow:0 8px 24px rgba(15,23,42,0.06); }
      h1 { color:#0f172a; margin:0 0 10px 0; font-size:20px; }
      p { color:#374151; line-height:1.5; margin:8px 0; }
      .cta { margin-top:18px; }
      .signature { margin-top:26px; color:#6b7280; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Welcome back, ${escapeHtml(name)}!</h1>

      <p>Your account suspension has been lifted. You can now log in and continue working.</p>

      <p>We’re glad to have you back — if you need assistance, feel free to reach out.</p>

      <div class="signature">
        <p>Regards,<br/><strong>Team TaskNity</strong></p>
      </div>
    </div>
  </body>
  </html>
  `;
}

function escapeHtml(s: string) {
  return (s || "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[c] as string));
}
