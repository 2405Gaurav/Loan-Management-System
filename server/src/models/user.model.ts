import bcrypt from "bcryptjs";
import mongoose, { type HydratedDocument, type Model, Schema } from "mongoose";

const BCRYPT_SALT_ROUNDS = 12;

export interface IUser {
  email: string;
  password: string;
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
