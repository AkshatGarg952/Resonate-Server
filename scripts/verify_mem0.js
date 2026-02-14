import dotenv from 'dotenv';
import { MemoryService } from '../src/services/memory.service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load env from parent directory
dotenv.config({ path: join(__dirname, '../.env') });

const run = async () => {
    console.log("Initializing MemoryService...");
    try {
        const memoryService = new MemoryService();
        console.log("MemoryService initialized.");
        console.log("Config:", {
            baseUrl: memoryService.baseUrl,
            agentId: memoryService.agentId,
            hasApiKey: !!memoryService.apiKey
        });

        const health = memoryService.checkHealth();
        console.log("Health check:", health);

        if (!health.available) {
            console.error("MemoryService is not available. Check config.");
            return;
        }

        const testUserId = "test-user-verification-" + Date.now();
        console.log(`\nTesting with user ID: ${testUserId}`);

        // 1. Add a memory
        console.log("Adding a test memory...");
        const addResult = await memoryService.addMemory(testUserId, "Ate a healthy salad.", {
            category: "nutrition.intake",
            module_specific: {
                meal_type: "lunch",
                calories: 400,
                plan_adherence: true
            },
            source: "user_input"
        });
        console.log("Add result:", addResult);

        if (!addResult.success) {
            console.error("Failed to add memory.");
            return;
        }

        // 2. Retrieve all memories
        console.log("\nRetrieving all memories for user...");
        const allMemories = await memoryService.getAllMemories(testUserId);
        console.log("All memories count:", allMemories.count);
        console.log("All memories:", JSON.stringify(allMemories.results, null, 2));

        if (allMemories.count === 0) {
            console.error("Failed to retrieve the added memory.");
        } else {
            console.log("Successfully verified memory storage and retrieval.");
        }

        // 3. Search memory
        console.log("\nSearching memory...");
        const searchResult = await memoryService.searchMemory(testUserId, "salad", { category: "nutrition.intake" });
        console.log("Search result count:", searchResult.count);
        console.log("Search result:", JSON.stringify(searchResult.results, null, 2));

        // Cleanup
        console.log("\nCleaning up...");
        if (addResult.memoryId) {
            await memoryService.deleteMemory(addResult.memoryId);
            console.log("Test memory deleted.");
        }

    } catch (error) {
        console.error("Error during verification:", error);
    }
};

run();
