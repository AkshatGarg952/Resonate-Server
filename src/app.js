import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import diagnosticsRoutes from "./routes/diagnostics.routes.js";
import fitRoutes from "./routes/fitConnect.routes.js"
import waterRoutes from "./routes/water.routes.js"
import coachRoutes from "./routes/coachLead.routes.js"
import workoutRoutes from "./routes/workout.routes.js"
import nutritionRoutes from "./routes/nutrition.routes.js"
import foodRoutes from "./routes/food.routes.js"
import interventionRoutes from "./routes/intervention.routes.js";
import dailyLogRoutes from "./routes/dailyLog.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import { startFitnessSync } from "./cron/fitnessSync.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { defaultRateLimiter, strictRateLimiter } from "./middlewares/rateLimiter.js";
import logger from "./utils/logger.js";

// Swagger docs
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.config.js";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());

app.use(cookieParser());

// Apply default rate limiting to all routes
app.use(defaultRateLimiter);

// API Documentation - available at /api-docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "Resonate API Docs"
}));

// Health check endpoints
app.get("/", (req, res) => {
  res.send("Resonate API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Auth routes with stricter rate limiting
app.use("/auth", strictRateLimiter, authRoutes);
app.use("/user", userRoutes);
app.use("/diagnostics", diagnosticsRoutes);
app.use("/fit", fitRoutes);
app.use("/water", waterRoutes);
app.use("/coach", coachRoutes);
app.use("/workout", workoutRoutes);
app.use("/nutrition", nutritionRoutes);
app.use("/food", foodRoutes);
app.use("/api/interventions", interventionRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/admin/memory", adminRoutes);

startFitnessSync();

logger.info("App", "Express app initialized");

export default app;
