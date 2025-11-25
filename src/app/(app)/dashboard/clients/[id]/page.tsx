// /Users/kunal/Documents/WORK/studio-TN.proto-main/src/app/(app)/dashboard/clients/[id]/page.tsx
import { cookies } from "next/headers";
import ClientUI from "@/components/dashboard/client-ui";

/* ---------------- FETCH CLIENT (SERVER SAFE) ---------------- */
async function getClient(id: string) {
  const cookieStore = await cookies();

  const res = await fetch(`http://localhost:3000/api/clients/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: cookieStore.toString(),
    },
  });

  if (!res.ok) {
    throw new Error("Failed to load client");
  }

  const data = await res.json();
  return data.client;
}

/* ---------------- PAGE ---------------- */
export default async function ClientPage({
  params,
}: {
  params: { id: string };
}) {
  const client = await getClient(params.id);

  return <ClientUI client={client} />;
}
