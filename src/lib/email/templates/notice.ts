// /src/lib/email/templates/notice.ts

export function noticeEmail({
  name,
  title,
  message,
  adminName,
}: {
  name: string;
  title: string;
  message: string;
  adminName: string;
}) {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #444;">New Notice Issued</h2>
      
      <p>Dear <strong>${name}</strong>,</p>

      <p>${message}</p>

      <p><strong>Notice Title:</strong> ${title}</p>

      <br />

      <p>Issued by: <strong>${adminName}</strong></p>

      <br/>
      <p style="font-size: 12px; color: #777;">This is an automated message from TaskNity.</p>
    </div>
  `;
}
