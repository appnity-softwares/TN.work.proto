import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token, password } = await req.json();

  const record = await db.passwordResetToken.findUnique({ where: { token } });
  if (!record) return NextResponse.json({ success: false, message: "Invalid token" });

  if (record.used) return NextResponse.json({ success: false, message: "Token already used" });

  if (record.expiresAt < new Date())
    return NextResponse.json({ success: false, message: "Token expired" });

  const hashed = await bcrypt.hash(password, 10);

  await db.user.update({
    where: { id: record.userId },
    data: { hashedPasscode: hashed },
  });

  await db.passwordResetToken.update({
    where: { id: record.id },
    data: { used: true },
  });

  return NextResponse.json({ success: true });
}
