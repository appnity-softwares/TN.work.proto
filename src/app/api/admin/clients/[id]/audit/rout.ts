import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(_: Request, { params }: any) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  const audits = await prisma.clientAudit.findMany({
    where: { clientId: params.id },
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ audits });
}
