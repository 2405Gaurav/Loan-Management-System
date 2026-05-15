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

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100";

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
    <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-bold text-navy">Personal details</h2>
      <p className="mt-1 text-sm text-slate-500">
        Quick details to unlock your credit journey.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
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
            className={inputClass}
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
            className={`${inputClass} uppercase`}
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
            className={inputClass}
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
            className={inputClass}
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
            className={inputClass}
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
          className="w-full rounded-full bg-brand-600 px-4 py-3 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit & run eligibility check"}
        </button>
      </form>
    </div>
  );
}
