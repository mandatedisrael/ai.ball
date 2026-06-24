interface BrandNameProps {
  className?: string;
}

export function BrandName({ className = "" }: BrandNameProps) {
  return (
    <span className={`font-display font-bold tracking-tight ${className}`}>
      match<span className="text-accent">⚽</span>nalyst
    </span>
  );
}

export const BRAND_TITLE = "match⚽nalyst";
export const BRAND_TAGLINE = "AI football analyst";