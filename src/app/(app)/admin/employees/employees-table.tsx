'use client';

import { useState, useMemo } from 'react';
import { User } from '@prisma/client';
import { EmployeeActionsCell } from './employee-actions-cell';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface EmployeesTableProps {
  employees: User[];
}

export function EmployeesTable({ employees }: EmployeesTableProps) {
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<keyof User | '' >('');

  const filteredEmployees = useMemo(() => {
    let filtered = employees.filter(employee => 
      employee.name?.toLowerCase().includes(filter.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(filter.toLowerCase())
    );

    if (sortBy) {
      filtered = filtered.sort((a, b) => {
        if (a[sortBy] < b[sortBy]) return -1;
        if (a[sortBy] > b[sortBy]) return 1;
        return 0;
      });
    }

    return filtered;
  }, [employees, filter, sortBy]);

  return (
    <div>
      <div className="flex items-center mb-4">
        <Input 
          placeholder="Filter by name or code..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => setSortBy('name')}>Name</TableHead>
              <TableHead onClick={() => setSortBy('employeeCode')}>Employee Code</TableHead>
              <TableHead onClick={() => setSortBy('role')}>Role</TableHead>
              <TableHead onClick={() => setSortBy('status')}>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>{employee.name}</TableCell>
                <TableCell>{employee.employeeCode}</TableCell>
                <TableCell>{employee.role}</TableCell>
                <TableCell>{employee.status}</TableCell>
                <TableCell>
                  <EmployeeActionsCell employee={employee} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
