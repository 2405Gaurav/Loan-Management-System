import type { Types } from "mongoose";
import { DocumentType } from "../models/enums.js";
import { Document } from "../models/document.model.js";
import type { UserDocument } from "../models/user.model.js";

// Save salary slip metadata and link it to borrower profile
export async function saveSalarySlipDocument(
  user: UserDocument,
  file: Express.Multer.File
) {
  const document = await Document.create({
    borrower: user._id,
    documentType: DocumentType.SALARY_SLIP,
    originalFileName: file.originalname,
    storedFileName: file.filename,
    filePath: file.path,
    mimeType: file.mimetype,
    fileSize: file.size,
    uploadedAt: new Date(),
  });

  user.salarySlipUploaded = true;

  if (!user.uploadedDocuments) {
    user.uploadedDocuments = [];
  }

  user.uploadedDocuments.push(document._id as Types.ObjectId);
  await user.save();

  return document;
}

// Fetch latest salary slip for a borrower
export async function getLatestSalarySlip(borrowerId: Types.ObjectId) {
  return Document.findOne({
    borrower: borrowerId,
    documentType: DocumentType.SALARY_SLIP,
  }).sort({ uploadedAt: -1 });
}
