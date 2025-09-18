// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ ok: true, uptime: process.uptime() });
});

// Basic root
app.get('/', (req, res) => {
  res.status(200).send('TCBA API is running');
});

// Example API route
app.get('/api/ping', (req, res) => {
  res.json({ pong: true, ts: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TCBA API listening on port ${PORT}`);
});
