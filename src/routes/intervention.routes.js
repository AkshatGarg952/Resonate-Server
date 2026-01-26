import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { createIntervention, getInterventions, getActiveInterventions, stopIntervention, updateIntervention } from "../controllers/intervention.controller.js";

const router = express.Router();

router.post("/", isAuthenticated, createIntervention);
router.get("/active", isAuthenticated, getActiveInterventions);

router.patch("/:id/stop", isAuthenticated, stopIntervention);
router.put("/:id", isAuthenticated, updateIntervention);

router.get("/", isAuthenticated, getInterventions);


export default router;
