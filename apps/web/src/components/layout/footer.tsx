import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-8 px-4 sm:px-6 lg:px-8">
        <p className="text-sm text-muted-foreground">
          Recon distills stock fundamentals into actionable signals.
        </p>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground transition-colors">
            About
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="#" className="hover:text-foreground transition-colors">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
