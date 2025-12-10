// /src/lib/email/templates/meeting.ts
export function meetingEmail({
  name,
  clientName,
  title,
  date,
  time,
  description,
}: {
  name: string;
  clientName: string;
  title: string;
  date: string; // formatted date string
  time: string; // formatted time string
  description?: string;
}) {
  return `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Meeting Scheduled</title>
    <style>
      body { font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial; background:#f8fafc; padding:20px; color:#0f172a; }
      .card { max-width:680px; margin:0 auto; background:#fff; padding:22px; border-radius:12px; box-shadow:0 10px 30px rgba(2,6,23,0.06); }
      h1 { margin:0 0 6px 0; font-size:20px; color:#0f172a; }
      p { margin:8px 0; color:#374151; line-height:1.5; }
      .info { display:flex; gap:18px; margin-top:12px; }
      .info div { flex:1; background:#f3f4f6; padding:12px; border-radius:8px; }
      .label { font-size:12px; color:#6b7280; margin-bottom:6px; }
      .value { font-weight:600; color:#111827; }
      .desc { margin-top:12px; background:#f9fafb; padding:12px; border-radius:8px; color:#374151; }
      .signature { margin-top:20px; color:#6b7280; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>Meeting Scheduled</h1>

      <p>Hello <strong>${escapeHtml(name)}</strong>,</p>

      <p>A meeting has been scheduled — details below.</p>

      <div class="info" role="group" aria-label="meeting details">
        <div>
          <div class="label">Client</div>
          <div class="value">${escapeHtml(clientName)}</div>
        </div>

        <div>
          <div class="label">Date</div>
          <div class="value">${escapeHtml(date)}</div>

          <div style="margin-top:8px;" class="label">Time</div>
          <div class="value">${escapeHtml(time)}</div>
        </div>
      </div>

      <div style="margin-top:12px;">
        <div class="label">Meeting Title</div>
        <div class="value">${escapeHtml(title)}</div>
      </div>

      ${description ? `<div class="desc"><strong>Description</strong><div style="margin-top:8px;">${escapeHtml(description)}</div></div>` : ""}

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
