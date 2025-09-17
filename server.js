// server.js — TCBA minimal API
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// CORS: allow GoDaddy front-end origin(s)
const allowOrigin = process.env.ALLOW_ORIGIN || '*';
app.use(cors({
  origin: (origin, cb) => cb(null, true), // permissive; tighten in production
  credentials: true
}));

// Simple "session" using a cookie flag (for demo purposes only)
app.use((req, _res, next) => {
  req.session = {};
  if (req.cookies && req.cookies.tcba_auth === '1') req.session.authenticated = true;
  next();
});

app.get('/healthz', (_req, res) => res.status(200).send('OK'));

// Demo login: accepts any non-empty username/password
app.post('/api/login', (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }
  // Set a simple cookie to simulate auth
  res.cookie('tcba_auth', '1', { httpOnly: true, sameSite: 'Lax', maxAge: 1000*60*60*8 });
  res.status(200).json({ ok: true, user: { name: username } });
});

app.post('/api/logout', (_req, res) => {
  res.clearCookie('tcba_auth');
  res.status(200).json({ ok: true });
});

// Helpful placeholders so links don't 404
app.get('/auth/google', (_req, res) => {
  res
    .status(200)
    .send('Google OAuth placeholder. Your API is reachable. Integrate real OAuth later.');
});

app.get('/auth/paypal', (_req, res) => {
  res
    .status(200)
    .send('PayPal Login placeholder. Your API is reachable. Integrate real login later.');
});

// Fallback
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

app.listen(PORT, () => {
  console.log(`TCBA API listening on port ${PORT}`);
});
