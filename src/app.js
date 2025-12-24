import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import diagnosticsRoutes from "./routes/diagnostics.routes.js";
import fitRoutes from "./routes/fitConnect.routes.js"
import { startFitnessSync } from "./cron/fitnessSync.js";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
  origin: "http://localhost:5173", // EXACT frontend URL
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

startFitnessSync();

export default app;
