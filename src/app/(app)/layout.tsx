import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

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
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar user={session.user} />
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </SidebarProvider>
  );
}
