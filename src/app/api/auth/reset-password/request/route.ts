// /src/app/api/auth/reset-password/request/route.ts
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";
import { sendEmail } from "@/lib/email/sendEmail";
import { resetPasswordEmail } from "@/lib/email/templates/reset";
import { getBaseUrl } from "@/lib/getBaseUrl";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();

    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user || !user.email) {
      return NextResponse.json(
        { success: false, message: "User not found or has no email." },
        { status: 400 }
      );
    }

    // Generate Token
    const token = crypto.randomBytes(24).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await db.passwordResetToken.create({
      data: { userId, token, expiresAt },
    });

    const link = `${getBaseUrl()}/reset-password/${token}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: resetPasswordEmail({ name: user.name, link }),
    });

    return NextResponse.json({
      success: true,
      message: "Password reset link has been sent.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json(
      { success: false, message: "Server error creating reset token." },
      { status: 500 }
    );
  }
}
