// server.js — TCBA API backend

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.resolve(__dirname, 'tcba.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Database failed:", err.message);
  } else {
    console.log("✅ Connected to SQLite DB");
  }
});

// Test route
app.get('/test', (req, res) => {
  res.json({ status: 'ok', message: 'TCBA API working!' });
});

// Members route
app.get('/members', (req, res) => {
  db.all('SELECT * FROM members', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Port for Render
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`🚀 TCBA API running on port ${PORT}`);
});
