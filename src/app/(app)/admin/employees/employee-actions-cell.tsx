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

import {
  deactivateUser,
  suspendUser,
  activateUser,
  unsuspendUser,
  requestPasswordReset
} from './actions';

export function EmployeeActionsCell({ employee }: { employee: User }) {
  const [loading, setLoading] = useState(false);

  const handleDeactivate = async () => {
    if (confirm('Deactivate this user?')) {
      const result = await deactivateUser(employee.id);
      alert(result.message);
    }
  };

  const handleActivate = async () => {
    if (confirm('Activate this user?')) {
      const result = await activateUser(employee.id);
      alert(result.message);
    }
  };

  const handleSuspend = async () => {
    const reason = prompt('Reason for suspension:');
    if (reason) {
      const result = await suspendUser(employee.id, reason);
      alert(result.message);
    }
  };

  const handleUnsuspend = async () => {
    if (confirm('Remove suspension?')) {
      const result = await unsuspendUser(employee.id);
      alert(result.message);
    }
  };

  const handleSendResetLink = async () => {
    setLoading(true);
    const result = await requestPasswordReset(employee.id);
    setLoading(false);
    alert(result.message);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(employee.id)}>
            Copy Employee ID
          </DropdownMenuItem>

          {/* NEW → Send token reset link */}
          <DropdownMenuItem onClick={handleSendResetLink} disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </DropdownMenuItem>

          {employee.status !== 'SUSPENDED' && (
            <DropdownMenuItem onClick={handleSuspend}>Suspend</DropdownMenuItem>
          )}

          {employee.status === 'SUSPENDED' && (
            <DropdownMenuItem onClick={handleUnsuspend}>Unsuspend</DropdownMenuItem>
          )}

          {employee.status === 'ACTIVE' ? (
            <DropdownMenuItem onClick={handleDeactivate}>Deactivate</DropdownMenuItem>
          ) : (
            <DropdownMenuItem onClick={handleActivate}>Activate</DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
