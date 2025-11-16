// addAdminNew.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

const name = "Michael Barber";
const email = "michael@tcbabees.org";
const username = "michael_admin";
const password = "BeeStrong!2025";
const role = "god-mode";

db.run(
  "INSERT INTO members (name, email, username, password, role) VALUES (?, ?, ?, ?, ?)",
  [name, email, username, password, role],
  function (err) {
    if (err) {
      if (err.message && err.message.includes("UNIQUE constraint failed")) {
        console.error("Error: That username already exists.");
      } else {
        console.error("Error:", err.message);
      }
    } else {
      console.log("✅ New admin created:", { id: this.lastID, username });
    }
    db.close();
  }
);
