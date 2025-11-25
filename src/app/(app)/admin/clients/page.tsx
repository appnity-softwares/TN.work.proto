"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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

const statusStyles: Record<string, string> = {
  ACTIVE: "bg-green-50 text-green-700 border border-green-200",
  ON_HOLD: "bg-yellow-50 text-yellow-700 border border-yellow-200",
  IN_PROGRESS: "bg-blue-50 text-blue-700 border border-blue-200",
  COMPLETED: "bg-purple-50 text-purple-700 border border-purple-200",
  CANCELLED: "bg-red-50 text-red-700 border border-red-200",
};

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientType[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/admin/clients", {
        cache: "no-store",
      });

      const data = await res.json();

      if (!data?.clients || !Array.isArray(data.clients)) {
        console.error("Invalid response:", data);
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

    if (!intervalRef.current) {
      intervalRef.current = setInterval(fetchClients, 15000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Clients" description="Manage all client profiles." />

      {/* ACTION BAR */}
      <div className="flex justify-end gap-3 px-6 pt-0 pb-4">
        <Link href="/admin/clients/new">
          <Button>Create Client</Button>
        </Link>

        <Link href="/api/admin/clients/export-all" target="_blank">
          <Button variant="outline">Export PDF</Button>
        </Link>
      </div>

      {/* CONTENT */}
      <div className="px-6 pb-6">
        {loading ? (
          <div className="text-center py-10 text-muted-foreground">
            Loading clients...
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            No clients created yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {clients.map((client) => (
              <Link
                key={client.id}
                href={`/admin/clients/${client.id}`}
                className="block group"
              >
                <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition rounded-xl group-hover:border-gray-300">
                  <CardContent className="p-5 space-y-4">

                    {/* HEADER */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {client.name}
                      </h3>

                      <Badge
                        className={`text-xs font-medium ${
                          statusStyles[client.status] ||
                          "bg-gray-100 text-gray-700 border"
                        }`}
                      >
                        {client.status}
                      </Badge>
                    </div>

                    {/* STATS */}
                    <div className="grid grid-cols-3 gap-2 text-sm text-gray-600 pt-2">
                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {client._count?.employees ?? 0}
                        </p>
                        <p className="text-xs">Employees</p>
                      </div>

                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {client._count?.projects ?? 0}
                        </p>
                        <p className="text-xs">Projects</p>
                      </div>

                      <div className="text-center">
                        <p className="font-semibold text-gray-900">
                          {client._count?.logs ?? 0}
                        </p>
                        <p className="text-xs">Logs</p>
                      </div>
                    </div>

                    {/* FOOTER */}
                    <div className="pt-2">
                      <p className="text-xs text-right text-gray-500 group-hover:text-gray-700 transition">
                        Click to open →
                      </p>
                    </div>

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
