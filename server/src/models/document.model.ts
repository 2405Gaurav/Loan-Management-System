import mongoose, { type HydratedDocument, type Model, Schema, Types } from "mongoose";
import { DocumentType } from "./enums.js";

export interface IDocument {
  borrower: Types.ObjectId;
  loan?: Types.ObjectId;
  documentType: DocumentType;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type DocumentRecord = HydratedDocument<IDocument>;
export type DocumentModel = Model<IDocument>;

const documentSchema = new Schema<IDocument, DocumentModel>(
  {
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    loan: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
    },
    documentType: {
      type: String,
      enum: Object.values(DocumentType),
      required: true,
    },
    originalFileName: {
      type: String,
      required: true,
      trim: true,
    },
    storedFileName: {
      type: String,
      required: true,
      trim: true,
    },
    filePath: {
      type: String,
      required: true,
      trim: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
      min: 1,
    },
    uploadedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  { timestamps: true }
);

documentSchema.index({ borrower: 1, documentType: 1 });

export const Document = mongoose.model<IDocument, DocumentModel>(
  "Document",
  documentSchema
);
