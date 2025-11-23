"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

  return (
    <div className="p-6 space-y-6">

      {/* CLIENT INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">

          <p><b>Name:</b> {client.name}</p>
          <p><b>Status:</b> {client.status}</p>
          <p><b>Objective:</b> {client.objective || "—"}</p>
          <p><b>Funds:</b> INR{client.funds}</p>

          <div className="border-t pt-4 mt-4">
            <h4 className="font-semibold mb-2">Assigned Employees</h4>

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

          <input
            className="border p-2 rounded w-full"
            placeholder="Objective"
            onChange={e => setForm({ ...form, objective: e.target.value })}
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Request"
            onChange={e => setForm({ ...form, request: e.target.value })}
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Response"
            onChange={e => setForm({ ...form, response: e.target.value })}
          />

          <input
            type="number"
            className="border p-2 rounded w-full"
            placeholder="Amount"
            onChange={e => setForm({ ...form, amount: e.target.value })}
          />

          <input
            type="file"
            className="border p-2 rounded w-full"
            onChange={e => setFile(e.target.files?.[0] || null)}
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
            <p className="text-muted-foreground">
              No logs submitted yet.
            </p>
          )}

          {client.logs.map((log: any) => (
            <div key={log.id} className="border p-3 rounded mb-3">

              {log.createdBy && (
                <p className="text-sm mb-2 text-gray-600">
                  <b>By:</b> {log.createdBy.name} ({log.createdBy.employeeCode})
                </p>
              )}

              <p><b>Objective:</b> {log.objective}</p>
              <p><b>Request:</b> {log.request}</p>
              <p><b>Response:</b> {log.response}</p>
              <p><b>Amount:</b> INR{log.amount}</p>

              {log.attachments?.file && (
                <a
                  href={log.attachments.file}
                  target="_blank"
                  className="text-blue-600 underline mt-2 block"
                >
                  View Attachment
                </a>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

    </div>
  );
}
