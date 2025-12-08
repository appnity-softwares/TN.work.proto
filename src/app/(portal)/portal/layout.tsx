import { PortalSidebar } from "@/components/portal/PortalSidebar";
import { PropsWithChildren } from "react";

export default function PortalLayout({ children }: PropsWithChildren) {
  return (
    <div className="flex h-screen bg-gray-100">
      <PortalSidebar />
      <main className="flex-1 p-6 overflow-y-auto">{children}</main>
    </div>
  );
}
