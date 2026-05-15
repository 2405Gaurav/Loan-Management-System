import mongoose from "mongoose";

// Map Mongoose validation errors to a single user-facing message
export function getMongooseValidationMessage(error: unknown): string | null {
  if (error instanceof mongoose.Error.ValidationError) {
    const messages = Object.values(error.errors).map((e) => e.message);
    return messages[0] ?? "Validation failed";
  }
  return null;
}
