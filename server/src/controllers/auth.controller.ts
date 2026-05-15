import type { Request, Response } from "express";
import { UserRole } from "../models/enums.js";
import { User } from "../models/user.model.js";
import { generateToken } from "../utils/jwt.js";
import { isStaffRole } from "../middleware/staff.middleware.js";

function formatUser(user: {
  _id: unknown;
  email: string;
  role?: UserRole;
  fullName?: string;
  profileCompleted?: boolean;
  brePassed?: boolean;
}) {
  const role = user.role ?? UserRole.BORROWER;
  return {
    id: String(user._id),
    email: user.email,
    role,
    fullName: user.fullName ?? "",
    profileCompleted: user.profileCompleted ?? false,
    brePassed: user.brePassed ?? false,
    isStaff: isStaffRole(role),
  };
}

// Return current session user (role used for dashboard routing)
export async function me(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  res.status(200).json({ user: formatUser(req.user) });
}

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
      return;
    }

    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role: UserRole.BORROWER,
    });

    const token = generateToken(String(user._id));

    res.status(201).json({
      message: "Signup successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
    }).select("+password");

    if (!user) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = generateToken(String(user._id));

    res.status(200).json({
      message: "Login successful",
      token,
      user: formatUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}
