import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware.js";
import { authorize, blockBorrowerFromOps } from "../middleware/rbac.middleware.js";
import { UserRole } from "../models/enums.js";
import * as opsController from "../controllers/ops.controller.js";

const router = Router();

// All ops routes need auth + non-borrower
router.use(authenticate, blockBorrowerFromOps);

router.get("/meta", opsController.getDashboardMeta);

// Sales module
router.get(
  "/sales/leads",
  authorize(UserRole.SALES, UserRole.ADMIN),
  opsController.getSalesLeads
);

// Sanction module
router.get(
  "/sanction/loans",
  authorize(UserRole.SANCTION, UserRole.ADMIN),
  opsController.getSanctionQueue
);
router.patch(
  "/sanction/loans/:id/approve",
  authorize(UserRole.SANCTION, UserRole.ADMIN),
  opsController.approveLoan
);
router.patch(
  "/sanction/loans/:id/reject",
  authorize(UserRole.SANCTION, UserRole.ADMIN),
  opsController.rejectLoan
);

// Disbursement module
router.get(
  "/disbursement/loans",
  authorize(UserRole.DISBURSEMENT, UserRole.ADMIN),
  opsController.getDisbursementQueue
);
router.patch(
  "/disbursement/loans/:id/disburse",
  authorize(UserRole.DISBURSEMENT, UserRole.ADMIN),
  opsController.disburseLoan
);

// Collection module
router.get(
  "/collection/loans",
  authorize(UserRole.COLLECTION, UserRole.ADMIN),
  opsController.getCollectionQueue
);
router.get(
  "/collection/loans/:id/payments",
  authorize(UserRole.COLLECTION, UserRole.ADMIN),
  opsController.getLoanPayments
);
router.post(
  "/collection/payments",
  authorize(UserRole.COLLECTION, UserRole.ADMIN),
  opsController.recordPayment
);

export default router;
