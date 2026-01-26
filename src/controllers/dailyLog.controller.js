import { DailyLog } from "../models/DailyLog.js";

// Create or Update a Daily Log (Upsert for the current date)
export const createDailyLog = async (req, res) => {
    try {
        const { date, energyLevel, sleepQuality, stressLevel, mood, symptoms, notes } = req.body;

        // Determine the date to log for. If not provided, it's "now".
        // We normalize to the start of the day or just rely on the user passing the correct date string.
        // Ideally, the frontend sends a specific date. 
        // If the user sends a date, we should check if a log already exists for that user on that day.

        // Simple approach: Use the date provided or today.
        // If we want to prevent multiple logs for same day, we need to query by range or normalized date.
        // For MVP, if they send a specific date 'YYYY-MM-DD', we can try to find and update.

        // Let's assume date is passed as ISO string or YYYY-MM-DD. 
        // We'll search for a log on that calendar day.

        const logDate = date ? new Date(date) : new Date();
        const startOfDay = new Date(logDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(logDate);
        endOfDay.setHours(23, 59, 59, 999);

        let dailyLog = await DailyLog.findOne({
            user: req.user._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        });

        if (dailyLog) {
            // Update existing
            if (energyLevel) dailyLog.energyLevel = energyLevel;
            if (sleepQuality) dailyLog.sleepQuality = sleepQuality;
            if (stressLevel) dailyLog.stressLevel = stressLevel;
            if (mood) dailyLog.mood = mood;
            if (symptoms) dailyLog.symptoms = symptoms;
            if (notes) dailyLog.notes = notes;

            await dailyLog.save();
        } else {
            // Create new
            dailyLog = await DailyLog.create({
                user: req.user._id,
                date: logDate,
                energyLevel,
                sleepQuality,
                stressLevel,
                mood,
                symptoms,
                notes
            });
        }

        res.status(200).json({ success: true, dailyLog });
    } catch (error) {
        console.error("Error creating/updating daily log:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};

// Get all daily logs for the user
export const getDailyLogs = async (req, res) => {
    try {
        const logs = await DailyLog.find({ user: req.user._id }).sort({ date: -1 });
        res.status(200).json({ success: true, logs });
    } catch (error) {
        console.error("Error getting daily logs:", error);
        res.status(500).json({ success: false, message: "Server Error", error: error.message });
    }
};
