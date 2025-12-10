import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const result = await resend.emails.send({
      from: process.env.MAIL_FROM || "TaskNity <tasknity@resender.dev>",
      to,
      subject,
      html,
    });

    return { success: true, result };
  } catch (error: any) {
    console.error("Email sending failed:", error.message || error);
    return { success: false, error: error.message };
  }
}
