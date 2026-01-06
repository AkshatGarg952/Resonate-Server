import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    phone: { type: String },

    gender: {
      type: String,
      enum: ["male", "female", "other"]
    },

    fitnessProvider: {
      type: String,
      enum: ["google_fit", "apple_health"],
    },

    fitnessConnected: {
      type: Boolean
    },

    age: Number,
    height: Number,
    weight: Number,


    goals: String,

    dietType: {
      type: String,
      enum: ["vegetarian", "eggetarian", "non_vegetarian"],
    },

    googleFit: {
      accessToken: String,
      refreshToken: String,
      expiryDate: Number
    },


    hasMedicalCondition: { type: Boolean, default: false },
    medicalConditions: [String],

    menstrualProfile: {
      cycleLengthDays: Number,
      lastPeriodDate: Date,
      phase: String
    },

    dailyMealPlan: { type: Object, default: null },
    mealPlanDate: { type: Date, default: null }
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
