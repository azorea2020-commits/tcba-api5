// create-members.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Path to your DB file
const dbPath = path.join(__dirname, "db", "tcba.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  console.log("✅ Connected to database at:", dbPath);

  // Create members table if it doesn’t exist
  db.run(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error("❌ Error creating members table:", err.message);
    } else {
      console.log("🎉 Members table created (or already exists).");
    }
  });
});

db.close();
