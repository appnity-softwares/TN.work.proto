import { getSession } from "@/lib/session";
import prisma from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });

  const records = await prisma.attendance.findMany({
    where: { userId: session.user.id },
    orderBy: { checkIn: "desc" }
  });

  const rows = [
    ["Date", "Check In", "Check Out", "Hours"]
  ];

  for (const r of records) {
    const checkIn = new Date(r.checkIn);
    const checkOut = r.checkOut ? new Date(r.checkOut) : new Date();

    const hours =
      (checkOut.getTime() - checkIn.getTime()) / 1000 / 60 / 60;

    rows.push([
      checkIn.toDateString(),
      checkIn.toLocaleTimeString(),
      r.checkOut ? checkOut.toLocaleTimeString() : "—",
      hours.toFixed(2)
    ]);
  }

  const csv = rows.map((r) => r.join(",")).join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=attendance.csv"
    }
  });
}
