
import mongoose from "mongoose";

const foodLogSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, index: true }, // Firebase UID
        imageUrl: { type: String, required: true },
        cuisineContext: { type: String, default: "General" },

        foodName: { type: String },
        description: { type: String },
        ingredients: [String],

        nutritionalInfo: {
            calories: { type: Number },
            protein: { type: String },
            carbohydrates: { type: String },
            fats: { type: String },
            fiber: { type: String }
        },

        healthRating: { type: Number }, // 1-10
        suggestions: { type: String },

        // For future portfolio analysis
        mealType: {
            type: String,
            enum: ["breakfast", "lunch", "dinner", "snack", "unknown"],
            default: "unknown"
        },
        date: { type: Date, default: Date.now }
    },
    { timestamps: true }
);

export const FoodLog = mongoose.model("FoodLog", foodLogSchema);
