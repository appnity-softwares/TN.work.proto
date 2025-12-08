import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  console.log("📩 POST /api/errors called");

  try {
    // Step 1 — Try cookie-based session
    const session = await getSession();
    let user = session?.user;

    // Step 2 — Fallback to Authorization header
    if (!user) {
      const auth = req.headers.get("authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

      if (token) {
        try {
          const payload = jwt.verify(token, secretKey as any) as any;
          console.log("🔓 Token payload:");
          user = payload;
        } catch (err) {
          console.warn("⚠ Invalid auth token for error route");
        }
      }
    }

    const { route, message, stacktrace, metadata } = await req.json();

   ;

    await prisma.errorLog.create({
      data: {
        userId: user?.id || null,
        route,
        message,
        stacktrace,
        metadata,
      },
    });

    console.log("✅ Error logged");

    return Response.json({ success: true });
  } catch (error) {
    console.error("❌ Error in POST /api/errors:", error);
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("📥 GET /api/errors");

    const logs = await prisma.errorLog.findMany({
      orderBy: { timestamp: "desc" },
    });

    console.log(`📤 Returning ${logs.length} error logs`);

    return Response.json({ logs });
  } catch (error) {
    console.error("❌ Error in GET /api/errors:", error);
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
