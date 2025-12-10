// /src/lib/email/hooks.ts

import { sendEmail } from "@/lib/email/sendEmail";
import { resetPasswordEmail } from "@/lib/email/templates/reset";
import { suspensionEmail } from "@/lib/email/templates/suspend";
import { unsuspendEmail } from "@/lib/email/templates/unsuspend";
import { noticeEmail } from "@/lib/email/templates/notice";
import { meetingEmail } from "@/lib/email/templates/meeting";
import { getBaseUrl } from "@/lib/getBaseUrl";

interface UserInfo {
  id: string;
  name: string;
  email?: string | null;
}

/* ----------------------------------------------------
   1. SEND PASSWORD RESET EMAIL (Token Format B)
---------------------------------------------------- */
export async function sendResetPasswordEmail(user: UserInfo, token: string) {
  if (!user.email) return { success: false, message: "User has no email" };

  const baseUrl = getBaseUrl();

  // Format B → https://site.com/reset-password/tokenId
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const html = resetPasswordEmail({
    name: user.name,
    link: resetUrl,
  });

  return sendEmail({
    to: user.email,
    subject: "Reset Your Password – TaskNity",
    html,
  });
}

/* ----------------------------------------------------
   2. SEND SUSPENSION EMAIL
---------------------------------------------------- */
export async function sendSuspensionEmail(user: UserInfo, reason: string) {
  if (!user.email) return { success: false, message: "User has no email" };

  const html = suspensionEmail({
    name: user.name,
    reason,
  });

  return sendEmail({
    to: user.email,
    subject: "Account Suspended – TaskNity",
    html,
  });
}

/* ----------------------------------------------------
   3. SEND UNSUSPEND EMAIL
---------------------------------------------------- */
export async function sendUnsuspendEmail(user: UserInfo) {
  if (!user.email) return { success: false, message: "User has no email" };

  const html = unsuspendEmail({
    name: user.name,
  });

  return sendEmail({
    to: user.email,
    subject: "Welcome Back – TaskNity",
    html,
  });
}

/* ----------------------------------------------------
   4. SEND NOTICE EMAIL (Admin → Employee)
---------------------------------------------------- */
export async function sendNoticeToEmployee(params: {
  user: UserInfo;
  title: string;
  message: string;
  adminName: string;
}) {
  if (!params.user.email) return { success: false, message: "User has no email" };

  const html = noticeEmail({
    name: params.user.name,
    title: params.title,
    message: params.message,
    adminName: params.adminName,
  });

  return sendEmail({
    to: params.user.email,
    subject: `New Notice: ${params.title}`,
    html,
  });
}

/* ----------------------------------------------------
   5. SEND MEETING EMAIL (Client Meeting Scheduler)
---------------------------------------------------- */
export async function sendMeetingScheduledEmail(params: {
  user: UserInfo;
  clientName: string;
  title: string;
  date: string;
  time: string;
  description?: string;
}) {
  if (!params.user.email) return { success: false, message: "User has no email" };

  const html = meetingEmail({
    name: params.user.name,
    clientName: params.clientName,
    title: params.title,
    date: params.date,
    time: params.time,
    description: params.description,
  });

  return sendEmail({
    to: params.user.email,
    subject: `Meeting Scheduled – ${params.clientName}`,
    html,
  });
}
