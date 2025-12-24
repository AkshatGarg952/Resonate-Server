import mongoose from "mongoose";

/* ---------- Sub-schemas ---------- */

// Steps per day
const stepsSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    steps: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

// Sleep per day
const sleepSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    sleepHours: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

// Workout item
const workoutSchema = new mongoose.Schema(
  {
    type: String,
    durationMinutes: Number,
    caloriesBurned: Number
  },
  { _id: false }
);

// Workouts per day
const dailyWorkoutSchema = new mongoose.Schema(
  {
    date: {
      type: String, // YYYY-MM-DD
      required: true
    },
    workouts: {
      type: [workoutSchema],
      default: []
    }
  },
  { _id: false }
);

/* ---------- Main Schema ---------- */

const fitnessDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    provider: {
      type: String,
      enum: ["google_fit", "apple_health"],
      required: true
    },

    stepsHistory: {
      type: [stepsSchema], // last 7 days
      default: []
    },

    sleepHistory: {
      type: [sleepSchema], // last 7 days
      default: []
    },

    workoutHistory: {
      type: [dailyWorkoutSchema], // last 7 days
      default: []
    },

    lastSyncTime: {
      type: Date
    }
  },
  { timestamps: true }
);

fitnessDataSchema.index(
  { userId: 1, provider: 1 },
  { unique: true }
);

export const FitnessData = mongoose.model("FitnessData", fitnessDataSchema);
