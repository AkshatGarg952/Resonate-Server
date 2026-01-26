import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createDailyLog, getDailyLogs } from "../controllers/dailyLog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createDailyLog);
router.get("/", isAuthenticated, getDailyLogs);

export default router;
