import express from "express";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", isAuthenticated, getProfile);
router.put("/profile", isAuthenticated, updateProfile);

export default router;
