import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const clients = await prisma.client.findMany({
    where: {
      employees: {
        some: { userId }
      }
    },
    include: {
      projects: {
        include: {
          project: true,
        },
      },
      logs: {
        where: { createdById: userId },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return Response.json({ clients });
}
