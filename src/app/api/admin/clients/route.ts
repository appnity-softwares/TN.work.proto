import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

// -----------------------------------------
// GET: Fetch all clients (Admin only)
// -----------------------------------------
export async function GET() {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const clients = await prisma.client.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          logs: true,
          employees: true,
          projects: true,
        },
      },
    },
  });

  return Response.json({ clients });
}

// -----------------------------------------
// POST: Create a new client (Admin only)
// -----------------------------------------
export async function POST(req: Request) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await req.json();

    const {
      name,
      companyName,
      contactEmail,
      contactPhone,
      status,
      funds,
      objective,
      notes,
      employeeIds = [],
      projectIds = [],
    } = body;

    if (!name) {
      return Response.json(
        { error: "Client name is required" },
        { status: 400 }
      );
    }

    // ✅ Create main client
    const client = await prisma.client.create({
      data: {
        name,
        companyName,
        contactEmail,
        contactPhone,
        status,
        funds: funds ? Number(funds) : null,   // ✅ FIX
        objective,
        notes,
      },
    });

    // ✅ Assign employees & projects if any selected
    if (employeeIds.length > 0 || projectIds.length > 0) {
      const operations = [];

      if (employeeIds.length > 0) {
        operations.push(
          prisma.clientEmployee.createMany({
            data: employeeIds.map((userId: string) => ({
              clientId: client.id,
              userId,
            })),
            skipDuplicates: true,
          })
        );
      }

      if (projectIds.length > 0) {
        operations.push(
          prisma.clientProject.createMany({
            data: projectIds.map((projectId: string) => ({
              clientId: client.id,
              projectId,
            })),
            skipDuplicates: true,
          })
        );
      }

      await prisma.$transaction(operations);
    }

    return Response.json(
      {
        success: true,
        client,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating client:", error);

    return Response.json(
      { error: "Failed to create client" },
      { status: 500 }
    );
  }
}
