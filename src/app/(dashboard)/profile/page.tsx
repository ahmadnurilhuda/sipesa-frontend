"use client";

import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { currentUser, saveSession } from "@/lib/auth";
import { roleLabels } from "@/lib/constants";
import { apiErrorMessage } from "@/lib/errors";
import { User } from "@/types";
import { FormEvent, useEffect, useState } from "react";

type ProfileForm = {
  name: string;
  username: string;
  email: string;
  phone: string;
  currentPassword: string;
  newPassword: string;
};

type ProfileResponse = {
  accessToken: string;
  user: User;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [form, setForm] = useState<ProfileForm>({
    name: "",
    username: "",
    email: "",
    phone: "",
    currentPassword: "",
    newPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileForm, string>>>({});
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const storedUser = currentUser();
    setUser(storedUser);
    if (storedUser) {
      setForm((prev) => ({
        ...prev,
        name: storedUser.name,
        username: storedUser.username,
        email: storedUser.email,
        phone: storedUser.phone ?? ""
      }));
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    const validationErrors = validateProfile(form);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      const text = "Periksa kembali isian profil. Ada data yang belum lengkap atau belum sesuai.";
      setError(text);
      toast.error(text);
      setSaving(false);
      return;
    }
    try {
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email,
        phone: form.phone || null,
        currentPassword: form.currentPassword || null,
        newPassword: form.newPassword || null
      };
      const res = await api.put<ProfileResponse>("/auth/me", payload);
      saveSession(res.data.accessToken, res.data.user);
      setUser(res.data.user);
      setForm((prev) => ({ ...prev, currentPassword: "", newPassword: "" }));
      setMessage("Profil berhasil diperbarui.");
      toast.success("Profil berhasil diperbarui.");
    } catch (err) {
      const text = apiErrorMessage(err, "Profil belum berhasil diperbarui.");
      setError(text);
      toast.error(text);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-ink">Profil Saya</h1>
        <p className="mt-1 text-sm text-slate-500">{user ? roleLabels[user.role] : "Memuat data pengguna..."}</p>
      </div>

      <form onSubmit={submit} className="mt-5 grid gap-4 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-2">
        <label className="text-sm font-medium text-slate-700">
          Nama
          <input className={inputClass(fieldErrors.name)} value={form.name} onChange={(event) => setFieldValue("name", event.target.value)} />
          {fieldErrors.name && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.name}</span>}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Username
          <input className={inputClass(fieldErrors.username)} value={form.username} onChange={(event) => setFieldValue("username", event.target.value)} />
          {fieldErrors.username && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.username}</span>}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Email
          <input className={inputClass(fieldErrors.email)} type="email" value={form.email} onChange={(event) => setFieldValue("email", event.target.value)} />
          {fieldErrors.email && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.email}</span>}
        </label>
        <label className="text-sm font-medium text-slate-700">
          No. WhatsApp
          <input className={inputClass(fieldErrors.phone)} value={form.phone} onChange={(event) => setFieldValue("phone", event.target.value)} placeholder="Contoh: 081234567890" />
          {fieldErrors.phone && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.phone}</span>}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Kata Sandi Lama
          <input className={inputClass(fieldErrors.currentPassword)} type="password" value={form.currentPassword} onChange={(event) => setFieldValue("currentPassword", event.target.value)} />
          {fieldErrors.currentPassword && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.currentPassword}</span>}
        </label>
        <label className="text-sm font-medium text-slate-700">
          Kata Sandi Baru
          <input className={inputClass(fieldErrors.newPassword)} type="password" value={form.newPassword} onChange={(event) => setFieldValue("newPassword", event.target.value)} />
          {fieldErrors.newPassword && <span className="mt-1 block text-xs font-medium text-rose-600">{fieldErrors.newPassword}</span>}
        </label>

        {message && <p className="rounded-md bg-emerald-50 p-2 text-sm text-emerald-700 md:col-span-2">{message}</p>}
        {error && <p className="rounded-md bg-rose-50 p-2 text-sm text-rose-700 md:col-span-2">{error}</p>}

        <div className="md:col-span-2">
          <Button disabled={saving}>{saving ? "Menyimpan..." : "Simpan Profil"}</Button>
        </div>
      </form>
    </div>
  );

  function setFieldValue(name: keyof ProfileForm, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  }
}

function validateProfile(form: ProfileForm) {
  const errors: Partial<Record<keyof ProfileForm, string>> = {};
  if (!form.name.trim()) errors.name = "Nama wajib diisi.";
  if (!form.username.trim()) {
    errors.username = "Username wajib diisi.";
  } else if (/\s/.test(form.username.trim())) {
    errors.username = "Username tidak boleh memakai spasi.";
  }
  if (!form.email.trim()) {
    errors.email = "Email wajib diisi.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Format email belum benar. Contoh: nama@email.com.";
  }
  if (form.phone.trim() && !/^(08\d{8,12}|62\d{9,13})$/.test(form.phone.replace(/\D/g, ""))) {
    errors.phone = "Nomor WhatsApp harus diawali 08 atau 62. Contoh: 081234567890.";
  }
  if (form.newPassword && form.newPassword.length < 6) {
    errors.newPassword = "Kata sandi baru minimal 6 karakter.";
  }
  if (form.newPassword && !form.currentPassword) {
    errors.currentPassword = "Isi kata sandi lama untuk mengganti kata sandi.";
  }
  if (form.currentPassword && !form.newPassword) {
    errors.newPassword = "Isi kata sandi baru, atau kosongkan kata sandi lama jika tidak ingin mengganti password.";
  }
  return errors;
}

function inputClass(hasError?: string) {
  return `mt-1 w-full rounded-md border px-3 py-2 outline-none focus:ring-2 ${
    hasError ? "border-rose-400 bg-rose-50 focus:ring-rose-100" : "border-slate-300 focus:border-teal-600 focus:ring-teal-100"
  }`;
}
