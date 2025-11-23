import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";

/* ---------------- UTIL: COOKIE SERIALIZER ---------------- */
function serializeCookies(cookieList: { name: string; value: string }[]) {
  return cookieList.map(({ name, value }) => `${name}=${value}`).join("; ");
}

/* ---------------- FETCH CLIENTS ---------------- */
async function getClients() {
  // ✅ FIX: cookies() must be awaited
  const cookieStore = await cookies();

  // cookieStore.getAll() returns Cookie[]
  const cookieHeader = serializeCookies(cookieStore.getAll());

  const res = await fetch("http://localhost:3000/api/admin/clients", {
    cache: "no-store",
    headers: {
      Cookie: cookieHeader,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load clients");
  }

  const data = await res.json();
  return data.clients;
}

/* ---------------- PAGE COMPONENT ---------------- */
export default async function ClientsPage() {
  const clients = await getClients();

  return (
    <div>
      <PageHeader title="Clients" description="Manage all client profiles" />

      <div className="flex justify-end gap-3 p-6 pt-0">
        <Link href="/admin/clients/new">
          <Button>Create Client</Button>
        </Link>

        <Link href="/api/admin/clients/export-all" target="_blank">
          <Button variant="outline">Export All PDF</Button>
        </Link>
      </div>

      <div className="grid gap-4 p-6">
        {clients.length === 0 && (
          <p className="text-muted-foreground text-sm">No clients created yet.</p>
        )}

        {clients.map((client: any) => (
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
    </div>
  );
}
