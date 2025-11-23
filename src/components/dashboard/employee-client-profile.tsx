"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

  return (
    <div className="p-6 space-y-8">

      {/* CLIENT INFO */}
      <Card>
        <CardHeader>
          <CardTitle>Client Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p><b>Name:</b> {client.name}</p>
          <p><b>Status:</b> {client.status}</p>
          <p><b>Objective:</b> {client.objective}</p>
          <p><b>Funds:</b> INR{client.funds ?? "N/A"}</p>
        </CardContent>
      </Card>

      {/* PROJECTS */}
      <Card>
        <CardHeader>
          <CardTitle>Linked Projects</CardTitle>
        </CardHeader>
        <CardContent>
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
          <input
            className="border p-2 rounded w-full"
            placeholder="Objective update"
            onChange={(e) =>
              setForm({ ...form, objective: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Request / Issue raised"
            onChange={(e) =>
              setForm({ ...form, request: e.target.value })
            }
          />

          <input
            className="border p-2 rounded w-full"
            placeholder="Response / Action taken"
            onChange={(e) =>
              setForm({ ...form, response: e.target.value })
            }
          />

          <input
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

        <CardContent>
          {client.logs.length === 0 && (
            <p>No logs submitted yet.</p>
          )}

          {client.logs.map((log: any) => (
            <div key={log.id} className="border rounded p-3 mb-3">
              <p><b>Objective:</b> {log.objective}</p>
              <p><b>Request:</b> {log.request}</p>
              <p><b>Response:</b> {log.response}</p>

              {log.attachments?.file && (
                <a
                  href={log.attachments.file}
                  target="_blank"
                  className="text-blue-600 underline block mt-1"
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
