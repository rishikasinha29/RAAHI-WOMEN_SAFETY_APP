import jwt from "jsonwebtoken"

function getSecret() {
  if (!process.env.JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured."
    )
  }

  return process.env.JWT_SECRET
}

/*
 * Admin JWT
 */
export function createToken(admin) {
  return jwt.sign(
    {
      sub: admin.id,
      email: admin.email,
      role: "admin",
    },
    getSecret(),
    {
      expiresIn: "8h",
    }
  )
}

/*
 * Normal user JWT
 */
export function createUserToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: "user",
    },
    getSecret(),
    {
      expiresIn: "7d",
    }
  )
}

/*
 * Read Bearer token.
 */
function getBearerToken(req) {
  const authorization =
    req.headers.authorization

  if (
    !authorization?.startsWith(
      "Bearer "
    )
  ) {
    return null
  }

  return authorization.slice(
    "Bearer ".length
  )
}

/*
 * Admin-only middleware.
 */
export function requireAdmin(
  req,
  res,
  next
) {
  const token =
    getBearerToken(req)

  if (!token) {
    return res.status(401).json({
      error:
        "Authentication required.",
    })
  }

  try {
    const decoded =
      jwt.verify(
        token,
        getSecret()
      )

    if (
      decoded.role !==
      "admin"
    ) {
      return res.status(403).json({
        error:
          "Administrator access required.",
      })
    }

    req.admin = decoded

    next()
  } catch {
    return res.status(401).json({
      error:
        "Invalid or expired authentication token.",
    })
  }
}

/*
 * Normal-user middleware.
 *
 * Admins are not accepted here.
 */
export function requireUser(
  req,
  res,
  next
) {
  const token =
    getBearerToken(req)

  if (!token) {
    return res.status(401).json({
      error:
        "Login required.",
    })
  }

  try {
    const decoded =
      jwt.verify(
        token,
        getSecret()
      )

    if (
      decoded.role !==
      "user"
    ) {
      return res.status(403).json({
        error:
          "User account required.",
      })
    }

    req.user = decoded

    next()
  } catch {
    return res.status(401).json({
      error:
        "Invalid or expired authentication token.",
    })
  }
}

/*
 * Optional authentication.
 *
 * Used by SOS so emergency functionality
 * is not blocked for logged-out users.
 */
export function optionalUser(
  req,
  res,
  next
) {
  const token =
    getBearerToken(req)

  req.user = null

  if (!token) {
    return next()
  }

  try {
    const decoded =
      jwt.verify(
        token,
        getSecret()
      )

    if (
      decoded.role ===
      "user"
    ) {
      req.user = decoded
    }
  } catch {
    req.user = null
  }

  next()
}