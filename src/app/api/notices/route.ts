import prisma from "@/lib/db";
import { checkAdmin } from "@/lib/auth/checkAdmin";
import { getSession } from "@/lib/session";

export async function POST(req: Request) {
  console.log("📩 [API] POST /api/notices triggered");

  try {
    const session = await getSession();
    console.log("🔍 Session:");

    if (!session) {
      console.error("🚫 Unauthorized — no session");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const authUser = session.user;
    console.log("👤 Auth User:", authUser);

    checkAdmin(authUser);
    console.log("🛡 Admin check passed");

    const body = await req.json();
    console.log("📦 Request Body:", body);

    const { title, message, type, targetUserId } = body;

    if (!title || !message || !type) {
      console.error("⚠ Missing required fields");
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    console.log("📝 Creating Notice in DB...");

    const notice = await prisma.notice.create({
      data: {
        title,
        message,
        type,
        adminId: authUser.id,
        targetUserId: targetUserId || null,
      },
    });

    console.log("✅ Notice Created:", notice);

    return new Response(JSON.stringify({ success: true, notice }), { status: 200 });

  } catch (error) {
    console.error("❌ Error in POST /api/notices:", error);
    return new Response(JSON.stringify({ error: "Server error", details: String(error) }), { status: 500 });
  }
}


export async function GET(req: Request) {
  console.log("📥 [API] GET /api/notices triggered");

  try {
    const session = await getSession();
    console.log("🔍 Session:");

    if (!session) {
      console.error("🚫 Unauthorized");
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
    }

    const user = session.user;
    console.log("👤 Auth User:", user);

    console.log("🔎 Fetching notices for user:", user.id);

    const notices = await prisma.notice.findMany({
      where: {
        OR: [
          { type: "PUBLIC" },
          { targetUserId: user.id }
        ],
      },
      orderBy: { createdAt: "desc" },
    });

    console.log(`📤 Returning ${notices.length} notices`);

    return new Response(JSON.stringify({ notices }), { status: 200 });

  } catch (error) {
    console.error("❌ Error in GET /api/notices:", error);
    return new Response(JSON.stringify({ error: "Server error", details: String(error) }), { status: 500 });
  }
}
