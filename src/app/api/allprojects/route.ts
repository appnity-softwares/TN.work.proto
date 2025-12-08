import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const projects = await prisma.project.findMany({
    include: { users: true },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ projects });
}
