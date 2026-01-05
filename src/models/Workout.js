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
        injuries: [String]
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

export default mongoose.model("Workout", workoutSchema);
