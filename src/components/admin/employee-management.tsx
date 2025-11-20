"use client";

import { useActionState, useState, useEffect, useTransition } from "react";
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
import { Label } from "@/components/ui/label";
import { User } from "@/lib/types";
import { Role } from "@prisma/client";
import { PlusCircle, Trash, Users, Loader2 } from "lucide-react";
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

const initialState = {
  success: false,
  message: "",
};

function SubmitButton() {
    const [isPending, startTransition] = useTransition();
    
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        // This is a workaround for a bug in Next.js where the form is not submitted
        // when the button is clicked.
        if (event.currentTarget.form) {
             event.currentTarget.form.requestSubmit();
        }
    }
    return (
        <Button type="submit" disabled={isPending} onClick={handleClick}>
            {isPending ? <Loader2 className="animate-spin" /> : "Create Account"}
        </Button>
    )
}


export function EmployeeManagement({ initialUsers }: EmployeeManagementProps) {
  const [users, setUsers] = useState(initialUsers);
  const [open, setOpen] = useState(false);
  const [createUserState, formAction] = useActionState(createUser, initialState);
  const { toast } = useToast();
  const userAvatar = placeholderImages.find((p) => p.id === "user-avatar");

  useEffect(() => {
    if (createUserState.message) {
      if (createUserState.success) {
        toast({
          title: "Success",
          description: createUserState.message,
        });
        setOpen(false);
        // We rely on revalidatePath to update the user list
      } else {
        // Error is shown inside the dialog
      }
    }
  }, [createUserState, toast]);

  const handleDeleteUser = async (userId: string) => {
    const result = await deleteUser(userId);
    if (result.success) {
        toast({
            title: "Employee Removed",
            description: result.message,
        });
        setUsers(users.filter(user => user.id !== userId));
    } else {
        toast({
            variant: "destructive",
            title: "Error",
            description: result.message,
        });
    }
  };

  return (
    <Card className="glass">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="font-headline flex items-center gap-2">
            <Users className="h-6 w-6" />
            All Employees
          </CardTitle>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Employee</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new employee account.
              </DialogDescription>
            </DialogHeader>
            <form action={formAction}>
              <div className="grid gap-4 py-4">
                {createUserState.message && !createUserState.success && (
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{createUserState.message}</AlertDescription>
                    </Alert>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="employeeCode" className="text-right">
                    Emp. Code
                  </Label>
                  <Input
                    id="employeeCode"
                    name="employeeCode"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="passcode" className="text-right">
                    Passcode
                  </Label>
                  <Input
                    id="passcode"
                    name="passcode"
                    type="password"
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="role" className="text-right">
                    Role
                  </Label>
                  <Select name="role" defaultValue={Role.EMPLOYEE}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                      <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <SubmitButton />
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
              <TableHead>Employee Code</TableHead>
              <TableHead>Role</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={userAvatar?.imageUrl}
                      alt={user.name}
                      data-ai-hint={userAvatar?.imageHint}
                    />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </TableCell>
                <TableCell>{user.employeeCode}</TableCell>
                <TableCell>
                  <Badge
                    variant={user.role === "ADMIN" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    <Trash className="h-4 w-4 text-destructive" />
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