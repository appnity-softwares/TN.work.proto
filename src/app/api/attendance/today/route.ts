import prisma from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: today },
    },
    orderBy: { checkIn: "asc" },
  });

  let totalMs = 0;

  for (const r of records) {
    const checkOut = r.checkOut ?? new Date();
    totalMs += new Date(checkOut).getTime() - new Date(r.checkIn).getTime();
  }

  return Response.json({
    hours: Number((totalMs / 1000 / 60 / 60).toFixed(2)),
  });
}
