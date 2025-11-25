"use client";

import { useActionState, useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { User } from "@/lib/types";
import { Role } from "@prisma/client";
import { PlusCircle, Trash, Users, Crown, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { placeholderImages } from "@/lib/placeholder-images";
import { createUser, deleteUser } from "@/app/api/admin-actions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertTriangle } from "lucide-react";

interface EmployeeManagementProps {
  initialUsers: User[];
}

const initialState = { success: false, message: "" };

export function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "role" | "code">("name");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const [createUserState, formAction] = useActionState(createUser, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const userAvatar = placeholderImages.find((p) => p.id === "user-avatar");

  useEffect(() => {
    if (createUserState.success) {
      toast({ title: "Success", description: createUserState.message });
      setOpen(false);
    }
  }, [createUserState, toast]);

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;

    const result = await deleteUser(deleteTarget.id);

    if (result.success) {
      toast({ title: "Employee Removed", description: result.message });
      setUsers((prev) => prev.filter((u) => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  const filteredUsers = useMemo(() => {
    let updated = [...users];

    // Search
    updated = updated.filter(
      (u) =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.employeeCode.toLowerCase().includes(search.toLowerCase())
    );

    // Sorting
    updated.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "role") return a.role.localeCompare(b.role);
      return a.employeeCode.localeCompare(b.employeeCode);
    });

    return updated;
  }, [users, search, sortBy]);

  return (
    <Card className="glass">
      {/* Header */}
      <CardHeader className="flex flex-col md:flex-row items-center justify-between gap-4">
        <CardTitle className="flex items-center gap-2">
          <Users /> All Employees
        </CardTitle>

        <div className="flex gap-3 items-center w-full md:w-auto">
          {/* Search */}
          <Input
            placeholder="Search employees..."
            className="max-w-xs"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Sorting */}
          <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Sort: Name</SelectItem>
              <SelectItem value="role">Sort: Role</SelectItem>
              <SelectItem value="code">Sort: Code</SelectItem>
            </SelectContent>
          </Select>

          {/* Add Employee */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
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
                    <AlertTriangle className="h-4 w-4" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  onClick={() => router.push(`/admin/employees/${user.id}`)}
                  className={`cursor-pointer transition hover:bg-muted hover:shadow-sm border-l-4 ${
                    user.role === Role.ADMIN
                      ? "border-indigo-600"
                      : "border-green-500"
                  }`}
                >
                  <TableCell className="flex items-center gap-2">
                    <Avatar>
                      <AvatarImage src={userAvatar?.imageUrl} />
                      <AvatarFallback>{user.name[0]}</AvatarFallback>
                    </Avatar>
                    {user.name}
                  </TableCell>

                  <TableCell>{user.employeeCode}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        user.role === Role.ADMIN
                          ? "bg-indigo-600 text-white"
                          : "bg-green-600 text-white"
                      }
                    >
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
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteTarget(user);
                      }}
                    >
                      <Trash className="text-destructive h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Employee</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove{" "}
              <strong>{deleteTarget?.name}</strong>?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Yes, Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
