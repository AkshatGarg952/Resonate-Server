import "dotenv/config";
import { MemoryService } from '../src/services/memory.service.js';

const run = async () => {
    const TARGET_USER_ID = "lm4EgvlBcVf8OHDTotiTGqkeXKh2"; // ID from server logs

    console.log(`Debugging memories for User ID: ${TARGET_USER_ID}`);

    try {
        const memoryService = new MemoryService();
        console.log("Configured Agent ID:", memoryService.agentId);

        // 1. Fetch operations
        console.log("\nAttempting to fetch ALL memories for this user...");
        const all = await memoryService.getAllMemories(TARGET_USER_ID);
        console.log(`Found ${all.count} memories.`);
        if (all.results.length > 0) {
            console.log("First memory sample:", JSON.stringify(all.results[0], null, 2));
        }

        // 2. Write operation check
        console.log("\nAttempting to write a debug memory...");
        const addRes = await memoryService.addMemory(TARGET_USER_ID, "Debug memory: System connectivity check.", {
            category: "recovery.sleep",
            source: "system_generated",
            module_specific: {
                hours: 8,
                quality_score: 90
            }
        });

        if (addRes.success) {
            if (addRes.memoryId) {
                console.log("Successfully wrote debug memory. ID:", addRes.memoryId);
                // Clean up
                await memoryService.deleteMemory(addRes.memoryId);
                console.log("Debug memory deleted.");
            } else if (addRes.status === 'PENDING') {
                console.log(`Memory creation queued (Async). Event ID: ${addRes.eventId}`);
                console.log("Skipping delete as memory is not yet created.");
            } else {
                console.log("Memory added but no ID returned.", addRes);
            }
        } else {
            console.error("Failed to write memory.");
        }

    } catch (error) {
        console.error("Debug script failed:", error);
        if (error.originalError && error.originalError.response) {
            console.error("Mem0 API Error Details:", JSON.stringify(error.originalError.response.data, null, 2));
        }
    }
};

run();
