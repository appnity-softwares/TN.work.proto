// src/components/admin/employee-management.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images';
import { createUser } from '@/app/api/admin-actions';
import { requestEmployeeDetailsUpdate } from '@/app/api/employee-actions';
import {
  deactivateUser,
  suspendUser,
  requestPasswordReset,
} from '@/app/(app)/admin/employees/actions';
import { User as UserType } from '@/lib/types';
import { Role } from '@prisma/client';
import { PlusCircle, Users, Crown, User as UserIcon, Edit, KeyRound, UserX, Ban, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmployeeManagementProps {
  initialUsers: UserType[];
}

// small helper to safely string values that may be null/undefined
const safeStr = (v?: string | null) => (v ?? '').toString();

export function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
  const [users, setUsers] = useState<UserType[]>(initialUsers || []);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'role' | 'code'>('name');
  const [actionTarget, setActionTarget] = useState<{
    user: UserType;
    action: 'deactivate' | 'reset' | 'suspend' | 'edit';
  } | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [createUserState, formAction] = useActionState(createUser, { success: false, message: '' });
  const { toast } = useToast();
  const router = useRouter();
  const userAvatar = placeholderImages.find((p) => p.id === 'user-avatar');

  // debounce logic
  const debounceRef = useRef<number | undefined>();
  useEffect(() => {
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => setDebouncedSearch(search.trim().toLowerCase()), 300);
    return () => window.clearTimeout(debounceRef.current);
  }, [search]);

  // react to createUser success
  useEffect(() => {
    if (createUserState.success) {
      toast({ title: 'Success', description: createUserState.message });
      setOpen(false);
      router.refresh();
    } else if (createUserState.message && !createUserState.success) {
      toast({ variant: 'destructive', title: 'Error', description: createUserState.message });
    }
  }, [createUserState, toast, router]);

  // action handler wrapper
  const handleAction = async () => {
    if (!actionTarget) return;

    const { user, action } = actionTarget;
    let result: { success: boolean; message?: string } | undefined;

    try {
      if (action === 'deactivate') {
        result = await deactivateUser(user.id);
      } else if (action === 'reset') {
        result = await requestPasswordReset(user.id);
      } else if (action === 'suspend') {
        result = await suspendUser(user.id, suspensionReason);
      } else if (action === 'edit') {
        result = await requestEmployeeDetailsUpdate(user.id);
      }

      if (result?.success) {
        toast({ title: 'Success', description: result.message || 'Done' });
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: result?.message || 'An unknown error occurred.',
        });
      }
    } catch (err: any) {
      console.error('Action error:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: err?.message || 'An unexpected error occurred.',
      });
    } finally {
      setActionTarget(null);
      setSuspensionReason('');
    }
  };

  // filter + sort
  const filteredUsers = useMemo(() => {
    const q = debouncedSearch;

    let filtered = users.filter((u) => {
      const name = safeStr(u.name).toLowerCase();
      const code = safeStr((u as any).employeeCode).toLowerCase();
      const email = safeStr((u as any).email).toLowerCase();
      const status = safeStr((u as any).status).toLowerCase();

      if (!q) return true;
      return (
        name.includes(q) ||
        code.includes(q) ||
        email.includes(q) ||
        status.includes(q)
      );
    });

    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return safeStr(a.name).localeCompare(safeStr(b.name));
      }
      if (sortBy === 'role') {
        return safeStr(a.role).localeCompare(safeStr(b.role));
      }
      // code
      return safeStr((a as any).employeeCode).localeCompare(safeStr((b as any).employeeCode));
    });

    return filtered;
  }, [users, debouncedSearch, sortBy]);

  return (
    <Card className="glass">
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Users /> All Employees
        </CardTitle>

        <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
          <Input
            placeholder="Search by name, code, email or status..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-full sm:w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="role">Sort: Role</SelectItem>
              <SelectItem value="code">Sort: Code</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Employee</DialogTitle>
                <DialogDescription>Create a new employee account.</DialogDescription>
              </DialogHeader>

              <form action={formAction} className="space-y-3">
                {createUserState.message && !createUserState.success && (
                  <Alert variant="destructive">
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{createUserState.message}</AlertDescription>
                  </Alert>
                )}

                <Input name="name" placeholder="Name" required />
                <Input name="employeeCode" placeholder="Employee Code" required />
                <Input name="passcode" type="password" placeholder="Passcode" required />

                <Select name="role" defaultValue={Role.EMPLOYEE}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                    <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
                  </SelectContent>
                </Select>

                <DialogFooter>
                  <Button type="submit">Create</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {filteredUsers.length === 0 ? (
          <div className="text-center py-10 space-y-3">
            <Users className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="text-muted-foreground">No Employees Found</p>
            <Button onClick={() => setOpen(true)}>Add First Employee</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Code</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredUsers.map((user) => {
                  const displayName = safeStr(user.name);
                  const displayCode = safeStr((user as any).employeeCode);
                  const avatarInitial = displayName ? displayName[0].toUpperCase() : '?';

                  return (
                    <TableRow
                      key={user.id}
                      className={`border-l-4 ${user.role === Role.ADMIN ? 'border-indigo-600' : 'border-green-500'}`}
                    >
                      <TableCell className="flex items-center gap-2">
                        <Avatar>
                          <AvatarImage src={userAvatar?.imageUrl} alt={displayName} />
                          <AvatarFallback>{avatarInitial}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p>{displayName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {displayCode}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="hidden sm:table-cell">{displayCode}</TableCell>

                      <TableCell className="hidden md:table-cell">
                        <Badge className={user.role === Role.ADMIN ? 'bg-indigo-600 text-white' : 'bg-green-600 text-white'}>
                          {user.role === Role.ADMIN ? (
                            <span className="flex items-center gap-1">
                              <Crown className="h-3 w-3" /> Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" /> Employee
                            </span>
                          )}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={user.status === 'ACTIVE' ? 'default' : user.status === 'SUSPENDED' ? 'secondary' : 'destructive'}
                        >
                          {user.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="flex gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => router.push(`/admin/employees/${user.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionTarget({ user, action: 'edit' });
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionTarget({ user, action: 'reset' });
                          }}
                        >
                          <KeyRound className="text-blue-500 h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionTarget({ user, action: 'suspend' });
                          }}
                          disabled={user.status === 'SUSPENDED'}
                        >
                          <Ban className="text-yellow-500 h-4 w-4" />
                        </Button>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActionTarget({ user, action: 'deactivate' });
                          }}
                          disabled={user.status === 'INACTIVE'}
                        >
                          <UserX className="text-destructive h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* confirm dialog */}
      <Dialog open={!!actionTarget} onOpenChange={() => setActionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Action</DialogTitle>
            <DialogDescription>
              Are you sure you want to{' '}
              {actionTarget?.action === 'edit'
                ? `send an email to ${safeStr(actionTarget.user.name)} to edit their details?`
                : `${actionTarget?.action} ${safeStr(actionTarget?.user?.name)}'s account?`}
              {actionTarget?.action === 'reset' && " A password reset link will be sent to their email."}
            </DialogDescription>
          </DialogHeader>

          {actionTarget?.action === 'suspend' && (
            <div className="space-y-2">
              <label htmlFor="suspensionReason">Reason for Suspension</label>
              <Textarea
                id="suspensionReason"
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Enter the reason for suspending this user."
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setActionTarget(null)}>
              Cancel
            </Button>
            <Button
              variant={actionTarget?.action === 'deactivate' || actionTarget?.action === 'suspend' ? 'destructive' : 'default'}
              onClick={handleAction}
            >
              Yes, Proceed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default EmployeeManagement;
