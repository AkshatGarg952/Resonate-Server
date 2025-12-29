import mongoose from "mongoose";

export const biomarkerSchema = new mongoose.Schema(
  {
    value: Number,

    status: {
      type: String,
      enum: ["good", "bad"],
      default: "good",
    },

    unit: String,
    referenceRange: String,

    isCalculated: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);
