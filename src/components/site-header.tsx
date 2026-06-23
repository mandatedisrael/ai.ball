import Link from "next/link";

import { BrandName } from "@/components/brand-name";

export function SiteHeader() {
  return (
    <header className="border-border sticky top-0 z-50 border-b bg-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-2">
          <span className="bg-accent/15 text-accent flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold">
            ⚽
          </span>
          <BrandName className="text-lg" />
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/"
            className="text-muted hover:text-foreground text-sm font-medium"
          >
            Matches
          </Link>
          <span className="bg-accent/10 text-accent hidden rounded-full px-3 py-1 text-xs font-medium sm:inline-block">
            AI Analyst
          </span>
        </nav>
      </div>
    </header>
  );
}