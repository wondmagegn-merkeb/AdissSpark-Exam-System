
"use client";

import Link from 'next/link';
import { Logo } from './Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { usePathname } from 'next/navigation';

export function PublicNavbar() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Logo />
          <div className="h-8 w-20 animate-pulse rounded-md bg-muted"></div>
        </div>
      </header>
    );
  }
  
  const isAuthPage = pathname === '/login' || pathname === '/register';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Logo />
        <nav className="flex items-center gap-4">
          {!user && !isAuthPage && (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Sign Up</Link>
              </Button>
            </>
          )}
          {user && (
             <Button asChild>
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
