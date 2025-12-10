import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/email/send";
import { passwordResetTemplate } from "@/lib/email/templates/password-reset";

export async function POST(req: Request) {
  try {
    const { userId, email, name } = await req.json();

    if (!userId || !email) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 min

    await db.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt: expires,
      },
    });

    const link = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${token}`;

    await sendEmail(
      email,
      "Reset Your TaskNity Password",
      passwordResetTemplate(name, link)
    );

    return NextResponse.json({ success: true, message: "Reset link sent to email." });
  } catch (error) {
    console.error("Reset request failed:", error);
    return NextResponse.json({ success: false, message: "Could not send reset link." });
  }
}
