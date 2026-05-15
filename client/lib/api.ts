import axios from "axios";
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "./navigation";

const API_BASE_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      useAuthStore.getState().clearSession();
    }
    return Promise.reject(error);
  }
);

export type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";
export type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "CLOSED" | "REJECTED";
export type LoanApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

import type { UserRole } from "./roles";

export interface AuthUser {
  id: string;
  email: string;
  role?: UserRole;
  isStaff?: boolean;
  fullName?: string;
  profileCompleted?: boolean;
  brePassed?: boolean;
  salarySlipUploaded?: boolean;
}

export interface BorrowerProfile {
  id: string;
  email: string;
  fullName: string;
  panNumber: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentType: EmploymentType | "";
  profileCompleted: boolean;
  brePassed: boolean;
  salarySlipUploaded: boolean;
}

export interface SalarySlipDocument {
  id: string;
  documentType: string;
  originalFileName: string;
  storedFileName: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
}

export interface LoanPaymentRecord {
  id: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  remainingBalanceAfterPayment: number;
  recordedBy: string;
  createdAt: string;
}

export interface LoanApplication {
  id: string;
  principalAmount: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepaymentAmount: number;
  totalPaidAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason: string;
  appliedAt: string;
  sanctionedAt: string | null;
  disbursedAt: string | null;
  closedAt: string | null;
  payments: LoanPaymentRecord[];
  salarySlipDocument: {
    id: string;
    originalFileName: string;
    mimeType: string;
    uploadedAt: string;
  } | null;
}

export interface ProfileResponse {
  user: BorrowerProfile;
  activeLoan: LoanApplication | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface BreResponse {
  passed: boolean;
  errors: string[];
  user: BorrowerProfile;
  activeLoan: LoanApplication | null;
}

export interface SubmitProfilePayload {
  fullName: string;
  panNumber: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentType: EmploymentType;
}

export interface UploadSalarySlipResponse {
  message: string;
  document: SalarySlipDocument;
  user: { salarySlipUploaded: boolean };
}

export interface ApplyLoanPayload {
  principalAmount: number;
  tenureInDays: number;
}

export interface ApplyLoanResponse {
  message: string;
  loan: LoanApplication;
}

export async function signup(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/signup", { email, password });
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", { email, password });
  return data;
}

export async function getBorrowerProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/api/borrower/profile");
  return data;
}

export async function submitBorrowerProfile(
  payload: SubmitProfilePayload
): Promise<BreResponse> {
  const { data } = await api.post<BreResponse>("/api/borrower/profile", payload);
  return data;
}

export async function uploadSalarySlip(file: File): Promise<UploadSalarySlipResponse> {
  const formData = new FormData();
  formData.append("salarySlip", file);

  const token = useAuthStore.getState().token;
  const { data } = await axios.post<UploadSalarySlipResponse>(
    `${API_BASE_URL}/api/documents/upload-salary-slip`,
    formData,
    {
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}

export async function applyForLoan(payload: ApplyLoanPayload): Promise<ApplyLoanResponse> {
  const { data } = await api.post<ApplyLoanResponse>("/api/loans/apply", payload);
  return data;
}

export async function getMyLoanApplication(): Promise<{ loan: LoanApplication | null }> {
  const { data } = await api.get<{ loan: LoanApplication | null }>("/api/loans/my-application");
  return data;
}

export async function getAuthMe(): Promise<{ user: AuthUser }> {
  const { data } = await api.get<{ user: AuthUser }>("/api/auth/me");
  return data;
}

export type DashboardModule = "sales" | "sanction" | "disbursement" | "collection";

export interface DashboardMeta {
  role: UserRole;
  modules: DashboardModule[];
}

export interface SalesLead {
  id: string;
  email: string;
  fullName: string;
  profileCompleted: boolean;
  brePassed: boolean;
  salarySlipUploaded: boolean;
  registeredAt: string;
}

export interface OpsLoan {
  id: string;
  borrower: { id: string; email: string; fullName: string };
  principalAmount: number;
  tenureInDays: number;
  totalRepaymentAmount: number;
  outstandingAmount: number;
  totalPaidAmount: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason: string;
  appliedAt: string;
  sanctionedAt: string | null;
  disbursedAt: string | null;
}

export interface LoanPayment {
  id: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  remainingBalanceAfterPayment: number;
  recordedBy: string;
  createdAt: string;
}

export async function getDashboardMeta(): Promise<DashboardMeta> {
  const { data } = await api.get<DashboardMeta>("/api/ops/meta");
  return data;
}

export async function getSalesLeads(): Promise<{ leads: SalesLead[] }> {
  const { data } = await api.get<{ leads: SalesLead[] }>("/api/ops/sales/leads");
  return data;
}

export async function getSanctionQueue(): Promise<{ loans: OpsLoan[] }> {
  const { data } = await api.get<{ loans: OpsLoan[] }>("/api/ops/sanction/loans");
  return data;
}

export async function approveLoan(loanId: string): Promise<void> {
  await api.patch(`/api/ops/sanction/loans/${loanId}/approve`);
}

export async function rejectLoan(loanId: string, rejectionReason: string): Promise<void> {
  await api.patch(`/api/ops/sanction/loans/${loanId}/reject`, { rejectionReason });
}

export async function getDisbursementQueue(): Promise<{ loans: OpsLoan[] }> {
  const { data } = await api.get<{ loans: OpsLoan[] }>("/api/ops/disbursement/loans");
  return data;
}

export async function disburseLoan(loanId: string): Promise<void> {
  await api.patch(`/api/ops/disbursement/loans/${loanId}/disburse`);
}

export async function getCollectionQueue(): Promise<{ loans: OpsLoan[] }> {
  const { data } = await api.get<{ loans: OpsLoan[] }>("/api/ops/collection/loans");
  return data;
}

export async function getLoanPayments(loanId: string): Promise<{ payments: LoanPayment[] }> {
  const { data } = await api.get<{ payments: LoanPayment[] }>(
    `/api/ops/collection/loans/${loanId}/payments`
  );
  return data;
}

export async function recordPayment(payload: {
  loanId: string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
}): Promise<void> {
  await api.post("/api/ops/collection/payments", payload);
}

// All authenticated users land on dashboard (borrower sees loan status; staff sees ops module)
export function getPostLoginPath(_user: AuthUser, _fallback: string): string {
  return ROUTES.dashboard;
}
