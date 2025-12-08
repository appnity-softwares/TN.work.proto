import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET(req: Request) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const day = searchParams.get("day");
  const dateParam = searchParams.get("date");

  // Convert to IST timezone
  const nowIST = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  let targetDate = nowIST;

  if (dateParam) {
    targetDate = new Date(dateParam);
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const nightShiftStart = new Date(startOfDay);
  nightShiftStart.setHours(0, 0, 0, 0);

  const nightShiftEnd = new Date(startOfDay);
  nightShiftEnd.setHours(5, 0, 0, 0);

  let records;

  if (day === "today" || dateParam) {
    records = await prisma.attendance.findMany({
      where: {
        OR: [
          {
            checkIn: {
              gte: startOfDay,
              lte: endOfDay,
            },
          },
          {
            checkIn: {
              gte: nightShiftStart,
              lte: nightShiftEnd,
            },
          },
        ],
      },
      include: { user: true },
      orderBy: { checkIn: "desc" },
    });
  } else {
    const previousStart = new Date(startOfDay);
    previousStart.setDate(previousStart.getDate() - 7);

    records = await prisma.attendance.findMany({
      where: {
        checkIn: {
          gte: previousStart,
          lt: startOfDay,
        },
      },
      include: { user: true },
      orderBy: { checkIn: "desc" },
    });
  }

  const formatted = records.map((r) => ({
    id: r.id,
    employeeName: r.user.name,
    employeeId: r.user.id,
    clockIn: r.checkIn,
    clockOut: r.checkOut,
  }));

  return Response.json(formatted);
}
