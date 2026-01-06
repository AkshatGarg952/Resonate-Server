import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getDailySuggestions, generateNewDailySuggestions } from "../controllers/nutrition.controller.js";

const router = express.Router();

router.get("/daily-suggestions", isAuthenticated, getDailySuggestions);
router.post("/daily-suggestions", isAuthenticated, generateNewDailySuggestions);

export default router;
