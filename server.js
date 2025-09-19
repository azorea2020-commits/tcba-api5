require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const app = express();
const PORT = process.env.PORT || 5000;

// --- basic app setup ---
app.set('trust proxy', 1);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- session (required for Passport) ---
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,            // set true behind HTTPS proxy (Render); keep false locally
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 8 // 8h
    }
  })
);

// --- Passport base wiring ---
app.use(passport.initialize());
app.use(passport.session());

// Serialize minimal user into the session
passport.serializeUser((user, done) => done(null, { id: user.id, name: user.name, provider: user.provider }));
passport.deserializeUser((obj, done) => done(null, obj));

// --- Google OAuth ---
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:5000/auth/google/callback
      },
      (accessToken, refreshToken, profile, done) => {
        const user = { id: profile.id, name: profile.displayName, provider: 'google' };
        return done(null, user);
      }
    )
  );

  app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      failureRedirect: '/login.html?err=oauth',
    }),
    (req, res) => res.redirect('/welcome.html')
  );
}

// --- Facebook OAuth ---
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: process.env.FACEBOOK_CALLBACK_URL, // e.g. http://localhost:5000/auth/facebook/callback
        profileFields: ['id', 'displayName', 'emails']
      },
      (accessToken, refreshToken, profile, done) => {
        const user = { id: profile.id, name: profile.displayName, provider: 'facebook' };
        return done(null, user);
      }
    )
  );

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));

  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/login.html?err=oauth',
    }),
    (req, res) => res.redirect('/welcome.html')
  );
}

// --- auth helpers ---
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

// --- static files ---
const publicDir = path.join(__dirname, 'public_html');
app.use(express.static(publicDir, { index: 'index.html' }));

// Protected example (optional): if you want to gate a route
app.get('/app', requireAuth, (req, res) => res.redirect('/welcome.html'));

// health
app.get('/healthz', (_req, res) => res.status(200).send('ok'));

// fallback: return index.html for other GETs
app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

app.listen(PORT, () => console.log(`TCBA API listening on port ${PORT}`));
