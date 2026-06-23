import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), ".data");

async function ensureDataDir(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
}

function filePath(name: string): string {
  return path.join(DATA_DIR, name);
}

export async function readJsonStore<T>(name: string, fallback: T): Promise<T> {
  try {
    await ensureDataDir();
    const raw = await readFile(filePath(name), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJsonStore<T>(name: string, value: T): Promise<void> {
  await ensureDataDir();
  await writeFile(filePath(name), JSON.stringify(value, null, 2), "utf8");
}