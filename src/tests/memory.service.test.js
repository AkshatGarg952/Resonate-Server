import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import axios from 'axios';
import { MemoryService, MemoryServiceError } from '../services/memory.service.js';
import { ValidationError } from '../utils/memoryValidator.js';

jest.mock('axios');

describe('MemoryService', () => {
    let memoryService;
    let mockAxios;

    beforeEach(() => {
        mockAxios = axios;
        mockAxios.post = jest.fn();
        mockAxios.get = jest.fn();
        mockAxios.put = jest.fn();
        mockAxios.delete = jest.fn();

        process.env.MEM0_API_KEY = 'test-api-key';
        process.env.MEM0_AGENT_ID = 'test-agent';

        memoryService = new MemoryService();
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addMemory', () => {
        const validMetadata = {
            timestamp: '2026-02-02T12:00:00Z',
            timezone: 'Asia/Kolkata',
            category: 'fitness.training',
            source: 'user_input',
            confidence: 0.95,
            tags: ['test'],
            module_specific: {
                workout_type: 'push',
                duration_mins: 45,
                rpe: 7
            }
        };

        test('should add memory with valid metadata', async () => {
            const mockResponse = {
                data: {
                    results: {
                        id: 'mem-123'
                    }
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            const result = await memoryService.addMemory(
                'user-123',
                'Test workout: 45 mins push day',
                validMetadata
            );

            expect(result.success).toBe(true);
            expect(result.memoryId).toBe('mem-123');
            expect(mockAxios.post).toHaveBeenCalledTimes(1);
        });

        test('should reject invalid category', async () => {
            const invalidMetadata = {
                ...validMetadata,
                category: 'invalid.category'
            };

            await expect(
                memoryService.addMemory('user-123', 'Test', invalidMetadata)
            ).rejects.toThrow(ValidationError);

            expect(mockAxios.post).not.toHaveBeenCalled();
        });

        test('should reject missing required fields', async () => {
            const invalidMetadata = {
                ...validMetadata,
                module_specific: {
                    workout_type: 'push'
                }
            };

            await expect(
                memoryService.addMemory('user-123', 'Test', invalidMetadata)
            ).rejects.toThrow(ValidationError);

            expect(mockAxios.post).not.toHaveBeenCalled();
        });

        test('should normalize metadata before validation', async () => {
            const metadataWithoutDefaults = {
                category: 'fitness.training',
                source: 'user_input',
                module_specific: {
                    workout_type: 'push',
                    duration_mins: 45,
                    rpe: 7
                }
            };

            const mockResponse = {
                data: {
                    results: {
                        id: 'mem-123'
                    }
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            const result = await memoryService.addMemory(
                'user-123',
                'Test',
                metadataWithoutDefaults
            );

            expect(result.success).toBe(true);
            const callArgs = mockAxios.post.mock.calls[0][1];
            expect(callArgs.metadata.timestamp).toBeDefined();
            expect(callArgs.metadata.timezone).toBe('UTC');
            expect(callArgs.metadata.confidence).toBe(0.95);
        });

        test('should sanitize PII before sending', async () => {
            const metadataWithPII = {
                ...validMetadata,
                module_specific: {
                    ...validMetadata.module_specific,
                    email: 'user@example.com',
                    phone: '1234567890'
                }
            };

            const mockResponse = {
                data: {
                    results: {
                        id: 'mem-123'
                    }
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            await memoryService.addMemory('user-123', 'Test', metadataWithPII);

            const callArgs = mockAxios.post.mock.calls[0][1];
            expect(callArgs.metadata.module_specific.email).toBeUndefined();
            expect(callArgs.metadata.module_specific.phone).toBeUndefined();
        });

        test('should retry on network failure', async () => {
            mockAxios.post
                .mockRejectedValueOnce(new Error('Network error'))
                .mockRejectedValueOnce(new Error('Network error'))
                .mockResolvedValueOnce({
                    data: {
                        results: {
                            id: 'mem-123'
                        }
                    }
                });

            const result = await memoryService.addMemory(
                'user-123',
                'Test',
                validMetadata
            );

            expect(result.success).toBe(true);
            expect(mockAxios.post).toHaveBeenCalledTimes(3);
        });

        test('should throw after max retries', async () => {
            mockAxios.post.mockRejectedValue(new Error('Network error'));

            await expect(
                memoryService.addMemory('user-123', 'Test', validMetadata)
            ).rejects.toThrow(MemoryServiceError);

            expect(mockAxios.post).toHaveBeenCalledTimes(3);
        });

        test('should handle authentication error without retry', async () => {
            mockAxios.post.mockRejectedValue({
                response: {
                    status: 401,
                    data: { error: 'Unauthorized' }
                }
            });

            await expect(
                memoryService.addMemory('user-123', 'Test', validMetadata)
            ).rejects.toThrow(MemoryServiceError);

            expect(mockAxios.post).toHaveBeenCalledTimes(1);
        });
    });

    describe('searchMemory', () => {
        test('should search memories successfully', async () => {
            const mockResponse = {
                data: {
                    results: [
                        {
                            id: 'mem-123',
                            memory: 'Test workout',
                            metadata: { category: 'fitness.training' }
                        }
                    ]
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            const result = await memoryService.searchMemory(
                'user-123',
                'workout',
                { category: 'fitness.training' },
                10
            );

            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(1);
            expect(result.count).toBe(1);
        });

        test('should handle empty search results', async () => {
            const mockResponse = {
                data: {
                    results: []
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            const result = await memoryService.searchMemory(
                'user-123',
                'nonexistent',
                {},
                10
            );

            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(0);
            expect(result.count).toBe(0);
        });

        test('should apply category filter', async () => {
            const mockResponse = {
                data: {
                    results: []
                }
            };
            mockAxios.post.mockResolvedValue(mockResponse);

            await memoryService.searchMemory(
                'user-123',
                'test',
                { category: 'nutrition.intake' },
                5
            );

            const callArgs = mockAxios.post.mock.calls[0][1];
            expect(callArgs.filters).toEqual({ category: 'nutrition.intake' });
            expect(callArgs.limit).toBe(5);
        });
    });

    describe('getAllMemories', () => {
        test('should retrieve all memories', async () => {
            const mockResponse = {
                data: {
                    results: [
                        { id: 'mem-1', memory: 'Memory 1' },
                        { id: 'mem-2', memory: 'Memory 2' }
                    ]
                }
            };
            mockAxios.get.mockResolvedValue(mockResponse);

            const result = await memoryService.getAllMemories('user-123');

            expect(result.success).toBe(true);
            expect(result.results).toHaveLength(2);
            expect(result.count).toBe(2);
        });

        test('should apply category filter', async () => {
            const mockResponse = {
                data: {
                    results: []
                }
            };
            mockAxios.get.mockResolvedValue(mockResponse);

            await memoryService.getAllMemories('user-123', {
                category: 'fitness.training'
            });

            const callArgs = mockAxios.get.mock.calls[0][1];
            expect(callArgs.params.category).toBe('fitness.training');
        });
    });

    describe('getMemoryById', () => {
        test('should retrieve memory by ID', async () => {
            const mockResponse = {
                data: {
                    id: 'mem-123',
                    memory: 'Test memory'
                }
            };
            mockAxios.get.mockResolvedValue(mockResponse);

            const result = await memoryService.getMemoryById('mem-123');

            expect(result.success).toBe(true);
            expect(result.data.id).toBe('mem-123');
        });

        test('should handle not found error', async () => {
            mockAxios.get.mockRejectedValue({
                response: {
                    status: 404,
                    data: { error: 'Not found' }
                }
            });

            await expect(
                memoryService.getMemoryById('nonexistent')
            ).rejects.toThrow(MemoryServiceError);
        });
    });

    describe('updateMemory', () => {
        const validMetadata = {
            timestamp: '2026-02-02T12:00:00Z',
            timezone: 'Asia/Kolkata',
            category: 'fitness.training',
            source: 'user_input',
            confidence: 0.95,
            module_specific: {
                workout_type: 'push',
                duration_mins: 45,
                rpe: 7
            }
        };

        test('should update memory successfully', async () => {
            const mockResponse = {
                data: {
                    id: 'mem-123',
                    memory: 'Updated memory'
                }
            };
            mockAxios.put.mockResolvedValue(mockResponse);

            const result = await memoryService.updateMemory(
                'mem-123',
                'Updated text',
                validMetadata
            );

            expect(result.success).toBe(true);
            expect(mockAxios.put).toHaveBeenCalledTimes(1);
        });

        test('should validate metadata before update', async () => {
            const invalidMetadata = {
                ...validMetadata,
                category: 'invalid'
            };

            await expect(
                memoryService.updateMemory('mem-123', 'Test', invalidMetadata)
            ).rejects.toThrow(ValidationError);

            expect(mockAxios.put).not.toHaveBeenCalled();
        });

        test('should handle not found error', async () => {
            mockAxios.put.mockRejectedValue({
                response: {
                    status: 404,
                    data: { error: 'Not found' }
                }
            });

            await expect(
                memoryService.updateMemory('nonexistent', 'Test', validMetadata)
            ).rejects.toThrow(MemoryServiceError);
        });
    });

    describe('deleteMemory', () => {
        test('should delete memory successfully', async () => {
            mockAxios.delete.mockResolvedValue({ data: {} });

            const result = await memoryService.deleteMemory('mem-123');

            expect(result.success).toBe(true);
            expect(result.memoryId).toBe('mem-123');
            expect(mockAxios.delete).toHaveBeenCalledTimes(1);
        });

        test('should handle not found error', async () => {
            mockAxios.delete.mockRejectedValue({
                response: {
                    status: 404,
                    data: { error: 'Not found' }
                }
            });

            await expect(
                memoryService.deleteMemory('nonexistent')
            ).rejects.toThrow(MemoryServiceError);
        });
    });

    describe('checkHealth', () => {
        test('should return health status', () => {
            const health = memoryService.checkHealth();

            expect(health.available).toBe(true);
            expect(health.configured).toBe(true);
        });
    });

    describe('graceful degradation', () => {
        test('should return null when service is unavailable', async () => {
            memoryService.isAvailable = false;

            const result = await memoryService.addMemory(
                'user-123',
                'Test',
                {}
            );

            expect(result).toBeNull();
            expect(mockAxios.post).not.toHaveBeenCalled();
        });

        test('should return empty results when searching and unavailable', async () => {
            memoryService.isAvailable = false;

            const result = await memoryService.searchMemory(
                'user-123',
                'test'
            );

            expect(result.results).toEqual([]);
            expect(mockAxios.post).not.toHaveBeenCalled();
        });
    });
});
