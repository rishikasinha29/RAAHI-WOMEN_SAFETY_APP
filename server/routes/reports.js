import express from "express"
import { query } from "../db.js"
import { hazardSchema } from "../validation.js"
import { requireUser } from "../auth.js"

const router = express.Router()

/*
 * --------------------------------------------------
 * GET MY REPORTS
 * --------------------------------------------------
 *
 * Returns only reports created by the currently
 * authenticated user.
 */
router.get(
  "/mine",
  requireUser,
  async (req, res, next) => {
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
          h.anonymous,
          ST_Y(h.geom) AS lat,
          ST_X(h.geom) AS lon
        FROM hazards h
        JOIN hazard_categories c
          ON c.id = h.category_id
        WHERE h.reported_by = $1
        ORDER BY
          COALESCE(h.occurred_at, h.created_at) DESC
        `,
        [req.user.sub]
      )

      return res.json({
        reports: result.rows,
      })
    } catch (error) {
      next(error)
    }
  }
)

/*
 * --------------------------------------------------
 * CREATE REPORT
 * --------------------------------------------------
 */
router.post(
  "/",
  requireUser,
  async (req, res, next) => {
    try {
      const parsed =
        hazardSchema.safeParse(req.body)

      if (!parsed.success) {
        return res.status(400).json({
          error: "Invalid report.",
          details:
            parsed.error.flatten(),
        })
      }

      const {
        category,
        description,
        severity,
        lat,
        lon,
        address,
        occurredAt,
        anonymous,
      } = parsed.data

      const result =
        await query(
          `
          INSERT INTO hazards (
            category_id,
            description,
            severity,
            confidence,
            status,
            address,
            geom,
            occurred_at,
            reported_by,
            anonymous
          )
          SELECT
            id,
            $1,
            $2,
            0.5,
            'active',
            $3,
            ST_SetSRID(
              ST_MakePoint(
                $4,
                $5
              ),
              4326
            ),
            COALESCE(
              $6::timestamptz,
              NOW()
            ),
            $7,
            $8
          FROM hazard_categories
          WHERE name = $9

          RETURNING
            id,
            description,
            severity,
            confidence,
            status,
            address,
            occurred_at,
            anonymous,
            ST_Y(geom) AS lat,
            ST_X(geom) AS lon
          `,
          [
            description,
            severity,
            address,
            lon,
            lat,
            occurredAt || null,
            req.user.sub,
            anonymous,
            category,
          ]
        )

      if (result.rows.length === 0) {
        return res.status(400).json({
          error:
            "Invalid hazard category.",
        })
      }

      return res.status(201).json({
        report: result.rows[0],
      })
    } catch (error) {
      next(error)
    }
  }
)

/*
 * --------------------------------------------------
 * DELETE MY REPORT
 * --------------------------------------------------
 *
 * SECURITY:
 * The report ID alone is NOT sufficient.
 * PostgreSQL deletion also requires that the
 * report belongs to the current authenticated user.
 */
router.delete(
  "/:id",
  requireUser,
  async (req, res, next) => {
    try {
      const result = await query(
        `
        DELETE FROM hazards
        WHERE id = $1
          AND reported_by = $2
        RETURNING id
        `,
        [
          req.params.id,
          req.user.sub,
        ]
      )

      if (result.rows.length === 0) {
        return res.status(404).json({
          error:
            "Report not found or you are not authorized to delete it.",
        })
      }

      return res.json({
        success: true,
        id: result.rows[0].id,
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router