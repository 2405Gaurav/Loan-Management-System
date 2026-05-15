import axios from "axios";

export const MIN_PASSWORD_LENGTH = 6;

export function getAuthErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (axios.isAxiosError(err) && err.response?.data) {
    const data = err.response.data as { message?: string };
    if (data.message) return String(data.message);
  }
  return fallback;
}

export function validatePasswordClient(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  }
  return null;
}
