import { Intervention } from "../models/Intervention.js";

// Create a new intervention
export const createIntervention = async (req, res) => {
    try {
        const { type, name, startDate, endDate, dosage, frequency, status, notes } = req.body;

        const intervention = await Intervention.create({
            user: req.user._id,
            type,
            name,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : null,
            dosage,
            frequency,
            status,
            notes,
        });

        res.status(201).json({ success: true, intervention });
    } catch (error) {
        console.error("Error creating intervention:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get all interventions for the user
export const getInterventions = async (req, res) => {
    try {
        const interventions = await Intervention.find({ user: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, interventions });
    } catch (error) {
        console.error("Error getting interventions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get active interventions for the user
export const getActiveInterventions = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Start of today

        const interventions = await Intervention.find({
            user: req.user._id,
            status: "active",
            $or: [
                { endDate: null },
                { endDate: { $gte: today } }
            ]
        }).sort({ createdAt: -1 });

        res.status(200).json({ success: true, interventions });
    } catch (error) {
        console.error("Error getting active interventions:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
// Stop an intervention (discontinue or complete)
export const stopIntervention = async (req, res) => {
    try {
        const { status, reason } = req.body;
        const intervention = await Intervention.findOne({ _id: req.params.id, user: req.user._id });

        if (!intervention) {
            return res.status(404).json({ success: false, message: "Intervention not found" });
        }

        intervention.status = status || "discontinued";
        intervention.endDate = new Date();
        if (reason) {
            intervention.discontinuationReason = reason;
        }

        await intervention.save();

        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error stopping intervention:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Update an intervention
export const updateIntervention = async (req, res) => {
    try {
        const { type, name, startDate, endDate, dosage, frequency, status, notes } = req.body;
        const intervention = await Intervention.findOne({ _id: req.params.id, user: req.user._id });

        if (!intervention) {
            return res.status(404).json({ success: false, message: "Intervention not found" });
        }

        // Update fields if provided
        if (type) intervention.type = type;
        if (name) intervention.name = name;
        if (startDate) intervention.startDate = new Date(startDate);
        if (endDate !== undefined) intervention.endDate = endDate ? new Date(endDate) : null;
        if (dosage !== undefined) intervention.dosage = dosage;
        if (frequency !== undefined) intervention.frequency = frequency;
        if (status) intervention.status = status;
        if (notes !== undefined) intervention.notes = notes;

        await intervention.save();

        res.status(200).json({ success: true, intervention });
    } catch (error) {
        console.error("Error updating intervention:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
