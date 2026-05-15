import type { NextFunction, Request, Response } from "express";
import multer from "multer";

// Convert multer errors into clean API responses
export function handleMulterError(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  if (!err) {
    next();
    return;
  }

  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({ message: "File size cannot exceed 5 MB" });
      return;
    }

    res.status(400).json({ message: err.message });
    return;
  }

  if (err instanceof Error) {
    res.status(400).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: "File upload failed" });
}
