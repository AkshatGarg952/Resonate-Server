import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import diagnosticsRoutes from "./routes/diagnostics.routes.js";
import fitRoutes from "./routes/fitConnect.routes.js"
import waterRoutes from "./routes/water.routes.js"
import coachRoutes from "./routes/coachLead.routes.js"
import workoutRoutes from "./routes/workout.routes.js"
import { startFitnessSync } from "./cron/fitnessSync.js";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json());

app.use(cookieParser());




// ROUTES
app.get("/", (req, res) => {
  res.send("Resonate API is running...");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/diagnostics", diagnosticsRoutes);
app.use("/fit", fitRoutes);
app.use("/water", waterRoutes);
app.use("/coach", coachRoutes);
app.use("/workout", workoutRoutes);

startFitnessSync();

export default app;
