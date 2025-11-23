"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/page-header";
import { Checkbox } from "@/components/ui/checkbox";

export default function CreateClientPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    companyName: "",
    contactEmail: "",
    contactPhone: "",
    funds: "",
    objective: "",
    notes: "",
    employeeIds: [] as string[],
    projectIds: [] as string[],
    status: "ACTIVE",
  });

  /* -------------------------------------------
   * LOAD EMPLOYEES + PROJECTS
   * ------------------------------------------- */
  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => setEmployees(data.employees || []));

    fetch("/api/allprojects")
      .then((res) => res.json())
      .then((data) => setProjects(data.projects || []));
  }, []);

  /* -------------------------------------------
   * TOGGLE ASSIGN EMPLOYEE
   * ------------------------------------------- */
  const toggleEmployee = (id: string) => {
    setForm((prev) => ({
      ...prev,
      employeeIds: prev.employeeIds.includes(id)
        ? prev.employeeIds.filter((e) => e !== id)
        : [...prev.employeeIds, id],
    }));
  };

  /* -------------------------------------------
   * TOGGLE ASSIGN PROJECT
   * ------------------------------------------- */
  const toggleProject = (id: string) => {
    setForm((prev) => ({
      ...prev,
      projectIds: prev.projectIds.includes(id)
        ? prev.projectIds.filter((p) => p !== id)
        : [...prev.projectIds, id],
    }));
  };

  /* -------------------------------------------
   * SUBMIT NEW CLIENT
   * ------------------------------------------- */
  const submitClient = async () => {
    setLoading(true);

    const res = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        funds: form.funds ? Number(form.funds) : null,
      }),
    });

    const result = await res.json();
    setLoading(false);

    if (!res.ok) {
      alert(result.error || "Something went wrong ❌");
      return;
    }

    alert("Client created successfully ✅");
    window.location.href = "/admin/clients";
  };

  /* -------------------------------------------
   * UI
   * ------------------------------------------- */
  return (
    <div className="p-6">
      <PageHeader
        title="Create Client"
        description="Add a new client and assign employees & projects"
      />

      <div className="max-w-3xl mx-auto mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Details</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* BASIC FIELDS */}
            <Input
              placeholder="Client Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <Input
              placeholder="Company Name"
              value={form.companyName}
              onChange={(e) =>
                setForm({ ...form, companyName: e.target.value })
              }
            />

            <Input
              placeholder="Contact Email"
              type="email"
              value={form.contactEmail}
              onChange={(e) =>
                setForm({ ...form, contactEmail: e.target.value })
              }
            />

            <Input
              placeholder="Contact Phone"
              value={form.contactPhone}
              onChange={(e) =>
                setForm({ ...form, contactPhone: e.target.value })
              }
            />

            <Input
              type="number"
              placeholder="Funds"
              value={form.funds}
              onChange={(e) => setForm({ ...form, funds: e.target.value })}
            />

            <Textarea
              placeholder="Client Objective"
              value={form.objective}
              onChange={(e) =>
                setForm({ ...form, objective: e.target.value })
              }
            />

            <Textarea
              placeholder="Internal Notes"
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />

            {/* ------------------------- */}
            {/* ASSIGN EMPLOYEES & PROJECTS */}
            {/* ------------------------- */}

            <Card>
              <CardHeader>
                <CardTitle>Assign Employees & Projects</CardTitle>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* EMPLOYEES */}
                <div>
                  <h3 className="font-semibold mb-2">Employees</h3>

                  {employees.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No employees found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {employees.map((emp) => (
                        <label key={emp.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={form.employeeIds.includes(emp.id)}
                            onCheckedChange={() => toggleEmployee(emp.id)}
                          />
                          <span>{emp.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* PROJECTS */}
                <div>
                  <h3 className="font-semibold mb-2">Projects</h3>

                  {projects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No projects found.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {projects.map((proj) => (
                        <label
                          key={proj.id}
                          className="flex items-center gap-2"
                        >
                          <Checkbox
                            checked={form.projectIds.includes(proj.id)}
                            onCheckedChange={() => toggleProject(proj.id)}
                          />
                          <span>{proj.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SUBMIT BUTTON */}
            <Button
              onClick={submitClient}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Creating..." : "Create Client"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
