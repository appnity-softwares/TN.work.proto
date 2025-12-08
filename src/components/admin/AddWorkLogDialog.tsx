"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddWorkLogSchema } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUsers } from "@/lib/hooks/use-users";

export function AddWorkLogDialog() {
  const [open, setOpen] = useState(false);
  const { users, isLoading: usersLoading } = useUsers();

  const form = useForm({
    resolver: zodResolver(AddWorkLogSchema),
    defaultValues: {
      date: new Date(),
      checkIn: "",
      checkOut: "",
      userId: "",
    },
  });

  const onSubmit = async (data: any) => {
    await fetch("/api/admin/work", {
      method: "POST",
      body: JSON.stringify(data),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Work Log</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Work Log</DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <Input type="date" {...form.register("date")} />
          <Input placeholder="Check In" {...form.register("checkIn")} />
          <Input placeholder="Check Out" {...form.register("checkOut")} />
          <select {...form.register("userId")}>
            {usersLoading ? (
              <option>Loading users...</option>
            ) : (
              users.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))
            )}
          </select>
          <Button type="submit">Submit</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
