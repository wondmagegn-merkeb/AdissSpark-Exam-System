
"use client";

import { SidebarTrigger } from '@/components/ui/sidebar';
import { UserNav } from '@/components/dashboard/UserNav';
import { Logo } from '../shared/Logo';

export function DashboardNavbar() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6 shadow-sm">
      <div className="md:hidden"> {/* Only show trigger on mobile, as sidebar is controlled by provider on desktop */}
        <SidebarTrigger />
      </div>
      <div className="hidden md:block"> {/* Placeholder for desktop sidebar trigger or logo if needed */}
         {/* <Logo/>  Can be enabled if logo is preferred in navbar over sidebar header */}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <UserNav />
      </div>
    </header>
  );
}
