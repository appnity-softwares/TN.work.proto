import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import prisma from "@/lib/db";
import { EmployeeProfile } from "@/components/admin/employee-profile";

interface Props {
  params: { id: string };
}

export default async function EmployeeProfilePage({ params }: Props) {
  const session = await getSession();

  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      attendance: {
        orderBy: { checkIn: "desc" },
      },
      workLogs: {
        orderBy: { date: "desc" },
      },
    },
  });

  if (!user) notFound();

  return <EmployeeProfile user={user} />;
}
