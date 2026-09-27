import express from "express"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { query } from "../db.js"
import { createUserToken } from "../auth.js"

const router =
  express.Router()

const registerSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(120),

    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform(
        (value) =>
          value.toLowerCase()
      ),

    password: z
      .string()
      .min(8)
      .max(128),
  })

const loginSchema =
  z.object({
    email: z
      .string()
      .trim()
      .email()
      .max(255)
      .transform(
        (value) =>
          value.toLowerCase()
      ),

    password: z
      .string()
      .min(1)
      .max(128),
  })

/*
 * POST /api/auth/register
 */
router.post(
  "/register",
  async (
    req,
    res,
    next
  ) => {
    try {
      const parsed =
        registerSchema.safeParse(
          req.body
        )

      if (!parsed.success) {
        return res.status(400).json({
          error:
            "Invalid registration details.",
          details:
            parsed.error.flatten(),
        })
      }

      const {
        name,
        email,
        password,
      } = parsed.data

      const existing =
        await query(
          `
          SELECT id
          FROM users
          WHERE email = $1
          LIMIT 1
          `,
          [email]
        )

      if (
        existing.rows.length >
        0
      ) {
        return res.status(409).json({
          error:
            "An account with this email already exists.",
        })
      }

      const passwordHash =
        await bcrypt.hash(
          password,
          12
        )

      const result =
        await query(
          `
          INSERT INTO users (
            name,
            email,
            password_hash
          )
          VALUES (
            $1,
            $2,
            $3
          )
          RETURNING
            id,
            name,
            email,
            created_at
          `,
          [
            name,
            email,
            passwordHash,
          ]
        )

      const user =
        result.rows[0]

      const token =
        createUserToken(
          user
        )

      res.status(201).json({
        token,

        user: {
          id:
            user.id,
          name:
            user.name,
          email:
            user.email,
        },
      })
    } catch (error) {
      if (
        error.code ===
        "23505"
      ) {
        return res.status(409).json({
          error:
            "An account with this email already exists.",
        })
      }

      next(error)
    }
  }
)

/*
 * POST /api/auth/login
 */
router.post(
  "/login",
  async (
    req,
    res,
    next
  ) => {
    try {
      const parsed =
        loginSchema.safeParse(
          req.body
        )

      if (!parsed.success) {
        return res.status(400).json({
          error:
            "Invalid login details.",
        })
      }

      const {
        email,
        password,
      } = parsed.data

      const result =
        await query(
          `
          SELECT
            id,
            name,
            email,
            password_hash
          FROM users
          WHERE email = $1
          LIMIT 1
          `,
          [email]
        )

      if (
        result.rows.length ===
        0
      ) {
        return res.status(401).json({
          error:
            "Invalid email or password.",
        })
      }

      const user =
        result.rows[0]

      const passwordValid =
        await bcrypt.compare(
          password,
          user.password_hash
        )

      if (!passwordValid) {
        return res.status(401).json({
          error:
            "Invalid email or password.",
        })
      }

      const token =
        createUserToken(
          user
        )

      res.json({
        token,

        user: {
          id:
            user.id,
          name:
            user.name,
          email:
            user.email,
        },
      })
    } catch (error) {
      next(error)
    }
  }
)

/*
 * GET /api/auth/me
 */
router.get(
  "/me",
  async (
    req,
    res,
    next
  ) => {
    try {
      const authorization =
        req.headers.authorization

      if (
        !authorization?.startsWith(
          "Bearer "
        )
      ) {
        return res.status(401).json({
          error:
            "Authentication required.",
        })
      }

      const token =
        authorization.slice(
          "Bearer ".length
        )

      const jwt =
        await import(
          "jsonwebtoken"
        )

      let decoded

      try {
        decoded =
          jwt.default.verify(
            token,
            process.env.JWT_SECRET
          )
      } catch {
        return res.status(401).json({
          error:
            "Invalid or expired authentication token.",
        })
      }

      if (
        decoded.role !==
        "user"
      ) {
        return res.status(403).json({
          error:
            "User account required.",
        })
      }

      const result =
        await query(
          `
          SELECT
            id,
            name,
            email,
            created_at
          FROM users
          WHERE id = $1
          LIMIT 1
          `,
          [decoded.sub]
        )

      if (
        result.rows.length ===
        0
      ) {
        return res.status(401).json({
          error:
            "User account no longer exists.",
        })
      }

      res.json({
        user:
          result.rows[0],
      })
    } catch (error) {
      next(error)
    }
  }
)

export default router