import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

interface Params {
  params: { id: string };
}

export async function GET(req: Request, { params }: Params) {
  const session = await getSession();

  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      attendance: {
        orderBy: { checkIn: "desc" }, // Use 'checkIn' if 'date' does not exist
        take: 50,
      },
      workLogs: {
        orderBy: { id: "desc" },
        take: 50,
      },
      projects: true,
      noticesIssued: true,
      logs: true,
    },
  });

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  return Response.json({ user });
}
