import crypto from "crypto";
import rateLimit from "express-rate-limit";

export function requestId(req, res, next) {
  const id = crypto.randomUUID();

  req.requestId = id;
  res.setHeader("X-Request-ID", id);

  next();
}

export function createRateLimiter({
  windowMs = 60 * 1000,
  max = 60,
} = {}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: "Too many requests. Please try again later.",
    },
  });
}

export function notFoundHandler(req, res) {
  res.status(404).json({
    error: "Endpoint not found.",
    requestId: req.requestId,
  });
}

export function errorHandler(error, req, res, next) {
  console.error(`[${req.requestId}]`, error);

  if (res.headersSent) {
    return next(error);
  }

  res.status(error.status || 500).json({
    error:
      error.status && error.message
        ? error.message
        : "Internal server error.",
    requestId: req.requestId,
  });
}