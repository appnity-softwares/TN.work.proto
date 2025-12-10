// /src/components/admin/EmployeeTable.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Table, TableHeader, TableBody, TableRow, TableCell, TableHead } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Edit, KeyRound, UserX, RefreshCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export type EmployeeListItem = {
  id: string;
  name: string;
  email?: string | null;
  employeeCode: string;
  role: "ADMIN" | "EMPLOYEE";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  avatar?: string | null;
};

export function EmployeeTable({ employees }: { employees: EmployeeListItem[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const refresh = () => router.refresh();

  async function postAction(endpoint: string, payload: any) {
    setLoadingId(payload.userId);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success !== false) {
        toast({ title: "Success", description: data.message || "Done" });
        refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: data.message || "Action failed" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Error", description: err?.message || "Network error" });
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden sm:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((u) => (
            <TableRow key={u.id} className="group hover:bg-slate-50">
              <TableCell className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {u.avatar ? <AvatarImage src={u.avatar} /> : null}
                  <AvatarFallback>{u.name?.[0] ?? "U"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{u.name}</div>
                  <div className="text-xs text-muted-foreground">{u.employeeCode}</div>
                </div>
              </TableCell>

              <TableCell className="hidden sm:table-cell">{u.email ?? "—"}</TableCell>

              <TableCell className="hidden md:table-cell">
                <Badge className="px-2 py-1">
                  {u.role === "ADMIN" ? "Admin" : "Employee"}
                </Badge>
              </TableCell>

              <TableCell>
                <Badge
                  variant={u.status === "ACTIVE" ? "default" : u.status === "SUSPENDED" ? "secondary" : "destructive"}
                >
                  {u.status}
                </Badge>
              </TableCell>

              <TableCell className="w-0">
                {/* Hover-only three-dot menu */}
                <div className="flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition">
                        <MoreVertical className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/admin/employees/${u.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" /> View Profile
                      </DropdownMenuItem>

                      <DropdownMenuItem onClick={() => router.push(`/admin/employees/${u.id}/edit`)}>
                        <Edit className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => postAction("/api/auth/reset-password/request", { userId: u.id })}
                      >
                        <KeyRound className="mr-2 h-4 w-4" /> Send Reset Link
                      </DropdownMenuItem>

                      {u.status !== "SUSPENDED" ? (
                        <DropdownMenuItem
                          onClick={() => {
                            const reason = window.prompt("Reason for suspension (optional):") || "Suspended by admin";
                            postAction("/api/admin/employees/suspend", { userId: u.id, reason });
                          }}
                        >
                          <UserX className="mr-2 h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem onClick={() => postAction("/api/admin/employees/unsuspend", { userId: u.id })}>
                          <RefreshCcw className="mr-2 h-4 w-4" /> Unsuspend
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem onClick={() => postAction("/api/admin/employees/deactivate", { userId: u.id })}>
                        <UserX className="mr-2 h-4 w-4" /> Deactivate
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
