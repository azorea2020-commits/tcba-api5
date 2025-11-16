// ============================
// Treasure Coast Bee Association API
// ============================

import express from "express";
import session from "express-session";
import cors from "cors";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -----------------------------
// Express App Configuration
// -----------------------------
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Allow both Render and GoDaddy domains to connect
app.use(
  cors({
    origin: [
      "https://tcbabees.org",
      "https://www.tcbabees.org",
      "https://tcba-api.onrender.com",
      "http://localhost:8080"
    ],
    credentials: true,
  })
);

// -----------------------------
// Session Setup
// -----------------------------
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// -----------------------------
// Database (SQLite)
// -----------------------------
let db;
(async () => {
  db = await open({
    filename: "./tcba.db",
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      role TEXT DEFAULT 'member'
    );
  `);
})();

// -----------------------------
// Routes
// -----------------------------

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// Basic root route
app.get("/", (req, res) => {
  res.send("TCBA API is running successfully!");
});

// Test route for users
app.get("/api/members", async (req, res) => {
  try {
    const members = await db.all("SELECT id, name, email, role FROM members");
    res.json(members);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});

// Example route to add a member (POST)
app.post("/api/members", async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    await db.run(
      "INSERT INTO members (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role || "member"]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Insert failed" });
  }
});

// -----------------------------
// Start Server
// -----------------------------
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`✅ TCBA API running on port ${PORT}`);
});
