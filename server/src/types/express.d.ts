import type { UserDocument } from "../models/user.model.js";

// Extend Express Request so protected routes can access req.user
declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

export {};
