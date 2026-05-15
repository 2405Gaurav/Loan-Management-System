import "dotenv/config";
import mongoose from "mongoose";
import { UserRole } from "../models/enums.js";
import { User } from "../models/user.model.js";

// Known credentials for evaluators — one account per role
const SEED_USERS: Array<{
  email: string;
  password: string;
  role: UserRole;
  fullName: string;
}> = [
  { email: "admin@creditsea.com", password: "Admin@123", role: UserRole.ADMIN, fullName: "Admin User" },
  { email: "sales@creditsea.com", password: "Sales@123", role: UserRole.SALES, fullName: "Sales Executive" },
  { email: "sanction@creditsea.com", password: "Sanction@123", role: UserRole.SANCTION, fullName: "Sanction Executive" },
  { email: "disbursement@creditsea.com", password: "Disburse@123", role: UserRole.DISBURSEMENT, fullName: "Disbursement Executive" },
  { email: "collection@creditsea.com", password: "Collect@123", role: UserRole.COLLECTION, fullName: "Collection Executive" },
  { email: "borrower@creditsea.com", password: "Borrow@123", role: UserRole.BORROWER, fullName: "Test Borrower" },
];

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  for (const entry of SEED_USERS) {
    const existing = await User.findOne({ email: entry.email });
    if (existing) {
      existing.role = entry.role;
      existing.fullName = entry.fullName;
      existing.password = entry.password;
      await existing.save();
      console.log(`Updated: ${entry.email} (${entry.role})`);
    } else {
      await User.create({
        email: entry.email,
        password: entry.password,
        role: entry.role,
        fullName: entry.fullName,
        profileCompleted: entry.role === UserRole.BORROWER,
      });
      console.log(`Created: ${entry.email} (${entry.role})`);
    }
  }

  console.log("\nSeed complete. Login credentials:");
  for (const entry of SEED_USERS) {
    console.log(`  ${entry.role.padEnd(14)} ${entry.email} / ${entry.password}`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
