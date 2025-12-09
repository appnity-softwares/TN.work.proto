import { db as prisma } from "@/lib/db";

export async function getEmployeeProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      attendance: { orderBy: { checkIn: "desc" } },
      workLogs: { orderBy: { date: "desc" } }
    }
  });

  if (!user) throw new Error("User not found");

  const totalMs = user.attendance.reduce((sum, r) => {
    if (!r.checkOut) return sum;
    return sum + (r.checkOut.getTime() - r.checkIn.getTime());
  }, 0);

  return {
    user,
    attendance: user.attendance,
    workLogs: user.workLogs,
    totalHours: (totalMs / (1000 * 60 * 60)).toFixed(2),
  };
}
