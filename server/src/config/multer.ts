import crypto from "crypto";
import fs from "fs";
import multer, { type FileFilterCallback } from "multer";
import path from "path";
import type { Request } from "express";
import {
  ALLOWED_SALARY_SLIP_MIME_TYPES,
  DOCUMENT_MAX_SIZE_BYTES,
} from "../constants/loan.constants.js";

// Local folder for salary slip files
export const SALARY_SLIP_UPLOAD_DIR = path.join(
  process.cwd(),
  "uploads",
  "salary-slips"
);

// Create upload directory if it does not exist yet
export function ensureUploadDirectories(): void {
  if (!fs.existsSync(SALARY_SLIP_UPLOAD_DIR)) {
    fs.mkdirSync(SALARY_SLIP_UPLOAD_DIR, { recursive: true });
  }
}

// Build a unique stored file name to avoid collisions
function buildStoredFileName(originalName: string): string {
  const extension = path.extname(originalName).toLowerCase();
  const unique = crypto.randomBytes(16).toString("hex");
  return `${Date.now()}-${unique}${extension}`;
}

const storage = multer.diskStorage({
  destination(_req, _file, cb) {
    ensureUploadDirectories();
    cb(null, SALARY_SLIP_UPLOAD_DIR);
  },
  filename(_req, file, cb) {
    cb(null, buildStoredFileName(file.originalname));
  },
});

// Accept only assignment-allowed MIME types
function fileFilter(
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void {
  if (
    ALLOWED_SALARY_SLIP_MIME_TYPES.includes(
      file.mimetype as (typeof ALLOWED_SALARY_SLIP_MIME_TYPES)[number]
    )
  ) {
    cb(null, true);
    return;
  }

  cb(new Error("Only PDF, JPG, and PNG files are allowed"));
}

export const salarySlipUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: DOCUMENT_MAX_SIZE_BYTES,
    files: 1,
  },
});
