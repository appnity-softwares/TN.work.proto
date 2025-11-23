import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

interface Params {
  params: { id: string };
}

export async function POST(req: Request, { params }: Params) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: clientId } = params;

  try {
    const body = await req.json();
    const employeeIds: string[] = body.employeeIds || [];
    const projectIds: string[] = body.projectIds || [];

    await prisma.$transaction([
      prisma.clientEmployee.deleteMany({ where: { clientId } }),
      prisma.clientProject.deleteMany({ where: { clientId } }),
      employeeIds.length
        ? prisma.clientEmployee.createMany({
            data: employeeIds.map((userId) => ({ clientId, userId })),
          })
        : prisma.$queryRaw`SELECT 1`,
      projectIds.length
        ? prisma.clientProject.createMany({
            data: projectIds.map((projectId) => ({ clientId, projectId })),
          })
        : prisma.$queryRaw`SELECT 1`,
    ]);

    return Response.json({ success: true });
  } catch (error) {
    console.error("Error assigning client relations:", error);
    return Response.json(
      { error: "Failed to assign employees/projects" },
      { status: 500 }
    );
  }
}
