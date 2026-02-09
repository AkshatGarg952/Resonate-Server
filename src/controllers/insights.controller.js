
import { InsightsEngine } from '../services/insights/insights.engine.js';
import { logger } from '../utils/memoryLogger.js';

const insightsEngine = new InsightsEngine();

// Get daily insights for the authenticated user
export const getDailyInsights = async (req, res) => {
    try {
        const userId = req.user.id; // Assumes auth middleware populates req.user

        logger.debug('CONTROLLER', 'Request for daily insights', { userId });

        const insights = await insightsEngine.generateInsights(userId);

        // Optionally, we could store these insights in DB/Memory here to avoid re-generating
        // But for "Day 9" requirement, real-time generation is acceptable.

        res.status(200).json({
            success: true,
            count: insights.length,
            data: insights,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        logger.logError('CONTROLLER', error, { userId: req.user?.id });
        res.status(500).json({
            success: false,
            message: 'Failed to generate insights',
            error: error.message
        });
    }
};

// Test endpoint (optional, useful for debugging without auth if needed locally)
export const testInsights = async (req, res) => {
    // Only for dev environment!
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: 'Forbidden' });
    }

    // Allow passing userId in distinct way or query param
    const userId = req.query.userId || 'test-user-id';

    try {
        const insights = await insightsEngine.generateInsights(userId);
        res.status(200).json({
            success: true,
            count: insights.length,
            data: insights
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
