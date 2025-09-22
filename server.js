// server.js — TCBA Auth API (Express + Passport + SQLite)
// Full drop-in with /healthz, /, and /__whoami to prove which file is running.

require('dotenv').config();

const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const bcrypt = require('bcryptjs');

// ===== Env & constants =====
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.BASE_URL || `http://localhost:${PORT}`;
const isProd = process.env.NODE_ENV === 'production' || !!process.env.RENDER;
const SESSION_SECRET = process.env.SESSION_SECRET || 'change-me';
const BUILD = process.env.BUILD_TAG || 'dev-local';

// Allowed site origins for CORS (override with SITE_ORIGINS env, comma-separated)
const allowedOrigins = (process.env.SITE_ORIGINS ||
  'http://localhost:5500,http://localhost:3000,https://tcbabees.org'
).split(',').map(s => s.trim()).filter(Boolean);

// ===== App =====
const app = express();
if (isProd) app.set('trust proxy', 1); // needed for Render/https

app.use(cors({
  origin(origin, cb) {
    if (!origin) return cb(null, true); // curl/postman
    return allowedOrigins.includes(origin) ? cb(null, true) : cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,                    // must be true with sameSite 'none'
    maxAge: 1000 * 60 * 60 * 24 * 7    // 7 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// ===== SQLite (lightweight user store) =====
const sqlite3 = require('sqlite3').verbose();
const dbDir = path.join(__dirname, 'db');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir);
const dbPath = path.join(dbDir, 'users.sqlite');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) { if (err) return reject(err); resolve(this); });
  });
}
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => { if (err) return reject(err); resolve(row); });
  });
}

run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  password_hash TEXT,
  provider TEXT,
  provider_id TEXT,
  name TEXT,
  photo TEXT,
  created_at TEXT DEFAULT (datetime('now'))
)`);

// ===== Passport serialize/deserialize =====
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try { done(null, await get('SELECT * FROM users WHERE id = ?', [id]) || null); }
  catch (e) { done(e); }
});

// ===== Local (email/password) =====
passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
  try {
    const user = await get('SELECT * FROM users WHERE email = ?', [String(email).toLowerCase()]);
    if (!user || !user.password_hash) return done(null, false, { message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password_hash);
    return ok ? done(null, user) : done(null, false, { message: 'Invalid credentials' });
  } catch (e) { return done(e); }
}));

// ===== Google (optional) =====
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${BASE_URL}/auth/google/callback`
  }, async (_at, _rt, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase() || null;
      const pid = profile.id;
      let user = await get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['google', pid]);
      if (!user && email) user = await get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        await run('INSERT INTO users (email, provider, provider_id, name, photo) VALUES (?,?,?,?,?)', [
          email, 'google', pid, profile.displayName || '', profile.photos?.[0]?.value || null
        ]);
        user = await get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['google', pid]);
      }
      done(null, user);
    } catch (e) { done(e); }
  }));
}

// ===== Facebook (optional) =====
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: `${BASE_URL}/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'photos', 'emails']
  }, async (_at, _rt, profile, done) => {
    try {
      const email = profile.emails?.[0]?.value?.toLowerCase() || null;
      const pid = profile.id;
      let user = await get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['facebook', pid]);
      if (!user && email) user = await get('SELECT * FROM users WHERE email = ?', [email]);
      if (!user) {
        await run('INSERT INTO users (email, provider, provider_id, name, photo) VALUES (?,?,?,?,?)', [
          email, 'facebook', pid, profile.displayName || '', profile.photos?.[0]?.value || null
        ]);
        user = await get('SELECT * FROM users WHERE provider = ? AND provider_id = ?', ['facebook', pid]);
      }
      done(null, user);
    } catch (e) { done(e); }
  }));
}

// ===== Static test page =====
app.use('/public', express.static(path.join(__dirname, 'public')));

// ===== Health, Root, and WhoAmI (PLACED HERE, before listen) =====
app.get('/healthz', (_req, res) => res.json({ ok: true }));

app.get('/', (_req, res) => {
  res.type('text/plain').send('TCBA Auth API is running. Try /healthz, /__whoami, or /public/login.html');
});

app.get('/__whoami', (_req, res) => {
  res.json({
    build: BUILD,
    cwd: process.cwd(),
    dirname: __dirname,
    main: require.main?.filename,
    baseUrl: process.env.BASE_URL,
    nodeEnv: process.env.NODE_ENV,
    time: new Date().toISOString()
  });
});

// ===== API routes =====
app.get('/me', (req, res) => {
  if (!req.user) return res.status(401).json({ error: 'Not signed in' });
  const { id, email, name, photo, provider } = req.user;
  res.json({ id, email, name, photo, provider });
});

app.post('/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
    const lower = String(email).toLowerCase();
    const exists = await get('SELECT id FROM users WHERE email = ?', [lower]);
    if (exists) return res.status(409).json({ error: 'Email already in use' });
    const hash = await bcrypt.hash(password, 10);
    await run('INSERT INTO users (email, password_hash, provider, name) VALUES (?,?,?,?)',
      [lower, hash, 'local', name || '']);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Signup failed', detail: e.message }); }
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json({ error: info?.message || 'Unauthorized' });
    req.logIn(user, (err2) => {
      if (err2) return next(err2);
      res.json({ ok: true });
    });
  })(req, res, next);
});

app.post('/logout', (req, res) => {
  req.logout(() => res.json({ ok: true }));
});

// OAuth routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/public/login.html?error=google' }),
  (_req, res) => res.redirect('/public/login.html?success=google')
);

app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { failureRedirect: '/public/login.html?error=facebook' }),
  (_req, res) => res.redirect('/public/login.html?success=facebook')
);

// ===== Start (Render-friendly bind) =====
const HOST = isProd ? '0.0.0.0' : '127.0.0.1';
app.listen(PORT, HOST, () => {
  console.log(`TCBA Auth server running on ${BASE_URL} (HOST=${HOST}, PORT=${PORT}) :: BUILD=${BUILD}`);
});
