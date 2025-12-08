import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { EmployeeProfile } from "@/components/admin/employee-profile";
import { subDays } from 'date-fns';

interface Props {
  params: { id: string };
}

export default async function EmployeeProfilePage({ params }: Props) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  const thirtyDaysAgo = subDays(new Date(), 30);

  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      attendance: {
        where: {
          checkIn: {
            gte: thirtyDaysAgo,
          },
        },
        orderBy: { checkIn: "desc" },
      },
      workLogs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) notFound();

  // Get all attendance for the calendar view and lifetime stats
  const allAttendance = await db.attendance.findMany({
    where: { userId: params.id },
    orderBy: { checkIn: 'asc' },
  });

  return <EmployeeProfile user={user} allAttendance={allAttendance} />;
}
