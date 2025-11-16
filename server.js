// server.js — TCBA API backend clean version for Render

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database file (local SQLite file in same folder)
const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, err => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
    } else {
        console.log("✅ Connected to SQLite database.");
    }
});

// Test route
app.get('/test', (req, res) => {
    res.json({ status: 'ok', message: 'TCBA API test route is working!' });
});

// Members route example
app.get('/members', (req, res) => {
    db.all("SELECT * FROM members", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Render-required PORT
const PORT = process.env.PORT || 10000;

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 TCBA API running on port ${PORT}`);
});
