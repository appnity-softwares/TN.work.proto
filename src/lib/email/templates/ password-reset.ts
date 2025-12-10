import { emailBaseLayout } from "../base-layout";

export function passwordResetTemplate(name: string, link: string) {
  return emailBaseLayout(`
      <p>Dear ${name},</p>
      <p>A request has been received to reset your TaskNity account password.</p>
      <p>Please click the button below to set a new password:</p>

      <p style="text-align:center;">
        <a href="${link}" style="background:#4285F4;color:white;padding:10px 18px;border-radius:6px;text-decoration:none;">
          Reset Password
        </a>
      </p>

      <p><b>The link expires in 30 minutes.</b></p>
      <p>If you did not perform this request, please inform the admin immediately.</p>
  `);
}
