'use client';

import { PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { AppSidebarNav } from './app-sidebar';
import { SessionUser } from '@/lib/types';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  user?: SessionUser;
  title?: string;
  description?: string;
  className?: string;
}

export function PageHeader({ user, title, description, className }: PageHeaderProps) {
  if (title) {
    return (
        <div className={cn("mb-6", className)}>
            <h1 className="text-2xl font-bold">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
        </div>
    );
  }
  if (user) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:hidden">
        <Sheet>
            <SheetTrigger asChild>
            <Button size="icon" variant="outline">
                <PanelLeft className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
            </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
            <AppSidebarNav user={user} />
            </SheetContent>
        </Sheet>
        </header>
    );
  }
}
