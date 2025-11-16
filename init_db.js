import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function setupDatabase() {
  const db = await open({
    filename: "./database/tcba.db",
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      dob TEXT,
      address TEXT,
      email TEXT UNIQUE,
      phone TEXT,
      username TEXT UNIQUE,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Members table ready.");
  await db.close();
}

setupDatabase();
