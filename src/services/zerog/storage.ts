import type { SavedAnalysis } from "@/types/analysis";

const memoryStore = new Map<string, SavedAnalysis>();

export async function saveAnalysis(
  analysis: SavedAnalysis,
): Promise<SavedAnalysis> {
  memoryStore.set(analysis.id, analysis);
  return analysis;
}

export async function listSavedAnalyses(): Promise<SavedAnalysis[]> {
  return Array.from(memoryStore.values()).sort((a, b) =>
    b.savedAt.localeCompare(a.savedAt),
  );
}

export async function getSavedAnalysis(
  id: string,
): Promise<SavedAnalysis | null> {
  return memoryStore.get(id) ?? null;
}