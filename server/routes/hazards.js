import express from "express";
import { query } from "../db.js";
import { requireAdmin } from "../auth.js";

const router = express.Router();

/*
 * GET /api/hazards
 * Return all active hazards with their category name.
 */
router.get("/", async (req, res, next) => {
  try {
    const result = await query(`
      SELECT
        h.id,
        c.name AS category,
        h.description,
        h.severity,
        h.confidence,
        h.status,
        h.address,
        h.occurred_at,
        h.created_at,
        h.updated_at,
        ST_Y(h.geom) AS lat,
        ST_X(h.geom) AS lon
      FROM hazards h
      JOIN hazard_categories c
        ON c.id = h.category_id
      WHERE h.status = 'active'
      ORDER BY h.created_at DESC
    `);

    res.json({
      hazards: result.rows,
    });
  } catch (error) {
    next(error);
  }
});

/*
 * GET /api/hazards/:id
 * Return a single hazard with its category name.
 */
router.get("/:id", async (req, res, next) => {
  try {
    const result = await query(
      `
      SELECT
        h.id,
        c.name AS category,
        h.description,
        h.severity,
        h.confidence,
        h.status,
        h.address,
        h.occurred_at,
        h.created_at,
        h.updated_at,
        ST_Y(h.geom) AS lat,
        ST_X(h.geom) AS lon
      FROM hazards h
      JOIN hazard_categories c
        ON c.id = h.category_id
      WHERE h.id = $1
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Hazard not found.",
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

/*
 * PATCH /api/hazards/:id
 * Admin-only hazard status update.
 */
router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const allowedStatuses = [
      "active",
      "review",
      "invalid",
      "resolved",
    ];

    if (!allowedStatuses.includes(req.body.status)) {
      return res.status(400).json({
        error: "Invalid hazard status.",
      });
    }

    const result = await query(
      `
      UPDATE hazards
      SET
        status = $1,
        updated_at = NOW()
      WHERE id = $2
      RETURNING
        id,
        status,
        updated_at
      `,
      [req.body.status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Hazard not found.",
      });
    }

    res.json({
      hazard: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
});

/*
 * DELETE /api/hazards/:id
 * Admin-only hazard deletion.
 */
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await query(
      `
      DELETE FROM hazards
      WHERE id = $1
      RETURNING id
      `,
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        error: "Hazard not found.",
      });
    }

    res.json({
      success: true,
      id: result.rows[0].id,
    });
  } catch (error) {
    next(error);
  }
});

export default router;