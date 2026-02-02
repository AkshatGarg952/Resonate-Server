import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import {
    validateCategory,
    validateSource,
    validateConfidence,
    validateTimestamp,
    validateTimezone,
    validateCategorySpecificFields,
    validateMemoryMetadata,
    getDefaultConfidence,
    sanitizePII,
    normalizeMetadata,
    ValidationError,
    VALID_CATEGORIES,
    VALID_SOURCES
} from '../utils/memoryValidator.js';

describe('Memory Validator', () => {
    describe('validateCategory', () => {
        test('should accept valid categories', () => {
            VALID_CATEGORIES.forEach(category => {
                expect(() => validateCategory(category)).not.toThrow();
            });
        });

        test('should reject invalid category', () => {
            expect(() => validateCategory('invalid.category')).toThrow(ValidationError);
        });

        test('should reject missing category', () => {
            expect(() => validateCategory(null)).toThrow(ValidationError);
            expect(() => validateCategory(undefined)).toThrow(ValidationError);
        });
    });

    describe('validateSource', () => {
        test('should accept valid sources', () => {
            VALID_SOURCES.forEach(source => {
                expect(() => validateSource(source)).not.toThrow();
            });
        });

        test('should reject invalid source', () => {
            expect(() => validateSource('invalid_source')).toThrow(ValidationError);
        });

        test('should reject missing source', () => {
            expect(() => validateSource(null)).toThrow(ValidationError);
        });
    });

    describe('validateConfidence', () => {
        test('should accept valid confidence scores', () => {
            expect(() => validateConfidence(0.0)).not.toThrow();
            expect(() => validateConfidence(0.5)).not.toThrow();
            expect(() => validateConfidence(1.0)).not.toThrow();
        });

        test('should reject out of range confidence', () => {
            expect(() => validateConfidence(-0.1)).toThrow(ValidationError);
            expect(() => validateConfidence(1.1)).toThrow(ValidationError);
        });

        test('should reject non-numeric confidence', () => {
            expect(() => validateConfidence('0.5')).toThrow(ValidationError);
        });

        test('should reject missing confidence', () => {
            expect(() => validateConfidence(null)).toThrow(ValidationError);
            expect(() => validateConfidence(undefined)).toThrow(ValidationError);
        });
    });

    describe('validateTimestamp', () => {
        test('should accept valid ISO 8601 timestamps', () => {
            expect(() => validateTimestamp('2026-02-02T12:00:00Z')).not.toThrow();
            expect(() => validateTimestamp(new Date().toISOString())).not.toThrow();
        });

        test('should reject invalid timestamp format', () => {
            expect(() => validateTimestamp('2026-02-02')).toThrow(ValidationError);
            expect(() => validateTimestamp('invalid')).toThrow(ValidationError);
        });

        test('should reject missing timestamp', () => {
            expect(() => validateTimestamp(null)).toThrow(ValidationError);
        });
    });

    describe('validateTimezone', () => {
        test('should accept valid timezone strings', () => {
            expect(() => validateTimezone('Asia/Kolkata')).not.toThrow();
            expect(() => validateTimezone('UTC')).not.toThrow();
            expect(() => validateTimezone('America/New_York')).not.toThrow();
        });

        test('should reject empty timezone', () => {
            expect(() => validateTimezone('')).toThrow(ValidationError);
            expect(() => validateTimezone('   ')).toThrow(ValidationError);
        });

        test('should reject missing timezone', () => {
            expect(() => validateTimezone(null)).toThrow(ValidationError);
        });
    });

    describe('validateCategorySpecificFields', () => {
        test('should validate fitness.training required fields', () => {
            const validData = {
                workout_type: 'push',
                duration_mins: 45,
                rpe: 7
            };
            expect(() => validateCategorySpecificFields('fitness.training', validData)).not.toThrow();
        });

        test('should reject missing required fields for fitness.training', () => {
            const invalidData = {
                workout_type: 'push'
            };
            expect(() => validateCategorySpecificFields('fitness.training', invalidData)).toThrow(ValidationError);
        });

        test('should validate nutrition.intake required fields', () => {
            const validData = {
                meal_type: 'lunch',
                calories: 500,
                plan_adherence: true
            };
            expect(() => validateCategorySpecificFields('nutrition.intake', validData)).not.toThrow();
        });

        test('should validate recovery.sleep required fields', () => {
            const validData = {
                hours: 7.5,
                quality_score: 8
            };
            expect(() => validateCategorySpecificFields('recovery.sleep', validData)).not.toThrow();
        });

        test('should reject non-object module_specific', () => {
            expect(() => validateCategorySpecificFields('fitness.training', null)).toThrow(ValidationError);
            expect(() => validateCategorySpecificFields('fitness.training', 'invalid')).toThrow(ValidationError);
        });
    });

    describe('validateMemoryMetadata', () => {
        let validMetadata;

        beforeEach(() => {
            validMetadata = {
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
        });

        test('should accept valid metadata', () => {
            expect(() => validateMemoryMetadata(validMetadata)).not.toThrow();
        });

        test('should reject invalid category', () => {
            validMetadata.category = 'invalid';
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });

        test('should reject invalid source', () => {
            validMetadata.source = 'invalid';
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });

        test('should reject invalid confidence', () => {
            validMetadata.confidence = 1.5;
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });

        test('should reject missing required fields', () => {
            delete validMetadata.timestamp;
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });

        test('should reject invalid tags type', () => {
            validMetadata.tags = 'not-an-array';
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });

        test('should reject missing category-specific fields', () => {
            validMetadata.module_specific = { workout_type: 'push' };
            expect(() => validateMemoryMetadata(validMetadata)).toThrow(ValidationError);
        });
    });

    describe('getDefaultConfidence', () => {
        test('should return correct confidence for each source', () => {
            expect(getDefaultConfidence('user_input')).toBe(0.95);
            expect(getDefaultConfidence('coach_input')).toBe(0.95);
            expect(getDefaultConfidence('device_sync')).toBe(0.90);
            expect(getDefaultConfidence('lab_import')).toBe(1.0);
            expect(getDefaultConfidence('system_generated')).toBe(0.80);
        });

        test('should return default for unknown source', () => {
            expect(getDefaultConfidence('unknown')).toBe(0.80);
        });
    });

    describe('sanitizePII', () => {
        test('should remove PII fields from module_specific', () => {
            const metadata = {
                category: 'fitness.training',
                module_specific: {
                    workout_type: 'push',
                    email: 'user@example.com',
                    phone: '1234567890',
                    duration_mins: 45
                }
            };

            const sanitized = sanitizePII(metadata);
            expect(sanitized.module_specific.email).toBeUndefined();
            expect(sanitized.module_specific.phone).toBeUndefined();
            expect(sanitized.module_specific.workout_type).toBe('push');
            expect(sanitized.module_specific.duration_mins).toBe(45);
        });

        test('should not modify original metadata', () => {
            const metadata = {
                category: 'fitness.training',
                module_specific: {
                    email: 'user@example.com'
                }
            };

            const sanitized = sanitizePII(metadata);
            expect(metadata.module_specific.email).toBe('user@example.com');
            expect(sanitized.module_specific.email).toBeUndefined();
        });
    });

    describe('normalizeMetadata', () => {
        test('should add default confidence based on source', () => {
            const metadata = {
                source: 'user_input',
                category: 'fitness.training'
            };

            const normalized = normalizeMetadata(metadata);
            expect(normalized.confidence).toBe(0.95);
        });

        test('should add default timestamp if missing', () => {
            const metadata = {
                source: 'user_input',
                category: 'fitness.training'
            };

            const normalized = normalizeMetadata(metadata);
            expect(normalized.timestamp).toBeDefined();
            expect(new Date(normalized.timestamp)).toBeInstanceOf(Date);
        });

        test('should add default timezone if missing', () => {
            const metadata = {
                source: 'user_input',
                category: 'fitness.training'
            };

            const normalized = normalizeMetadata(metadata);
            expect(normalized.timezone).toBe('UTC');
        });

        test('should add empty tags array if missing', () => {
            const metadata = {
                source: 'user_input',
                category: 'fitness.training'
            };

            const normalized = normalizeMetadata(metadata);
            expect(normalized.tags).toEqual([]);
        });

        test('should not override existing values', () => {
            const metadata = {
                source: 'user_input',
                category: 'fitness.training',
                confidence: 0.99,
                timestamp: '2026-01-01T00:00:00Z',
                timezone: 'Asia/Kolkata',
                tags: ['custom']
            };

            const normalized = normalizeMetadata(metadata);
            expect(normalized.confidence).toBe(0.99);
            expect(normalized.timestamp).toBe('2026-01-01T00:00:00Z');
            expect(normalized.timezone).toBe('Asia/Kolkata');
            expect(normalized.tags).toEqual(['custom']);
        });
    });
});
