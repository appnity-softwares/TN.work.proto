'use client';

import { useState } from 'react';
import { User } from '@prisma/client';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { deactivateUser, suspendUser, resetPassword } from './actions';

interface EmployeeActionsCellProps {
  employee: User;
}

export function EmployeeActionsCell({ employee }: EmployeeActionsCellProps) {
  const [isSuspended, setIsSuspended] = useState(employee.status === 'SUSPENDED');

  const handleDeactivate = async () => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      const result = await deactivateUser(employee.id);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  const handleSuspend = async () => {
    const reason = window.prompt('Please provide a reason for suspension:');
    if (reason) {
      const result = await suspendUser(employee.id, reason);
      if (result.success) {
        setIsSuspended(true);
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  const handleResetPassword = async () => {
    if (window.confirm("Are you sure you want to reset this user's password?")) {
      const result = await resetPassword(employee.id);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(employee.id)}>
          Copy Employee ID
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleResetPassword}>Reset Password</DropdownMenuItem>
        {!isSuspended && (
          <DropdownMenuItem onClick={handleSuspend}>Suspend</DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDeactivate}>Deactivate</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
