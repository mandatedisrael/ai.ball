"use client";

import { useState } from "react";

interface TeamLogoProps {
  name: string;
  logo?: string;
  size?: number;
  className?: string;
}

function teamInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function TeamLogo({
  name,
  logo,
  size = 28,
  className = "",
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(logo) && !failed;

  if (showImage) {
    return (
      <img
        src={logo}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`shrink-0 rounded-full bg-white object-contain p-0.5 ring-1 ring-border/50 ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      className={`bg-surface-elevated text-muted flex shrink-0 items-center justify-center rounded-full font-mono text-[0.6rem] font-bold tracking-tight uppercase ring-1 ring-border/50 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {teamInitials(name)}
    </span>
  );
}