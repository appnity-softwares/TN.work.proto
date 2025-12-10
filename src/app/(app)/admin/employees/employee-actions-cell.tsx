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
import { deactivateUser, suspendUser, resetPasswordCustom, activateUser, unsuspendUser } from './actions';

export function EmployeeActionsCell({ employee }: { employee: User }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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

  const handleResetPassword = async () => {
    if (!newPassword) return alert("Enter a password");
    const result = await resetPasswordCustom(employee.id, newPassword);
    alert(result.message);
    setShowPasswordModal(false);
    setNewPassword('');
  };

  return (
    <>
      {/* Action Dropdown */}
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

          <DropdownMenuItem onClick={() => setShowPasswordModal(true)}>
            Reset Password (Custom)
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

      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
          <div className="bg-white p-6 rounded-xl shadow-lg space-y-4 w-[350px]">
            <h2 className="font-semibold">Set New Password</h2>
            <input
              className="border px-3 py-2 rounded w-full"
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
              <Button onClick={handleResetPassword}>Update</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
