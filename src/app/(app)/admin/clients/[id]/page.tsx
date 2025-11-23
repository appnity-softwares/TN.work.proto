// app/admin/clients/[id]/page.tsx
import { cookies } from "next/headers";
import ClientProfile from "@/components/admin/client-profile";

async function getClient(id: string) {
  console.log("📡 Fetching client:", id);

  const cookieStore = await cookies(); // ✅ FIX — add await
  const sessionCookie = cookieStore.get("tn_proto_session")?.value;

  const res = await fetch(`http://localhost:3000/api/admin/clients/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: `tn_proto_session=${sessionCookie}`,
    },
  });

  if (!res.ok) {
    console.error("❌ Failed to load client", res.status);
    throw new Error("Failed to load client");
  }

  const data = await res.json();
  return data.client;
}

export default async function ClientPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const client = await getClient(id);

  return <ClientProfile client={client} />;
}
