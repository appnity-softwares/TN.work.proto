import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { cookies } from "next/headers";

async function getAssignedClients() {
  const cookieStore = cookies();

  const res = await fetch("/api/clients", {
    headers: {
      Cookie: cookieStore.toString(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to load assigned clients");
  }

  const data = await res.json();
  return data.clients;
}

export default async function EmployeeClientsPage() {
  const clients = await getAssignedClients();

  return (
    <div>
      <PageHeader
        title="Assigned Clients"
        description="Clients and work assigned to you"
      />

      <div className="grid gap-4 p-6">
        {clients.length === 0 && (
          <p className="text-muted-foreground">
            No clients assigned to you yet.
          </p>
        )}

        {clients.map((client: any) => (
          <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
            <Card className="hover:shadow-md transition">
              <CardContent className="p-4 space-y-2">
                <h3 className="text-lg font-bold">{client.name}</h3>
                <p>Status: {client.status}</p>
                <p>Objective: {client.objective ?? "—"}</p>
                <p>Projects: {client.projects.length}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
