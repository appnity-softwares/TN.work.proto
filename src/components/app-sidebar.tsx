"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Bell,
  MessageSquare,
  Clock,
  Home,
  LogOut,
  PanelLeft,
  Users,
  AlertTriangle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import { Logo } from "./logo";
import { SessionUser } from "@/lib/types";
import { logout } from "@/app/api/auth-actions";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { placeholderImages } from "@/lib/placeholder-images";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";

const employeeNavItems = [
  { href: "/dashboard", icon: Home, label: "Dashboard" },
  { href: "/dashboard/discussion", icon: MessageSquare, label: "Discussions" },

  // ✅ NEW: Assigned Clients
  {
    href: "/dashboard/clients",
    icon: Briefcase,
    label: "Assigned Clients",
  },

  { href: "/dashboard/my-hours", icon: Clock, label: "My Hours" },
];

export function AppSidebar({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const userAvatar = placeholderImages.find((p) => p.id === "user-avatar");

  const [clientCount, setClientCount] = useState<number | null>(null);

  // ✅ Fetch clients count only for admin
  useEffect(() => {
    if (user.role !== "ADMIN") return;

    const fetchClients = async () => {
      try {
        const res = await fetch("/api/admin/clients", { cache: "no-store" });
        const data = await res.json();
        setClientCount(data.clients.length);
      } catch (err) {
        console.error("Client count fetch error:", err);
      }
    };

    fetchClients();
  }, [user.role]);

  const isRouteActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + "/");
  };

  const adminNavItems = [
    { href: "/admin/attendance", icon: Clock, label: "Attendance" },
    { href: "/admin/employees", icon: Users, label: "Employees" },
    { href: "/admin/clients", icon: Briefcase, label: "Clients", showCount: true },
    { href: "/admin/notices", icon: Bell, label: "Notices" },
    { href: "/admin/errors", icon: AlertTriangle, label: "Error Logs" },
  ];

  const navItems = user.role === "ADMIN" ? adminNavItems : employeeNavItems;

  const navContent = (
    <div className="flex flex-col h-full bg-muted/40">
      {/* Header */}
      <div className="flex items-center justify-center h-20 border-b">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4">
        <div className="grid items-start gap-2">
          {navItems.map((item: any) => (
            <Link key={item.label} href={item.href}>
              <Button
                variant={isRouteActive(item.href) ? "default" : "ghost"}
                className="w-full justify-start flex items-center gap-2"
                aria-current={isRouteActive(item.href) ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>

                {/* ✅ ADMIN CLIENT COUNT */}
                {item.showCount && clientCount !== null && (
                  <Badge variant="secondary" className="ml-auto text-xs px-2 py-0.5">
                    {clientCount}
                  </Badge>
                )}
              </Button>
            </Link>
          ))}
        </div>
      </nav>

      {/* User Footer */}
      <div className="mt-auto border-t p-4">
        <div className="flex items-center gap-3 mb-4">
          <Avatar>
            <AvatarImage
              src={userAvatar?.imageUrl}
              alt={user.name}
              data-ai-hint={userAvatar?.imageHint}
            />
            <AvatarFallback>
              {user.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        </div>

        <form action={logout}>
          <Button variant="ghost" className="w-full justify-start">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-64 border-r">
        {navContent}
      </div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="m-4">
              <PanelLeft className="h-5 w-5" />
            </Button>
          </SheetTrigger>

          <SheetContent side="left" className="p-0 w-64">
            <VisuallyHidden>
              <DialogTitle>Mobile Navigation Menu</DialogTitle>
            </VisuallyHidden>

            {navContent}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
