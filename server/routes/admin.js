import express from "express";
import bcrypt from "bcryptjs";
import { query } from "../db.js";
import { createToken, requireAdmin } from "../auth.js";

const router = express.Router();

router.post("/login", async (req, res, next) => {
  try {
    const email =
      String(req.body.email || "")
        .trim()
        .toLowerCase();

    const password =
      String(req.body.password || "");

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required.",
      });
    }

    const result = await query(
      `
      SELECT id, email, password_hash
      FROM admin_users
      WHERE email = $1
      `,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    const admin = result.rows[0];

    const valid =
      await bcrypt.compare(
        password,
        admin.password_hash
      );

    if (!valid) {
      return res.status(401).json({
        error: "Invalid credentials.",
      });
    }

    const token =
      createToken(admin);

    res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get(
  "/dashboard",
  requireAdmin,
  async (req, res, next) => {
    try {
      const result = await query(`
        SELECT
          COUNT(*)::int AS total,
          COUNT(*) FILTER (
            WHERE status = 'active'
          )::int AS active,
          COUNT(*) FILTER (
            WHERE status = 'review'
          )::int AS review,
          COUNT(*) FILTER (
            WHERE status = 'resolved'
          )::int AS resolved,
          COUNT(*) FILTER (
            WHERE status = 'invalid'
          )::int AS invalid
        FROM hazards
      `);

      res.json({
        statistics: result.rows[0],
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;