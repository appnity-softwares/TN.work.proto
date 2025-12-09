import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { format } from "date-fns";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const records = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: firstDay, lt: nextMonth },
    },
    orderBy: { checkIn: "asc" },
  });

  const days: Record<string, number> = {};

  for (const r of records) {
    const day = format(new Date(r.checkIn), "d MMM");

    const checkOut =
      r.checkOut ??
      new Date(); // still clocked in → count time up to now

    const ms = new Date(checkOut).getTime() - new Date(r.checkIn).getTime();

    days[day] = (days[day] || 0) + ms;
  }

  const result = Object.entries(days).map(([date, ms]) => ({
    date,
    hours: Number((ms / 1000 / 60 / 60).toFixed(2)),
  }));

  return Response.json({ data: result });
}
