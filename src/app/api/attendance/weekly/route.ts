import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { format } from "date-fns";

function startOfWeek(d: Date) {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ records: [] });
  }

  const userId = session.user.id;
  const weekStart = startOfWeek(new Date());

  const records = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: weekStart },
    },
    orderBy: { checkIn: "asc" },
  });

  const result = records.map((r) => {
    const checkIn = new Date(r.checkIn);
    const checkOut = r.checkOut ? new Date(r.checkOut) : new Date();

    const hours =
      (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60);

    return {
      id: r.id,
      date: format(checkIn, "EEEE, d MMM"),
      hours: Number(hours.toFixed(2)),
    };
  });

  return Response.json({ records: result });
}
