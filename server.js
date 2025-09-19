// server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

// --- basics ---
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
  })
);
app.use(passport.initialize());
app.use(passport.session());

// --- passport serialize/deserialize ---
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

// --- Google OAuth (only if keys exist) ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL:
          process.env.GOOGLE_CALLBACK_URL ||
          'http://localhost:5000/auth/google/callback',
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, { id: profile.id, name: profile.displayName, provider: 'google' });
      }
    )
  );

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login.html?err=oauth' }),
    (_req, res) => res.redirect('/welcome.html')
  );
}

// --- Facebook OAuth (only if keys exist) ---
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL:
          process.env.FACEBOOK_CALLBACK_URL ||
          'http://localhost:5000/auth/facebook/callback',
        profileFields: ['id', 'displayName', 'emails'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, { id: profile.id, name: profile.displayName, provider: 'facebook' });
      }
    )
  );

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login.html?err=oauth' }),
    (_req, res) => res.redirect('/welcome.html')
  );
}

// --- helpers ---
function requireAuth(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) return next();
  return res.redirect('/login.html');
}

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    req.session.destroy(() => res.redirect('/login.html'));
  });
});

// --- static site ---
const PUBLIC = path.join(__dirname, 'public_html');
app.use(express.static(PUBLIC, { index: 'index.html' }));

// optional protected route example
app.get('/app', requireAuth, (_req, res) => res.redirect('/welcome.html'));

// health & fallback
app.get('/healthz', (_req, res) => res.status(200).send('ok'));
app.get('*', (_req, res) => res.sendFile(path.join(PUBLIC, 'index.html')));

// --- start ---
app.listen(PORT, () => {
  console.log(`TCBA API listening on port ${PORT}`);
});
