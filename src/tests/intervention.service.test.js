import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Define mocks before imports
jest.unstable_mockModule('../services/memory.service.js', () => ({
    MemoryService: jest.fn().mockImplementation(() => ({
        addMemory: jest.fn().mockResolvedValue({ success: true, memoryId: 'mem-123' })
    }))
}));

jest.unstable_mockModule('../models/Intervention.js', () => ({
    Intervention: jest.fn().mockImplementation(() => ({
        save: jest.fn().mockResolvedValue(true),
    }))
}));

// Dynamic imports to ensure mocks are applied
const { InterventionService } = await import('../services/intervention.service.js');
const { Intervention } = await import('../models/Intervention.js');

describe('InterventionService', () => {
    let interventionService;
    let mockMemoryService;

    beforeEach(async () => {
        // Setup mock MemoryService
        const { MemoryService } = await import('../services/memory.service.js');
        mockMemoryService = new MemoryService();

        // Reset Intervention mocks
        Intervention.mockClear();
        // Add static methods to the mock
        Intervention.find = jest.fn();
        Intervention.findById = jest.fn();
        Intervention.findByIdAndUpdate = jest.fn();

        interventionService = new InterventionService(mockMemoryService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('createIntervention', () => {
        const validInterventionData = {
            type: 'sleep',
            recommendation: 'Sleep more',
            rationale: 'You are tired',
            startDate: new Date(),
            durationDays: 14,
            targetMetric: 'sleep_hours',
            targetValue: 8
        };

        test('should create intervention and add memory', async () => {
            // Mock Mongoose save
            const mockSave = jest.fn().mockResolvedValue({
                ...validInterventionData,
                _id: 'int-123',
                startDate: validInterventionData.startDate
            });

            // Override the constructor mock for this test
            Intervention.mockImplementation(() => ({
                save: mockSave,
                ...validInterventionData,
                _id: 'int-123',
                startDate: validInterventionData.startDate
            }));

            const result = await interventionService.createIntervention('user-123', validInterventionData);

            expect(mockSave).toHaveBeenCalled();
            expect(mockMemoryService.addMemory).toHaveBeenCalled();

            const memoryText = mockMemoryService.addMemory.mock.calls[0][1];
            expect(memoryText).toContain('Intervention: Sleep more');
            expect(memoryText).toContain('Reason: You are tired');
        });
    });

    describe('recordOutcome', () => {
        const mockIntervention = {
            _id: 'int-123',
            user: 'user-123',
            type: 'sleep',
            status: 'active',
            startDate: new Date(),
            outcomes: [],
            save: jest.fn().mockResolvedValue(true),
            toJSON: () => mockIntervention // In case toJSON is called
        };

        test('should record outcome and add memory', async () => {
            Intervention.findById.mockResolvedValue(mockIntervention);

            const outcomeData = {
                metricValue: 7.5,
                notes: 'Slept better',
                status: 'active'
            };

            await interventionService.recordOutcome('int-123', outcomeData);

            expect(mockIntervention.outcomes).toHaveLength(1);
            expect(mockIntervention.outcomes[0].metricValue).toBe(7.5);
            expect(mockIntervention.save).toHaveBeenCalled();
            expect(mockMemoryService.addMemory).toHaveBeenCalled();

            const memoryText = mockMemoryService.addMemory.mock.calls[0][1];
            expect(memoryText).toContain('Outcome: sleep intervention');
            expect(memoryText).toContain('Final Value: 7.5');
        });

        test('should update status if provided', async () => {
            Intervention.findById.mockResolvedValue(mockIntervention);

            const outcomeData = {
                metricValue: 8,
                notes: 'Done',
                status: 'completed'
            };

            await interventionService.recordOutcome('int-123', outcomeData);

            expect(mockIntervention.status).toBe('completed');
            expect(mockIntervention.endDate).toBeDefined();
        });
    });

    describe('getActiveInterventions', () => {
        test('should return active interventions', async () => {
            const mockInterventions = [{ _id: 'int-1' }, { _id: 'int-2' }];
            const mockSort = jest.fn().mockResolvedValue(mockInterventions);
            Intervention.find.mockReturnValue({ sort: mockSort });

            const result = await interventionService.getActiveInterventions('user-123');

            expect(Intervention.find).toHaveBeenCalledWith({ user: 'user-123', status: 'active' });
            expect(result).toHaveLength(2);
        });
    });
});
