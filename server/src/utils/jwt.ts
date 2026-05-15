import jwt from "jsonwebtoken";

const JWT_EXPIRES_IN = "7d";

export interface JwtPayload {
  userId: string;
}

export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ userId }, secret, { expiresIn: JWT_EXPIRES_IN });
}
