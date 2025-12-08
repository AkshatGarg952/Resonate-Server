import express from "express";
import { registerUser, loginUser } from "../controllers/auth.controller.js";
import { verifyFirebaseToken } from "../middlewares/firebaseAuth.js";

const router = express.Router();


router.post("/register", verifyFirebaseToken, registerUser);
router.post("/login", verifyFirebaseToken, loginUser);

export default router;
