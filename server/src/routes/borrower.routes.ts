import { Router } from "express";
import {
  getProfile,
  submitProfile,
} from "../controllers/borrower.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

// All borrower routes require valid JWT
router.use(authenticate);

// Fetch current borrower profile and BRE status
router.get("/profile", getProfile);

// Submit personal details and run BRE
router.post("/profile", submitProfile);

export default router;
