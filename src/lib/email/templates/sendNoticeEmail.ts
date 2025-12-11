import { sendEmail } from "../sendEmail";
import { noticeEmail } from "@/lib/email/templates/notice";

export async function sendNoticeEmail({
  to,
  title,
  message,
  type,
  adminName = "Admin"
}: {
  to: string;
  title: string;
  message: string;
  type: string;
  adminName?: string;
}) {
  const html = noticeEmail({
    name: type,
    title,
    message,
    adminName,
  });

  return sendEmail({
    to,
    subject: `New Notice: ${title}`,
    html,
  });
}
