import { PermissionStatus, Role } from "@/types";

export const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  WALI_SANTRI: "Wali Santri",
  WALI_KELAS: "Wali Kelas",
  WALI_KAMAR: "Wali Kamar",
  KEAMANAN: "Keamanan",
  KAUR_ASRAMA: "Kaur Asrama"
};

export const statusLabels: Record<PermissionStatus, string> = {
  DRAFT: "Draft",
  PENDING_WALI_KELAS: "Menunggu Wali Kelas",
  REJECTED_BY_WALI_KELAS: "Ditolak Wali Kelas",
  PENDING_WALI_KAMAR: "Menunggu Wali Kamar",
  REJECTED_BY_WALI_KAMAR: "Ditolak Wali Kamar",
  APPROVED: "Disetujui",
  CHECKED_OUT: "Sudah Keluar",
  CHECKED_IN: "Sudah Kembali",
  COMPLETED: "Selesai",
  OVERDUE: "Terlambat",
  CANCELLED: "Dibatalkan"
};

export const statusColors: Record<PermissionStatus, string> = {
  DRAFT: "bg-slate-100 text-slate-700",
  PENDING_WALI_KELAS: "bg-amber-100 text-amber-800",
  REJECTED_BY_WALI_KELAS: "bg-rose-100 text-rose-800",
  PENDING_WALI_KAMAR: "bg-sky-100 text-sky-800",
  REJECTED_BY_WALI_KAMAR: "bg-rose-100 text-rose-800",
  APPROVED: "bg-emerald-100 text-emerald-800",
  CHECKED_OUT: "bg-blue-100 text-blue-800",
  CHECKED_IN: "bg-indigo-100 text-indigo-800",
  COMPLETED: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-zinc-100 text-zinc-700"
};
