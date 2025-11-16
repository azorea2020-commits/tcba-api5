const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./database.db");

db.all("SELECT id, name, email, username, role FROM members", [], (err, rows) => {
  if (err) {
    console.error("Error:", err.message);
  } else if (!rows.length) {
    console.log("⚠️  No members found in the database.");
  } else {
    console.table(rows);
  }
  db.close();
});
