"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { DashboardSummary } from "@/types";
import { useEffect, useState } from "react";

const labels: Record<keyof DashboardSummary, string> = {
  totalApprovedPermissions: "Izin Disetujui",
  totalCheckedOutStudents: "Santri Keluar",
  totalCompletedToday: "Selesai Hari Ini",
  totalOverdueStudents: "Terlambat",
  pendingWaliKelas: "Menunggu Wali Kelas",
  pendingWaliKamar: "Menunggu Wali Kamar"
};

const cardOrder: (keyof DashboardSummary)[] = [
  "totalApprovedPermissions",
  "totalCheckedOutStudents",
  "totalCompletedToday",
  "totalOverdueStudents",
  "pendingWaliKelas",
  "pendingWaliKamar"
];

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();
  useEffect(() => {
    api
      .get<DashboardSummary>("/dashboard/summary")
      .then((res) => setSummary(res.data))
      .catch((err) => {
        const text = apiErrorMessage(err, "Gagal memuat ringkasan dashboard.");
        setError(text);
        toast.error(text);
      });
  }, []);

  if (!summary) {
    return error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : <Spinner />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Dashboard</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cardOrder.map((key) => (
          <section key={key} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">{labels[key]}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{summary[key] ?? 0}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
