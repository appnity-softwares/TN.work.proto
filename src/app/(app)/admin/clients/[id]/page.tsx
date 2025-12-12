import { cookies } from "next/headers";
import ClientProfile from "@/components/admin/client-profile";
import { notFound } from "next/navigation";

async function getClient(id: string) {
  console.log("📡 Fetching client:", id);

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("tn_proto_session")?.value;

  // Improved baseUrl logic
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

  console.log("🌐 Base URL:", baseUrl); // Debugging log

  const res = await fetch(`${baseUrl}/api/admin/clients/${id}`, {
    cache: "no-store",
    headers: {
      Cookie: sessionCookie ? `tn_proto_session=${sessionCookie}` : "",
    },
  });

  if (!res.ok) {
    console.error("❌ Failed to fetch client:", res.status);
    notFound();
  }

  const data = await res.json();

  if (!data?.client) {
    console.error("❌ Invalid API response:", data);
    notFound();
  }

  return data.client;
}

/** ✅ FIXED for Next.js 15 */
export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // <- THIS is what your error was about

  console.log("✅ Page received ID:", id);

  const client = await getClient(id);

  return <ClientProfile client={client} />;
}
