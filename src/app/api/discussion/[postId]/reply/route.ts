import prisma from "@/lib/db";
import { getSession } from "@/lib/session";
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET!;

export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  console.log("📩 POST /api/discussion/[postId]/reply called");

  try {
    // STEP 1 — AUTH
    const session = await getSession();
    let user = session?.user;

    // Bearer token fallback
    if (!user) {
      const auth = req.headers.get("authorization") || "";
      const token = auth.startsWith("Bearer ") ? auth.split(" ")[1] : null;

      if (token) {
        try {
          const payload = jwt.verify(token, secretKey as any) as any;
          console.log("🔓 Decoded token payload:");
          user = payload;
        } catch (err) {
          console.warn("⚠ Invalid auth token");
        }
      }
    }

    if (!user) {
      console.error("🚫 Unauthorized — No session or token");
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    

    // STEP 2 — DATA
    const { content } = await req.json();
    if (!content) {
      console.warn("⚠ Missing reply content");
      return Response.json({ error: "Reply content required" }, { status: 400 });
    }

    console.log("📝 Creating reply:");

    // STEP 3 — CREATE REPLY
    const reply = await prisma.discussionReply.create({
      data: {
        postId: params.postId,
        userId: user.id,
        content,
      },
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true },
        },
      },
    });

    console.log("✅ Reply created:");

    return Response.json({ success: true, reply }, { status: 201 });
  } catch (error) {
    console.error("❌ Error in POST /api/discussion/[postId]/reply:", error);
    return Response.json(
      { error: "Server error", details: String(error) },
      { status: 500 }
    );
  }
}
