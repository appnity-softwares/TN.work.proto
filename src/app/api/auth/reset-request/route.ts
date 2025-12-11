import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/sendEmail";
import { resetPasswordEmail } from "@/lib/email/templates/reset";
import { getBaseUrl } from "@/lib/getBaseUrl";

export async function POST(req: Request) {
  try {
    const { userId, email, name } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
    }

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await db.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt: expires,
      },
    });

    const link = `${getBaseUrl()}/reset-password/${token}`;

    await sendEmail({
      to: email,
      subject: "Reset Your TaskNity Password",
      html: resetPasswordEmail({
        name,
        link,
      }),
    });

    return NextResponse.json({
      success: true,
      message: "Reset link sent to email.",
    });
  } catch (error) {
    console.error("Reset request failed:", error);
    return NextResponse.json({
      success: false,
      message: "Could not send reset link.",
    });
  }
}
