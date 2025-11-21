import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getSession();

  if (session?.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full">
      {children}
    </div>
  );
}
