"use client";

import { useClients } from "@/lib/hooks/use-clients";

export function ClientManager() {
  const { clients, isLoading, isError } = useClients();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading clients</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Clients</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.map((client: any) => (
          <div key={client.id} className="p-4 border rounded-lg">
            <h2 className="text-lg font-semibold">{client.name}</h2>
            <p className="text-sm text-gray-500">{client.contactEmail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
