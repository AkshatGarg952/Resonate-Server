import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String },
    name: { type: String },
    age: Number,
    weight: Number,
    goals: String,
    phone: { type: String },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
