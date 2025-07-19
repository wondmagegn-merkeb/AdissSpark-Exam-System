import { PublicNavbar } from '@/components/shared/PublicNavbar';
import type { ReactNode } from 'react';

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicNavbar />
      <main className="flex-grow">{children}</main>
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} ADDISSPARK. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
