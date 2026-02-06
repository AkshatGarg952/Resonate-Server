import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Define mock factory for ESM
const mockSearchMemory = jest.fn();
jest.unstable_mockModule('../services/memory.service.js', () => ({
    MemoryService: jest.fn().mockImplementation(() => ({
        searchMemory: mockSearchMemory
    }))
}));

// Dynamic imports are required after unstable_mockModule
const { MemoryContextBuilder } = await import('../services/memory/memoryContext.builder.js');
const { MemoryService } = await import('../services/memory.service.js');

describe('MemoryContextBuilder', () => {
    let contextBuilder;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchMemory.mockReset();
        mockSearchMemory.mockResolvedValue({ results: [] }); // Default return
        contextBuilder = new MemoryContextBuilder();
    });

    describe('buildMemoryContext', () => {
        const userId = 'user-123';

        test('should return empty context for unknown intent', async () => {
            const context = await contextBuilder.buildMemoryContext(userId, 'unknown_intent');

            expect(context.intent).toBe('unknown_intent');
            expect(context.key_facts).toEqual([]);
            expect(context.recent_events).toEqual([]);
        });

        test('should handle errors gracefully', async () => {
            mockSearchMemory.mockRejectedValue(new Error('Service failure'));

            const context = await contextBuilder.buildMemoryContext(userId, 'fitness_plan');

            expect(context.error).toBe(true);
            expect(context.recent_events).toEqual([]);
        });

        describe('Intent: fitness_plan', () => {
            test('should build fitness context with recent workouts and recovery', async () => {
                // Mock responses for sequential calls
                mockSearchMemory
                    .mockResolvedValueOnce({ // 1. Training logs
                        results: [
                            {
                                memory: 'Push Workout: Bench 4x8',
                                metadata: { module_specific: { rpe: 8 } }
                            },
                            {
                                memory: 'Pull Workout: Rows 3x10',
                                metadata: { module_specific: { rpe: 7 } }
                            }
                        ]
                    })
                    .mockResolvedValueOnce({ // 2. Recovery (Sleep)
                        results: [
                            {
                                memory: 'Sleep: 5.5h',
                                metadata: { module_specific: { hours: 5.5 } }
                            }
                        ]
                    })
                    .mockResolvedValueOnce({ // 3. Stress
                        results: []
                    })
                    .mockResolvedValueOnce({ // 4. Interventions
                        results: []
                    });

                const context = await contextBuilder.buildMemoryContext(userId, 'fitness_plan');

                expect(context.intent).toBe('fitness_plan');
                expect(context.recent_events).toContain('Push Workout: Bench 4x8');
                expect(context.recent_events).toContain('Pull Workout: Rows 3x10');
                expect(context.key_facts).toContain('Recovery: Sleep: 5.5h');

                // Check trends calculation
                expect(context.trends.avg_workout_intensity).toBe(7.5);
                expect(context.trends.recovery_status).toBe('poor');
            });

            test('should handle empty fitness history', async () => {
                mockSearchMemory.mockResolvedValue({ results: [] });

                const context = await contextBuilder.buildMemoryContext(userId, 'fitness_plan');

                expect(context.key_facts).toContain('No recent workout history found.');
                expect(context.recent_events).toEqual([]);
            });
        });

        describe('Intent: nutrition_plan', () => {
            test('should build nutrition context with adherence trends', async () => {
                mockSearchMemory
                    .mockResolvedValueOnce({ // 1. Meal logs
                        results: [
                            { memory: 'Lunch: Salad (Adhered to plan)' },
                            { memory: 'Dinner: Pizza (Not adhered)' },
                            { memory: 'Breakfast: Oats (Adhered)' },
                            { memory: 'Snack: Apple (Adhered)' }
                        ]
                    })
                    .mockResolvedValueOnce({ // 2. Interventions
                        results: [{ memory: 'Intervention: Increase Protein' }]
                    });

                const context = await contextBuilder.buildMemoryContext(userId, 'nutrition_plan');

                expect(context.intent).toBe('nutrition_plan');
                expect(context.recent_events.length).toBe(4);
                expect(context.intervention_history).toContain('Intervention: Increase Protein');

                expect(context.trends.plan_adherence_percent).toBe(75);
                expect(context.key_facts).toContain('Recent plan adherence: 75%');
            });
        });

        describe('Intent: insights', () => {
            test('should aggregate insights from multiple categories', async () => {
                mockSearchMemory
                    .mockResolvedValueOnce({ // 1. Recent activity
                        results: [{ memory: 'Weekly Summary: Active' }]
                    })
                    .mockResolvedValueOnce({ // 2. Diagnostics
                        results: [{ memory: 'Blood: LDL 120' }]
                    })
                    .mockResolvedValueOnce({ // 3. BCA
                        results: [{ memory: 'BCA: 20% Body Fat' }]
                    })
                    .mockResolvedValueOnce({ // 4. Outcomes
                        results: [{ memory: 'Outcome: Improved sleep' }]
                    });

                const context = await contextBuilder.buildMemoryContext(userId, 'insights');

                expect(context.intent).toBe('insights');
                expect(context.recent_events).toContain('Weekly Summary: Active');
                expect(context.key_facts).toContain('Diagnostic: Blood: LDL 120');
                expect(context.key_facts).toContain('Body Comp: BCA: 20% Body Fat');
                expect(context.intervention_history).toContain('Outcome: Improved sleep');
            });
        });
    });
});
