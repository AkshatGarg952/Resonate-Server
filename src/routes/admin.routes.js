import express from "express";
import { getUserMemories, deleteMemory, addMemoryManual } from "../controllers/admin/memory.controller.js";
import { protect } from "../middlewares/auth.middleware.js"; // Assuming auth middleware exists

const router = express.Router();

// Base path: /api/admin/memory

router.get("/:userId", protect, getUserMemories);
router.post("/:userId", protect, addMemoryManual);
router.delete("/:memoryId", protect, deleteMemory);

export default router;
