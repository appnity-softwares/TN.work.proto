import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const session = await getSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const clientId = params.id;

  // ✅ Check if employee is assigned to this client
  const assignment = await prisma.clientEmployee.findFirst({
    where: {
      clientId,
      userId,
    },
  });

  if (!assignment && session.user.role !== "ADMIN") {
    return Response.json({ error: "Access denied" }, { status: 403 });
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },

    include: {
      employees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
            },
          },
        },
      },

      logs: {
        orderBy: { createdAt: "desc" },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
            },
          },
        },
      },

      projects: {
        include: {
          project: true,
        },
      },
    },
  });

  if (!client) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }

  return Response.json({ client });
}
