import initSqlJs from 'sql.js';
import fs from 'fs';
import { hashPassword } from '../utils/auth.utils.js';

let db;
let SQL;

export async function initializeDatabase() {
  try {
    SQL = await initSqlJs();
    
    // Try to load existing database
    let buffer;
    try {
      buffer = fs.readFileSync('crm.db');
      db = new SQL.Database(buffer);
    } catch (err) {
      // If file doesn't exist, create new database
      db = new SQL.Database();
      await createTables();
      await createAdminUser();
    }

    // Save database periodically
    setInterval(saveDatabase, 5000);

    return db;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

async function createTables() {
  // Users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Leads table
  db.run(`
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      status TEXT NOT NULL,
      source TEXT,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assigned_to) REFERENCES users(id)
    )
  `);

  // Notes table
  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lead_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lead_id) REFERENCES leads(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);
}

async function createAdminUser() {
  const adminEmail = 'admin@example.com';
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  const admin = stmt.get([adminEmail]);
  stmt.free();
  
  if (!admin) {
    const hashedPassword = hashPassword('admin123');
    const insertStmt = db.prepare(`
      INSERT INTO users (email, password, name, role)
      VALUES (?, ?, ?, ?)
    `);
    insertStmt.run([adminEmail, hashedPassword, 'Admin User', 'admin']);
    insertStmt.free();
  }
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync('crm.db', buffer);
}

// Database query helpers
export const dbHelpers = {
  prepare: (sql) => {
    return db.prepare(sql);
  },
  
  run: (sql, params = []) => {
    return db.run(sql, params);
  },
  
  get: (sql, params = []) => {
    const stmt = db.prepare(sql);
    const result = stmt.get(params);
    stmt.free();
    return result;
  },
  
  all: (sql, params = []) => {
    const stmt = db.prepare(sql);
    const results = stmt.all(params);
    stmt.free();
    return results;
  },
  
  exec: (sql) => {
    return db.exec(sql);
  }
};

export default dbHelpers;