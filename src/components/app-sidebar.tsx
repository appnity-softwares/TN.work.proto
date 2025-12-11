'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, ForwardRefExoticComponent, RefAttributes } from 'react';
import {
  Bell,
  MessageSquare,
  Clock,
  Home,
  LogOut,
  Users,
  Briefcase,
  LucideProps,
  Info,
  Trash,
  ClipboardList,
  CalendarClock,
  Mail,
} from 'lucide-react';



import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Logo } from './logo';
import { SessionUser } from '@/lib/types';
import { logout } from '@/app/api/auth-actions';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images';
import { Badge } from '@/components/ui/badge';

interface NavItem {
  href: string;
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>;
  label: string;
  showCount?: boolean;
}

const employeeNavItems: NavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/discussion', icon: MessageSquare, label: 'Discussions' },
  {
    href: '/dashboard/clients',
    icon: Briefcase,
    label: 'Assigned Clients',
  },
  { href: '/dashboard/my-hours', icon: Clock, label: 'My Hours' },
  { href: '/dashboard/details', icon: Info, label: 'My Details' },
];



const adminNavItems: NavItem[] = [
  {
    href: '/admin/attendance',
    icon: ClipboardList,     // Attendance → checklist
    label: 'Attendance',
  },
  {
    href: '/admin/employees',
    icon: Users,             // Employees → users icon
    label: 'Employees',
  },
  {
    href: '/admin/clients',
    icon: Briefcase,         // Clients → business briefcase
    label: 'Clients',
    showCount: true,
  },
  {
    href: '/admin/notices',
    icon: Bell,              // Notices → bell (notification)
    label: 'Notices',
  },
  {
    href: '/admin/bin',
    icon: Trash,             // Bin → trash icon
    label: 'Bin',
  },
  {
    href: '/admin/employee-details',
    icon: Info,     // Employee Details → form/checklist icon
    label: 'Employee Details',
  },
  {
    href: '/admin/reminders',
    icon: CalendarClock,     // Meetings / Reminders → calendar + clock
    label: 'Meetings',
  },
  {
    href: '/admin/email',
    icon: Mail,              // Email → proper mail icon
    label: 'Email',
  },
];


export function AppSidebarNav({ user }: { user: SessionUser }) {
  const pathname = usePathname();
  const userAvatar = placeholderImages.find((p) => p.id === 'user-avatar');
  const [clientCount, setClientCount] = useState<number | null>(null);

  useEffect(() => {
    if (user.role !== 'ADMIN') return;

    const fetchClients = async () => {
      try {
        const res = await fetch('/api/admin/clients', { cache: 'no-store' });
        const data = await res.json();
        setClientCount(data.clients.length);
      } catch (err) {
        console.error('Client count fetch error:', err);
      }
    };

    fetchClients();
  }, [user.role]);

  const isRouteActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  const navItems: NavItem[] = user.role === 'ADMIN' ? adminNavItems : employeeNavItems;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Logo />
         <span className="">{user.name}</span>
 {/* Current User Name Placeholder */}
        </Link>
      </div>
      <div className="flex-1">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
          {navItems.map((item: NavItem) => (
            <Link
              key={item.label}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
                isRouteActive(item.href) ? 'bg-muted text-primary' : ''
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
              {item.showCount && clientCount !== null && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {clientCount}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
      </div>
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
}

export function AppSidebar({ user }: { user: SessionUser }) {
  return (
    <aside className="hidden border-r bg-muted/40 lg:block">
      <AppSidebarNav user={user} />
    </aside>
  );
}
