import { PageHeader } from "@/components/page-header";
import { cookies } from "next/headers";
import EditClientForm from "@/components/admin/edit-client-form";

async function getClient(id: string) {
  const cookieStore = cookies(); // ❌ no await

  const res = await fetch(
    `http://localhost:3000/api/admin/clients/${id}`,
    {
      cache: "no-store",
      headers: { Cookie: cookieStore.toString() },
    }
  );

  if (!res.ok) throw new Error("Failed to load client");
  const data = await res.json();
  return data.client;
}

export default async function EditClientPage({
  params,
}: {
  params: { id: string };
}) {
  // ❌ no await needed
  const client = await getClient(params.id);

  return (
    <div>
      <PageHeader
        title={`Edit ${client.name}`}
        description="Update client details"
      />
      <EditClientForm client={client} />
    </div>
  );
}
