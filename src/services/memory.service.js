import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { mem0Config, validateMem0Config } from '../config/mem0.config.js';
import { validateMemoryMetadata, sanitizePII, normalizeMetadata, ValidationError } from '../utils/memoryValidator.js';
import { logger } from '../utils/memoryLogger.js';

const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

class MemoryServiceError extends Error {
    constructor(message, code = 'MEMORY_ERROR', originalError = null) {
        super(message);
        this.name = 'MemoryServiceError';
        this.code = code;
        this.originalError = originalError;
    }
}

export class MemoryService {
    constructor() {
        try {
            validateMem0Config();
            this.apiKey = mem0Config.apiKey;
            this.agentId = mem0Config.agentId;
            this.baseUrl = mem0Config.baseUrl;
            this.isAvailable = true;
        } catch (error) {
            logger.error('INIT', 'Failed to initialize MemoryService', { error: error.message });
            this.isAvailable = false;
            throw new MemoryServiceError('Memory service initialization failed', 'INIT_ERROR', error);
        }
    }

    getHeaders() {
        return {
            'Authorization': `Token ${this.apiKey}`,
            'Content-Type': 'application/json'
        };
    }

    async retryWithBackoff(operation, maxRetries = MAX_RETRIES) {
        let lastError;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (error.response?.status === 401 || error.response?.status === 403) {
                    throw new MemoryServiceError('Authentication failed', 'AUTH_ERROR', error);
                }

                if (error.response?.status === 400) {
                    throw new MemoryServiceError('Invalid request', 'VALIDATION_ERROR', error);
                }

                if (attempt < maxRetries - 1) {
                    const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
                    logger.warn('RETRY', `Attempt ${attempt + 1} failed, retrying in ${delay}ms`, {
                        error: error.message,
                        attempt: attempt + 1,
                        maxRetries
                    });
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        throw new MemoryServiceError(
            `Operation failed after ${maxRetries} attempts`,
            'MAX_RETRIES_EXCEEDED',
            lastError
        );
    }

    async addMemory(userId, text, metadata) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('ADD_MEMORY', 'Service unavailable, skipping memory storage');
            return null;
        }

        try {
            const normalizedMetadata = normalizeMetadata(metadata);
            validateMemoryMetadata(normalizedMetadata);

            const sanitizedMetadata = sanitizePII(normalizedMetadata);

            const runId = uuidv4();

            const payload = {
                messages: [
                    {
                        role: 'user',
                        content: text
                    }
                ],
                user_id: userId,
                agent_id: this.agentId,
                run_id: runId,
                metadata: sanitizedMetadata
            };

            logger.debug('ADD_MEMORY', 'Adding memory', { userId, category: sanitizedMetadata.category });

            const response = await this.retryWithBackoff(async () => {
                return await axios.post(
                    `${this.baseUrl}/memories/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            const memoryId = response.data?.results?.id || response.data?.results?.[0]?.id;

            logger.measureDuration('ADD_MEMORY', startTime);
            logger.info('ADD_MEMORY', 'Memory added successfully', {
                userId,
                memoryId,
                category: sanitizedMetadata.category
            });

            return {
                success: true,
                memoryId,
                data: response.data
            };

        } catch (error) {
            logger.logError('ADD_MEMORY', error, { userId });

            if (error instanceof ValidationError) {
                throw error;
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to add memory', 'ADD_ERROR', error);
        }
    }

    async searchMemory(userId, query, filters = {}, limit = 10) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('SEARCH_MEMORY', 'Service unavailable, returning empty results');
            return { results: [] };
        }

        try {
            const payload = {
                query,
                user_id: userId,
                agent_id: this.agentId,
                limit
            };

            if (filters.category) {
                payload.filters = { category: filters.category };
            }

            logger.debug('SEARCH_MEMORY', 'Searching memories', { userId, query, filters });

            const response = await this.retryWithBackoff(async () => {
                return await axios.post(
                    `${this.baseUrl}/memories/search/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('SEARCH_MEMORY', startTime);
            logger.info('SEARCH_MEMORY', 'Search completed', {
                userId,
                resultCount: response.data?.results?.length || 0
            });

            return {
                success: true,
                results: response.data?.results || [],
                count: response.data?.results?.length || 0
            };

        } catch (error) {
            logger.logError('SEARCH_MEMORY', error, { userId, query });

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to search memories', 'SEARCH_ERROR', error);
        }
    }

    async getAllMemories(userId, filters = {}) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('GET_ALL_MEMORIES', 'Service unavailable, returning empty results');
            return { results: [] };
        }

        try {
            const params = {
                user_id: userId,
                agent_id: this.agentId
            };

            if (filters.category) {
                params.category = filters.category;
            }

            logger.debug('GET_ALL_MEMORIES', 'Fetching all memories', { userId, filters });

            const response = await this.retryWithBackoff(async () => {
                return await axios.get(
                    `${this.baseUrl}/memories/`,
                    {
                        params,
                        headers: this.getHeaders()
                    }
                );
            });

            logger.measureDuration('GET_ALL_MEMORIES', startTime);
            logger.info('GET_ALL_MEMORIES', 'Memories retrieved', {
                userId,
                count: response.data?.results?.length || 0
            });

            return {
                success: true,
                results: response.data?.results || [],
                count: response.data?.results?.length || 0
            };

        } catch (error) {
            logger.logError('GET_ALL_MEMORIES', error, { userId });

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to get memories', 'GET_ERROR', error);
        }
    }

    async getMemoryById(memoryId) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('GET_MEMORY', 'Service unavailable');
            return null;
        }

        try {
            logger.debug('GET_MEMORY', 'Fetching memory by ID', { memoryId });

            const response = await this.retryWithBackoff(async () => {
                return await axios.get(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('GET_MEMORY', startTime);
            logger.info('GET_MEMORY', 'Memory retrieved', { memoryId });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            logger.logError('GET_MEMORY', error, { memoryId });

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to get memory', 'GET_ERROR', error);
        }
    }

    async updateMemory(memoryId, text, metadata) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('UPDATE_MEMORY', 'Service unavailable, skipping update');
            return null;
        }

        try {
            const normalizedMetadata = normalizeMetadata(metadata);
            validateMemoryMetadata(normalizedMetadata);

            const sanitizedMetadata = sanitizePII(normalizedMetadata);

            const payload = {
                text,
                metadata: sanitizedMetadata
            };

            logger.debug('UPDATE_MEMORY', 'Updating memory', { memoryId });

            const response = await this.retryWithBackoff(async () => {
                return await axios.put(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    payload,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('UPDATE_MEMORY', startTime);
            logger.info('UPDATE_MEMORY', 'Memory updated', { memoryId });

            return {
                success: true,
                data: response.data
            };

        } catch (error) {
            logger.logError('UPDATE_MEMORY', error, { memoryId });

            if (error instanceof ValidationError) {
                throw error;
            }

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to update memory', 'UPDATE_ERROR', error);
        }
    }

    async deleteMemory(memoryId) {
        const startTime = Date.now();

        if (!this.isAvailable) {
            logger.warn('DELETE_MEMORY', 'Service unavailable, skipping deletion');
            return null;
        }

        try {
            logger.debug('DELETE_MEMORY', 'Deleting memory', { memoryId });

            await this.retryWithBackoff(async () => {
                return await axios.delete(
                    `${this.baseUrl}/memories/${memoryId}/`,
                    { headers: this.getHeaders() }
                );
            });

            logger.measureDuration('DELETE_MEMORY', startTime);
            logger.info('DELETE_MEMORY', 'Memory deleted', { memoryId });

            return {
                success: true,
                memoryId
            };

        } catch (error) {
            logger.logError('DELETE_MEMORY', error, { memoryId });

            if (error.response?.status === 404) {
                throw new MemoryServiceError('Memory not found', 'NOT_FOUND', error);
            }

            if (error instanceof MemoryServiceError) {
                throw error;
            }

            throw new MemoryServiceError('Failed to delete memory', 'DELETE_ERROR', error);
        }
    }

    checkHealth() {
        return {
            available: this.isAvailable,
            configured: !!this.apiKey && !!this.agentId
        };
    }
}

export { MemoryServiceError };
