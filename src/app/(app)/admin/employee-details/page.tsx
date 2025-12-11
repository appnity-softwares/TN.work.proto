// /Users/kunal/Documents/WORK/studio-TN.proto-main/src/app/(app)/admin/employee-details/page.tsx

import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { db as prisma } from "@/lib/db";
import { EmployeeDetailsTable } from "./details-table";
import { UserWithMeta } from "@/lib/types";

export default async function EmployeeDetailsPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const users = await (prisma.user.findMany as any)({
    where: {
      role: "EMPLOYEE",
      meta: {
        path: ["detailsSubmitted"],
        equals: true,
      },
    },
    select: {
      id: true,
      name: true,
      employeeCode: true,
      role: true,
      status: true,
      joinDate: true,
      meta: true,
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold">Employee Details</h1>
      <p className="text-muted-foreground">
        Review and approve employee details submissions.
      </p>
      <div className="mt-8">
        <EmployeeDetailsTable users={users as UserWithMeta[]} />
      </div>
    </div>
  );
}
