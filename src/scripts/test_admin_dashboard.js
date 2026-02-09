
import dotenv from 'dotenv';
dotenv.config();

// Mock response object
const mockRes = () => {
    const res = {};
    res.status = (code) => {
        res.statusCode = code;
        return res;
    };
    res.json = (data) => {
        res.data = data;
        return res;
    };
    return res;
};

// Mock request object
const mockReq = (params = {}, query = {}, user = {}) => ({
    params,
    query,
    user
});

// Dynamic import to handle env vars
async function runTest() {
    console.log("Starting Admin Dashboard Controller Test...");

    // Set dummy key to pass config validation if needed
    if (!process.env.MEM0_API_KEY) process.env.MEM0_API_KEY = 'dummy';

    const { getDashboardStats, getUserMemoryView, getRecentInsights } = await import('../controllers/admin.dashboard.controller.js');
    const { MemoryService } = await import('../services/memory.service.js');

    // Mock MemoryService.getAllMemories to avoid API calls
    MemoryService.prototype.getAllMemories = async (userId) => {
        console.log(`[Mock] Fetching memories for ${userId}`);
        return [
            { id: 1, memory: "Test memory 1", created_at: new Date() },
            { id: 2, memory: "Test memory 2", created_at: new Date() }
        ];
    };

    // Test 1: Dashboard Stats
    console.log("\nTesting getDashboardStats...");
    const resStats = mockRes();
    await getDashboardStats(mockReq(), resStats);

    if (resStats.statusCode === 200 && resStats.data.success) {
        console.log("✅ Stats Endpoint: Passed");
        console.log("   Data:", JSON.stringify(resStats.data.stats));
    } else {
        console.log("❌ Stats Endpoint: Failed");
        console.log(resStats);
    }

    // Test 2: User Memory View
    console.log("\nTesting getUserMemoryView...");
    const resUser = mockRes();
    await getUserMemoryView(mockReq({ userId: 'test-user-123' }), resUser);

    if (resUser.statusCode === 200 && resUser.data.success && resUser.data.memories.length === 2) {
        console.log("✅ User Memory Endpoint: Passed");
        console.log(`   Fetched ${resUser.data.count} memories for user.`);
    } else {
        console.log("❌ User Memory Endpoint: Failed");
        console.log(resUser);
    }

    // Test 3: Recent Insights
    console.log("\nTesting getRecentInsights...");
    const resInsights = mockRes();
    await getRecentInsights(mockReq(), resInsights);

    if (resInsights.statusCode === 200 && resInsights.data.success) {
        console.log("✅ Recent Insights Endpoint: Passed");
        console.log(`   Insights count: ${resInsights.data.insights.length} (Expected empty/mock for now)`);
    } else {
        console.log("❌ Recent Insights Endpoint: Failed");
        console.log(resInsights);
    }
}

runTest().catch(console.error);
