import { getAuth } from "@/lib/auth/get-auth";
import { db } from "@/lib/db";
import { redirect } from 'next/navigation';
import { AdminBinPage } from "@/components/admin/bin-page";

export default async function AdminBinRoute() {
  const session = await getAuth();
  const user = session?.user;

  if (!user) {
    redirect('/');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const binItems = await db.bin.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });

  return <AdminBinPage initialBinItems={binItems} />;
}
