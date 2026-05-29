import { promises as fs } from "fs";
import path from "path";
import type { StoredTransaction } from "./payphone";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "transactions.json");

async function ensureFile(): Promise<void> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.access(FILE);
  } catch {
    await fs.writeFile(FILE, "[]", "utf8");
  }
}

async function readAll(): Promise<StoredTransaction[]> {
  await ensureFile();
  const raw = await fs.readFile(FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as StoredTransaction[]) : [];
  } catch {
    return [];
  }
}

async function writeAll(list: StoredTransaction[]): Promise<void> {
  await ensureFile();
  await fs.writeFile(FILE, JSON.stringify(list, null, 2), "utf8");
}

export async function saveTransaction(tx: StoredTransaction): Promise<void> {
  const list = await readAll();
  const idx = list.findIndex((t) => t.clientTransactionId === tx.clientTransactionId);
  if (idx >= 0) list[idx] = tx;
  else list.push(tx);
  await writeAll(list);
}

export async function getTransaction(
  clientTransactionId: string
): Promise<StoredTransaction | null> {
  const list = await readAll();
  return list.find((t) => t.clientTransactionId === clientTransactionId) ?? null;
}
