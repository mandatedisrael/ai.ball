"use client";

import { useSyncExternalStore } from "react";

import {
  loadPreferences,
  loadSavedAnalyses,
} from "@/lib/client/local-store";
import type { SavedAnalysis } from "@/types/analysis";

const EMPTY_TEAMS: string[] = [];
const EMPTY_SAVED: SavedAnalysis[] = [];

let cachedTeams = EMPTY_TEAMS;
let cachedTeamsKey = "";
let cachedSaved = EMPTY_SAVED;
let cachedSavedKey = "";

function invalidateSnapshots() {
  cachedTeamsKey = "";
  cachedSavedKey = "";
}

function subscribe(callback: () => void) {
  const handler = () => {
    invalidateSnapshots();
    callback();
  };

  window.addEventListener("storage", handler);
  window.addEventListener("match-analyst:store", handler);

  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("match-analyst:store", handler);
  };
}

function getFavoriteTeamsSnapshot(): string[] {
  const teams = loadPreferences().favoriteTeams;
  const key = JSON.stringify(teams);

  if (key === cachedTeamsKey) {
    return cachedTeams;
  }

  cachedTeamsKey = key;
  cachedTeams = teams;
  return cachedTeams;
}

function getSavedAnalysesSnapshot(): SavedAnalysis[] {
  const items = loadSavedAnalyses();
  const key = JSON.stringify(items);

  if (key === cachedSavedKey) {
    return cachedSaved;
  }

  cachedSavedKey = key;
  cachedSaved = items;
  return cachedSaved;
}

export function useFavoriteTeams(): string[] {
  return useSyncExternalStore(
    subscribe,
    getFavoriteTeamsSnapshot,
    () => EMPTY_TEAMS,
  );
}

export function useSavedAnalyses(): SavedAnalysis[] {
  return useSyncExternalStore(
    subscribe,
    getSavedAnalysesSnapshot,
    () => EMPTY_SAVED,
  );
}