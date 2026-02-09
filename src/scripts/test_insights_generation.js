
import dotenv from 'dotenv';
dotenv.config();

// Helper to run test
async function runTest() {
    console.log("Starting Insights Engine Test...");

    // Set dummy API key if missing to pass validation
    if (!process.env.MEM0_API_KEY) {
        process.env.MEM0_API_KEY = 'dummy-key';
    }

    // Dynamic imports to ensure env vars are set before config loads
    const { InsightsEngine } = await import('../services/insights/insights.engine.js');
    const { MemoryContextBuilder } = await import('../services/memory/memoryContext.builder.js');

    // Mock context builder to avoid external API calls
    MemoryContextBuilder.prototype.buildMemoryContext = async function (userId, intent) {
        console.log(`[Mock] Building context for ${userId} with intent ${intent}`);

        return {
            intent,
            timestamp: new Date().toISOString(),
            key_facts: [
                "Latest Blood Test: Vitamin D 22 ng/mL (deficient)"
            ],
            recent_events: [
                "Felt high stress at work today",
                "Another day of high stress",
                "Feeling very fatigued and tired recently",
                "Exhausted after workout",
                "Missed workout due to schedule"
            ],
            trends: {
                avg_sleep_hours: 5.5,
                avg_workout_intensity: 8.5,
                latest_blood_test: {
                    memory: "Blood Test: Vitamin D 22 ng/mL (deficient)"
                }
            },
            intervention_history: [],
            active_interventions: []
        };
    };

    const engine = new InsightsEngine();
    const insights = await engine.generateInsights("test-user");

    console.log(`Generated ${insights.length} insights:`);
    console.log(JSON.stringify(insights, null, 2));

    // Verification checks
    // Verification checks
    const hasSleepWarning = insights.some(i => i.title === 'Recovery Risk');
    const hasStressWarning = insights.some(i => i.title === 'High Stress & Low Sleep');
    const hasVitaminDWarning = insights.some(i => i.title === 'Vitamin D Deficiency');

    const result = {
        success: hasSleepWarning && hasStressWarning && hasVitaminDWarning,
        insights: insights.map(i => ({ title: i.title, type: i.type })),
        checks: { hasSleepWarning, hasStressWarning, hasVitaminDWarning }
    };

    // Write to file for verification
    const fs = await import('fs');
    fs.writeFileSync('test_result.json', JSON.stringify(result, null, 2));

    if (result.success) {
        console.log("\n✅ Test Passed: All expected rules triggered.");
    } else {
        console.log("\n❌ Test Failed: Missing expected insights.");
        console.log({ hasSleepWarning, hasStressWarning, hasVitaminDWarning });
    }
}

runTest().catch(console.error);
