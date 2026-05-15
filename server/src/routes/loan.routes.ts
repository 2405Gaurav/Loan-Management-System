import { Router } from "express";
import { applyLoan, getMyLoan } from "../controllers/loan.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.use(authenticate);

router.get("/my-application", getMyLoan);
router.post("/apply", applyLoan);

export default router;
