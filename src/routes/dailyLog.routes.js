import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createDailyLog, getDailyLogs, getWeeklyLogs } from "../controllers/dailyLog.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createDailyLog);
router.get("/weekly", isAuthenticated, getWeeklyLogs);
router.get("/", isAuthenticated, getDailyLogs);

export default router;
