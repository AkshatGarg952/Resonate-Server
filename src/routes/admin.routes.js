import express from "express";
import { getUserMemories, deleteMemory, addMemoryManual } from "../controllers/admin/memory.controller.js";
import { isAuthenticated } from "../middlewares/isAuthenticated.js";

const router = express.Router();

// Base path: /api/admin/memory

router.get("/:userId", isAuthenticated, getUserMemories);
router.post("/:userId", isAuthenticated, addMemoryManual);
router.delete("/:memoryId", isAuthenticated, deleteMemory);

export default router;
