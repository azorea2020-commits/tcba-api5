require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const PayPalStrategy = require("passport-oauth2").Strategy;

const app = express();

// =====================
// SESSION SETUP
// =====================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "super-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);

// =====================
// PASSPORT SETUP
// =====================
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// =====================
// GOOGLE STRATEGY
// =====================
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// =====================
// PAYPAL STRATEGY
// =====================
passport.use(
  "paypal",
  new PayPalStrategy(
    {
      authorizationURL: "https://www.sandbox.paypal.com/signin/authorize",
      tokenURL: "https://api.sandbox.paypal.com/v1/oauth2/token",
      clientID: process.env.PAYPAL_CLIENT_ID,
      clientSecret: process.env.PAYPAL_CLIENT_SECRET,
      callbackURL: "/auth/paypal/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, { accessToken });
    }
  )
);

// =====================
// ROUTES
// =====================
app.get("/", (req, res) => {
  res.send("TCBA API is running!");
});

// ----- GOOGLE -----
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login-failed",
    successRedirect: "/login-success",
  })
);

// ----- PAYPAL -----
app.get("/auth/paypal", passport.authenticate("paypal"));

app.get(
  "/auth/paypal/callback",
  passport.authenticate("paypal", {
    failureRedirect: "/login-failed",
    successRedirect: "/login-success",
  })
);

// ----- STATUS ROUTES -----
app.get("/login-success", (req, res) => {
  res.send("✅ Login successful!");
});

app.get("/login-failed", (req, res) => {
  res.send("❌ Login failed!");
});

// =====================
// START SERVER
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
