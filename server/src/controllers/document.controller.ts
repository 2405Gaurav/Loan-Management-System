import type { Request, Response } from "express";
import { saveSalarySlipDocument } from "../services/document.service.js";

// POST /api/documents/upload-salary-slip
export async function uploadSalarySlip(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    if (!req.user.brePassed) {
      res.status(400).json({ message: "Complete BRE eligibility before uploading" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: "Salary slip file is required" });
      return;
    }

    const document = await saveSalarySlipDocument(req.user, req.file);

    res.status(201).json({
      message: "Salary slip uploaded successfully",
      document: {
        id: String(document._id),
        documentType: document.documentType,
        originalFileName: document.originalFileName,
        storedFileName: document.storedFileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
        uploadedAt: document.uploadedAt,
      },
      user: {
        salarySlipUploaded: true,
      },
    });
  } catch (error) {
    console.error("Upload salary slip error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
