import { api } from "./api";
import { Permission } from "@/types";

export async function getPermissions() {
  const { data } = await api.get<Permission[]>("/permissions");
  return data;
}

export async function approvePermission(id: string, action: "approve-wali-kelas" | "approve-wali-kamar", note: string) {
  const { data } = await api.post<Permission>(`/permissions/${id}/${action}`, { note });
  return data;
}

export async function rejectPermission(id: string, action: "reject-wali-kelas" | "reject-wali-kamar", note: string) {
  const { data } = await api.post<Permission>(`/permissions/${id}/${action}`, { note });
  return data;
}

export async function confirmReturnPermission(id: string, note: string) {
  const { data } = await api.post<Permission>(`/permissions/${id}/confirm-return`, { note });
  return data;
}
