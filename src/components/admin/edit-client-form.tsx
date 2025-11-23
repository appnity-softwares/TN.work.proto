"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function EditClientForm({ client }: { client: any }) {
  const [form, setForm] = useState({
    name: client.name || "",
    companyName: client.companyName || "",
    contactEmail: client.contactEmail || "",
    contactPhone: client.contactPhone || "",
    objective: client.objective || "",
    notes: client.notes || "",
    funds: client.funds || "",
    status: client.status || "ACTIVE",
  });

  const updateClient = async () => {
    const res = await fetch(`/api/admin/clients/${client.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      alert("Failed to update client");
      return;
    }

    alert("Client updated successfully ✅");
    window.location.href = `/admin/clients/${client.id}`;
  };

  return (
    <div className="max-w-xl p-6 space-y-4">
      <input className="border p-2 w-full" value={form.name}
        onChange={e => setForm({ ...form, name: e.target.value })} />

      <input className="border p-2 w-full" value={form.companyName}
        onChange={e => setForm({ ...form, companyName: e.target.value })} />

      <input className="border p-2 w-full" value={form.contactEmail}
        onChange={e => setForm({ ...form, contactEmail: e.target.value })} />

      <input className="border p-2 w-full" value={form.contactPhone}
        onChange={e => setForm({ ...form, contactPhone: e.target.value })} />

      <input className="border p-2 w-full" value={form.funds}
        onChange={e => setForm({ ...form, funds: e.target.value })} />

      <textarea className="border p-2 w-full"
        value={form.objective}
        onChange={e => setForm({ ...form, objective: e.target.value })} />

      <textarea className="border p-2 w-full"
        value={form.notes}
        onChange={e => setForm({ ...form, notes: e.target.value })} />

      <select
        className="border p-2 w-full"
        value={form.status}
        onChange={e => setForm({ ...form, status: e.target.value })}
      >
        <option value="ACTIVE">ACTIVE</option>
        <option value="ON_HOLD">ON HOLD</option>
        <option value="CLOSED">CLOSED</option>
      </select>

      <Button onClick={updateClient}>Update Client</Button>
    </div>
  );
}
