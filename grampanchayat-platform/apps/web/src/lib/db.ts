import fs from 'fs/promises';
import path from 'path';
import type { UserRole } from './auth';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DbUser {
  id: string;
  fullName: string;
  mobile: string;
  hashedPin: string;
  role: UserRole;
  createdAt: string;
}

// ─── Storage ──────────────────────────────────────────────────────────────────
// NOTE: This is a local JSON mock for development.
// In production this will be replaced with Prisma + PostgreSQL.
const DB_FILE = path.join(process.cwd(), 'db.json');

async function initDb(): Promise<void> {
  try {
    await fs.access(DB_FILE);
  } catch {
    await fs.writeFile(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

async function readDb(): Promise<{ users: DbUser[] }> {
  await initDb();
  const raw = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(raw);
}

async function writeDb(data: { users: DbUser[] }): Promise<void> {
  await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export async function getUsers(): Promise<DbUser[]> {
  const db = await readDb();
  return db.users;
}

export async function findUserByMobile(mobile: string): Promise<DbUser | null> {
  const users = await getUsers();
  return users.find((u) => u.mobile === mobile) ?? null;
}

export async function saveUser(user: {
  fullName: string;
  mobile: string;
  hashedPin: string;
  role: UserRole;
}): Promise<DbUser> {
  const db = await readDb();

  const existing = db.users.find((u) => u.mobile === user.mobile);
  if (existing) {
    throw new Error('User with this mobile number already exists');
  }

  const newUser: DbUser = {
    id: Date.now().toString(),
    ...user,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);
  await writeDb(db);
  return newUser;
}
