// /src/lib/email/templates/suspend.ts
export function suspensionEmail({ name, reason }: { name: string; reason: string }) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Account Suspended</title>
    <style>
      body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#fff; color:#111827; padding:20px; }
      .container { max-width:600px; margin:0 auto; }
      .card { border-radius:8px; padding:20px; border-left:4px solid #d93025; background:#fff; box-shadow:0 4px 12px rgba(2,6,23,0.04); }
      h1 { font-size:18px; margin:0 0 10px 0; color:#b91c1c; }
      p { margin:8px 0; color:#111827; line-height:1.45; }
      .meta { margin-top:12px; color:#374151; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="card">
        <h1>Account Suspended</h1>
        <p>Hello <strong>${escapeHtml(name)}</strong>,</p>

        <p>Your account has been suspended by the administrator.</p>

        <p class="meta"><strong>Reason:</strong><br/>${escapeHtml(reason || "No reason provided")}</p>

        <p style="margin-top:16px;">If you think this is a mistake, contact your administrator for more information.</p>

        <p style="margin-top:20px;">Regards,<br/><strong>Team TaskNity</strong></p>
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
