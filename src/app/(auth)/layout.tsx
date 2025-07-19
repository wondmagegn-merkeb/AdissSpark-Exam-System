import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen">
      <Button asChild variant="outline" className="absolute top-4 right-4 sm:top-6 sm:right-6">
        <Link href="/home">
          <Home className="mr-2 h-4 w-4" />
          Home
        </Link>
      </Button>
      <main className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  );
}
