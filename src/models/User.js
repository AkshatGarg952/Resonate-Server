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
    age: Number,
    height: Number,
    weight: Number,


    goals: String,  

    dietType: {
      type: String,
      enum: ["vegetarian", "eggetarian", "non_vegetarian"],
    },

    hasMedicalCondition: { type: Boolean, default: false },
    medicalConditions: [String],
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
