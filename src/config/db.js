import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,                 // Up to 50 concurrent DB connections
      minPoolSize: 10,                 // Keep 10 warm to avoid cold-start latency
      serverSelectionTimeoutMS: 5000,  // Fail fast if DB is unreachable
      socketTimeoutMS: 45000,          // Allow long-running queries up to 45s
    });
    console.log("MongoDB Connected");
  } catch (error) {
    console.error("MongoDB Error:", error);
    process.exit(1);
  }
};
