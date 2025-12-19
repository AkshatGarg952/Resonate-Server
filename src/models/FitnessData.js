import mongoose from "mongoose";

const workoutSchema = new mongoose.Schema(
  {
    type: String,
    durationMinutes: Number,
    caloriesBurned: Number
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

    date: {
      type: String,
      required: true,
      index: true
    },

    steps: {
      type: Number,
      default: 0
    },

    sleepHours: {
      type: Number,
      default: 0
    },

    workouts: [workoutSchema],

    lastSyncTime: {
      type: Date
    }
  },
  { timestamps: true }
);


fitnessDataSchema.index(
  { userId: 1, provider: 1, date: 1 },
  { unique: true }
);

export const FitnessData = mongoose.model("FitnessData", fitnessDataSchema);
