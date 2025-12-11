'use client';

import { User } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface AdminsTableProps {
  admins: User[];
}

export function AdminsTable({ admins }: AdminsTableProps) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Admins</h2>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.email}</TableCell>
                <TableCell>{admin.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
