'use client';

import { useEffect, useState } from 'react';
import { User } from '@prisma/client';
import { EmployeesTable } from './employees-table';
import { AdminsTable } from './admins-table';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const response = await fetch('/api/employees');
      const data = await response.json();
      const allEmployees = data.employees;
      setEmployees(allEmployees.filter((user: User) => user.role === 'EMPLOYEE'));
      setAdmins(allEmployees.filter((user: User) => user.role === 'ADMIN' || user.role === 'SUPERADMIN'));
    }

    fetchUsers();
  }, []);

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Employees</h1>
      <EmployeesTable employees={employees} />
      <div className="mt-10">
        <AdminsTable admins={admins} />
      </div>
    </div>
  );
}
