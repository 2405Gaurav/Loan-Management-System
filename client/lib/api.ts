import axios from "axios";
import { getToken } from "./auth";

const API_BASE_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";
export type LoanStatus = "APPLIED" | "SANCTIONED" | "DISBURSED" | "CLOSED" | "REJECTED";
export type LoanApprovalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AuthUser {
  id: string;
  email: string;
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

export interface LoanApplication {
  id: string;
  principalAmount: number;
  tenureInDays: number;
  interestRate: number;
  simpleInterest: number;
  totalRepaymentAmount: number;
  outstandingAmount: number;
  status: LoanStatus;
  approvalStatus: LoanApprovalStatus;
  rejectionReason: string;
  appliedAt: string;
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

  const token = getToken();
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

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function saveUser(user: AuthUser | BorrowerProfile): void {
  localStorage.setItem("user", JSON.stringify(user));
}
