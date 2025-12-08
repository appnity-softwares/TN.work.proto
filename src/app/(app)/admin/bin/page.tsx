import { getAuth } from "@/lib/auth/get-auth";
import { db } from "@/lib/db";
import { BinManagement } from "@/components/admin/bin-management";
import { redirect } from 'next/navigation';

export default async function AdminBinPage() {
  const user = await getAuth();
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

  return <BinManagement initialBinItems={binItems} />;
}
