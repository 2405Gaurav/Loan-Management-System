import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model, Schema } from "mongoose";
import {
  BreEligibilityStatus,
  EmploymentType,
  ProfileCompletionStep,
  UserRole,
} from "./enums.js";
import { evaluateBreRules, isValidPan } from "../utils/validators.js";

const BCRYPT_SALT_ROUNDS = 12;

export interface IAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IProfileCompletion {
  currentStep: ProfileCompletionStep;
  personalDetailsCompleted: boolean;
  salarySlipUploaded: boolean;
  loanApplied: boolean;
}

export interface IUser {
  email: string;
  password: string;
  role: UserRole;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: Date;
  pan?: string;
  address?: IAddress;
  employmentType?: EmploymentType;
  employerName?: string;
  monthlySalary?: number;
  profileCompletion: IProfileCompletion;
  breEligibilityStatus: BreEligibilityStatus;
  breIneligibilityReasons: string[];
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
  evaluateAndSetBreStatus(): void;
}

export type UserDocument = HydratedDocument<IUser, IUserMethods>;

export type UserModel = Model<IUser, Record<string, never>, IUserMethods>;

const addressSchema = new Schema<IAddress>(
  {
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^\d{6}$/, "Pincode must be a 6-digit Indian PIN code"],
    },
  },
  { _id: false }
);

const profileCompletionSchema = new Schema<IProfileCompletion>(
  {
    currentStep: {
      type: String,
      enum: Object.values(ProfileCompletionStep),
      default: ProfileCompletionStep.REGISTERED,
    },
    personalDetailsCompleted: { type: Boolean, default: false },
    salarySlipUploaded: { type: Boolean, default: false },
    loanApplied: { type: Boolean, default: false },
  },
  { _id: false }
);

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      required: true,
      default: UserRole.BORROWER,
    },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    phone: {
      type: String,
      trim: true,
      sparse: true,
      match: [/^[6-9]\d{9}$/, "Phone must be a valid 10-digit Indian mobile number"],
    },
    dateOfBirth: { type: Date },
    pan: {
      type: String,
      uppercase: true,
      trim: true,
      sparse: true,
      validate: {
        validator(value: string) {
          if (!value) return true;
          return isValidPan(value);
        },
        message: "Invalid PAN format (expected e.g. ABCDE1234F)",
      },
    },
    address: addressSchema,
    employmentType: {
      type: String,
      enum: Object.values(EmploymentType),
    },
    employerName: { type: String, trim: true },
    monthlySalary: {
      type: Number,
      min: [0, "Salary cannot be negative"],
    },
    profileCompletion: {
      type: profileCompletionSchema,
      default: () => ({}),
    },
    breEligibilityStatus: {
      type: String,
      enum: Object.values(BreEligibilityStatus),
      default: BreEligibilityStatus.PENDING,
    },
    breIneligibilityReasons: {
      type: [String],
      default: [],
    },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        const { password: _password, ...safe } = ret;
        return safe;
      },
    },
    toObject: { virtuals: true },
  }
);

userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ breEligibilityStatus: 1 });
userSchema.index(
  { pan: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { role: UserRole.BORROWER, pan: { $type: "string" } },
  }
);

userSchema.virtual("fullName").get(function (this: UserDocument) {
  return [this.firstName, this.lastName].filter(Boolean).join(" ") || undefined;
});

userSchema.methods.comparePassword = async function (
  this: UserDocument,
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.evaluateAndSetBreStatus = function (this: UserDocument): void {
  if (this.role !== UserRole.BORROWER) {
    return;
  }

  const result = evaluateBreRules({
    dateOfBirth: this.dateOfBirth,
    monthlySalary: this.monthlySalary,
    pan: this.pan,
    employmentType: this.employmentType,
  });

  this.breEligibilityStatus = result.eligible
    ? BreEligibilityStatus.ELIGIBLE
    : BreEligibilityStatus.INELIGIBLE;
  this.breIneligibilityReasons = result.reasons;
};

userSchema.pre("save", async function (this: UserDocument) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, BCRYPT_SALT_ROUNDS);
  }

  if (
    this.role === UserRole.BORROWER &&
    (this.isModified("dateOfBirth") ||
      this.isModified("monthlySalary") ||
      this.isModified("pan") ||
      this.isModified("employmentType"))
  ) {
    this.evaluateAndSetBreStatus();
  }
});

export const User = mongoose.model<IUser, UserModel>("User", userSchema);
