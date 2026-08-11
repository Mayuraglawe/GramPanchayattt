import fs from 'fs/promises';
import path from 'path';

// This is a simple mock database that saves data to a local JSON file.
// In a real application, you would use a real database like PostgreSQL or MongoDB.
const DB_FILE = path.join(process.cwd(), 'db.json');

export async function initDb() {
  try {
    await fs.access(DB_FILE);
  } catch {
    // File doesn't exist, create it with empty users array
    await fs.writeFile(DB_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

export async function getUsers() {
  await initDb();
  const data = await fs.readFile(DB_FILE, 'utf-8');
  return JSON.parse(data).users;
}

export async function saveUser(user: { fullName: string; mobile: string; hashedPin: string; role?: string }) {
  const users = await getUsers();
  
  // Check if mobile already exists
  const existingUser = users.find((u: { mobile: string }) => u.mobile === user.mobile);
  if (existingUser) {
    throw new Error('User with this mobile number already exists');
  }

  users.push({
    ...user,
    id: Date.now().toString(),
    createdAt: new Date().toISOString()
  });

  await fs.writeFile(DB_FILE, JSON.stringify({ users }, null, 2));
  return user;
}
