import mongoose from "mongoose";

const interventionSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: ["supplement", "diet", "fitness", "meditation", "other"],
            required: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
        },
        dosage: {
            type: String, // e.g., "500mg", "1 tablet"
        },
        frequency: {
            type: String, // e.g., "daily", "twice a day"
        },
        status: {
            type: String,
            enum: ["active", "paused", "discontinued", "completed"],
            default: "active",
        },
        discontinuationReason: {
            type: String, // Reason for discontinuing earlier than planned
        },
        notes: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Intervention = mongoose.model("Intervention", interventionSchema);
