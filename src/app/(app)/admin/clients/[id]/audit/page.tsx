import { PageHeader } from "@/components/page-header";
import { cookies } from "next/headers";

async function getAudit(clientId: string) {
  const cookieStore = cookies(); // ✅ sync, correct

  const res = await fetch(
    `/api/admin/clients/${clientId}/audit`,
    {
      cache: "no-store",
      headers: {
        Cookie: cookieStore.toString(), // ✅ send session
      },
    }
  );

  if (!res.ok) throw new Error("Failed to load audit logs");

  const data = await res.json();
  return data.audits;
}

export default async function AuditPage({ params }: any) {
  const audits = await getAudit(params.id);

  return (
    <div>
      <PageHeader
        title="Client Audit History"
        description="All changes made to this client"
      />

      <div className="p-6">
        {audits.map((a: any) => (
          <div key={a.id} className="border p-3 mb-3 rounded">
            <p><b>Action:</b> {a.action}</p>
            <p><b>By:</b> {a.changedBy}</p>
            <p><b>Date:</b> {new Date(a.createdAt).toLocaleString()}</p>
            <pre>{JSON.stringify(a.data, null, 2)}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
