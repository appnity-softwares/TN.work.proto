import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// GET /api/discussion - Fetch all discussion posts
export async function GET() {
  try {
    const posts = await prisma.discussionPost.findMany({
      include: {
        user: {
          select: { id: true, name: true, employeeCode: true },
        },
        replies: {
          include: {
            user: {
              select: { id: true, name: true, employeeCode: true },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        _count: {
          select: { replies: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return Response.json({ posts });
  } catch (error) {
    console.error("Failed to fetch discussion posts:", error);
    return Response.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/discussion - Create a new discussion post
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, content } = await req.json();

  if (!title || !content) {
    return Response.json({ error: "Title and content are required" }, { status: 400 });
  }

  try {
    const newPost = await prisma.discussionPost.create({
      data: {
        title,
        content,
        userId: session.user.id,
      },
      include: {
         user: {
          select: { id: true, name: true, employeeCode: true },
        },
        replies: true
      }
    });
    return Response.json({ post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Failed to create discussion post:", error);
    return Response.json({ error: "Failed to create post" }, { status: 500 });
  }
}
