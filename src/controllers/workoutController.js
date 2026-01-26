import axios from "axios";
import Workout from "../models/Workout.js";

export const generateWorkout = async (req, res) => {
    try {
        const { fitnessLevel, equipment, timeAvailable, injuries, motivationLevel, workoutTiming, goalBarriers } = req.body;

        if (!fitnessLevel || !timeAvailable) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const MICROSERVICE_URL = process.env.MICROSERVICE_URL || "http://127.0.0.1:10000";

        let age = null, gender = null, weight = null, cyclePhase = null;
        if (req.user) {
            age = req.user.age;
            gender = req.user.gender;
            weight = req.user.weight;
            if (req.user.menstrualProfile) {
                cyclePhase = req.user.menstrualProfile.phase;
            }
        }

        const response = await axios.post(`${MICROSERVICE_URL}/generate-workout`, {
            fitnessLevel,
            equipment: equipment || [],
            timeAvailable: parseInt(timeAvailable),
            injuries: injuries || [],
            motivationLevel,
            workoutTiming,
            goalBarriers: goalBarriers || [],
            age,
            gender,
            weight,
            cyclePhase
        });

        const plan = response.data.plan;

        if (req.user) {
            const newWorkout = new Workout({
                user: req.user._id,
                inputs: { fitnessLevel, equipment, timeAvailable, injuries, motivationLevel, workoutTiming, goalBarriers },
                plan: plan
            });
            await newWorkout.save();
        }

        res.status(200).json({ status: "success", plan });
    } catch (error) {
        console.error("Error generating workout:", error.message);

        if (error.response) {
            return res.status(error.response.status).json({ message: "Error from generator service", detail: error.response.data });
        }
        res.status(500).json({ message: "Failed to generate workout", error: error.message });
    }
};

export const getWorkoutHistory = async (req, res) => {
    try {
        const workouts = await Workout.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.status(200).json({ status: "success", workouts });
    } catch (error) {
        console.error("Error fetching history:", error);
        res.status(500).json({ message: "Failed to fetch workout history" });
    }
};
