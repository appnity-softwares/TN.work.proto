"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { getAuth } from "@/lib/auth/get-auth";

import { sendEmail } from "@/lib/email/sendEmail";
import { resetPasswordEmail } from "@/lib/email/templates/reset";

import { suspensionEmail } from "@/lib/email/templates/suspend";
import { unsuspendEmail } from "@/lib/email/templates/unsuspend";

import { getBaseUrl } from "@/lib/getBaseUrl";

/* ---------------------------
   REQUEST PASSWORD RESET
-----------------------------*/
export async function requestPasswordReset(userId: string) {
  const user = await db.user.findUnique({ where: { id: userId } });

  if (!user || !user.email) {
    return { success: false, message: "User not found or missing email" };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await db.passwordResetToken.create({
    data: { userId, token, expiresAt },
  });

  const link = `${getBaseUrl()}/reset-password/${token}`;

  await sendEmail({
    to: user.email,
    subject: "Reset your TaskNity password",
    html: resetPasswordEmail({ name: user.name || "User", link }),
  });

  return { success: true, message: "Password reset link sent" };
}

/* --------------------------------
   SUSPEND USER
----------------------------------*/
export async function suspendUser(userId: string, reason = "Suspended by admin") {
  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) return { success: false, message: "User not found" };

  const oldMeta =
    existing.meta && typeof existing.meta === "object" && !Array.isArray(existing.meta)
      ? existing.meta
      : {};

  const updatedMeta = {
    ...oldMeta,
    suspensionReason: reason,
  };

  const user = await db.user.update({
    where: { id: userId },
    data: {
      status: "SUSPENDED",
      meta: updatedMeta as any,
    },
  });

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: "Your TaskNity Account Is Suspended",
      html: suspensionEmail({ name: user.name || "User", reason }),
    });
  }

  revalidatePath("/admin/employees");
  return { success: true, message: "User suspended" };
}
/* --------------------------------
   UNSUSPEND USER
----------------------------------*/
export async function unsuspendUser(userId: string) {
  const existing = await db.user.findUnique({ where: { id: userId } });
  if (!existing) return { success: false, message: "User not found" };

  const oldMeta =
    existing.meta && typeof existing.meta === "object" && !Array.isArray(existing.meta)
      ? existing.meta
      : {};

  const updatedMeta = {
    ...oldMeta,
    suspensionReason: null,
  };

  const user = await db.user.update({
    where: { id: userId },
    data: {
      status: "ACTIVE",
      meta: updatedMeta as any,
    },
  });

  // FIX → ensure name is always a string
  const safeName = user.name ?? "User";

  if (user.email) {
    await sendEmail({
      to: user.email,
      subject: "Welcome Back to TaskNity",
      html: unsuspendEmail({ name: safeName }),
    });
  }

  revalidatePath("/admin/employees");
  return { success: true, message: "User unsuspended" };
}

/* --------------------------------
   DEACTIVATE USER
----------------------------------*/
export async function deactivateUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { status: "INACTIVE" },
  });

  revalidatePath("/admin/employees");
  return { success: true, message: "User deactivated" };
}

/* --------------------------------
   ACTIVATE USER
----------------------------------*/
export async function activateUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { status: "ACTIVE" },
  });

  revalidatePath("/admin/employees");
  return { success: true, message: "User activated" };
}

/* --------------------------------
   MAKE ADMIN
----------------------------------*/
export async function makeAdmin(userId: string) {
    const session = await getAuth();
    if (session?.user.role !== 'SUPERADMIN') {
        return { success: false, message: "You don't have permission to do this." };
    }

    await db.user.update({
        where: { id: userId },
        data: { role: "ADMIN" },
    });

    revalidatePath("/admin/employees");
    return { success: true, message: "User promoted to Admin" };
}
