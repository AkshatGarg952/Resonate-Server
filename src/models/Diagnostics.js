import mongoose from "mongoose";

const biomarkerSchema = new mongoose.Schema({
  value: Number,
  status: {
    type: String,
    enum: ["good", "bad"],
    default: "good"
  }
});

const diagnosticsSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    pdfUrl: { type: String, required: true },
    
    biomarkers: {
      hemoglobin: biomarkerSchema,
      fastingGlucose: biomarkerSchema,
      hdl: biomarkerSchema,
      ldl: biomarkerSchema,
      triglycerides: biomarkerSchema,
      tsh: biomarkerSchema,
      vitaminD: biomarkerSchema,
      alt: biomarkerSchema,
      ast: biomarkerSchema,
    },
    
    status: { type: String, enum: ["pending", "completed"], default: "pending" }
  },
  { timestamps: true }
);

export const Diagnostics = mongoose.model("Diagnostics", diagnosticsSchema);
