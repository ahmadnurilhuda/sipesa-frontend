"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { apiErrorMessage } from "@/lib/errors";
import { Student } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z
  .object({
    studentId: z.string().min(1, "Pilih santri yang akan mengajukan izin."),
    permissionType: z.string().trim().min(3, "Jenis izin wajib diisi minimal 3 karakter. Contoh: Acara keluarga."),
    reason: z.string().trim().min(10, "Alasan izin harus dijelaskan minimal 10 karakter agar mudah diverifikasi."),
    destination: z.string().trim().min(3, "Tujuan izin wajib diisi dengan jelas. Contoh: Nganjuk Kota."),
    startAt: z.string().min(1, "Pilih tanggal dan jam mulai izin."),
    expectedReturnAt: z.string().min(1, "Pilih tanggal dan jam estimasi kembali.")
  })
  .refine((value) => new Date(value.expectedReturnAt).getTime() > new Date(value.startAt).getTime(), {
    message: "Estimasi kembali harus setelah tanggal dan jam mulai izin.",
    path: ["expectedReturnAt"]
  });

type Form = z.infer<typeof schema>;

export function PermissionForm() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const startAt = watch("startAt");
  const expectedReturnAt = watch("expectedReturnAt");
  useEffect(() => {
    api
      .get<Student[]>("/students")
      .then((res) => setStudents(res.data))
      .catch((err) => {
        const text = apiErrorMessage(err, "Gagal memuat daftar santri.");
        setError(text);
        toast.error(text);
      });
  }, []);

  async function onSubmit(values: Form) {
    setMessage("");
    setError("");
    try {
      await api.post("/permissions", {
        ...values,
        startAt: new Date(values.startAt).toISOString(),
        expectedReturnAt: new Date(values.expectedReturnAt).toISOString()
      });
      setMessage("Pengajuan izin berhasil dikirim.");
      toast.success("Pengajuan izin berhasil dikirim.");
      router.push("/permissions");
    } catch (err) {
      const text = apiErrorMessage(err, "Pengajuan izin gagal dikirim.");
      setError(text);
      toast.error(text);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4">
      <label className="text-sm font-medium">Santri
        <select className={inputClass(errors.studentId?.message)} {...register("studentId")}>
          <option value="">Pilih santri</option>
          {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
        </select>
        {errors.studentId && <span className="text-xs text-rose-600">{errors.studentId.message}</span>}
      </label>
      <label className="text-sm font-medium">Jenis Izin
        <input className={inputClass(errors.permissionType?.message)} placeholder="Contoh: Acara keluarga" {...register("permissionType")} />
        {errors.permissionType && <span className="text-xs text-rose-600">{errors.permissionType.message}</span>}
      </label>
      <label className="text-sm font-medium">Alasan
        <textarea className={inputClass(errors.reason?.message)} placeholder="Jelaskan alasan izin secara singkat dan jelas" {...register("reason")} />
        {errors.reason && <span className="text-xs text-rose-600">{errors.reason.message}</span>}
      </label>
      <label className="text-sm font-medium">Tujuan
        <input className={inputClass(errors.destination?.message)} placeholder="Contoh: Rumah keluarga di Nganjuk" {...register("destination")} />
        {errors.destination && <span className="text-xs text-rose-600">{errors.destination.message}</span>}
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Mulai
          <input type="datetime-local" className={inputClass(errors.startAt?.message)} {...register("startAt")} />
          {startAt && <span className="mt-1 block rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">{formatDateTime(startAt)}</span>}
          {errors.startAt && <span className="text-xs text-rose-600">{errors.startAt.message}</span>}
        </label>
        <label className="text-sm font-medium">Estimasi Kembali
          <input type="datetime-local" className={inputClass(errors.expectedReturnAt?.message)} {...register("expectedReturnAt")} />
          {expectedReturnAt && <span className="mt-1 block rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">{formatDateTime(expectedReturnAt)}</span>}
          {errors.expectedReturnAt && <span className="text-xs text-rose-600">{errors.expectedReturnAt.message}</span>}
        </label>
      </div>
      {(startAt || expectedReturnAt) && (
        <section className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <p className="font-semibold">Preview Jadwal Izin</p>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs text-sky-700">Mulai</dt><dd>{startAt ? formatDateTime(startAt) : "Belum dipilih"}</dd></div>
            <div><dt className="text-xs text-sky-700">Estimasi Kembali</dt><dd>{expectedReturnAt ? formatDateTime(expectedReturnAt) : "Belum dipilih"}</dd></div>
          </dl>
        </section>
      )}
      {error && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {message && <p className="text-sm text-emerald-700">{message}</p>}
      <Button disabled={isSubmitting}>{isSubmitting ? "Mengirim..." : "Kirim Pengajuan"}</Button>
    </form>
  );
}

function inputClass(hasError?: string) {
  return `mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
    hasError ? "border-rose-400 bg-rose-50 focus:ring-rose-100" : "border-slate-300 focus:border-teal-600 focus:ring-teal-100"
  }`;
}
