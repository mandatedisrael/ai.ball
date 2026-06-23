"use client";

import { useTheme } from "@/components/theme-provider";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="theme-toggle group"
    >
      <span className="theme-toggle-track">
        <span
          className={`theme-toggle-thumb ${theme === "dark" ? "is-dark" : ""}`}
        >
          {theme === "dark" ? <MoonIcon /> : <SunIcon />}
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M10 3a1 1 0 0 1 1 1v1.5a1 1 0 1 1-2 0V4a1 1 0 0 1 1-1Zm0 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-4a1 1 0 0 1 1 1v.5a1 1 0 1 1-2 0V11a1 1 0 0 1 1-1h.5ZM3 10a1 1 0 0 1 1-1h.5a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm12.95 5.55a1 1 0 0 1 0 1.41l-.35.35a1 1 0 1 1-1.41-1.41l.35-.35a1 1 0 0 1 1.41 0ZM5.76 5.76a1 1 0 0 1 1.41 0l.35.35a1 1 0 0 1-1.41 1.41l-.35-.35a1 1 0 0 1 0-1.41Zm9.9-1.06.35-.35a1 1 0 0 1 1.41 1.41l-.35.35a1 1 0 0 1-1.41-1.41ZM5.76 14.24l-.35.35a1 1 0 0 1-1.41-1.41l.35-.35a1 1 0 0 1 1.41 1.41ZM16 10a1 1 0 0 1 1 1v.5a1 1 0 0 1-2 0V11a1 1 0 0 1 1-1h.5Z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden>
      <path d="M13.9 2.3a7.25 7.25 0 1 0 4.8 11.45 6.25 6.25 0 0 1-4.8-11.45Z" />
    </svg>
  );
}