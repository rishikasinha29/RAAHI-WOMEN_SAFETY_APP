import express from "express";
import { searchLocations } from "../services/geocoding.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const q = String(req.query.q || "").trim();

    if (q.length < 2) {
      return res.json({
        results: [],
      });
    }

    const results =
      await searchLocations(q);

    res.json({
      results,
    });
  } catch (error) {
    next(error);
  }
});

export default router;