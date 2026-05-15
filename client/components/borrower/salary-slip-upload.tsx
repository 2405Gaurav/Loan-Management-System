"use client";

import axios from "axios";
import { motion } from "framer-motion";
import { FormEvent, useState } from "react";
import { Alert } from "@/components/auth-form";
import { uploadSalarySlip, type SalarySlipDocument } from "@/lib/api";

type Props = {
  onUploaded: (document: SalarySlipDocument) => void;
};

const ALLOWED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 5 * 1024 * 1024;

export function SalarySlipUpload({ onUploaded }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function validateSelectedFile(selected: File): string | null {
    if (!ALLOWED_TYPES.includes(selected.type)) {
      return "Only PDF, JPG, and PNG files are allowed";
    }
    if (selected.size > MAX_SIZE) {
      return "File size cannot exceed 5 MB";
    }
    return null;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Please select a salary slip file");
      return;
    }

    const validationError = validateSelectedFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await uploadSalarySlip(file);
      onUploaded(result.document);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Upload failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-md border border-slate-200 bg-white p-6 sm:p-8"
    >
      <h2 className="text-lg font-bold text-[#0a1930]">Upload salary slip</h2>
      <p className="mt-1 text-sm text-slate-500">
        Upload your latest salary slip (PDF, JPG, or PNG — max 5 MB).
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label
            htmlFor="salarySlip"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            Salary slip file
          </label>
          <input
            id="salarySlip"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-[#00baf2] file:px-3 file:py-1.5 file:text-white"
          />
        </div>

        {error && <Alert type="error" message={error} />}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-[#00baf2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0099d6] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Uploading..." : "Upload salary slip"}
        </button>
      </form>
    </motion.div>
  );
}
