"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Step = "email" | "otp" | "password" | "success";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function requestOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      toast.error(emailError);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string }>("/auth/forgot-password/request-otp", { email });
      setMessage(data.message);
      toast.success(data.message);
      setStep("otp");
    } catch (err) {
      const text = apiErrorMessage(err, "Email tidak dikenal.");
      setError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!/^\d{6}$/.test(otp)) {
      const text = "Kode OTP harus berisi tepat 6 angka.";
      setError(text);
      toast.error(text);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ resetToken: string; message: string }>("/auth/forgot-password/verify-otp", { email, otp });
      setResetToken(data.resetToken);
      setMessage(data.message);
      toast.success(data.message);
      setStep("password");
    } catch (err) {
      const text = apiErrorMessage(err, "OTP salah.");
      setError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }

  async function resetPassword(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (newPassword !== confirmPassword) {
      const text = "Konfirmasi kata sandi tidak sama.";
      setError(text);
      toast.error(text);
      return;
    }
    if (newPassword.length < 6) {
      const text = "Kata sandi baru minimal 6 karakter.";
      setError(text);
      toast.error(text);
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post<{ message: string }>("/auth/forgot-password/reset", { email, resetToken, newPassword });
      setMessage(data.message);
      toast.success(data.message);
      setStep("success");
    } catch (err) {
      const text = apiErrorMessage(err, "Kata sandi gagal diperbarui.");
      setError(text);
      toast.error(text);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-ink">Lupa Password</h1>
        <p className="mt-1 text-sm text-slate-500">{subtitle(step)}</p>

        {step === "email" && (
          <form onSubmit={requestOtp} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Email Terdaftar
              <input
                type="email"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                placeholder="admin@sipesa.local"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
            </label>
            <Button className="w-full" disabled={loading}>{loading ? "Mengirim..." : "Kirim OTP"}</Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={verifyOtp} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Kode OTP
              <input
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 tracking-widest outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                inputMode="numeric"
                maxLength={6}
                placeholder="6 digit"
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
                required
              />
            </label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button type="button" variant="secondary" onClick={() => setStep("email")}>Ubah Email</Button>
              <Button disabled={loading || otp.length !== 6}>{loading ? "Memeriksa..." : "Verifikasi OTP"}</Button>
            </div>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={resetPassword} className="mt-6 space-y-4">
            <label className="block text-sm font-medium">Kata Sandi Baru
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
            <label className="block text-sm font-medium">Konfirmasi Kata Sandi
              <input
                type="password"
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={6}
                required
              />
            </label>
            <Button className="w-full" disabled={loading}>{loading ? "Menyimpan..." : "Simpan Kata Sandi"}</Button>
          </form>
        )}

        {step === "success" && (
          <div className="mt-6 space-y-4">
            <Button className="w-full" onClick={() => router.push("/login")}>Kembali ke Login</Button>
          </div>
        )}

        {message && <p className="mt-4 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p>}
        {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}

        <div className="mt-5 text-center">
          <Link href="/login" className="text-sm font-semibold text-primary hover:text-teal-800">
            Kembali ke halaman login
          </Link>
        </div>
      </section>
    </main>
  );
}

function subtitle(step: Step) {
  if (step === "email") return "Masukkan email akun yang terdaftar.";
  if (step === "otp") return "Masukkan kode OTP yang diterima melalui email.";
  if (step === "password") return "Buat kata sandi baru untuk akun Anda.";
  return "Kata sandi berhasil diperbarui.";
}

function validateEmail(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "Email wajib diisi.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Format email belum benar. Contoh: nama@email.com.";
  }
  return "";
}
