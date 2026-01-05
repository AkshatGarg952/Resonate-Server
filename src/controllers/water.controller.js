import { FitnessData } from "../models/FitnessData.js";

// Get Water Data (Current Day + History just in case)
export const getWaterData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find or create the resonate provider document for this user
        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });

        if (!fitnessData) {
            // If it doesn't exist, return a default empty structure or create one?
            // Let's create one on the fly for simplicity if they want to read it.
            fitnessData = await FitnessData.create({
                userId,
                provider: "resonate",
                waterHistory: []
            });
        }

        // Find today's entry
        const today = new Date().toISOString().split('T')[0];
        const todayEntry = fitnessData.waterHistory.find(w => w.date === today) || { date: today, amountMl: 0, goalMl: 0 };

        res.json({
            today: todayEntry,
            history: fitnessData.waterHistory
        });

    } catch (error) {
        console.error("Get Water Data Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Log Water (Add/Update for today)
export const logWater = async (req, res) => {
    try {
        const userId = req.user._id;
        const { amountMl, date } = req.body; // Allow passing date manually or default to today

        const targetDate = date || new Date().toISOString().split('T')[0];
        const amountToAdd = parseInt(amountMl);

        if (isNaN(amountToAdd)) {
            return res.status(400).json({ message: "Invalid amount" });
        }

        // Upsert logic
        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });

        if (!fitnessData) {
            fitnessData = new FitnessData({ userId, provider: "resonate", waterHistory: [] });
        }

        let dayEntryIndex = fitnessData.waterHistory.findIndex(w => w.date === targetDate);

        if (dayEntryIndex > -1) {
            // Update existing (Set or Add? Usually log means "add this cup", but the UI might send total. 
            // Let's assume the UI sends the NEW TOTAL or ADDITION? 
            // "Allow users to log daily water consumption" -> +250ml.
            // If I send +250, I should probably use $inc or calculate here.
            // Let's assume the client sends the *delta* or we handle explicit "add".
            // Actually, to be safe and idempotent, sending the TOTAL amount is better if the client manages state, 
            // BUT simplistic "I drank a glass" implies adding.
            // Let's implement an "add" endpoint logic.

            fitnessData.waterHistory[dayEntryIndex].amountMl += amountToAdd;
        } else {
            // Create new entry for day
            // Default goal from previous day? Or fixed? Let's fix to 3000 for now.
            fitnessData.waterHistory.push({
                date: targetDate,
                amountMl: amountToAdd,
                goalMl: 0
            });
        }

        await fitnessData.save();

        // Return the updated day entry
        const updatedEntry = fitnessData.waterHistory.find(w => w.date === targetDate);
        res.json(updatedEntry);

    } catch (error) {
        console.error("Log Water Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Set Goal
export const setWaterGoal = async (req, res) => {
    try {
        const userId = req.user._id;
        const { goalMl, date } = req.body;

        if (!goalMl) return res.status(400).json({ message: "Goal required" });
        const targetDate = date || new Date().toISOString().split('T')[0];

        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });
        if (!fitnessData) {
            fitnessData = new FitnessData({ userId, provider: "resonate", waterHistory: [] });
        }

        let dayEntryIndex = fitnessData.waterHistory.findIndex(w => w.date === targetDate);
        if (dayEntryIndex > -1) {
            fitnessData.waterHistory[dayEntryIndex].goalMl = goalMl;
        } else {
            fitnessData.waterHistory.push({
                date: targetDate,
                amountMl: 0,
                goalMl: goalMl
            });
        }

        await fitnessData.save();
        const updatedEntry = fitnessData.waterHistory.find(w => w.date === targetDate);
        res.json(updatedEntry);

    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};
