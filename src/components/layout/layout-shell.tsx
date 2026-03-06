'use client';

import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';

const FULL_PAGE_ROUTES = ['/console'];

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = FULL_PAGE_ROUTES.some((route) => pathname.startsWith(route));

  if (isFullPage) {
    return (
      <main id="main-content" className="flex-1">
        {children}
      </main>
    );
  }

  return (
    <>
      <Header />
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col bg-card md:border-x border-border/60 md:shadow-2xl">
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
}
