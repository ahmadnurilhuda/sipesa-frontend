"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { FormEvent, useEffect, useMemo, useState } from "react";

type Row = Record<string, string | number | boolean | null | undefined> & { id: string };
type Option = { label: string; value: string };
type Field = {
  name: string;
  label: string;
  type?: "text" | "email" | "password" | "date" | "number" | "checkbox" | "select";
  required?: boolean;
  options?: Option[];
  source?: {
    endpoint: string;
    labelKey?: string;
    labelKeys?: string[];
    valueKey?: string;
  };
};

export function SimpleCrudPage({ title, endpoint, columns, fields = [] }: { title: string; endpoint: string; columns: string[]; fields?: Field[] }) {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [editing, setEditing] = useState<Row | null>(null);
  const [form, setForm] = useState<Record<string, string | boolean>>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, Option[]>>({});
  const [error, setError] = useState("");
  const { user } = useCurrentUser();
  const toast = useToast();
  const canWrite = fields.length > 0 && user?.role === "ADMIN";
  const sourceSignature = useMemo(() => JSON.stringify(fields.map((field) => ({ name: field.name, source: field.source }))), [fields]);

  const emptyForm = useMemo(() => Object.fromEntries(fields.map((field) => [field.name, field.type === "checkbox" ? false : ""])), [fields]);

  async function refresh() {
    try {
      const res = await api.get<Row[]>(endpoint);
      setRows(res.data);
    } catch {
      setRows([]);
      const message = "Data tidak dapat dimuat. Periksa sesi login atau hak akses.";
      setError(message);
      toast.error(message);
    }
  }

  useEffect(() => {
    refresh();
  }, [endpoint]);

  useEffect(() => {
    const sourcedFields = fields.filter((field) => field.source);
    if (sourcedFields.length === 0) return;
    let cancelled = false;

    async function loadOptions() {
      const entries = await Promise.all(sourcedFields.map(async (field) => {
        try {
          const res = await api.get<Row[]>(field.source!.endpoint);
          return [field.name, res.data.map((row) => optionFromRow(row, field))] as const;
        } catch {
          return [field.name, []] as const;
        }
      }));
      if (!cancelled) {
        setDynamicOptions(Object.fromEntries(entries));
      }
    }

    loadOptions();
    return () => { cancelled = true; };
  }, [sourceSignature]);

  function startCreate() {
    setEditing(null);
    setForm(emptyForm);
    setFieldErrors({});
    setError("");
  }

  function startEdit(row: Row) {
    setEditing(row);
    setForm(Object.fromEntries(fields.map((field) => [field.name, field.type === "checkbox" ? Boolean(row[field.name]) : String(row[field.name] ?? "")])));
    setFieldErrors({});
    setError("");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const validationErrors = validateForm(fields, form, Boolean(editing));
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const message = "Periksa kembali isian form. Ada data yang belum lengkap atau belum sesuai.";
      setError(message);
      toast.error(message);
      return;
    }
    const payload = buildPayload(fields, form);
    try {
      if (editing) {
        await api.put(`${endpoint}/${editing.id}`, payload);
      } else {
        await api.post(endpoint, payload);
      }
      setForm({});
      setEditing(null);
      await refresh();
      toast.success(editing ? "Data berhasil diperbarui." : "Data berhasil ditambahkan.");
    } catch (err) {
      const message = apiErrorMessage(err, "Data belum berhasil disimpan. Periksa isian dan hak akses.");
      setError(message);
      toast.error(message);
    }
  }

  async function remove(row: Row) {
    if (!confirm("Hapus data ini?")) return;
    try {
      await api.delete(`${endpoint}/${row.id}`);
      await refresh();
      toast.success("Data berhasil dihapus.");
    } catch (err) {
      const message = apiErrorMessage(err, "Data belum berhasil dihapus.");
      setError(message);
      toast.error(message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink">{title}</h1>
        {canWrite && <Button onClick={startCreate}>Tambah</Button>}
      </div>
      {canWrite && Object.keys(form).length > 0 && (
        <form onSubmit={submit} className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
          {fields.map((field) => (
            <label key={field.name} className="text-sm font-medium text-slate-700">
              {field.label}
              {isFieldRequired(field, Boolean(editing)) && <span className="ml-1 text-rose-600">*</span>}
              {field.type === "checkbox" ? (
                <input className="ml-2 h-4 w-4" type="checkbox" checked={Boolean(form[field.name])} onChange={(event) => setForm((prev) => ({ ...prev, [field.name]: event.target.checked }))} />
              ) : field.type === "select" || field.source ? (
                <select className={inputClass(fieldErrors[field.name])} value={String(form[field.name] ?? "")} onChange={(event) => setFieldValue(field.name, event.target.value)}>
                  <option value="">Pilih</option>
                  {(field.options ?? dynamicOptions[field.name] ?? []).map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                </select>
              ) : (
                <input className={inputClass(fieldErrors[field.name])} type={field.type ?? "text"} value={String(form[field.name] ?? "")} onChange={(event) => setFieldValue(field.name, event.target.value)} />
              )}
              {fieldErrors[field.name] && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors[field.name]}</span>}
            </label>
          ))}
          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700 md:col-span-2">{error}</p>}
          <div className="flex gap-2 md:col-span-2">
            <Button>{editing ? "Simpan Perubahan" : "Simpan"}</Button>
            <Button type="button" variant="secondary" onClick={() => { setForm({}); setEditing(null); }}>Batal</Button>
          </div>
        </form>
      )}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {!rows ? <div className="p-4"><Spinner /></div> : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500"><tr>{columns.map((col) => <th key={col} className="px-4 py-3">{col}</th>)}{canWrite && <th className="px-4 py-3">Aksi</th>}</tr></thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id}>
                  {columns.map((col) => <td key={col} className="px-4 py-3">{String(row[col] ?? "-")}</td>)}
                  {canWrite && <td className="px-4 py-3"><div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => startEdit(row)}>Edit</Button><Button type="button" variant="danger" onClick={() => remove(row)}>Hapus</Button></div></td>}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );

  function setFieldValue(name: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }
}

function optionFromRow(row: Row, field: Field): Option {
  const valueKey = field.source?.valueKey ?? "id";
  const value = String(row[valueKey] ?? "");
  const labelKeys = field.source?.labelKeys ?? (field.source?.labelKey ? [field.source.labelKey] : ["name"]);
  const label = labelKeys
    .map((key) => row[key])
    .filter((value) => value !== null && value !== undefined && String(value).trim() !== "")
    .map(String)
    .join(" - ");
  return { value, label: label || value };
}

function buildPayload(fields: Field[], form: Record<string, string | boolean>) {
  return Object.fromEntries(fields.map((field) => {
    const value = form[field.name];
    if ((field.type === "select" || field.source) && value === "") {
      return [field.name, null];
    }
    if (field.type === "number" && typeof value === "string") {
      return [field.name, value.trim() === "" ? null : Number(value)];
    }
    return [field.name, value];
  }));
}

function validateForm(fields: Field[], form: Record<string, string | boolean>, editing: boolean) {
  const errors: Record<string, string> = {};
  for (const field of fields) {
    if (field.type === "checkbox") continue;
    const rawValue = form[field.name];
    const value = typeof rawValue === "string" ? rawValue.trim() : "";
    if (isFieldRequired(field, editing) && value === "") {
      errors[field.name] = `${field.label} wajib diisi.`;
      continue;
    }
    if (value === "") continue;
    if (field.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errors[field.name] = "Format email belum benar. Contoh: nama@email.com.";
    }
    if (field.type === "password" && value.length < 6) {
      errors[field.name] = "Password minimal 6 karakter.";
    }
    if (field.type === "number" && !Number.isFinite(Number(value))) {
      errors[field.name] = `${field.label} harus berupa angka.`;
    }
    if (field.type === "date" && Number.isNaN(new Date(value).getTime())) {
      errors[field.name] = `${field.label} belum berupa tanggal yang benar.`;
    }
    if (isPhoneField(field) && !isValidIndonesianPhone(value)) {
      errors[field.name] = "Nomor HP harus berisi angka dan diawali 08 atau 62. Contoh: 081234567890.";
    }
    if (field.name === "username" && /\s/.test(value)) {
      errors[field.name] = "Username tidak boleh memakai spasi.";
    }
  }
  return errors;
}

function isFieldRequired(field: Field, editing: boolean) {
  if (field.required !== undefined) return field.required;
  if (field.type === "checkbox") return false;
  if (field.type === "password" && editing) return false;
  return true;
}

function isPhoneField(field: Field) {
  const text = `${field.name} ${field.label}`.toLowerCase();
  return text.includes("phone") || text.includes("telepon") || text.includes("whatsapp") || text.includes("hp");
}

function isValidIndonesianPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  return /^(08\d{8,12}|62\d{9,13})$/.test(digits);
}

function inputClass(hasError?: string) {
  return `mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
    hasError ? "border-rose-400 bg-rose-50 focus:ring-rose-100" : "border-slate-300 focus:border-teal-600 focus:ring-teal-100"
  }`;
}
