import { User } from "../models/User.js";
import axios from "axios";

const generatePlanFromAI = async (user) => {
    const payload = {
        age: user.age,
        gender: user.gender,
        weight: user.weight,
        height: user.height,
        goals: user.goals,
        dietType: user.dietType,
        allergies: user.medicalConditions || [],
        cuisine: "Indian"
    };

    const microserviceUrl = process.env.MICROSERVICE_URL || "http://localhost:10000";
    const response = await axios.post(`${microserviceUrl}/generate-nutrition`, payload);
    return response.data;
};


export const getDailySuggestions = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.dailyMealPlan) {
            return res.json({ status: "success", plan: user.dailyMealPlan });
        }

        try {
            const aiResponse = await generatePlanFromAI(user);

            user.dailyMealPlan = aiResponse.plan || aiResponse;
            user.mealPlanDate = new Date();
            await user.save();

            return res.json({ status: "success", plan: user.dailyMealPlan });

        } catch (error) {
            console.error("AI Generation failed:", error.message);
            return res.status(500).json({ message: "Failed to generate initial plan" });
        }

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const generateNewDailySuggestions = async (req, res) => {
    try {
        const userId = req.user.firebaseUid;
        const user = await User.findOne({ firebaseUid: userId });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        try {
            const aiResponse = await generatePlanFromAI(user);

            user.dailyMealPlan = aiResponse.plan || aiResponse;
            user.mealPlanDate = new Date();
            await user.save();

            return res.json({ status: "success", plan: user.dailyMealPlan });

        } catch (error) {
            console.error("AI Generation failed:", error.message);
            return res.status(500).json({ message: "Failed to regenerate plan" });
        }

    } catch (error) {
        console.error("Controller Error:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
