import { FitnessData } from "../models/FitnessData.js";

// Get Water Data (Current Day + History just in case)
export const getWaterData = async (req, res) => {
    try {
        const userId = req.user._id;

        // Find or create the resonate provider document for this user
        let fitnessData = await FitnessData.findOne({ userId, provider: "resonate" });

        if (!fitnessData) {
           
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
          

            fitnessData.waterHistory[dayEntryIndex].amountMl += amountToAdd;
        } else {
           
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
