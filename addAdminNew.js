// addAdminNew.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

const name = "Michael Barber";
const email = "michael@tcbabees.org";
const username = "michael_admin";
const password = "BeeStrong!2025";
const role = "god-mode";

db.run(
  "INSERT OR IGNORE INTO members (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)",
  [name, email, username, password, role],
  function (err) {
    if (err) {
      console.error("❌ Error:", err.message);
    } else if (this.changes === 0) {
      console.log("⚠️  Admin already exists or username/email is taken.");
    } else {
      console.log("✅ New GOD-mode admin created:", username);
    }
    db.close();
  }
);
