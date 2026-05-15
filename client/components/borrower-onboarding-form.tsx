"use client";

import axios from "axios";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/auth-form";
import {
  type BreResponse,
  type BorrowerProfile,
  type EmploymentType,
  submitBorrowerProfile,
} from "@/lib/api";
import { saveStoredUser } from "@/lib/auth";

type Props = {
  initialProfile?: BorrowerProfile | null;
  onProfileUpdated: (profile: BorrowerProfile, breResult: BreResponse) => void;
};

export function BorrowerOnboardingForm({ initialProfile, onProfileUpdated }: Props) {
  const [fullName, setFullName] = useState(initialProfile?.fullName ?? "");
  const [panNumber, setPanNumber] = useState(initialProfile?.panNumber ?? "");
  const [dateOfBirth, setDateOfBirth] = useState(initialProfile?.dateOfBirth ?? "");
  const [monthlySalary, setMonthlySalary] = useState(
    initialProfile?.monthlySalary ? String(initialProfile.monthlySalary) : ""
  );
  const [employmentType, setEmploymentType] = useState<EmploymentType | "">(
    (initialProfile?.employmentType as EmploymentType) ?? ""
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!employmentType) {
        setError("Please select an employment type");
        setLoading(false);
        return;
      }

      const result = await submitBorrowerProfile({
        fullName,
        panNumber,
        dateOfBirth,
        monthlySalary: Number(monthlySalary),
        employmentType,
      });

      saveStoredUser(result.user);
      onProfileUpdated(result.user, result);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to submit profile. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Personal details</h2>
      <p className="mt-1 text-sm text-slate-500">
        Complete your profile to run eligibility checks (BRE).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-slate-700">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="panNumber" className="mb-1.5 block text-sm font-medium text-slate-700">
            PAN Number
          </label>
          <input
            id="panNumber"
            type="text"
            value={panNumber}
            onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
            placeholder="ABCDE1234F"
            required
            maxLength={10}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="mb-1.5 block text-sm font-medium text-slate-700">
            Date Of Birth
          </label>
          <input
            id="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="monthlySalary" className="mb-1.5 block text-sm font-medium text-slate-700">
            Monthly Salary
          </label>
          <input
            id="monthlySalary"
            type="number"
            min={0}
            value={monthlySalary}
            onChange={(e) => setMonthlySalary(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        <div>
          <label htmlFor="employmentType" className="mb-1.5 block text-sm font-medium text-slate-700">
            Employment Type
          </label>
          <select
            id="employmentType"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Select employment type</option>
            <option value="SALARIED">SALARIED</option>
            <option value="SELF_EMPLOYED">SELF_EMPLOYED</option>
            <option value="UNEMPLOYED">UNEMPLOYED</option>
          </select>
        </div>

        {error && <Alert type="error" message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit & run eligibility check"}
        </button>
      </form>
    </div>
  );
}
