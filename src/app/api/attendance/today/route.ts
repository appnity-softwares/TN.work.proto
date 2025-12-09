import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

const IST_OFFSET_MINUTES = 330; // UTC +5:30

function getISTDayRange() {
  const now = new Date();

  // Convert current UTC time to IST
  const istTime = new Date(now.getTime() + IST_OFFSET_MINUTES * 60 * 1000);

  // Start of day in IST
  const startIST = new Date(istTime);
  startIST.setHours(0, 0, 0, 0);

  // End of day in IST
  const endIST = new Date(istTime);
  endIST.setHours(23, 59, 59, 999);

  // Convert back to UTC for database comparison
  const startUTC = new Date(startIST.getTime() - IST_OFFSET_MINUTES * 60 * 1000);
  const endUTC = new Date(endIST.getTime() - IST_OFFSET_MINUTES * 60 * 1000);

  return { startUTC, endUTC };
}

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  const { startUTC, endUTC } = getISTDayRange();

  const records = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: {
        gte: startUTC,
        lte: endUTC,
      },
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
