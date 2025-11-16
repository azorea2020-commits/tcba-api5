import express from "express";
import { openDb } from "../models/db.js";
const router = express.Router();

router.get("/", async (req, res) => {
  const db = await openDb();
  const members = await db.all("SELECT * FROM members");
  res.json(members);
});

export default router;
