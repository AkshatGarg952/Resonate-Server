import mongoose from "mongoose";

const biomarkerSchema = new mongoose.Schema({
  value: { type: Number, required: true },
  status: {
    type: String,
    enum: ["good", "bad"],
    default: "good"
  },
  unit: { type: String, default: null },
  category: { type: String, default: null },
  reason: { type: String, default: null },
  categoryLabel: { type: String, default: null }
}, { _id: false });

const diagnosticsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    
    // Store biomarkers in two formats:
    // 1. All biomarkers in a flat structure (for easy access)
    // Using Map type - Mongoose will handle conversion from plain objects
    biomarkers: {
      type: Map,
      of: biomarkerSchema,
      default: {}
    },
    
    // 2. Category-wise organization (for frontend display)
    // Using Mixed type for flexibility with nested structures
    biomarkersByCategory: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" }
  },
  { timestamps: true }
);

export const Diagnostics = mongoose.model("Diagnostics", diagnosticsSchema);
