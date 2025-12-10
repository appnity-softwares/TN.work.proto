// /src/app/(app)/admin/employees/[id]/edit/page.tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import EditEmployeeForm from "@/components/admin/EditEmployeeForm";

interface Props {
  params: { id: string };
}

export default async function EmployeeEditPage({ params }: Props) {
  const employee = await db.user.findUnique({ where: { id: params.id } });

  if (!employee) notFound();

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Edit Employee</CardTitle>
        </CardHeader>
        <CardContent>
          {/* server component passes initial data to client form */}
          <EditEmployeeForm initial={employee} />
        </CardContent>
      </Card>
    </div>
  );
}
