
"use client";

import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardNavbar } from '@/components/dashboard/DashboardNavbar';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
          <Skeleton className="h-8 w-32" />
          <div className="ml-auto flex items-center gap-4">
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </header>
        <div className="flex flex-1">
          <aside className="hidden h-full w-64 flex-col border-r bg-muted/40 p-4 md:flex">
            <Skeleton className="mb-4 h-8 w-40" />
            <Skeleton className="mb-2 h-8 w-full" />
            <Skeleton className="mb-2 h-8 w-full" />
            <Skeleton className="mb-2 h-8 w-full" />
            <div className="mt-auto">
              <Skeleton className="h-8 w-full" />
            </div>
          </aside>
          <main className="flex-1 p-6">
            <Skeleton className="h-96 w-full" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <DashboardSidebar />
      </Sidebar>
      <SidebarInset>
        <DashboardNavbar />
        <main className="flex-1 flex-col gap-4 p-4 md:gap-8 md:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
