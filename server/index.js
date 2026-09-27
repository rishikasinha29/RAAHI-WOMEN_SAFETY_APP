import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import geocodeRoutes from "./routes/geocode.js";
import routeRoutes from "./routes/routes.js";
import hazardRoutes from "./routes/hazards.js";
import reportRoutes from "./routes/reports.js";
import sosRoutes from "./routes/sos.js";
import adminRoutes from "./routes/admin.js";
import authRoutes from "./routes/auth.js";
import officialCrimeRoutes from "./routes/officialCrime.js";
import locationRoutes from "./routes/locations.js";

import {
  requestId,
  createRateLimiter,
  notFoundHandler,
  errorHandler,
} from "./middleware.js";

import { closeDatabase } from "./db.js";

const app = express();

const PORT =
  Number(process.env.PORT) || 4000;

const allowedOrigin =
  process.env.CORS_ORIGIN ||
  "http://localhost:5173";

app.use(helmet());

app.use(
  cors({
    origin: allowedOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  })
);

app.use(
  express.json({
    limit: "32kb",
  })
);

app.use(requestId);

app.use(
  createRateLimiter({
    windowMs:
      Number(
        process.env.RATE_LIMIT_WINDOW_MS
      ) || 60000,

    max:
      Number(
        process.env.RATE_LIMIT_MAX
      ) || 120,
  })
);

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "ANZEN API",
    timestamp: new Date().toISOString(),
  });
});

app.use(
  "/api/geocode",
  geocodeRoutes
);

app.use(
  "/api/routes",
  routeRoutes
);

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/hazards",
  hazardRoutes
);

app.use(
  "/api/reports",
  reportRoutes
);

app.use(
  "/api/sos",
  sosRoutes
);

app.use(
  "/api/locations", 
  locationRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/official-crime",
  officialCrimeRoutes
);

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(
  PORT,
  () => {
    console.log(
      `ANZEN API running on port ${PORT}`
    );
  }
);

async function shutdown(signal) {
  console.log(
    `${signal} received. Shutting down...`
  );

  server.close(async () => {
    try {
      await closeDatabase();
      process.exit(0);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  });
}

process.on(
  "SIGTERM",
  () => shutdown("SIGTERM")
);

process.on(
  "SIGINT",
  () => shutdown("SIGINT")
);

export default app;