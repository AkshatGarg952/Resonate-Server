import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { redirectToGoogleFit, handleGoogleFitCallback, getGoogleFitData } from "../controllers/fit.controller.js";

const router = express.Router();

// Start Google Fit OAuth
router.get("/google", isAuthenticated, redirectToGoogleFit);

// Google OAuth callback
router.get("/google/callback", handleGoogleFitCallback);

router.get("/getGoogleFitData", isAuthenticated, getGoogleFitData);

export default router;
