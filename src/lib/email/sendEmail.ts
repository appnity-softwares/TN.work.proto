// /src/lib/email/sendEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS = "TaskNity <tasknity@resender.dev>";

export interface EmailPayload {
  to: string | string[];
  subject: string;
  html: string;
  cc?: string | string[];
  bcc?: string | string[];
}

export async function sendEmail({ to, subject, html, cc, bcc }: EmailPayload) {
  try {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }

    const response = await resend.emails.send({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
      cc,
      bcc,
    });

    // FIX: Resend v3 returns: { data: { id }, error }
    return {
      success: true,
      id: response.data?.id || null,
    };
  } catch (error: any) {
    console.error("Email sending failed:", error);

    return {
      success: false,
      message: error?.message || "Unknown email error",
    };
  }
}
