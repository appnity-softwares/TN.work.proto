import { db as prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserFromRequest } from "@/lib/auth/verifyToken";
import { checkAdmin } from "@/lib/auth/checkAdmin";


export async function POST(req: Request) {
  try {
    const user = getUserFromRequest(req);
    checkAdmin(user); // ensures { role: "ADMIN" }

    const { name, employeeCode, passcode } = await req.json();

    const hashed = await bcrypt.hash(passcode, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        employeeCode,
        hashedPasscode: hashed,
        role: "EMPLOYEE"
      }
    });

    return Response.json({ success: true, user: newUser }, { status: 201 });
  } catch (err) {
    if (err instanceof Error) {
      console.error("❌ Admin Create Error:", err.message);
    } else {
      console.error("❌ Unknown error:", err);
    }

    return Response.json({ error: "Failed to create user" }, { status: 500 });
  }
}
