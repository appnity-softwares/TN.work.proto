import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  console.log("📩 POST /api/work called");

  try {
    const session = await getSession();
    let user = session?.user;

    const auth = req.headers.get("authorization") || "";
    const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

    if (!user && token) {
      try {
        const payload = jwt.verify(token, secretKey as any) as any;
        console.log("🔓 Token payload:");
        user = payload;
      } catch (err) {
        console.warn("⚠ Invalid token");
      }
    }

    if (!user) {
      console.error("🚫 Unauthorized — no user");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { description, metadata } = await req.json();

    console.log("📝 Creating work log for:", user.id);

    const log = await prisma.workLog.create({
      data: { userId: user.id, description, metadata },
    });

    console.log("✅ Work log saved:", log);

    return Response.json({ success: true, log });
  } catch (error) {
    console.error("❌ Error in POST /api/work:", error);
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
