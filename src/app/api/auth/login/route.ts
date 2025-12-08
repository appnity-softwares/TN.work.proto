import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  const { employeeCode, passcode } = await req.json();

  const user = await db.user.findUnique({
    where: { employeeCode }
  });

  if (!user)
    return Response.json({ error: "User not found" }, { status: 404 });

  const match = await bcrypt.compare(passcode, user.hashedPasscode);
  if (!match)
    return Response.json({ error: "Invalid passcode" }, { status: 401 });

  const token = generateToken({
    id: user.id,
    role: user.role,
    employeeCode: user.employeeCode
  });

  return Response.json({ success: true, token });
}
