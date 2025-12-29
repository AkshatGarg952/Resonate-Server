import mongoose from "mongoose";
import { categorizedBiomarkersSchema } from "./categorizedBiomarkers.js";

const diagnosticsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    pdfUrl: {
      type: String,
      required: true,
    },

    biomarkers: categorizedBiomarkersSchema,

    schemaVersion: {
      type: Number,
      default: 1,
    },

    metadata: {
      testTime: {
        type: String,
        enum: ["AM", "PM"],
      },
      reportDate: Date,
      labName: String,
    },

    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Diagnostics = mongoose.model("Diagnostics", diagnosticsSchema);
