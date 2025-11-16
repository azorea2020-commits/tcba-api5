import express from "express";
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "Wallet route active" });
});

export default router;
