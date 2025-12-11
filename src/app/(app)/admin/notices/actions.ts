'use server';

import { db } from "@/lib/db";
import { sendNoticeToEmployee } from "@/lib/email/hooks";
import { NoticeType } from "@prisma/client";

export async function createNotice({
  adminId,
  targetUserId,
  title,
  message,
  type,
  notify
}: {
  adminId: string;
  targetUserId?: string | null;
  title: string;
  message: string;
  type: string;
  notify: boolean;
}) {

  // Convert raw string → enum
  const noticeType: NoticeType =
    (type as NoticeType) ?? NoticeType.PUBLIC;

  const notice = await db.notice.create({
    data: {
      adminId,
      targetUserId: targetUserId || null,
      title,
      message,
      type: noticeType
    }
  });

  if (notify && targetUserId) {
    const user = await db.user.findUnique({ where: { id: targetUserId } });

    if (user?.email) {
      await sendNoticeToEmployee({
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        },
        title,
        message,
        adminName: "Admin"
      });
    }
  }

  return { success: true };
}
