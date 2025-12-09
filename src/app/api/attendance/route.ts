import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { format } from "date-fns";

// ---------------------------------------
// ✅ POST — Clock In / Clock Out
// ---------------------------------------
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const { type } = await req.json(); // "checkin" | "checkout"

  if (type === "checkin") {
    const record = await prisma.attendance.create({
      data: { userId, checkIn: new Date() },
    });

    return Response.json(
      { status: "checked_in", record },
      { status: 201 }
    );
  }

  if (type === "checkout") {
    const last = await prisma.attendance.findFirst({
      where: { userId, checkOut: null },
      orderBy: { checkIn: "desc" },
    });

    if (!last) {
      return Response.json(
        { error: "No active session to check out from." },
        { status: 400 }
      );
    }

    const record = await prisma.attendance.update({
      where: { id: last.id },
      data: { checkOut: new Date() },
    });

    return Response.json({ status: "checked_out", record });
  }

  return Response.json({ error: "Invalid type" }, { status: 400 });
}

// ---------------------------------------
// ✅ GET — Weekly Hours (your existing code)
// ---------------------------------------
export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  const now = new Date();
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
  weekStart.setHours(0, 0, 0, 0);

  const records = await prisma.attendance.findMany({
    where: {
      userId,
      checkIn: { gte: weekStart },
    },
    orderBy: { checkIn: "asc" },
  });

  const days: Record<string, number> = {};

  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    days[format(d, "EEEE")] = 0;
  }

  for (const r of records) {
    const key = format(new Date(r.checkIn), "EEEE");
    const checkOut = r.checkOut ?? new Date();
    const ms = new Date(checkOut).getTime() - new Date(r.checkIn).getTime();
    days[key] += ms;
  }

  const result = Object.entries(days).map(([label, ms]) => ({
    label,
    hours: Number((ms / 1000 / 60 / 60).toFixed(2)),
  }));

  return Response.json({ data: result });
}
