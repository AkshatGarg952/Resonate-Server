import { MemoryService } from "../../services/memory.service.js";
import { User } from "../../models/User.js";

const memoryService = new MemoryService();

export const getUserMemories = async (req, res) => {
    try {
        const { userId } = req.params;
        const { category, limit = 20, query } = req.query;

        // Verify user exists
        const user = await User.findOne({ firebaseUid: userId });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const filters = {};
        if (category) filters.category = category;

        const results = await memoryService.searchMemory(userId, query || "*", filters, parseInt(limit));

        return res.json({ status: "success", count: results.results.length, data: results.results });

    } catch (error) {
        console.error("Admin Memory Fetch Error:", error);
        return res.status(500).json({ message: "Failed to fetch memories" });
    }
};

export const deleteMemory = async (req, res) => {
    try {
        const { memoryId } = req.params;

        if (!memoryId) {
            return res.status(400).json({ message: "Memory ID is required" });
        }

        await memoryService.deleteMemory(memoryId);

        return res.json({ status: "success", message: "Memory deleted" });

    } catch (error) {
        console.error("Admin Memory Delete Error:", error);
        return res.status(500).json({ message: "Failed to delete memory" });
    }
};

export const addMemoryManual = async (req, res) => {
    try {
        const { userId } = req.params;
        const { text, metadata } = req.body;

        if (!text) return res.status(400).json({ message: "Text required" });

        await memoryService.addMemory(userId, text, metadata || {});

        return res.json({ status: "success", message: "Memory added manually" });

    } catch (error) {
        console.error("Admin Memory Add Error:", error);
        return res.status(500).json({ message: "Failed to add memory" });
    }
};
