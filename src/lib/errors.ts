import { AxiosError } from "axios";
import { formatApiMessageDates } from "./datetime";

type ApiErrorBody = {
  message?: string;
  fields?: Record<string, string>;
};

export function apiErrorMessage(error: unknown, fallback: string) {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorBody | undefined;
    const fieldMessages = data?.fields ? Object.entries(data.fields).map(([field, message]) => friendlyFieldMessage(field, message)).join(", ") : "";
    const message = data?.message ? friendlyApiMessage(data.message) : "";
    return message ? formatApiMessageDates(`${message}${fieldMessages ? `: ${fieldMessages}` : ""}`) : fallback;
  }
  return fallback;
}

function friendlyFieldMessage(field: string, message: string) {
  const label = fieldLabels[field] ?? field;
  const lower = message.toLowerCase();
  if (lower.includes("must not be blank") || lower.includes("tidak boleh kosong")) return `${label} wajib diisi`;
  if (lower.includes("must not be null")) return `${label} wajib dipilih`;
  if (lower.includes("must be a well-formed email address")) return "Format email belum benar. Contoh: nama@email.com";
  if (lower.includes("size must be between 6 and 6")) return `${label} harus berisi tepat 6 karakter`;
  if (lower.includes("size must be")) return `${label} belum memenuhi panjang minimal yang diminta`;
  if (lower.includes("must be a future date")) return `${label} harus setelah waktu saat ini`;
  return `${label}: ${message}`;
}

function friendlyApiMessage(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("could not resolve attribute")) return "Data belum bisa diproses karena format data tidak sesuai.";
  if (lower.includes("constraint") && lower.includes("phone")) return "No. HP sudah dipakai.";
  if (lower.includes("constraint") && lower.includes("email")) return "Email sudah dipakai.";
  if (lower.includes("constraint") && lower.includes("username")) return "Username sudah dipakai.";
  return message;
}

const fieldLabels: Record<string, string> = {
  name: "Nama",
  username: "Username",
  email: "Email",
  phone: "No. HP",
  password: "Password",
  role: "Role",
  studentId: "Santri",
  permissionType: "Jenis izin",
  reason: "Alasan",
  destination: "Tujuan",
  startAt: "Waktu mulai",
  expectedReturnAt: "Estimasi kembali",
  otp: "Kode OTP",
  newPassword: "Kata sandi baru",
  resetToken: "Token reset",
  period: "Periode",
  classId: "Kelas",
  roomId: "Kamar",
  academicYearId: "Tahun ajaran",
  maxPermissionDays: "Batas izin per semester",
  parentGuardianId: "Wali santri",
  pengurusId: "Pengurus",
  userId: "Akun login",
  nis: "NIS",
  nip: "NIP",
  position: "Jabatan",
  building: "Gedung",
  schoolYear: "Tahun ajaran"
};
