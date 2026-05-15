import { Router, type NextFunction, type Request, type Response } from "express";
import { uploadSalarySlip } from "../controllers/document.controller.js";
import { salarySlipUpload } from "../config/multer.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireBorrower } from "../middleware/borrower.middleware.js";
import { handleMulterError } from "../middleware/upload.middleware.js";

const router = Router();

router.use(authenticate, requireBorrower);

// Wrap multer so validation errors return JSON instead of crashing
function uploadSingle(fieldName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    salarySlipUpload.single(fieldName)(req, res, (err) => {
      if (err) {
        handleMulterError(err, req, res, next);
        return;
      }
      next();
    });
  };
}

router.post("/upload-salary-slip", uploadSingle("salarySlip"), uploadSalarySlip);

export default router;
