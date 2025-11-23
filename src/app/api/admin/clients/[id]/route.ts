import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

type RouteContext = {
  params: { id: string }; // ❌ remove Promise<>, params are sync
};

// -----------------------------------------
// GET: Fetch single client by ID (Admin only)
// -----------------------------------------
export async function GET(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = context.params;

  console.log("📍 Fetching client:", id);

  // Special forward case
  if (id === "export-all") {
    return Response.json(
      { error: "Forwarded to /export-all" },
      { status: 400 }
    );
  }

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      employees: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              employeeCode: true,
              role: true,
            },
          },
        },
      },
      projects: {
        include: { project: true },
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
    },
  });

  if (!client) {
    return Response.json({ error: "Client not found" }, { status: 404 });
  }

  return Response.json({ client });
}

// -----------------------------------------
// PUT: Update client (Admin only)
// -----------------------------------------
export async function PUT(req: Request, context: RouteContext) {
  const session = await getSession();

  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = context.params;
  const body = await req.json();

  console.log("✏ Updating client:", id);

  const updated = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      companyName: body.companyName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      objective: body.objective,
      notes: body.notes,
      funds: body.funds ? Number(body.funds) : null,
      status: body.status,
    },
  });

  return Response.json({ success: true, updated });
}
