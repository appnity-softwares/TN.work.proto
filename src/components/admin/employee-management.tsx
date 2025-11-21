"use client";

import { useActionState, useState, useEffect } from "react";
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
import { PlusCircle, Trash, Users } from "lucide-react";
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

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);

    if (result.success) {
      toast({ title: "Employee Removed", description: result.message });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } else {
      toast({ variant: "destructive", title: "Error", description: result.message });
    }
  };

  return (
    <Card className="glass">
      <CardHeader className="flex justify-between items-center">
        <CardTitle className="flex items-center gap-2">
          <Users /> All Employees
        </CardTitle>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
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
      </CardHeader>

      <CardContent>
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
            {users.map((user) => (
              <TableRow
                key={user.id}
                onClick={() => router.push(`/admin/employees/${user.id}`)}
                className="cursor-pointer hover:bg-muted"
              >
                <TableCell className="flex items-center gap-2">
                  <Avatar>
                    <AvatarImage src={userAvatar?.imageUrl} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </TableCell>
                <TableCell>{user.employeeCode}</TableCell>
                <TableCell><Badge>{user.role}</Badge></TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteUser(user.id);
                    }}
                  >
                    <Trash className="text-destructive h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

        </Table>
      </CardContent>
    </Card>
  );
}
