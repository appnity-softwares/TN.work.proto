import { sendEmail } from "../sendEmail";

export async function sendNoticeEmail({ to, title, message, type }: {
  to: string;
  title: string;
  message: string;
  type: string;
}) {
  const html = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color:#444;">New Notice</h2>
      <p><strong>Type:</strong> ${type}</p>
      <p><strong>Title:</strong> ${title}</p>
      <p>${message}</p>
      <br/>
      <p>— TaskNity</p>
    </div>
  `;

  return sendEmail({
    to,
    subject: `New Notice: ${title}`,
    html
  });
}
