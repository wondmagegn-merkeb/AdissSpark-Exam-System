import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 text-xl font-bold ${className}`}>
      <GraduationCap className="h-7 w-7 text-primary" />
      <span>Exam Prep Pro</span>
    </Link>
  );
}