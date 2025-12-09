import { db as prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return Response.json({ status: "out" });
  }

  const userId = session.user.id;

  const record = await prisma.attendance.findFirst({
    where: {
      userId,
      checkIn: { not: undefined },   // ✅ correct "not null" workaround
    },
    orderBy: { checkIn: "desc" },
  });

  if (!record) {
    return Response.json({ status: "out" });
  }

  if (record.checkIn && !record.checkOut) {
    return Response.json({ status: "in" });
  }

  return Response.json({ status: "out" });
}
