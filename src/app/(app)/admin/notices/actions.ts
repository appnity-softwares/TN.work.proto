'use server';

import { db } from "@/lib/db";
import { sendNoticeEmail } from "@/lib/email/templates/notice";

export async function createNotice({ adminId, targetUserId, title, message, type, notify }: {
  adminId: string;
  targetUserId?: string | null;
  title: string;
  message: string;
  type: string;
  notify: boolean;
}) {
  const notice = await db.notice.create({
    data: {
      adminId,
      targetUserId: targetUserId || null,
      title,
      message,
      type
    }
  });

  if (notify && targetUserId) {
    const user = await db.user.findUnique({ where: { id: targetUserId } });
    if (user?.email) {
      await sendNoticeEmail({
        to: user.email,
        title,
        message,
        type
      });
    }
  }

  return { success: true };
}
