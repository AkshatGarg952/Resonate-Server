
import express from 'express';
import { getDailyInsights, testInsights } from '../controllers/insights.controller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';

const router = express.Router();

/**
 * @swagger
 * /api/insights/daily:
 *   get:
 *     summary: Get daily health insights based on memory
 *     tags: [Insights]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of generated insights
 *       500:
 *         description: Server error
 */
router.get('/daily', isAuthenticated, getDailyInsights);

// Dev only route
if (process.env.NODE_ENV !== 'production') {
    router.get('/test-gen', testInsights);
}

export default router;
