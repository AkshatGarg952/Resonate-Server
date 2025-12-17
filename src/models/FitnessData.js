import mongoose from "mongoose";

const dailyFitnessSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },

  steps: {
    type: Number,
    default: 0
  },

  sleepHours: {
    type: Number,
    default: 0
  },

  workouts: [
    {
      type: {
        type: String,
      },
      durationMinutes: Number,
      caloriesBurned: Number
    }
  ]
});

const fitnessDataSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    provider: {
      type: String,
      enum: ["google_fit", "apple_health"],
      required: true
    },

    dailyData: [dailyFitnessSchema],

    lastSyncTime: {
      type: Date
    }
  },
  { timestamps: true }
);

export const FitnessData = mongoose.model("FitnessData", fitnessDataSchema);
