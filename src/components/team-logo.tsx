"use client";

import { useState } from "react";

import { TBD_TEAM_NAME } from "@/lib/team-display";

interface TeamLogoProps {
  name?: string | null;
  logo?: string | null;
  size?: number;
  className?: string;
}

function teamInitials(name: string): string {
  const safe = name.trim();
  if (!safe || safe === TBD_TEAM_NAME) return "?";

  const words = safe.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return safe.slice(0, 2).toUpperCase();
}

export function TeamLogo({
  name,
  logo,
  size = 28,
  className = "",
}: TeamLogoProps) {
  const [failed, setFailed] = useState(false);
  const safeName = name?.trim() || TBD_TEAM_NAME;
  const showImage = Boolean(logo) && !failed && safeName !== TBD_TEAM_NAME;

  if (showImage) {
    return (
      <img
        src={logo ?? undefined}
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
      {teamInitials(safeName)}
    </span>
  );
}