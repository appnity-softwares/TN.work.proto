// /src/components/admin/EditEmployeeForm.tsx
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Role } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function EditEmployeeForm({ initial }: any) {
  const [name, setName] = useState(initial.name || "");
  const [email, setEmail] = useState(initial.email || "");
  const [avatar, setAvatar] = useState(initial.avatar || "");
  const [employeeCode, setEmployeeCode] = useState(initial.employeeCode || "");
  const [role, setRole] = useState<Role>(initial.role || Role.EMPLOYEE);
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/employees/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: initial.id,
          name,
          email,
          avatar,
          employeeCode,
          role,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Saved", description: data.message || "Employee updated" });
        router.refresh();
      } else {
        toast({ variant: "destructive", title: "Error", description: data?.message || "Failed to update" });
      }
    } catch (err: any) {
      toast({ variant: "destructive", title: "Network error", description: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <label className="text-sm font-medium">Avatar URL</label>
        <Input value={avatar} onChange={(e) => setAvatar(e.target.value)} placeholder="https://..." />
        <p className="text-xs text-muted-foreground mt-1">Paste an image URL (no direct upload).</p>
      </div>

      <div>
        <label className="text-sm font-medium">Employee Code</label>
        <Input value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} required />
      </div>

      <div>
        <label className="text-sm font-medium">Role</label>
        <Select onValueChange={(v) => setRole(v as Role)} defaultValue={role}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={Role.ADMIN}>Admin</SelectItem>
            <SelectItem value={Role.EMPLOYEE}>Employee</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
        <Button variant="outline" onClick={() => router.push("/admin/employees")}>Back</Button>
      </div>
    </form>
  );
}
