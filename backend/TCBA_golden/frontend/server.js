const express = require('express');
const session = require('express-session');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const app = express();
app.set('trust proxy', 1); // needed on Fly/https to set secure cookies

const PORT = process.env.PORT || 8080;
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'tcba.sqlite');
const SESSION_SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const ORIGIN = process.env.CORS_ORIGIN || 'https://tcbabees.org';

fs.mkdirSync(DATA_DIR, { recursive: true });
const db = new sqlite3.Database(DB_FILE);
db.serialize(()=>{
  db.run(`CREATE TABLE IF NOT EXISTS users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    name TEXT,
    password TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

app.use(cors({
  origin: ORIGIN,           // exact origin (https://tcbabees.org)
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  // Cross-site cookie for frontend (tcbabees.org) ↔ API (fly.dev)
  cookie: {
    sameSite: 'none',
    secure: true,           // required for SameSite=None
    httpOnly: true
  }
}));

// Health
app.get('/api/health', (req,res)=>res.json({ ok:true, time:new Date().toISOString() }));

// Auth (simple email/pass demo)
app.post('/signup', (req,res)=>{
  const { email, password, name='TCBA User' } = req.body || {};
  if(!email || !password) return res.status(400).json({ error:'Missing email/password' });
  db.run(`INSERT INTO users(email,name,password) VALUES(?,?,?)`, [email,name,password], function(err){
    if (err) return res.status(400).json({ error:'User exists or DB error' });
    req.session.userId = this.lastID;
    res.json({ ok:true, userId:this.lastID });
  });
});

app.post('/login', (req,res)=>{
  const { email, password } = req.body || {};
  if(!email || !password) return res.status(400).json({ error:'Missing email/password' });
  db.get(`SELECT id FROM users WHERE email=? AND password=?`, [email,password], (err,row)=>{
    if (err) return res.status(500).json({ error:'DB error' });
    if (!row) return res.status(401).json({ error:'Invalid credentials' });
    req.session.userId = row.id;
    res.json({ ok:true, userId: row.id });
  });
});

app.post('/logout', (req,res)=>req.session.destroy(()=>res.json({ ok:true })));

// NEW: session check for the login page
app.get('/me', (req,res)=>{
  if (!req.session.userId) return res.json({ userId:null });
  res.json({ userId: req.session.userId });
});

app.get('/', (_,res)=>res.json({ api:'tcba', health:'/api/health' }));

app.listen(PORT, ()=>console.log('TCBA API on', PORT));
