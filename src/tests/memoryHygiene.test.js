import { MemoryHygieneService } from "../services/memory/memoryHygiene.service.js";
import { jest } from '@jest/globals';

// We don't need to mock the module anymore if we inject the dependency,
// BUT MemoryHygieneService still imports MemoryService at the top level.
// If that import throws (e.g. config validation), the test might still fail.
// However, MemoryService constructor throws, not the import itself (usually).
// Let's rely on DI.

describe("MemoryHygieneService", () => {
    let service;
    let mockMemoryService;

    beforeEach(() => {
        mockMemoryService = {
            searchMemory: jest.fn()
        };
        // Inject mock
        service = new MemoryHygieneService(mockMemoryService);
    });

    describe("isDuplicate", () => {
        it("should return false if no similar memories found", async () => {
            mockMemoryService.searchMemory.mockResolvedValue({ results: [] });

            const result = await service.isDuplicate("user123", "New workout", { category: "fitness.training" });
            expect(result).toBe(false);
        });

        it("should return true if exact text match with high confidence found", async () => {
            mockMemoryService.searchMemory.mockResolvedValue({
                results: [{
                    memory: "Exact match text",
                    score: 0.98,
                    metadata: { category: "fitness.training" }
                }]
            });

            const result = await service.isDuplicate("user123", "Exact match text", { category: "fitness.training" });
            expect(result).toBe(true);
        });

        it("should return true if metadata matches exactly", async () => {
            mockMemoryService.searchMemory.mockResolvedValue({
                results: [{
                    memory: "Some text",
                    score: 0.8,
                    metadata: {
                        category: "fitness.training",
                        module_specific: { steps: 1000 }
                    }
                }]
            });

            const result = await service.isDuplicate("user123", "Different text", {
                category: "fitness.training",
                module_specific: { steps: 1000 }
            });
            expect(result).toBe(true);
        });
    });
});
