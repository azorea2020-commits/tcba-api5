// ===============================
// TCBA Backend - Clean Setup
// Express + SQLite
// ===============================
const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors({
  origin: "https://tcbabees.org",
  credentials: true,
}));
app.use(bodyParser.json());

// ===============================
// SQLite Database Setup
// ===============================
const dbPath = path.join(__dirname, "tcba.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to SQLite:", err.message);
  } else {
    console.log("✅ Connected to SQLite database at", dbPath);
  }
});

// Create users table if it doesn't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);
});

// ===============================
// API Routes
// ===============================

// Signup
app.post("/signup", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const stmt = db.prepare("INSERT INTO users (email, password) VALUES (?, ?)");
  stmt.run([email, password], function (err) {
    if (err) {
      console.error("❌ Signup error:", err.message);
      return res.status(400).json({ error: "Email already in use." });
    }
    console.log(`🆕 New user created: ${email}`);
    res.json({ message: "Signup successful", id: this.lastID });
  });
  stmt.finalize();
});

// Login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  db.get(
    "SELECT * FROM users WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) {
        console.error("❌ Login error:", err.message);
        return res.status(500).json({ error: "Database error." });
      }
      if (!row) {
        return res.status(401).json({ error: "Invalid credentials." });
      }
      console.log(`✅ Login successful: ${email}`);
      res.json({ message: "Login successful", user: { id: row.id, email: row.email } });
    }
  );
});

// Root test
app.get("/", (req, res) => {
  res.send("🐝 TCBA API is live!");
});

// ===============================
// Start Server
// ===============================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
