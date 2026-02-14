import dotenv from "dotenv";
import path from "path";
import mongoose from "mongoose";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";
import { MemoryService } from "../services/memory.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, "../../.env");
dotenv.config({ path: envPath });

const looksLikeObjectId = (value) => /^[a-fA-F0-9]{24}$/.test(value || "");

async function resolveMemoryUser(identifier) {
    let user = await User.findOne({ firebaseUid: identifier }).select("_id firebaseUid email");
    if (user) return user;

    if (looksLikeObjectId(identifier)) {
        user = await User.findById(identifier).select("_id firebaseUid email");
        if (user) return user;
    }

    user = await User.findOne({ email: identifier }).select("_id firebaseUid email");
    return user;
}

async function main() {
    const input = process.argv[2];
    const category = process.argv[3];

    if (!input) {
        console.log("Usage: node src/scripts/check_user_memories.js <firebaseUid|email|mongoUserId> [category]");
        process.exit(1);
    }

    await connectDB();

    try {
        const user = await resolveMemoryUser(input);
        const memoryUserId = user?.firebaseUid || input;

        console.log("Resolved user:");
        console.log({
            requested: input,
            memoryUserId,
            mongoUserId: user?._id?.toString() || null,
            email: user?.email || null
        });

        const memoryService = new MemoryService();
        const result = await memoryService.getAllMemories(memoryUserId, category ? { category } : {});

        console.log(`\nTotal memories: ${result?.count || 0}`);
        const preview = (result?.results || []).slice(0, 10).map((m) => ({
            id: m.id,
            created_at: m.created_at,
            category: m.metadata?.category,
            memory: m.memory
        }));
        console.log(preview);
    } catch (error) {
        console.error("Failed to fetch user memories:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

main();
