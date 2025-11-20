import { PageHeader } from "@/components/page-header";
import { EmployeeManagement } from "@/components/admin/employee-management";
import { getUsers } from "@/lib/data";

export default async function EmployeesPage() {
  const users = await getUsers();

  return (
    <div className="flex flex-col h-full">
      <PageHeader
        title="Employee Management"
        description="Create, view, and manage employee accounts."
      />
      <div className="flex-1 overflow-y-auto p-6">
        <EmployeeManagement initialUsers={users} />
      </div>
    </div>
  );
}
