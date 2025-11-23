"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ---------------- STATUS OPTIONS ---------------- */
const STATUS_OPTIONS = [
  "ACTIVE",
  "ON_HOLD",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

export default function ClientProfile({ client }: { client: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState(client.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // ------------------------------
  // LOG FORM STATE
  // ------------------------------
  const [form, setForm] = useState({
    objective: "",
    demand: "",
    request: "",
    response: "",
    amount: "",
  });

  // ------------------------------
  // ASSIGNMENT STATE
  // ------------------------------
  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  /* ---------------- Load employees + projects ---------------- */
  useEffect(() => {
    loadOptions();

    const empIds = client.employees.map((e: any) => e.userId);
    const projIds = client.projects.map((p: any) => p.projectId);

    setSelectedEmployees(empIds);
    setSelectedProjects(projIds);
  }, []);

  async function loadOptions() {
    const [empRes, projRes] = await Promise.all([
      fetch("/api/employees"),
      fetch("/api/allprojects"),
    ]);

    const empData = await empRes.json();
    const projectData = await projRes.json();

    setEmployees(empData.employees);
    setProjects(projectData.projects);
  }

  /* ---------------- UPDATE CLIENT STATUS ---------------- */
  async function updateStatus() {
    setUpdatingStatus(true);

    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      alert("Failed to update status");
    } else {
      alert("Client status updated ✅");
    }

    setUpdatingStatus(false);
  }

  /* ---------------- ASSIGN SUBMIT ---------------- */
  async function saveAssignments() {
    setSavingAssignments(true);

    const res = await fetch(`/api/admin/clients/${client.id}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeIds: selectedEmployees,
        projectIds: selectedProjects,
      }),
    });

    if (!res.ok) {
      alert("Failed to update assignments");
    } else {
      alert("Assignments updated successfully ✅");
      window.location.reload();
    }

    setSavingAssignments(false);
  }

  /* ---------------- LOG SUBMIT ---------------- */
  async function submitLog() {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) => fd.append(key, value));

    if (file) fd.append("file", file);

    const res = await fetch(`/api/admin/clients/${client.id}/logs`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      alert("Failed to add log");
      return;
    }

    alert("Log added successfully ✅");
    window.location.reload();
  }

  /* ---------------- Toggle functions ---------------- */
  function toggleEmployee(id: string) {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  }

  function toggleProject(id: string) {
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  const exportPDF = () => {
    window.open(`/api/admin/clients/${client.id}/export`, "_blank");
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 space-y-10">

      {/* ---------------- CLIENT NAME + STATUS ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            {client.name}
            <span className="text-sm px-3 py-1 rounded bg-muted text-muted-foreground">
              {client.status}
            </span>
          </CardTitle>
        </CardHeader>
      </Card>

      {/* ACTION BUTTONS */}
      <div className="flex gap-4">
        <Button onClick={exportPDF}>Download Client Profile PDF</Button>
        <a href={`/admin/clients/${client.id}/edit`}>
          <Button variant="secondary">Edit Client</Button>
        </a>
      </div>

      {/* ------------------ CLIENT STATUS ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Client Status</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 max-w-md">
          <p className="text-sm text-muted-foreground">
            Current Status: <strong>{client.status}</strong>
          </p>

          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={updateStatus}
            disabled={updatingStatus}
            className="w-full"
          >
            {updatingStatus ? "Updating..." : "Update Status"}
          </Button>
        </CardContent>
      </Card>

      {/* ------------------ ASSIGNMENT SECTION ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Employees & Projects</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* EMPLOYEES */}
          <div>
            <h3 className="font-semibold mb-2">Employees</h3>

            {employees.length === 0 ? (
              <p className="text-sm text-muted-foreground">No employees found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {employees.map((emp) => (
                  <label key={emp.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedEmployees.includes(emp.id)}
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
              <p className="text-sm text-muted-foreground">No projects found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {projects.map((proj) => (
                  <label key={proj.id} className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedProjects.includes(proj.id)}
                      onCheckedChange={() => toggleProject(proj.id)}
                    />
                    <span>{proj.name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <Button disabled={savingAssignments} onClick={saveAssignments}>
            {savingAssignments ? "Saving..." : "Save Assignments"}
          </Button>
        </CardContent>
      </Card>

      {/* ------------------ ADD LOG FORM ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Add Client Log</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {["Objective", "Demand", "Request", "Response"].map((field, idx) => (
            <input
              key={idx}
              placeholder={field}
              className="border p-2 rounded w-full"
              onChange={(e) =>
                setForm({ ...form, [field.toLowerCase()]: e.target.value })
              }
            />
          ))}

          <input
            placeholder="Amount"
            type="number"
            className="border p-2 rounded w-full"
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="file"
            className="border p-2 rounded w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={submitLog}>Add Client Log</Button>
        </CardContent>
      </Card>

      {/* ------------------ LOG HISTORY ------------------ */}
      <Card>
        <CardHeader>
          <CardTitle>Client Logs</CardTitle>
        </CardHeader>

        <CardContent>
          {client.logs.length === 0 ? (
            <p>No logs added yet.</p>
          ) : (
            client.logs.map((log: any) => (
              <div key={log.id} className="border rounded p-3 mb-4">

                {/* CREATOR */}
                {log.createdBy && (
                  <p className="text-sm text-gray-600 mb-2">
                    <b>By:</b> {log.createdBy.name} ({log.createdBy.employeeCode})
                  </p>
                )}

                <p><b>Objective:</b> {log.objective}</p>
                <p><b>Demand:</b> {log.demand}</p>
                <p><b>Request:</b> {log.request}</p>
                <p><b>Response:</b> {log.response}</p>
                <p><b>Amount:</b> INR{log.amount}</p>

                {log.attachments?.file && (
                  <a
                    href={log.attachments.file}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View Attachment
                  </a>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
