import { InterventionService } from '../services/intervention.service.js';
import { MemoryService } from '../services/memory.service.js';

const memoryService = new MemoryService();
const interventionService = new InterventionService(memoryService);

/**
 * Create a new intervention
 */
export const createIntervention = async (req, res) => {
    try {
        // userId from auth middleware
        const userId = req.user._id;
        const interventionData = req.body;

        const intervention = await interventionService.createIntervention(userId, interventionData);

        res.status(201).json({ success: true, intervention });
    } catch (error) {
        console.error("Error creating intervention:", error);
        res.status(500).json({ success: false, message: "Failed to create intervention", error: error.message });
    }
};

/**
 * Get active interventions for the current user
 */
export const getActiveInterventions = async (req, res) => {
    try {
        const userId = req.user._id;
        const interventions = await interventionService.getActiveInterventions(userId);

        res.status(200).json({ success: true, interventions });
    } catch (error) {
        console.error("Error fetching active interventions:", error);
        res.status(500).json({ success: false, message: "Failed to fetch interventions", error: error.message });
    }
};

/**
 * Record an outcome for an intervention
 */
export const recordOutcome = async (req, res) => {
    try {
        const { id } = req.params;
        const outcomeData = req.body;

        const intervention = await interventionService.recordOutcome(id, outcomeData);

        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error recording outcome:", error);
        res.status(500).json({ success: false, message: "Failed to record outcome", error: error.message });
    }
};

/**
 * Get effectiveness analysis (basic)
 */
export const getInterventionAnalysis = async (req, res) => {
    try {
        const { id } = req.params;
        const analysis = await interventionService.analyzeEffectiveness(id);

        if (!analysis) {
            return res.status(404).json({ success: false, message: "Intervention not found or no data" });
        }

        res.status(200).json({ success: true, analysis });
    } catch (error) {
        console.error("Error analyzing intervention:", error);
        res.status(500).json({ success: false, message: "Failed to analyze intervention", error: error.message });
    }
};

/**
 * Get all interventions
 */
export const getInterventions = async (req, res) => {
    try {
        const userId = req.user._id;
        const interventions = await interventionService.getInterventions(userId);
        res.status(200).json({ success: true, interventions });
    } catch (error) {
        console.error("Error fetching interventions:", error);
        res.status(500).json({ success: false, message: "Failed to fetch interventions", error: error.message });
    }
};

/**
 * Stop an intervention
 */
export const stopIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const intervention = await interventionService.stopIntervention(id, reason);
        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error stopping intervention:", error);
        res.status(500).json({ success: false, message: "Failed to stop intervention", error: error.message });
    }
};

/**
 * Update an intervention
 */
export const updateIntervention = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const intervention = await interventionService.updateIntervention(id, updates);
        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error updating intervention:", error);
        res.status(500).json({ success: false, message: "Failed to update intervention", error: error.message });
    }
};
