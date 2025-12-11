import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppSidebar } from "@/components/app-sidebar";
import { PageHeader } from "@/components/page-header";
import { IdleTimer } from "@/components/dashboard/idle-timer";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen w-full">
      <AppSidebar user={session.user} />
      <div className="flex flex-col flex-1">
        <PageHeader user={session.user} />
        <main className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
      <IdleTimer />
    </div>
  );
}
