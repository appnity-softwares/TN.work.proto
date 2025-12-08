"use client";

import { useEmployees } from "@/lib/hooks/use-employees";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function EmployeeManager() {
  const { employees, isLoading, isError } = useEmployees();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading employees</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map((employee: any) => (
          <div key={employee.id} className="p-4 border rounded-lg flex items-center gap-4">
            <Avatar>
              <AvatarImage src={employee.image} alt={employee.name} />
              <AvatarFallback>{employee.name[0]}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-lg font-semibold">{employee.name}</h2>
              <p className="text-sm text-gray-500">{employee.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
