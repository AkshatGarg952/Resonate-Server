/**
 * Simple in-memory rate limiting middleware.
 * 
 * For production, consider using express-rate-limit with Redis store.
 */

const requestCounts = new Map();
const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 100;    // requests per window

/**
 * Clean up old entries periodically.
 */
setInterval(() => {
    const now = Date.now();
    for (const [key, data] of requestCounts.entries()) {
        if (now - data.windowStart > WINDOW_MS) {
            requestCounts.delete(key);
        }
    }
}, WINDOW_MS);

/**
 * Rate limiting middleware.
 * 
 * @param {Object} options - Configuration options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @returns {Function} Express middleware
 */
export function rateLimiter(options = {}) {
    const windowMs = options.windowMs || WINDOW_MS;
    const max = options.max || MAX_REQUESTS;

    return (req, res, next) => {
        // Get client identifier (IP or user ID)
        const clientId = req.user?.firebaseUid || req.ip || 'unknown';
        const now = Date.now();

        // Get or create client record
        let clientData = requestCounts.get(clientId);

        if (!clientData || now - clientData.windowStart > windowMs) {
            // Start new window
            clientData = {
                count: 0,
                windowStart: now,
            };
            requestCounts.set(clientId, clientData);
        }

        clientData.count++;

        // Set rate limit headers
        res.set({
            'X-RateLimit-Limit': max,
            'X-RateLimit-Remaining': Math.max(0, max - clientData.count),
            'X-RateLimit-Reset': new Date(clientData.windowStart + windowMs).toISOString(),
        });

        // Check if over limit
        if (clientData.count > max) {
            return res.status(429).json({
                error: 'Too many requests',
                message: `Rate limit exceeded. Try again in ${Math.ceil((clientData.windowStart + windowMs - now) / 1000)} seconds.`,
                retryAfter: Math.ceil((clientData.windowStart + windowMs - now) / 1000),
            });
        }

        next();
    };
}

/**
 * Stricter rate limiter for sensitive endpoints (auth, upload).
 */
export const strictRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100,            // 100 requests per minute
});

/**
 * Default rate limiter for general API endpoints.
 */
export const defaultRateLimiter = rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 1000,           // 1000 requests per minute
});
