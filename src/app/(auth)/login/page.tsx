"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { saveSession } from "@/lib/auth";
import { defaultRouteForRole } from "@/lib/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  email: z.string().min(1, "Email wajib diisi").email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi")
});

type Form = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const toast = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: "admin@sipesa.local", password: "password" } });

  async function onSubmit(values: Form) {
    setError("");
    try {
      const { data } = await api.post("/auth/login", values);
      saveSession(data.accessToken, data.user);
      toast.success("Login berhasil.");
      router.push(defaultRouteForRole(data.user.role));
    } catch {
      const text = "Login gagal. Periksa email dan password.";
      setError(text);
      toast.error(text);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">SIPESA SMP POMOSDA</h1>
        <p className="mt-1 text-sm text-slate-500">Masuk ke sistem perizinan santri.</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <label className="block text-sm font-medium">Email
            <input type="email" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register("email")} />
            {errors.email && <span className="text-xs text-rose-600">{errors.email.message}</span>}
          </label>
          <label className="block text-sm font-medium">Password
            <input type="password" className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2" {...register("password")} />
            {errors.password && <span className="text-xs text-rose-600">{errors.password.message}</span>}
          </label>
          <div className="flex justify-end">
            <Link href="/forgot-password" className="text-sm font-semibold text-primary hover:text-teal-800">
              Lupa password?
            </Link>
          </div>
          {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
          <Button className="w-full" disabled={isSubmitting}>{isSubmitting ? "Memproses..." : "Masuk"}</Button>
        </form>
      </section>
    </main>
  );
}
