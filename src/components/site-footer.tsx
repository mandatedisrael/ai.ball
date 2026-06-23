import { BrandName } from "@/components/brand-name";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <BrandName className="text-lg" />
            <p className="text-muted mt-2 text-sm">
              Football intelligence · 0G TEE verified
            </p>
          </div>
          <p className="text-muted max-w-sm text-xs leading-5">
            Research and analysis only. Not financial, betting, or investment
            advice. Polymarket prices shown for market context when available.
          </p>
        </div>
      </div>
    </footer>
  );
}