import { jest } from '@jest/globals';
import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fitnessSamples = require('./fixtures/fitness-samples.json');
const nutritionSamples = require('./fixtures/nutrition-samples.json');
const recoverySamples = require('./fixtures/recovery-samples.json');
const diagnosticsSamples = require('./fixtures/diagnostics-samples.json');

import { FitnessIngestor } from '../services/ingestors/fitness.ingestor.js';
import { NutritionIngestor } from '../services/ingestors/nutrition.ingestor.js';
import { RecoveryIngestor } from '../services/ingestors/recovery.ingestor.js';
import { DiagnosticsIngestor } from '../services/ingestors/diagnostics.ingestor.js';

// Mock MemoryService
const mockAddMemory = jest.fn();
const mockMemoryService = {
    addMemory: mockAddMemory
};

describe('Ingestors', () => {
    let fitnessIngestor;
    let nutritionIngestor;
    let recoveryIngestor;
    let diagnosticsIngestor;

    beforeEach(() => {
        mockAddMemory.mockClear();
        fitnessIngestor = new FitnessIngestor(mockMemoryService);
        nutritionIngestor = new NutritionIngestor(mockMemoryService);
        recoveryIngestor = new RecoveryIngestor(mockMemoryService);
        diagnosticsIngestor = new DiagnosticsIngestor(mockMemoryService);
    });

    describe('FitnessIngestor', () => {
        test('should process valid fitness samples correctly', async () => {
            const samples = fitnessSamples;
            for (const sample of samples) {
                await fitnessIngestor.processWorkoutEvent('user123', sample);
            }
            expect(mockAddMemory).toHaveBeenCalledTimes(samples.length);
            const firstCallArgs = mockAddMemory.mock.calls[0];
            expect(firstCallArgs[0]).toBe('user123');
            expect(firstCallArgs[1]).toContain('Completed Push Day');
            expect(firstCallArgs[2].category).toBe('fitness.training');
        });

        test('should handle missing exercises', async () => {
            const minimalWorkout = { name: 'Quick Cardio', durationMinutes: 20 };
            await fitnessIngestor.processWorkoutEvent('user123', minimalWorkout);
            const callArgs = mockAddMemory.mock.lastCall;
            expect(callArgs[1]).toContain('Completed Quick Cardio');
            expect(callArgs[2].module_specific.duration_mins).toBe(20);
        });
    });

    describe('NutritionIngestor', () => {
        test('should process valid nutrition samples correctly', async () => {
            const samples = nutritionSamples;
            for (const sample of samples) {
                await nutritionIngestor.processMealEvent('user123', sample);
            }
            expect(mockAddMemory).toHaveBeenCalledTimes(samples.length);
            const firstCallArgs = mockAddMemory.mock.calls[0];
            expect(firstCallArgs[0]).toBe('user123');
            expect(firstCallArgs[2].category).toBe('nutrition.intake');
        });

        test('should handle non-adherence correctly', async () => {
            const cheatMeal = nutritionSamples[1];
            await nutritionIngestor.processMealEvent('user123', cheatMeal);
            const callArgsSingle = mockAddMemory.mock.calls[0];
            expect(callArgsSingle[2].module_specific.plan_adherence).toBe(false);
        });
    });

    describe('RecoveryIngestor', () => {
        test('should process sleep events correctly', async () => {
            const sleepSample = recoverySamples.find(s => s.type === 'sleep');
            await recoveryIngestor.processSleepEvent('user123', sleepSample);

            expect(mockAddMemory).toHaveBeenCalled();
            const callArgs = mockAddMemory.mock.lastCall;

            expect(callArgs[0]).toBe('user123');
            // Check text format: "Sleep: 6h 30m, quality 6/10..."
            expect(callArgs[1]).toMatch(/Sleep: 6h 30m/);
            expect(callArgs[1]).toMatch(/quality 6\/10/);
            expect(callArgs[2].category).toBe('recovery.sleep');
            expect(callArgs[2].module_specific.hours).toBe(6.5);
        });

        test('should process stress events correctly', async () => {
            const stressSample = recoverySamples.find(s => s.type === 'stress');
            await recoveryIngestor.processStressEvent('user123', stressSample);

            expect(mockAddMemory).toHaveBeenCalled();
            const callArgs = mockAddMemory.mock.lastCall;

            expect(callArgs[0]).toBe('user123');
            expect(callArgs[1]).toMatch(/Stress level 7\/10/);
            expect(callArgs[1]).toMatch(/fatigue: high/);
            expect(callArgs[2].category).toBe('recovery.stress');
            expect(callArgs[2].module_specific.stress_score).toBe(7);
        });
    });

    describe('DiagnosticsIngestor', () => {
        test('should process blood reports correctly', async () => {
            const bloodReport = diagnosticsSamples.blood_reports[0];
            await diagnosticsIngestor.processBloodReport('user123', bloodReport);

            expect(mockAddMemory).toHaveBeenCalled();
            const callArgs = mockAddMemory.mock.lastCall;

            expect(callArgs[0]).toBe('user123');
            expect(callArgs[2].category).toBe('diagnostics.blood');
            // Check formatted text includes key markers and abnormal values
            expect(callArgs[1]).toContain('LDL Cholesterol 148 mg/dL (high) (↑ from 135)');
            expect(callArgs[1]).toContain('HbA1c 5.8 %'); // Key marker, even if normal
            // Check metadata flattening
            expect(callArgs[2].module_specific.ldl_cholesterol).toBe(148);
        });

        test('should process BCA correctly', async () => {
            const bcaData = diagnosticsSamples.bca_scans[0];
            await diagnosticsIngestor.processBCA('user123', bcaData);

            expect(mockAddMemory).toHaveBeenCalled();
            const callArgs = mockAddMemory.mock.lastCall;

            expect(callArgs[2].category).toBe('diagnostics.bca');
            expect(callArgs[1]).toContain('Weight 91kg');
            expect(callArgs[2].module_specific.body_fat_percent).toBe(28);
        });

        test('should process CGM correctly', async () => {
            const cgmData = diagnosticsSamples.cgm_summaries[0];
            await diagnosticsIngestor.processCGM('user123', cgmData);

            expect(mockAddMemory).toHaveBeenCalled();
            const callArgs = mockAddMemory.mock.lastCall;

            expect(callArgs[2].category).toBe('diagnostics.cgm');
            expect(callArgs[1]).toContain('CGM Pattern: Fasting glucose spikes');
            expect(callArgs[2].module_specific.avg_glucose).toBe(115);
        });
    });
});
