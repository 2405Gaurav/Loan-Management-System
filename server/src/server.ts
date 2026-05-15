import dotenv from "dotenv";
import mongoose from "mongoose";
import app from "./app.js";
import { ensureUploadDirectories } from "./config/multer.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is not defined in environment variables");
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  ensureUploadDirectories();

  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown connection error";
    if (message.includes("whitelist") || message.includes("ServerSelection")) {
      console.error(
        "\nMongoDB Atlas connection failed.\n" +
          "→ Open MongoDB Atlas → Network Access → Add IP Address → use your current IP or 0.0.0.0/0 (dev only).\n" +
          "→ Or use local MongoDB: MONGO_URI=mongodb://127.0.0.1:27017/loan-management\n"
      );
    }
    throw error;
  }
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
