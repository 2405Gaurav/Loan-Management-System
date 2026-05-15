import axios from "axios";
import { getToken } from "./auth";

const API_BASE_URL = "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT to every request when token exists in localStorage
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type EmploymentType = "SALARIED" | "SELF_EMPLOYED" | "UNEMPLOYED";

export interface AuthUser {
  id: string;
  email: string;
  fullName?: string;
  profileCompleted?: boolean;
  brePassed?: boolean;
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
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface ProfileResponse {
  user: BorrowerProfile;
}

export interface BreResponse {
  passed: boolean;
  errors: string[];
  user: BorrowerProfile;
}

export interface SubmitProfilePayload {
  fullName: string;
  panNumber: string;
  dateOfBirth: string;
  monthlySalary: number;
  employmentType: EmploymentType;
}

export async function signup(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/signup", {
    email,
    password,
  });
  return data;
}

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });
  return data;
}

// Fetch logged-in borrower profile from protected API
export async function getBorrowerProfile(): Promise<ProfileResponse> {
  const { data } = await api.get<ProfileResponse>("/api/borrower/profile");
  return data;
}

// Submit personal details and run BRE on backend
export async function submitBorrowerProfile(
  payload: SubmitProfilePayload
): Promise<BreResponse> {
  const { data } = await api.post<BreResponse>("/api/borrower/profile", payload);
  return data;
}

export function saveToken(token: string): void {
  localStorage.setItem("token", token);
}

export function saveUser(user: AuthUser | BorrowerProfile): void {
  localStorage.setItem("user", JSON.stringify(user));
}
