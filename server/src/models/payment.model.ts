import mongoose, { type HydratedDocument, type Model, Schema, Types } from "mongoose";

export interface IPayment {
  loan: Types.ObjectId;
  borrower: Types.ObjectId;
  utrNumber: string;
  amount: number;
  paymentDate: Date;
  remainingBalanceAfterPayment: number;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type PaymentDocument = HydratedDocument<IPayment>;
export type PaymentModel = Model<IPayment>;

const paymentSchema = new Schema<IPayment, PaymentModel>(
  {
    loan: {
      type: Schema.Types.ObjectId,
      ref: "Loan",
      required: true,
      index: true,
    },
    borrower: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    utrNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    amount: {
      type: Number,
      required: true,
      min: [0.01, "Payment amount must be greater than zero"],
    },
    paymentDate: {
      type: Date,
      required: true,
    },
    remainingBalanceAfterPayment: {
      type: Number,
      required: true,
      min: 0,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ loan: 1, paymentDate: -1 });
paymentSchema.index({ borrower: 1, paymentDate: -1 });

export const Payment = mongoose.model<IPayment, PaymentModel>("Payment", paymentSchema);
