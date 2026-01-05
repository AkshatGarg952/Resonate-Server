import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getWaterData, logWater, setWaterGoal } from "../controllers/water.controller.js";

const router = express.Router();

// Get water info (requires auth)
router.get("/", isAuthenticated, getWaterData);

// Log water (add amount)
router.post("/log", isAuthenticated, logWater);

// Set daily goal
router.post("/goal", isAuthenticated, setWaterGoal);

export default router;
