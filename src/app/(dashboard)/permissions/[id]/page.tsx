"use client";

import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { roleLabels } from "@/lib/constants";
import { formatDateTime } from "@/lib/datetime";
import { apiErrorMessage } from "@/lib/errors";
import { Permission } from "@/types";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PermissionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [permission, setPermission] = useState<Permission | null>(null);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const toast = useToast();
  useEffect(() => {
    api
      .get<Permission>(`/permissions/${id}`)
      .then((res) => setPermission(res.data))
      .catch((err) => {
        const text = apiErrorMessage(err, "Gagal memuat detail izin.");
        setError(text);
        toast.error(text);
      });
  }, [id]);

  async function loadQr() {
    try {
      setError("");
      const { data } = await api.get(`/permissions/${id}/qr`);
      setToken(data.token);
      toast.success("QR Code berhasil dimuat.");
    } catch (err) {
      const text = apiErrorMessage(err, "Gagal memuat QR Code.");
      setError(text);
      toast.error(text);
    }
  }

  if (!permission) {
    return error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : <Spinner />;
  }

  const rejectedWithoutLog = isRejectionStatus(permission.status) && !(permission.approvalLogs ?? []).some((log) => isRejectionStatus(log.toStatus));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold text-ink">{permission.studentName}</h1>
          <StatusBadge status={permission.status} />
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div><dt className="text-xs text-slate-500">Jenis Izin</dt><dd className="font-medium">{permission.permissionType}</dd></div>
          <div><dt className="text-xs text-slate-500">Tujuan</dt><dd className="font-medium">{permission.destination}</dd></div>
          <div><dt className="text-xs text-slate-500">Mulai</dt><dd>{formatDateTime(permission.startAt)}</dd></div>
          <div><dt className="text-xs text-slate-500">Estimasi Kembali</dt><dd>{formatDateTime(permission.expectedReturnAt)}</dd></div>
          <div><dt className="text-xs text-slate-500">Waktu Check-out</dt><dd>{formatDateTime(permission.checkedOutAt)}</dd></div>
          <div><dt className="text-xs text-slate-500">Waktu Check-in</dt><dd>{formatDateTime(permission.checkedInAt)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs text-slate-500">Alasan</dt><dd>{permission.reason}</dd></div>
        </dl>
        <div className="mt-6 border-t border-slate-100 pt-5">
          {rejectedWithoutLog && (
            <section className="mb-4 rounded-md border border-rose-200 bg-rose-50 p-3">
              <h2 className="font-semibold text-rose-800">Riwayat Keputusan Belum Lengkap</h2>
              <p className="mt-2 text-sm text-rose-900">Alasan penolakan belum tersedia di response backend. Restart backend lalu muat ulang halaman ini.</p>
            </section>
          )}
          <h2 className="font-semibold text-slate-900">Riwayat Keputusan</h2>
          {(permission.approvalLogs ?? []).length > 0 ? (
            <div className="mt-3 space-y-3">
              {(permission.approvalLogs ?? []).map((log) => (
                <section key={log.id} className={`rounded-md border p-3 ${decisionCardClass(log.toStatus)}`}>
                  <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <p className={`text-sm font-semibold ${decisionTitleClass(log.toStatus)}`}>{approvalLabel(log.toStatus)}</p>
                    <p className={`text-xs ${decisionMetaClass(log.toStatus)}`}>{formatDateTime(log.createdAt)}</p>
                  </div>
                  <p className={`mt-1 text-xs ${decisionMetaClass(log.toStatus)}`}>
                    {log.actorName} - {roleLabels[log.actorRole]}
                  </p>
                  <p className={`mt-2 text-sm ${decisionBodyClass(log.toStatus)}`}>{log.note?.trim() || "Tidak ada catatan."}</p>
                </section>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">Belum ada riwayat keputusan.</p>
          )}
        </div>
      </section>
      <aside className="rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">QR Code E-Ticket</h2>
        {error && <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
        <div className="mt-4 flex min-h-72 items-center justify-center rounded-md bg-slate-50 p-4">
          {token ? <QRCodeSVG value={token} size={220} /> : <p className="text-center text-sm text-slate-500">QR tersedia setelah izin disetujui Wali Kamar.</p>}
        </div>
        <Button className="mt-4 w-full" onClick={loadQr}>Tampilkan QR</Button>
      </aside>
    </div>
  );
}

function approvalLabel(status: string) {
  if (status === "PENDING_WALI_KAMAR") return "Disetujui Wali Kelas";
  if (status === "REJECTED_BY_WALI_KELAS") return "Ditolak Wali Kelas";
  if (status === "APPROVED") return "Disetujui Wali Kamar";
  if (status === "REJECTED_BY_WALI_KAMAR") return "Ditolak Wali Kamar";
  if (status === "COMPLETED") return "Konfirmasi Kembali";
  return status.replaceAll("_", " ");
}

function isRejectionStatus(status: string) {
  return status === "REJECTED_BY_WALI_KELAS" || status === "REJECTED_BY_WALI_KAMAR";
}

function isApprovalStatus(status: string) {
  return status === "PENDING_WALI_KAMAR" || status === "APPROVED";
}

function decisionCardClass(status: string) {
  if (isRejectionStatus(status)) return "border-rose-200 bg-rose-50";
  if (isApprovalStatus(status)) return "border-emerald-200 bg-emerald-50";
  return "border-slate-200 bg-slate-50";
}

function decisionTitleClass(status: string) {
  if (isRejectionStatus(status)) return "text-rose-800";
  if (isApprovalStatus(status)) return "text-emerald-800";
  return "text-slate-900";
}

function decisionMetaClass(status: string) {
  if (isRejectionStatus(status)) return "text-rose-700";
  if (isApprovalStatus(status)) return "text-emerald-700";
  return "text-slate-500";
}

function decisionBodyClass(status: string) {
  if (isRejectionStatus(status)) return "text-rose-900";
  if (isApprovalStatus(status)) return "text-emerald-900";
  return "text-slate-700";
}
