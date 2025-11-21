import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.attendance.findMany({
    include: { user: true },
    orderBy: { checkIn: "desc" },
  });

  const formatted = records.map((r) => ({
    id: r.id,
    employeeName: r.user.name,
    clockIn: r.checkIn,
    clockOut: r.checkOut,
  }));

  return Response.json(formatted);
}
