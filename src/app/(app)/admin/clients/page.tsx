"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---------- TYPE FIX ----------
type ClientType = {
  id: string;
  name: string;
  status: string;
  _count?: {
    employees?: number;
    projects?: number;
    logs?: number;
  };
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients", {
        cache: "no-store",
      });

      const text = await res.text();

      if (!text) {
        console.error("❌ Empty response from /api/admin/clients");
        return;
      }

      const data = JSON.parse(text);

      if (!Array.isArray(data.clients)) {
        console.error("❌ Invalid format:", data);
        return;
      }

      setClients(data.clients);
    } catch (err) {
      console.error("Error fetching clients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    const interval = setInterval(fetchClients, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      <PageHeader title="Clients" description="Manage all client profiles." />

      <div className="flex justify-end gap-3 p-6 pt-0">
        <Link href="/admin/clients/new">
          <Button>Create Client</Button>
        </Link>

        <Link href="/api/admin/clients/export-all" target="_blank">
          <Button variant="outline">Export All PDF</Button>
        </Link>
      </div>

      <div className="p-6">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">
            Loading clients...
          </p>
        ) : clients.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No clients created yet.
          </p>
        ) : (
          <div className="grid gap-4">
            {clients.map((client) => (
              <Link key={client.id} href={`/admin/clients/${client.id}`}>
                <Card className="hover:shadow-md transition">
                  <CardContent className="p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{client.name}</h3>

                    <p>Status: {client.status}</p>
                    <p>Employees: {client._count?.employees ?? 0}</p>
                    <p>Projects: {client._count?.projects ?? 0}</p>
                    <p>Logs: {client._count?.logs ?? 0}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
