"use client";

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { getSalesLeads, type SalesLead } from "@/lib/api";

export function SalesModule() {
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getSalesLeads();
      setLeads(data.leads);
    } catch (err: unknown) {
      const message =
        axios.isAxiosError(err) && err.response?.data?.message
          ? String(err.response.data.message)
          : "Failed to load leads";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <p className="text-sm text-slate-500">Loading leads...</p>;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <section>
      <h2 className="text-lg font-semibold text-slate-900">Sales — Lead tracking</h2>
      <p className="mt-1 text-sm text-slate-600">
        Registered borrowers without an active loan application.
      </p>

      {leads.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No leads at the moment.
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Borrower</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">BRE</th>
                <th className="px-4 py-3">Salary slip</th>
                <th className="px-4 py-3">Registered</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{lead.fullName || "—"}</p>
                    <p className="text-xs text-slate-500">{lead.email}</p>
                  </td>
                  <td className="px-4 py-3">{lead.profileCompleted ? "Yes" : "No"}</td>
                  <td className="px-4 py-3">{lead.brePassed ? "Passed" : "Pending"}</td>
                  <td className="px-4 py-3">{lead.salarySlipUploaded ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {new Date(lead.registeredAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
