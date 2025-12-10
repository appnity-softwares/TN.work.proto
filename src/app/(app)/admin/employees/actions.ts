"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";

import { sendEmail } from "@/lib/email/sendEmail";
import { resetPasswordEmail } from "@/lib/email/templates/reset";

import { sendSuspendEmail } from "@/lib/email/templates/suspend";
import { sendUnsuspendEmail } from "@/lib/email/templates/unsuspend";

import { getBaseUrl } from "@/lib/getBaseUrl";

/* ---------------------------------------------------
   REQUEST PASSWORD RESET (ADMIN → EMPLOYEE)
---------------------------------------------------- */
export async function requestPasswordReset(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId }
  });

  if (!user || !user.email) {
    return { success: false, message: "User not found or missing email" };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15m

  await db.passwordResetToken.create({
    data: { userId, token, expiresAt }
  });

  const link = `${getBaseUrl()}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your TaskNity password",
    html: resetPasswordEmail({
      name: user.name,
      link
    })
  });

  return { success: true, message: "Password reset link sent" };
}

/* ---------------------------------------------------
   SUSPEND USER
---------------------------------------------------- */
export async function suspendUser(userId: string, reason = "Suspended by admin") {
  // fetch user first for meta + email
  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) return { success: false, message: "User not found" };

  const updatedMeta = {
    ...(existing.meta || {}),
    suspensionReason: reason
  };

  const user = await db.user.update({
    where: { id: userId },
    data: { status: "SUSPENDED", meta: updatedMeta as any }
  });

  // send email
  if (user.email) {
    await sendSuspendEmail({
      to: user.email,
      reason
    });
  }

  revalidatePath("/admin/employees");
  return { success: true, message: "User suspended" };
}

/* ---------------------------------------------------
   UNSUSPEND USER
---------------------------------------------------- */
export async function unsuspendUser(userId: string) {
  const existing = await db.user.findUnique({ where: { id: userId } });

  if (!existing) return { success: false, message: "User not found" };

  const updatedMeta = {
    ...(existing.meta || {}),
    suspensionReason: null
  };

  const user = await db.user.update({
    where: { id: userId },
    data: { status: "ACTIVE", meta: updatedMeta as any }
  });

  // send welcome-back email
  if (user.email) {
    await sendUnsuspendEmail({
      to: user.email
    });
  }

  revalidatePath("/admin/employees");
  return { success: true, message: "User unsuspended" };
}

/* ---------------------------------------------------
   DEACTIVATE USER
---------------------------------------------------- */
export async function deactivateUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { status: "INACTIVE" }
  }).catch(() => null);

  revalidatePath("/admin/employees");
  return { success: true, message: "User deactivated" };
}

/* ---------------------------------------------------
   ACTIVATE USER
---------------------------------------------------- */
export async function activateUser(userId: string) {
  const user = await db.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" }
  }).catch(() => null);

  revalidatePath("/admin/employees");
  return { success: true, message: "User activated" };
}
