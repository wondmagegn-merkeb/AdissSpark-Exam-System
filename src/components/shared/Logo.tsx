import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-baseline gap-1 text-2xl font-bold ${className}`}>
      <span className="text-primary">ADDIS</span>
      <span className="text-sidebar-foreground">SPARK</span>
    </Link>
  );
}
