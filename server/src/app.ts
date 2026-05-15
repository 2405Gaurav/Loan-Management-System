import cors from "cors";
import express from "express";
import authRoutes from "./routes/auth.routes.js";
import borrowerRoutes from "./routes/borrower.routes.js";
import documentRoutes from "./routes/document.routes.js";
import loanRoutes from "./routes/loan.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/borrower", borrowerRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/loans", loanRoutes);

export default app;
