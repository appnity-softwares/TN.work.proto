'use client';

import { useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@prisma/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Role } from '@prisma/client';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { updateUser } from '../../actions';

interface EditEmployeeFormProps {
  employee: User;
}

const initialState = { success: false, message: '' };

export function EditEmployeeForm({ employee }: EditEmployeeFormProps) {
  const [state, formAction] = useActionState(updateUser, initialState);
  const router = useRouter();

  if (state.success) {
    router.push('/admin/employees');
  }

  return (
    <form action={formAction} className="space-y-4">
        <input type="hidden" name="id" value={employee.id} />
      {state.message && !state.success && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="name">Name</label>
        <Input id="name" name="name" defaultValue={employee.name} required />
      </div>

      <div className="space-y-2">
        <label htmlFor="employeeCode">Employee Code</label>
        <Input id="employeeCode" name="employeeCode" defaultValue={employee.employeeCode} required />
      </div>

      <div className="space-y-2">
        <label htmlFor="role">Role</label>
        <Select name="role" defaultValue={employee.role}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
                <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <Button type="submit">Update Employee</Button>
    </form>
  );
}
