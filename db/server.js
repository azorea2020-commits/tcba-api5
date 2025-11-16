
// ================================================
// Treasure Coast Bee Association Backend (TCBA)
// ================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
require("dotenv").config();

// === Setup Express ===
const app = express();
const PORT = process.env.PORT || 3000;

// === Allow Frontend Connections ===
app.use(cors({
  origin: [
    "http://localhost",
    "http://127.0.0.1",
    "https://tcbabees.org"
  ],
  credentials: true
}));

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// === Connect to Database ===
const dbPath = process.env.DB_PATH || "./db/tcba.db";
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Failed to connect to database:", err.message);
  } else {
    console.log("✅ Connected to TCBA database at", dbPath);
  }
});

// === Create Members Table if Missing ===
db.run(`
  CREATE TABLE IF NOT EXISTS members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT,
    joined TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// === Basic Test Route ===
app.get("/", (req, res) => {
  res.json({ message: "🐝 TCBA API is online!" });
});

// === Signup Route ===
app.post("/signup", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing required fields" });

  const query = "INSERT INTO members (name, email, password) VALUES (?, ?, ?)";
  db.run(query, [name, email, password], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: this.lastID, name });
  });
});

// === Login Route ===
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing credentials" });

  db.get("SELECT * FROM members WHERE email = ? AND password = ?",
    [email, password],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(401).json({ error: "Invalid email or password" });
      res.json({ success: true, user: row });
    }
  );
});

// === Launch Server ===
app.listen(PORT, () => {
  console.log(`🚀 TCBA backend running on port ${PORT}`);
});
