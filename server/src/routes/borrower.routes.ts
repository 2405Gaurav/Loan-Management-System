import { Router } from "express";
import {
  getProfile,
  submitProfile,
} from "../controllers/borrower.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireBorrower } from "../middleware/borrower.middleware.js";

const router = Router();

// JWT + borrower role only
router.use(authenticate, requireBorrower);

// Fetch current borrower profile and BRE status
router.get("/profile", getProfile);

// Submit personal details and run BRE
router.post("/profile", submitProfile);

export default router;
