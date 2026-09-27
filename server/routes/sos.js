import express from "express"
import { pool } from "../db.js"
import { optionalUser } from "../auth.js"

const router = express.Router()

router.post("/", optionalUser, async (req, res) => {
  try {
    const {
      latitude,
      longitude,
      accuracy,
    } = req.body

    if (
      typeof latitude !== "number" ||
      typeof longitude !== "number"
    ) {
      return res.status(400).json({
        error: "Valid latitude and longitude are required.",
      })
    }

    if (
      latitude < -90 ||
      latitude > 90 ||
      longitude < -180 ||
      longitude > 180
    ) {
      return res.status(400).json({
        error: "Invalid geographic coordinates.",
      })
    }

    const userId = req.user?.sub || null

    const result = await pool.query(
      `
      INSERT INTO sos_sessions (
        user_id,
        latitude,
        longitude,
        accuracy,
        created_at
      )
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING
        id,
        user_id,
        latitude,
        longitude,
        accuracy,
        created_at
      `,
      [
        userId,
        latitude,
        longitude,
        accuracy ?? null,
      ]
    )

    return res.status(201).json({
      success: true,
      session: result.rows[0],
    })
  } catch (error) {
    console.error(
      "SOS session creation error:",
      error
    )

    return res.status(500).json({
      error: "Failed to create SOS session.",
    })
  }
})

export default router