"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, FolderKanban, CircleDollarSign } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-700 border border-green-200",
  ON_HOLD: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-700 border border-blue-200",
  COMPLETED: "bg-purple-100 text-purple-700 border border-purple-200",
  CANCELLED: "bg-red-100 text-red-700 border border-red-200",
};

function getStatusClass(status: string) {
  return STATUS_COLORS[status] || "bg-gray-100 text-gray-700 border";
}

export default function EmployeeClientProfile({ client }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    objective: "",
    demand: "",
    request: "",
    response: "",
  });

  const submitLog = async () => {
    const fd = new FormData();

    Object.entries(form).forEach(([key, value]) =>
      fd.append(key, value)
    );

    if (file) fd.append("file", file);

    const res = await fetch(`/api/clients/${client.id}/logs`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      alert("Failed to send log");
      return;
    }

    alert("Log submitted to admin");
    window.location.reload();
  };

  const totalAmount = (client.logs || []).reduce(
    (sum: number, log: any) => sum + (Number(log.amount) || 0),
    0
  );

  return (
    <div className="p-6 space-y-8">
      {/* CLIENT INFO */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Client Info
              <Badge
                className={`text-xs px-2 py-1 rounded-full ${getStatusClass(
                  client.status
                )}`}
              >
                {client.status}
              </Badge>
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {client.name}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" />
              <span>Total Amount: INR{totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p>
            <b>Status:</b> {client.status}
          </p>
          <p>
            <b>Objective:</b> {client.objective || "—"}
          </p>
          <p>
            <b>Funds:</b> {client.funds ? `INR${client.funds}` : "N/A"}
          </p>
        </CardContent>
      </Card>

      {/* PROJECTS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <FolderKanban className="h-4 w-4" />
            Linked Projects
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          {client.projects.length === 0 && <p>No projects linked.</p>}

          {client.projects.map((proj: any) => (
            <p key={proj.id}>{proj.project.name}</p>
          ))}
        </CardContent>
      </Card>

      {/* ADD WORK LOG */}
      <Card>
        <CardHeader>
          <CardTitle>Submit Work Log</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3">
          <Input
            className="border p-2 rounded w-full"
            placeholder="Objective update"
            onChange={(e) =>
              setForm({ ...form, objective: e.target.value })
            }
          />

          <Input
            className="border p-2 rounded w-full"
            placeholder="Demand / Issue"
            onChange={(e) =>
              setForm({ ...form, demand: e.target.value })
            }
          />

          <Input
            className="border p-2 rounded w-full"
            placeholder="Request / Issue raised"
            onChange={(e) =>
              setForm({ ...form, request: e.target.value })
            }
          />

          <Input
            className="border p-2 rounded w-full"
            placeholder="Response / Action taken"
            onChange={(e) =>
              setForm({ ...form, response: e.target.value })
            }
          />

          <Input
            type="file"
            className="border p-2 rounded w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={submitLog}>
            Submit Work Log
          </Button>
        </CardContent>
      </Card>

      {/* LOG HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle>Your Logs</CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          {client.logs.length === 0 && (
            <p>No logs submitted yet.</p>
          )}

          {client.logs.map((log: any) => (
            <div key={log.id} className="border rounded p-3 mb-1">
              <p>
                <b>Objective:</b> {log.objective}
              </p>
              <p>
                <b>Demand:</b> {log.demand}
              </p>
              <p>
                <b>Request:</b> {log.request}
              </p>
              <p>
                <b>Response:</b> {log.response}
              </p>

              {log.attachments?.file && (
                <div className="mt-1 inline-flex items-center gap-2 rounded border px-3 py-1 text-xs">
                  <FileText className="h-3 w-3" />
                  <a
                    href={log.attachments.file}
                    target="_blank"
                    className="text-blue-600 underline"
                  >
                    View Attachment
                  </a>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
