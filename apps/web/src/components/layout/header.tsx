import Link from 'next/link';
import { BarChart3 } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6" />
          <span className="font-bold text-xl">Recon</span>
        </Link>
        <nav className="ml-auto flex items-center space-x-4 text-sm font-medium">
          <Link
            href="/"
            className="transition-colors hover:text-foreground/80 text-foreground/60"
          >
            Search
          </Link>
        </nav>
      </div>
    </header>
  );
}
