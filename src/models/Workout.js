import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    inputs: {
        fitnessLevel: String,
        equipment: [String],
        timeAvailable: Number,
        injuries: [String],
        motivationLevel: String,
        workoutTiming: String,
        goalBarriers: [String]
    },
    plan: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for fast per-user workout history queries
workoutSchema.index({ user: 1 });

export default mongoose.model("Workout", workoutSchema);
