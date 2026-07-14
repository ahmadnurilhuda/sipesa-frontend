"use client";

import { PermissionTable } from "@/components/permission/PermissionTable";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { Spinner } from "@/components/ui/Spinner";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { statusLabels } from "@/lib/constants";
import { Permission, PermissionStatus } from "@/types";
import { useEffect, useMemo, useState } from "react";

type AcademicYear = {
  id: string;
  period: string;
};

type SchoolClass = {
  id: string;
  name: string;
  schoolYear?: string;
  academicYearId?: string;
};

export default function ReportsPage() {
  const [items, setItems] = useState<Permission[] | null>(null);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [filters, setFilters] = useState({
    academicYearId: "",
    classId: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState(false);
  const toast = useToast();

  const filteredClasses = useMemo(() => classes.filter((item) => !filters.academicYearId || item.academicYearId === filters.academicYearId), [classes, filters.academicYearId]);

  useEffect(() => {
    Promise.all([
      api.get<AcademicYear[]>("/academic-years"),
      api.get<SchoolClass[]>("/classes")
    ])
      .then(([yearRes, classRes]) => {
        setAcademicYears(yearRes.data);
        setClasses(classRes.data);
      })
      .catch((err) => toast.error(apiErrorMessage(err, "Gagal memuat pilihan filter laporan.")));
  }, []);

  useEffect(() => {
    loadReport();
  }, []);

  async function loadReport() {
    setError("");
    setItems(null);
    try {
      const res = await api.get<Permission[]>("/reports/permissions", { params: reportParams(filters) });
      setItems(res.data);
    } catch (err) {
      const text = apiErrorMessage(err, "Gagal memuat laporan izin.");
      setError(text);
      toast.error(text);
      setItems([]);
    }
  }

  async function exportCsv() {
    setExporting(true);
    setError("");
    try {
      const res = await api.get<Blob>("/reports/permissions/export-csv", {
        params: reportParams(filters),
        responseType: "blob"
      });
      const url = URL.createObjectURL(res.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = `laporan-izin-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      toast.success("Laporan CSV berhasil diunduh.");
    } catch (err) {
      const text = apiErrorMessage(err, "Export CSV gagal.");
      setError(text);
      toast.error(text);
    } finally {
      setExporting(false);
    }
  }

  async function resetFilters() {
    const emptyFilters = { academicYearId: "", classId: "", status: "", startDate: "", endDate: "" };
    setFilters(emptyFilters);
    setError("");
    setItems(null);
    try {
      const res = await api.get<Permission[]>("/reports/permissions");
      setItems(res.data);
    } catch (err) {
      const text = apiErrorMessage(err, "Gagal memuat laporan izin.");
      setError(text);
      toast.error(text);
      setItems([]);
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-ink">Laporan Izin</h1>
        <Button type="button" onClick={exportCsv} disabled={exporting}>{exporting ? "Mengunduh..." : "Export CSV"}</Button>
      </div>

      <section className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
        <label className="text-sm font-medium text-slate-700">Tahun Ajaran
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={filters.academicYearId} onChange={(event) => setFilters((prev) => ({ ...prev, academicYearId: event.target.value, classId: "" }))}>
            <option value="">Semua tahun ajaran</option>
            {academicYears.map((item) => <option key={item.id} value={item.id}>{item.period}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Kelas
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={filters.classId} onChange={(event) => setFilters((prev) => ({ ...prev, classId: event.target.value }))}>
            <option value="">Semua kelas</option>
            {filteredClasses.map((item) => <option key={item.id} value={item.id}>{item.name} {item.schoolYear ? `- ${item.schoolYear}` : ""}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Status
          <select className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}>
            <option value="">Semua status</option>
            {(Object.keys(statusLabels) as PermissionStatus[]).map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Dari Tanggal
          <input type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={filters.startDate} onChange={(event) => setFilters((prev) => ({ ...prev, startDate: event.target.value }))} />
        </label>
        <label className="text-sm font-medium text-slate-700">Sampai Tanggal
          <input type="date" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" value={filters.endDate} onChange={(event) => setFilters((prev) => ({ ...prev, endDate: event.target.value }))} />
        </label>
        <div className="flex gap-2 md:col-span-5">
          <Button type="button" onClick={loadReport}>Terapkan Filter</Button>
          <Button type="button" variant="secondary" onClick={resetFilters}>Reset</Button>
        </div>
      </section>

      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-4">{items ? <PermissionTable permissions={items} /> : <Spinner />}</div>
    </div>
  );
}

function reportParams(filters: { academicYearId: string; classId: string; status: string; startDate: string; endDate: string }) {
  return {
    academicYearId: filters.academicYearId || undefined,
    classId: filters.classId || undefined,
    status: filters.status || undefined,
    start: filters.startDate ? new Date(`${filters.startDate}T00:00:00`).toISOString() : undefined,
    end: filters.endDate ? new Date(`${filters.endDate}T23:59:59`).toISOString() : undefined
  };
}
