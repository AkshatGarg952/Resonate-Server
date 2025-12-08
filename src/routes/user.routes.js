import express from "express";
import { verifyFirebaseToken } from "../middlewares/firebaseAuth.js";
import { getProfile, updateProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile", verifyFirebaseToken, getProfile);
router.put("/profile", verifyFirebaseToken, updateProfile);

export default router;
