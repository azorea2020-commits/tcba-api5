import express from "express";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import bcrypt from "bcrypt";

const router = express.Router();

async function openDb() {
  return open({
    filename: "./database/tcba.db",
    driver: sqlite3.Database
  });
}

// POST /login — verify user
router.post("/", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if ((!username && !email) || !password) {
      return res.status(400).json({ message: "Missing username/email or password." });
    }

    const db = await openDb();
    const user = await db.get(
      "SELECT * FROM members WHERE username = ? OR email = ?",
      [username, email]
    );

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: "Invalid password." });
    }

    res.json({ message: `Welcome ${user.name}!`, member_id: user.id });
    await db.close();
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Error during login: " + err.message });
  }
});

export default router;
