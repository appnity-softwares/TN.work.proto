export function meetingScheduledTemplate(employeeName: string, clientName: string, date: string, time: string, notes?: string) {
  return `
    <div style="font-family:Arial; font-size:15px; line-height:22px;">
      <p>Hello ${employeeName},</p>

      <p>A new meeting has been scheduled.</p>

      <p><b>Client Name:</b> ${clientName}</p>
      <p><b>Date:</b> ${date}</p>
      <p><b>Time:</b> ${time}</p>

      ${notes ? `<p><b>Notes:</b> ${notes}</p>` : ""}

      <p>Please be on time and well prepared.</p>

      <p>Regards,<br/>TN Proto Admin Team</p>
    </div>
  `;
}



