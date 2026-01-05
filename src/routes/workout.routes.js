import express from "express";
import { generateWorkout, getWorkoutHistory } from "../controllers/workoutController.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

router.post("/generate", isAuthenticated, generateWorkout);
router.get("/history", isAuthenticated, getWorkoutHistory);

export default router;
