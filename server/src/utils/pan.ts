import { User } from "../models/user.model.js";
import type { Types } from "mongoose";

export const PAN_DUPLICATE_MESSAGE =
  "A similar PAN card already exists in our system.";

export function normalizePan(pan: string): string {
  return pan.toUpperCase().trim();
}

// Proactive check before save — faster feedback than relying on index alone
export async function isPanRegisteredByAnotherUser(
  panNumber: string,
  excludeUserId: Types.ObjectId
): Promise<boolean> {
  const normalized = normalizePan(panNumber);
  const existing = await User.findOne({
    panNumber: normalized,
    _id: { $ne: excludeUserId },
  }).select("_id");
  return Boolean(existing);
}

export function isMongoPanDuplicateError(error: unknown): boolean {
  const err = error as {
    code?: number;
    keyPattern?: { panNumber?: unknown };
    keyValue?: { panNumber?: unknown };
  };
  if (err.code !== 11000) return false;
  return (
    err.keyPattern?.panNumber !== undefined || err.keyValue?.panNumber !== undefined
  );
}
