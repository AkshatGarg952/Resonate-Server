import mongoose from "mongoose";

const stepsSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    steps: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const sleepSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    sleepHours: {
      type: Number,
      default: 0
    }
  },
  { _id: false }
);

const workoutSchema = new mongoose.Schema(
  {
    type: String,
    durationMinutes: Number,
    caloriesBurned: Number
  },
  { _id: false }
);

const dailyWorkoutSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },
    workouts: {
      type: [workoutSchema],
      default: []
    }
  },
  { _id: false }
);

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
      type: [stepsSchema], 
      default: []
    },

    sleepHistory: {
      type: [sleepSchema],
      default: []
    },

    workoutHistory: {
      type: [dailyWorkoutSchema],
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
