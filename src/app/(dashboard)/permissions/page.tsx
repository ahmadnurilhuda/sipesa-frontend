"use client";

import { PermissionTable } from "@/components/permission/PermissionTable";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { apiErrorMessage } from "@/lib/errors";
import { getPermissions } from "@/lib/permissions";
import { Permission } from "@/types";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function PermissionsPage() {
  const [items, setItems] = useState<Permission[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const toast = useToast();
  useEffect(() => {
    getPermissions()
      .then(setItems)
      .catch((err) => {
        const text = apiErrorMessage(err, "Gagal memuat data perizinan.");
        setError(text);
        toast.error(text);
      });
  }, []);
  const filtered = useMemo(() => (items ?? []).filter((item) => `${item.studentName} ${item.destination} ${item.status}`.toLowerCase().includes(search.toLowerCase())), [items, search]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-ink">Perizinan Santri</h1>
        <Link href="/permissions/new"><Button>Buat Izin</Button></Link>
      </div>
      <input placeholder="Cari izin..." className="mt-4 w-full rounded-md border border-slate-300 px-3 py-2 sm:max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-4">{items ? <PermissionTable permissions={filtered} /> : <Spinner />}</div>
    </div>
  );
}
