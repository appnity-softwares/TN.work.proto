import { db } from "@/lib/db";

export async function validateResetToken(token: string) {
  const record = await db.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record) return { valid: false };

  if (record.used) return { valid: false };

  if (record.expiresAt < new Date()) return { valid: false };

  return { valid: true, userId: record.userId };
}
