import {
  readJsonStore,
  writeJsonStore,
} from "@/lib/persistence/store";
import type { SavedAnalysis } from "@/types/analysis";
import type { UserPreferences } from "@/types/user";
import { DEFAULT_USER_PREFERENCES } from "@/types/user";

const SAVED_STORE = "saved-analyses.json";
const PREFERENCES_STORE = "user-preferences.json";

const memorySaved = new Map<string, SavedAnalysis>();
let memoryPreferences: UserPreferences = { ...DEFAULT_USER_PREFERENCES };

async function readSavedMap(): Promise<Record<string, SavedAnalysis>> {
  return readJsonStore<Record<string, SavedAnalysis>>(SAVED_STORE, {});
}

export async function saveAnalysis(
  analysis: SavedAnalysis,
): Promise<SavedAnalysis> {
  memorySaved.set(analysis.id, analysis);

  try {
    const store = await readSavedMap();
    store[analysis.id] = analysis;
    await writeJsonStore(SAVED_STORE, store);
  } catch {
    // Fall back to in-memory when filesystem is unavailable (e.g. serverless).
  }

  return analysis;
}

export async function listSavedAnalyses(): Promise<SavedAnalysis[]> {
  try {
    const store = await readSavedMap();
    return Object.values(store).sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt),
    );
  } catch {
    return Array.from(memorySaved.values()).sort((a, b) =>
      b.savedAt.localeCompare(a.savedAt),
    );
  }
}

export async function getSavedAnalysis(
  id: string,
): Promise<SavedAnalysis | null> {
  try {
    const store = await readSavedMap();
    return store[id] ?? memorySaved.get(id) ?? null;
  } catch {
    return memorySaved.get(id) ?? null;
  }
}

export async function getUserPreferences(): Promise<UserPreferences> {
  try {
    return readJsonStore<UserPreferences>(
      PREFERENCES_STORE,
      memoryPreferences,
    );
  } catch {
    return memoryPreferences;
  }
}

export async function updateUserPreferences(
  patch: Partial<Pick<UserPreferences, "favoriteTeams" | "favoriteLeagues">>,
): Promise<UserPreferences> {
  const current = await getUserPreferences();
  const next: UserPreferences = {
    ...current,
    ...patch,
    updatedAt: new Date().toISOString(),
  };

  memoryPreferences = next;

  try {
    await writeJsonStore(PREFERENCES_STORE, next);
  } catch {
    // Keep in-memory fallback.
  }

  return next;
}