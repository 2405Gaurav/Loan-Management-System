import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model, Schema, Types } from "mongoose";
import { EmploymentType, UserRole } from "./enums.js";

const BCRYPT_SALT_ROUNDS = 12;

// Each BRE attempt (pass or fail) with rejection reasons for sales visibility
export interface IBreHistoryEntry {
  passed: boolean;
  errors: string[];
  attemptedAt: Date;
}

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  fullName?: string;
  panNumber?: string;
  dateOfBirth?: Date;
  monthlySalary?: number;
  employmentType?: EmploymentType;
  profileCompleted: boolean;
  brePassed: boolean;
  breHistory: IBreHistoryEntry[];
  salarySlipUploaded: boolean;
  uploadedDocuments: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;
export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.BORROWER,
      required: true,
    },
    fullName: { type: String, trim: true },
    panNumber: {
      type: String,
      uppercase: true,
      trim: true,
      unique: true,
      sparse: true,
    },
    dateOfBirth: { type: Date },
    monthlySalary: { type: Number, min: [0, "Salary cannot be negative"] },
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
    },
    profileCompleted: { type: Boolean, default: false },
    brePassed: { type: Boolean, default: false },
    breHistory: {
      type: [
        {
          passed: { type: Boolean, required: true },
          errors: [{ type: String }],
          attemptedAt: { type: Date, default: () => new Date() },
        },
      ],
      default: [],
    },
    salarySlipUploaded: { type: Boolean, default: false },
    uploadedDocuments: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        const { password: _password, ...safe } = ret;
        return safe;
      },
    },
  }
);

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre("save", async function (this: UserDocument) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
});

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
