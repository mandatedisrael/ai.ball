"use client";

import { useSyncExternalStore } from "react";

import {
  loadPreferences,
  loadSavedAnalyses,
} from "@/lib/client/local-store";
import type { SavedAnalysis } from "@/types/analysis";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("match-analyst:store", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("match-analyst:store", callback);
  };
}

export function useFavoriteTeams(): string[] {
  return useSyncExternalStore(
    subscribe,
    () => loadPreferences().favoriteTeams,
    () => [],
  );
}

export function useSavedAnalyses(): SavedAnalysis[] {
  return useSyncExternalStore(
    subscribe,
    () => loadSavedAnalyses(),
    () => [],
  );
}