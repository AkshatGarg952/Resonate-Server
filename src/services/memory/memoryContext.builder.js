import { MemoryService } from '../memory.service.js';
import { logger } from '../../utils/memoryLogger.js';

/**
 * Service to build structured memory context for AI generation
 */
export class MemoryContextBuilder {
    constructor() {
        this.memoryService = new MemoryService();
    }

    /**
     * Build context pack for specific user intent
     * @param {string} userId - User ID
     * @param {string} intent - One of: 'fitness_plan', 'nutrition_plan', 'insights'
     * @returns {Promise<Object>} Structured memory pack
     */
    async buildMemoryContext(userId, intent) {
        try {
            logger.debug('BUILD_CONTEXT', `Building context for intent: ${intent}`, { userId });

            const context = {
                intent,
                timestamp: new Date().toISOString(),
                key_facts: [],
                recent_events: [],
                intervention_history: [],
                trends: {}
            };

            switch (intent) {
                case 'fitness_plan':
                    await this._enrichFitnessContext(userId, context);
                    break;
                case 'nutrition_plan':
                    await this._enrichNutritionContext(userId, context);
                    break;
                case 'insights':
                    await this._enrichInsightsContext(userId, context);
                    break;
                default:
                    logger.warn('BUILD_CONTEXT', `Unknown intent: ${intent}`);
            }

            return context;
        } catch (error) {
            logger.logError('BUILD_CONTEXT', error, { userId, intent });
            // Return empty safe structure on error to not block AI generation
            return {
                intent,
                error: true,
                key_facts: [],
                recent_events: [],
                intervention_history: [],
                trends: {}
            };
        }
    }

    /**
     * Enrich context for fitness planning
     * Focus: Recent workouts, recovery status, injuries, program adherence
     */
    async _enrichFitnessContext(userId, context) {
        // 1. Get recent training logs (last 14 days)
        const trainingLogs = await this.memoryService.searchMemory(userId, 'workout training session', {
            category: 'fitness.training'
        }, 5);

        // 2. Get recent recovery status (sleep, stress)
        const recoveryData = await this.memoryService.searchMemory(userId, 'sleep stress recovery energy', {
            category: 'recovery.sleep' // Mem0 might return mixed results for semantic query, but filter helps
        }, 5);

        // Also fetch stress specifically if needed, or rely on semantic search 'recovery' covering it
        const stressData = await this.memoryService.searchMemory(userId, 'stress fatigue soreness', {
            category: 'recovery.stress'
        }, 3);

        // 3. Get active interventions
        const activeInterventions = await this.memoryService.searchMemory(userId, 'active training intervention', {
            category: 'intervention.plan'
        }, 3);

        // 4. Structure the data

        // Process workouts
        if (trainingLogs.results.length > 0) {
            context.recent_events.push(...trainingLogs.results.map(r => r.memory));

            // Extract facts (simplified for now, ideally would process metadata)
            const recentRPE = trainingLogs.results
                .map(r => r.metadata?.module_specific?.rpe)
                .filter(Boolean);

            if (recentRPE.length) {
                const avgRpe = recentRPE.reduce((a, b) => a + b, 0) / recentRPE.length;
                context.trends.avg_workout_intensity = Math.round(avgRpe * 10) / 10;
            }
        } else {
            context.key_facts.push("No recent workout history found.");
        }

        // Process recovery
        if (recoveryData.results.length > 0) {
            context.key_facts.push(...recoveryData.results.map(r => `Recovery: ${r.memory}`));

            // Simple trend detection
            const sleepHours = recoveryData.results
                .map(r => r.metadata?.module_specific?.hours)
                .filter(Boolean);

            if (sleepHours.length) {
                const avgSleep = sleepHours.reduce((a, b) => a + b, 0) / sleepHours.length;
                context.trends.avg_sleep_hours = Math.round(avgSleep * 10) / 10;

                if (avgSleep < 6) {
                    context.trends.recovery_status = 'poor';
                    context.key_facts.push("⚠️ Sleep average is below 6 hours (Poor Recovery)");
                } else if (avgSleep > 7.5) {
                    context.trends.recovery_status = 'good';
                } else {
                    context.trends.recovery_status = 'moderate';
                }
            }
        }

        // Process interventions
        if (activeInterventions.results.length > 0) {
            context.intervention_history.push(...activeInterventions.results.map(r => r.memory));
        }
    }

    /**
     * Enrich context for nutrition planning
     * Focus: Meal patterns, macro adherence, food preferences (implicit), interventions
     */
    async _enrichNutritionContext(userId, context) {
        // 1. Get recent meal logs
        const mealLogs = await this.memoryService.searchMemory(userId, 'meal food intake calories', {
            category: 'nutrition.intake'
        }, 10);

        // 2. Get active nutrition interventions
        const interventions = await this.memoryService.searchMemory(userId, 'nutrition diet intervention', {
            category: 'intervention.plan'
        }, 3);

        // 3. Get insights/trends (if any exist in generic store, or compute from logs)
        // For now, rely on logs

        if (mealLogs.results.length > 0) {
            context.recent_events.push(...mealLogs.results.slice(0, 5).map(r => r.memory));

            const adherenceCount = mealLogs.results.filter(r => {
                const text = r.memory.toLowerCase();
                return text.includes('adhered') && !text.includes('not adhered');
            }).length;
            const adherenceRate = Math.round((adherenceCount / mealLogs.results.length) * 100);

            context.trends.plan_adherence_percent = adherenceRate;
            context.key_facts.push(`Recent plan adherence: ${adherenceRate}%`);
        } else {
            context.key_facts.push("No recent nutrition logs found.");
        }

        if (interventions.results.length > 0) {
            context.intervention_history.push(...interventions.results.map(r => r.memory));
        }
    }

    /**
     * Enrich context for general insights
     * Focus: Broad trends, changes in diagnostics, correlation between categories
     */
    async _enrichInsightsContext(userId, context) {
        // 1. Fetch broad range of recent activities
        const recentActivity = await this.memoryService.searchMemory(userId, 'recent health activity summary', {}, 10);

        // 2. Fetch diagnostics
        const diagnostics = await this.memoryService.searchMemory(userId, 'blood test body composition cgm', {
            category: 'diagnostics.blood' // partial cover, might need multiple queries
        }, 3);

        const bca = await this.memoryService.searchMemory(userId, 'body composition weight', {
            category: 'diagnostics.bca'
        }, 3);

        // 3. Fetch past outcomes
        const outcomes = await this.memoryService.searchMemory(userId, 'intervention outcome result', {
            category: 'intervention.outcome'
        }, 5);

        if (recentActivity.results.length > 0) {
            context.recent_events.push(...recentActivity.results.map(r => r.memory));
        }

        if (diagnostics.results.length > 0) {
            context.key_facts.push(...diagnostics.results.map(r => `Diagnostic: ${r.memory}`));
        }

        if (bca.results.length > 0) {
            context.key_facts.push(...bca.results.map(r => `Body Comp: ${r.memory}`));
        }

        if (outcomes.results.length > 0) {
            context.intervention_history.push(...outcomes.results.map(r => r.memory));
        }
    }
}
