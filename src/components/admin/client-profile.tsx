"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  FileText,
  Users,
  FolderKanban,
  CircleDollarSign,
} from "lucide-react";
import { getBaseUrl } from "@/lib/getBaseUrl";

/* ---------------- BASE URL ---------------- */
const BASE_URL = getBaseUrl();

/* ---------------- STATUS OPTIONS ---------------- */
const STATUS_OPTIONS = [
  "ACTIVE",
  "ON_HOLD",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  ON_HOLD: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border border-blue-200",
  COMPLETED: "bg-purple-100 text-purple-700 border border-purple-200",
  CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

const getStatusClass = (status: string) =>
  STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border";

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function ClientProfile({ client }: { client: any }) {
  if (!client) {
    return (
      <div className="p-6 text-center text-muted-foreground">
        No client data available.
      </div>
    );
  }

  /* ---------------- STATES ---------------- */
  const [status, setStatus] = useState(client.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [form, setForm] = useState({
    objective: "",
    request: "",
    response: "",
    amount: "",
  });

  const [file, setFile] = useState<File | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [savingAssignments, setSavingAssignments] = useState(false);

  const [empSearch, setEmpSearch] = useState("");
  const [projSearch, setProjSearch] = useState("");

  const clientEmployees = client.employees || [];
  const clientProjects = client.projects || [];
  const clientLogs = client.logs || [];

  /* ---------------- INITIAL LOAD ---------------- */
  useEffect(() => {
    loadOptions();

    setSelectedEmployees(clientEmployees.map((e: any) => e.userId));
    setSelectedProjects(clientProjects.map((p: any) => p.projectId));
  }, []);

  /* ---------------- FETCH EMPLOYEES + PROJECTS ---------------- */
  async function loadOptions() {
    try {
      const [empRes, projRes] = await Promise.all([
        fetch(`${BASE_URL}/api/employees`),
        fetch(`${BASE_URL}/api/allprojects`),
      ]);

      const empData = await empRes.json();
      const projectData = await projRes.json();

      setEmployees(empData.employees || []);
      setProjects(projectData.projects || []);
    } catch (err) {
      console.error("❌ Failed loading options:", err);
    }
  }

  /* ---------------- STATUS UPDATE ---------------- */
  async function updateStatus() {
    setUpdatingStatus(true);

    const res = await fetch(`${BASE_URL}/api/admin/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!res.ok) alert("Failed to update status");
    else {
      alert("Status updated successfully ✅");
      window.location.reload();
    }

    setUpdatingStatus(false);
  }

  /* ---------------- SAVE ASSIGNMENTS ---------------- */
  async function saveAssignments() {
    setSavingAssignments(true);

    const res = await fetch(
      `${BASE_URL}/api/admin/clients/${client.id}/assign`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeIds: selectedEmployees,
          projectIds: selectedProjects,
        }),
      }
    );

    if (!res.ok) alert("Failed to update assignments ❌");
    else {
      alert("Assignments updated successfully ✅");
      window.location.reload();
    }

    setSavingAssignments(false);
  }

  /* ---------------- SUBMIT LOG ---------------- */
  async function submitLog() {
    const fd = new FormData();

    fd.append("objective", form.objective);
    fd.append("request", form.request);
    fd.append("response", form.response);
    fd.append("amount", form.amount);

    if (file) fd.append("file", file);

    const res = await fetch(`${BASE_URL}/api/admin/clients/${client.id}/logs`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) alert("Failed to add log ❌");
    else {
      alert("Log added successfully ✅");
      window.location.reload();
    }
  }

  /* ---------------- TOGGLE SELECTS ---------------- */
  const toggleEmployee = (id: string) =>
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );

  const toggleProject = (id: string) =>
    setSelectedProjects((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  /* ---------------- EXPORT PDF ---------------- */
  const exportPDF = () =>
    window.open(`${BASE_URL}/api/admin/clients/${client.id}/export`, "_blank");

  /* ---------------- FILTERS ---------------- */
  const filteredEmployees = employees.filter((e) =>
    e.name?.toLowerCase().includes(empSearch.toLowerCase())
  );

  const filteredProjects = projects.filter((p) =>
    p.name?.toLowerCase().includes(projSearch.toLowerCase())
  );

  /* ---------------- TOTAL AMOUNT ---------------- */
  const totalAmount = clientLogs.reduce(
    (sum: number, log: any) => sum + (Number(log.amount) || 0),
    0
  );

  /* ============================================================
     UI / RENDER
  ============================================================ */
  return (
    <div className="p-6 space-y-8">

      {/* ---------------- HEADER ---------------- */}
      <Card>
        <CardHeader className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              {client.name}
              <Badge className={getStatusClass(client.status)}>
                {client.status}
              </Badge>
            </CardTitle>

            <p className="text-muted-foreground text-sm">
              {client.companyName || "No company"}
            </p>
          </div>

          <Button onClick={exportPDF} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download Profile PDF
          </Button>
        </CardHeader>
      </Card>

      {/* ---------------- SUMMARY CARDS ---------------- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard icon={<Users size={16} />} label="Employees" value={clientEmployees.length} />
        <SummaryCard icon={<FolderKanban size={16} />} label="Projects" value={clientProjects.length} />
        <SummaryCard icon={<FileText size={16} />} label="Logs" value={clientLogs.length} />
        <SummaryCard icon={<CircleDollarSign size={16} />} label="Total Amount" value={`₹ ${totalAmount}`} />
      </div>

      {/* ---------------- STATUS UPDATE ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={updateStatus} disabled={updatingStatus}>
            {updatingStatus ? "Updating..." : "Update"}
          </Button>
        </CardContent>
      </Card>

      {/* ---------------- ASSIGN SECTIONS ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Assign Employees & Projects</CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employees */}
          <div>
            <h3 className="font-medium mb-2">Employees</h3>
            <Input
              placeholder="Search employees..."
              value={empSearch}
              onChange={(e) => setEmpSearch(e.target.value)}
              className="mb-3"
            />

            <div className="max-h-56 overflow-y-auto border rounded p-3 space-y-2">
              {filteredEmployees.map((emp) => (
                <label
                  key={emp.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedEmployees.includes(emp.id)}
                    onCheckedChange={() => toggleEmployee(emp.id)}
                  />
                  {emp.name}
                </label>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div>
            <h3 className="font-medium mb-2">Projects</h3>
            <Input
              placeholder="Search projects..."
              value={projSearch}
              onChange={(e) => setProjSearch(e.target.value)}
              className="mb-3"
            />

            <div className="max-h-56 overflow-y-auto border rounded p-3 space-y-2">
              {filteredProjects.map((proj) => (
                <label
                  key={proj.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <Checkbox
                    checked={selectedProjects.includes(proj.id)}
                    onCheckedChange={() => toggleProject(proj.id)}
                  />
                  {proj.name}
                </label>
              ))}
            </div>
          </div>
        </CardContent>

        <CardContent>
          <Button onClick={saveAssignments} disabled={savingAssignments}>
            {savingAssignments ? "Saving..." : "Save Assignments"}
          </Button>
        </CardContent>
      </Card>

      {/* ---------------- ADD LOG SECTION ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Log</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Input
            placeholder="Objective"
            value={form.objective}
            onChange={(e) => setForm({ ...form, objective: e.target.value })}
          />

          <Input
            placeholder="Client Request"
            value={form.request}
            onChange={(e) => setForm({ ...form, request: e.target.value })}
          />

          <Input
            placeholder="Your Response"
            value={form.response}
            onChange={(e) => setForm({ ...form, response: e.target.value })}
          />

          <Input
            type="number"
            placeholder="Amount"
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />

          <Input
            type="file"
            accept=".pdf,.jpg,.png"
            onChange={(e) =>
              setFile(e.target.files ? e.target.files[0] : null)
            }
          />

          <Button onClick={submitLog}>Add Log</Button>
        </CardContent>
      </Card>

      {/* ---------------- LOG LIST ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          {clientLogs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet.</p>
          ) : (
            clientLogs.map((log: any) => (
              <div
                key={log.id}
                className="border rounded p-3 text-sm space-y-1"
              >
                <p>
                  <b>{log.createdBy?.name}</b> —{" "}
                  {new Date(log.createdAt).toLocaleString()}
                </p>

                <p><b>Objective:</b> {log.objective}</p>
                <p><b>Request:</b> {log.request}</p>
                <p><b>Response:</b> {log.response}</p>
                <p><b>Amount:</b> ₹{log.amount}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================
   SUMMARY CARD
============================================================ */
function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-md border px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
