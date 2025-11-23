"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ClientCreateForm({
  users,
  projects,
}: {
  users: any[];
  projects: any[];
}) {
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    funds: "",
    objective: "",
    notes: "",
  });

  const [employeeIds, setEmployeeIds] = useState<string[]>([]);
  const [projectIds, setProjectIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const toggleEmployee = (id: string) => {
    setEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const toggleProject = (id: string) => {
    setProjectIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!form.name) {
      alert("Client name is required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        funds: form.funds ? Number(form.funds) : null,
        employeeIds,
        projectIds,
      }),
    });

    if (res.ok) {
      window.location.href = "/admin/clients";
    } else {
      const data = await res.json();
      alert(data.error || "Failed to create client");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-3xl space-y-6">

      {/* CLIENT INFO */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Client Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div>
          <Label>Company</Label>
          <Input
            value={form.companyName}
            onChange={(e) =>
              setForm({ ...form, companyName: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Email</Label>
          <Input
            value={form.contactEmail}
            onChange={(e) =>
              setForm({ ...form, contactEmail: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Phone</Label>
          <Input
            value={form.contactPhone}
            onChange={(e) =>
              setForm({ ...form, contactPhone: e.target.value })
            }
          />
        </div>

        <div>
          <Label>Funds</Label>
          <Input
            type="number"
            value={form.funds}
            onChange={(e) => setForm({ ...form, funds: e.target.value })}
          />
        </div>

        <div>
          <Label>Objective</Label>
          <Input
            value={form.objective}
            onChange={(e) =>
              setForm({ ...form, objective: e.target.value })
            }
          />
        </div>
      </div>

      {/* NOTES */}
      <div>
        <Label>Notes</Label>
        <textarea
          className="w-full border rounded p-2"
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </div>

      {/* EMPLOYEE ASSIGNMENT */}
      <div>
        <h3 className="font-semibold mb-2">Assign Employees</h3>
        <div className="grid grid-cols-2 gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={employeeIds.includes(u.id)}
                onChange={() => toggleEmployee(u.id)}
              />
              <span>{u.name} ({u.employeeCode})</span>
            </div>
          ))}
        </div>
      </div>

      {/* PROJECT ASSIGNMENT */}
      <div>
        <h3 className="font-semibold mb-2">Assign Projects</h3>
        <div className="grid grid-cols-2 gap-2">
          {projects.map((p) => (
            <div key={p.id} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={projectIds.includes(p.id)}
                onChange={() => toggleProject(p.id)}
              />
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleSubmit} disabled={loading}>
        {loading ? "Creating..." : "Create Client"}
      </Button>
    </div>
  );
}
