import { MemoryService } from "../memory.service.js";
import { logger } from "../../utils/memoryLogger.js";

/**
 * Service to handle memory hygiene, deduplication, and cleanup
 */
export class MemoryHygieneService {
    constructor(memoryService) {
        this.memoryService = memoryService || new MemoryService();
    }

    /**
     * Check if a similar memory already exists to prevent duplication
     * @param {string} userId
     * @param {string} text
     * @param {Object} metadata
     * @returns {Promise<boolean>} true if duplicate found
     */
    async isDuplicate(userId, text, metadata) {
        try {
            // 1. Exact match check on category and timestamp if available
            // This is a heuristic. Mem0 might not give us exact timestamp filtering easily depending on version,
            // so we rely on semantic search for the text.

            const searchResults = await this.memoryService.searchMemory(userId, text, {
                category: metadata.category
            }, 5);

            if (!searchResults || !searchResults.results) return false;

            // Check if any result is highly similar strings
            for (const result of searchResults.results) {
                if (result.score > 0.95 && result.memory === text) {
                    logger.warn('HYGIENE', 'Duplicate memory detected', { userId, text });
                    return true;
                }

                // Check if module_specific data is identical for same date
                if (metadata.module_specific && result.metadata && result.metadata.module_specific) {
                    const meta1 = JSON.stringify(metadata.module_specific);
                    const meta2 = JSON.stringify(result.metadata.module_specific);
                    if (meta1 === meta2 && metadata.category === result.metadata.category) {
                        logger.warn('HYGIENE', 'Duplicate metadata detected', { userId });
                        return true;
                    }
                }
            }

            return false;
        } catch (error) {
            logger.error('HYGIENE', 'Duplicate check failed', error);
            return false; // Fail open to avoid losing data
        }
    }

    /**
     * Delete memories older than retention period
     * @param {string} userId
     * @param {number} retentionDays default 730 (2 years)
     */
    async cleanupOldMemories(userId, retentionDays = 730) {
        // Implementation depends on Mem0 capability to filter by date in bulk delete
        // If not available, we might need to search and delete
        // Placeholder for now
        logger.info('HYGIENE', `Starting cleanup for user ${userId}`);
        return { deleted: 0 };
    }

    /**
     * Delete low confidence memories
     * @param {string} userId
     * @param {number} threshold default 0.7
     */
    async cleanupLowConfidence(userId, threshold = 0.7) {
        // Placeholder
        return { deleted: 0 };
    }
}
