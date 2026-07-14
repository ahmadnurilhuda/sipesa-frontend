import { Role } from "@/types";
import { Bell, BookOpen, CalendarDays, DoorOpen, FileClock, FileText, Home, LucideIcon, QrCode, School, ShieldCheck, UserCog, UserRoundCheck, Users } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: Role[];
};

const allRoles: Role[] = ["ADMIN", "WALI_SANTRI", "WALI_KELAS", "WALI_KAMAR", "KEAMANAN", "KAUR_ASRAMA"];
const dashboardRoles: Role[] = ["ADMIN", "WALI_KELAS", "WALI_KAMAR", "KAUR_ASRAMA"];
const adminOnly: Role[] = ["ADMIN"];

export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, roles: dashboardRoles },
  { href: "/profile", label: "Profil Saya", icon: UserCog, roles: allRoles },
  { href: "/permissions", label: "Perizinan", icon: FileText, roles: allRoles },
  { href: "/permissions/approval", label: "Persetujuan", icon: BookOpen, roles: ["ADMIN", "WALI_KELAS", "WALI_KAMAR"] },
  { href: "/security-scan", label: "Scan QR", icon: QrCode, roles: ["ADMIN", "KEAMANAN"] },
  { href: "/students", label: "Santri", icon: Users, roles: ["ADMIN", "WALI_SANTRI", "WALI_KELAS", "WALI_KAMAR", "KAUR_ASRAMA"] },
  { href: "/parents", label: "Wali Santri", icon: UserRoundCheck, roles: adminOnly },
  { href: "/pengurus", label: "Pengurus", icon: ShieldCheck, roles: adminOnly },
  { href: "/users", label: "Pengguna", icon: Users, roles: adminOnly },
  { href: "/classes", label: "Kelas", icon: School, roles: adminOnly },
  { href: "/rooms", label: "Kamar", icon: DoorOpen, roles: adminOnly },
  { href: "/academic-years", label: "Tahun Ajaran", icon: CalendarDays, roles: adminOnly },
  { href: "/semesters", label: "Semester", icon: CalendarDays, roles: adminOnly },
  { href: "/class-guardians", label: "Wali Kelas", icon: BookOpen, roles: adminOnly },
  { href: "/room-guardians", label: "Wali Kamar", icon: DoorOpen, roles: adminOnly },
  { href: "/student-class-histories", label: "Penempatan Kelas", icon: FileClock, roles: adminOnly },
  { href: "/student-room-histories", label: "Penempatan Kamar", icon: FileClock, roles: adminOnly },
  { href: "/reports", label: "Laporan", icon: FileText, roles: ["ADMIN", "KAUR_ASRAMA"] },
  { href: "/notifications", label: "Notifikasi", icon: Bell, roles: allRoles }
];

export function defaultRouteForRole(role: Role) {
  if (role === "WALI_SANTRI") return "/permissions";
  if (role === "KEAMANAN") return "/security-scan";
  return "/dashboard";
}

export function canAccessRoute(role: Role, pathname: string) {
  return navItems.some((item) => item.roles.includes(role) && (pathname === item.href || pathname.startsWith(`${item.href}/`)));
}
