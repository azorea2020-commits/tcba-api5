import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import membersRouter from "./routes/members.js";

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());

// Routes
app.use("/api/members", membersRouter);

// Root
app.get("/", (req, res) => {
  res.send("TCBA API is live and working!");
});

// Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ TCBA API running on port ${PORT}`));
