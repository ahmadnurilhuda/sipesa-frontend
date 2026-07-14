"use client";

import Link from "next/link";
import { Permission } from "@/types";
import { StatusBadge } from "../ui/StatusBadge";

export function PermissionTable({ permissions }: { permissions: Permission[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
          <tr>
            <th className="px-4 py-3">Santri</th>
            <th className="px-4 py-3">Jenis</th>
            <th className="px-4 py-3">Tujuan</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {permissions.map((item) => (
            <tr key={item.id}>
              <td className="px-4 py-3 font-medium">{item.studentName}</td>
              <td className="px-4 py-3">{item.permissionType}</td>
              <td className="px-4 py-3">{item.destination}</td>
              <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
              <td className="px-4 py-3"><Link className="font-semibold text-primary" href={`/permissions/${item.id}`}>Detail</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
