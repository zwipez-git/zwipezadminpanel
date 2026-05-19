import mongoose from "mongoose";

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/supermarket_delivery";
    
    mongoose.connection.on("connected", () => {
      console.log("🟢 Connected to MongoDB successfully via Mongoose");
    });

    mongoose.connection.on("error", (err) => {
      console.error("🔴 MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("🟡 MongoDB connection disconnected");
    });

    await mongoose.connect(mongoUri);
  } catch (error) {
    console.error("❌ Failed to establish initial MongoDB connection:", error);
  }
};

export default connectMongoDB;
