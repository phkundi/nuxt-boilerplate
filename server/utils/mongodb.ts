import mongoose from "mongoose";

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected) return;

  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/NuxtTest"
    );
    isConnected = true;
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
}
