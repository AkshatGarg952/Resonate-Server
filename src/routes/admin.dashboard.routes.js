
import express from 'express';
import { getDashboardStats, getRecentInsights, getUserMemoryView } from '../controllers/admin.dashboard.controller.js';
import { isAuthenticated } from '../middlewares/isAuthenticated.js';
// Add admin check middleware if needed later

const router = express.Router();

/**
 * @swagger
 * /api/admin/dashboard/stats:
 *   get:
 *     summary: Get dashboard overview stats
 *     tags: [Admin]
 */
router.get('/stats', isAuthenticated, getDashboardStats);

/**
 * @swagger
 * /api/admin/dashboard/insights/recent:
 *   get:
 *     summary: Get recent generated insights stream
 *     tags: [Admin]
 */
router.get('/insights/recent', isAuthenticated, getRecentInsights);

/**
 * @swagger
 * /api/admin/dashboard/user/:userId:
 *   get:
 *     summary: Get memory timeline for specific user
 *     tags: [Admin]
 */
router.get('/user/:userId', isAuthenticated, getUserMemoryView);

export default router;
