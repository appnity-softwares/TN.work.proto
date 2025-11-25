"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FileText, Users, CircleDollarSign } from "lucide-react";

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

export default function ClientUI({ client }: { client: any }) {
  const [file, setFile] = useState<File | null>(null);
  const [form, setForm] = useState({
    objective: "",
    request: "",
    response: "",
    amount: "",
  });

  const submitLog = async () => {
    const fd = new FormData();

    fd.append("objective", form.objective);
    fd.append("request", form.request);
    fd.append("response", form.response);
    fd.append("amount", form.amount);

    if (file) fd.append("file", file);

    const res = await fetch(`/api/clients/${client.id}/logs`, {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      alert("Failed to submit log");
      return;
    }

    alert("Log submitted successfully");
    location.reload();
  };

  const totalAmount = (client.logs || []).reduce(
    (sum: number, log: any) => sum + (Number(log.amount) || 0),
    0
  );

  return (
    <div className="p-6 space-y-6">
      {/* CLIENT SUMMARY */}
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              Client Information
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

          <div className="flex gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{client.employees.length} employees</span>
            </div>
            <div className="flex items-center gap-1">
              <CircleDollarSign className="h-3 w-3" />
              <span>Total Amount: INR{totalAmount.toFixed(0)}</span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2 text-sm">
          <p>
            <b>Objective:</b> {client.objective || "—"}
          </p>
          <p>
            <b>Funds:</b> {client.funds ? `INR${client.funds}` : "—"}
          </p>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
              <Users className="h-4 w-4" /> Assigned Employees
            </h4>

            {client.employees.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No employees assigned.
              </p>
            )}

            {client.employees.map((emp: any) => (
              <p key={emp.user.id} className="text-sm">
                {emp.user.name} ({emp.user.employeeCode})
              </p>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ADD LOG */}
      <Card>
        <CardHeader>
          <CardTitle>Add Work Log</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input
            className="border p-2 rounded w-full"
            placeholder="Objective"
            onChange={(e) =>
              setForm({ ...form, objective: e.target.value })
            }
          />

          <Input
            className="border p-2 rounded w-full"
            placeholder="Request"
            onChange={(e) =>
              setForm({ ...form, request: e.target.value })
            }
          />

          <Input
            className="border p-2 rounded w-full"
            placeholder="Response"
            onChange={(e) =>
              setForm({ ...form, response: e.target.value })
            }
          />

          <Input
            type="number"
            className="border p-2 rounded w-full"
            placeholder="Amount"
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <Input
            type="file"
            className="border p-2 rounded w-full"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <Button onClick={submitLog} className="w-full">
            Submit Log
          </Button>
        </CardContent>
      </Card>

      {/* LOG HISTORY */}
      <Card>
        <CardHeader>
          <CardTitle>Client Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {client.logs.length === 0 && (
            <p className="text-muted-foreground text-sm">
              No logs submitted yet.
            </p>
          )}

          {client.logs.map((log: any) => (
            <div key={log.id} className="border p-3 rounded mb-3 text-sm">
              {log.createdBy && (
                <p className="text-xs mb-2 text-gray-600">
                  <b>By:</b> {log.createdBy.name} (
                  {log.createdBy.employeeCode})
                </p>
              )}

              <p>
                <b>Objective:</b> {log.objective}
              </p>
              <p>
                <b>Request:</b> {log.request}
              </p>
              <p>
                <b>Response:</b> {log.response}
              </p>
              <p>
                <b>Amount:</b> INR{log.amount}
              </p>

              {log.attachments?.file && (
                <div className="mt-2 inline-flex items-center gap-2 rounded border px-3 py-1 text-xs">
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
