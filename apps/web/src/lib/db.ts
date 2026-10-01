import Database from 'better-sqlite3';
import path from 'path';

// Create or connect to a local sqlite database
const dbPath = path.join(process.cwd(), 'leads.db');
const db = new Database(dbPath);

// Initialize table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

export function addLead(email: string, url: string) {
  const stmt = db.prepare('INSERT INTO leads (email, url) VALUES (?, ?)');
  return stmt.run(email, url);
}

export function getLeads() {
  const stmt = db.prepare('SELECT * FROM leads ORDER BY created_at DESC');
  return stmt.all();
}
