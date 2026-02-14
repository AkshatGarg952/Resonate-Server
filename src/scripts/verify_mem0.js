
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

async function verifyMem0() {
    console.log("🔍 Verifying Mem0 Integration...");

    try {
        const { MemoryService } = await import('../services/memory.service.js');
        const memoryService = new MemoryService();

        console.log("✅ Service Initialized");

        // Use a test user
        const userId = "verify-script-" + Date.now();
        console.log(`👤 Using temporary User ID: ${userId}`);

        // 1. Add Memory
        console.log("\n📝 Adding test memory (Category: fitness.training)...");
        const addResult = await memoryService.addMemory(userId, "I ran 5km today.", {
            category: "fitness.training",
            source: "user_input",
            confidence: 1.0,
            module_specific: { workout_type: "run", duration_mins: 30, rpe: 7 }
        });

        if (addResult?.success) {
            console.log("✅ Memory added successfully");
        } else {
            console.error("❌ Failed to add memory");
            return;
        }

        // 2. Wait for Indexing
        console.log("\n⏳ Waiting 5 seconds for indexing...");
        await new Promise(resolve => setTimeout(resolve, 5000));

        // 3. Fetch All
        console.log("\n📥 Fetching all memories...");
        const allMemories = await memoryService.getAllMemories(userId);
        console.log(`📊 Found ${allMemories?.results?.length} memories`);

        if (allMemories?.results?.length > 0) {
            console.log("✅ Fetch working");
        } else {
            console.warn("⚠️ No memories found. Indexing might differ or take longer.");
        }

        // 4. Test Category Filter
        console.log("\n🔍 Testing Category Filter: 'fitness.training'");
        const filtered = await memoryService.getAllMemories(userId, { category: 'fitness.training' });
        console.log(`📊 Found ${filtered?.results?.length} memories`);

        if (filtered?.results?.length > 0) {
            console.log("✅ Category filtering working");
        } else {
            console.warn("⚠️ Category filter returned 0 results.");
        }

    } catch (error) {
        console.error("\n❌ Error:", error.message);
        if (error.response) {
            console.error("Response:", JSON.stringify(error.response.data, null, 2));
        }
    }
}

verifyMem0();
