"use client";

import { PermissionTable } from "@/components/permission/PermissionTable";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { apiErrorMessage } from "@/lib/errors";
import { approvePermission, confirmReturnPermission, getPermissions, rejectPermission } from "@/lib/permissions";
import { Permission } from "@/types";
import { useEffect, useState } from "react";

type DecisionAction = "approve" | "reject" | "confirm-return";

export default function ApprovalPage() {
  const [items, setItems] = useState<Permission[] | null>(null);
  const [error, setError] = useState("");
  const [decision, setDecision] = useState<{ item: Permission; action: DecisionAction } | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { user } = useCurrentUser();
  const toast = useToast();
  async function refresh() {
    try {
      setError("");
      setItems(await getPermissions());
    } catch (err) {
      const text = apiErrorMessage(err, "Gagal memuat data persetujuan.");
      setError(text);
      toast.error(text);
    }
  }
  useEffect(() => { refresh(); }, []);
  const pending = (items ?? []).filter((item) => {
    if (user?.role === "WALI_KELAS") return item.status === "PENDING_WALI_KELAS";
    if (user?.role === "WALI_KAMAR") return item.status === "PENDING_WALI_KAMAR" || item.status === "CHECKED_IN";
    return item.status === "PENDING_WALI_KELAS" || item.status === "PENDING_WALI_KAMAR" || item.status === "CHECKED_IN";
  });

  function openDecision(item: Permission, action: DecisionAction) {
    setDecision({ item, action });
    setNote(action === "reject" ? "" : action === "confirm-return" ? "Santri sudah bertemu Wali Kamar dan kembali ke kamar." : "Disetujui.");
    setError("");
  }

  async function submitDecision() {
    if (!decision) return;
    if (decision.action === "reject" && note.trim().length < 3) {
      const text = "Alasan penolakan wajib diisi.";
      setError(text);
      toast.error(text);
      return;
    }
    const kamar = decision.item.status === "PENDING_WALI_KAMAR";
    setSubmitting(true);
    try {
      setError("");
      if (decision.action === "confirm-return") {
        await confirmReturnPermission(decision.item.id, note.trim() || "Santri sudah bertemu Wali Kamar dan kembali ke kamar.");
      } else if (decision.action === "approve") {
        await approvePermission(decision.item.id, kamar ? "approve-wali-kamar" : "approve-wali-kelas", note.trim() || "Disetujui.");
      } else {
        await rejectPermission(decision.item.id, kamar ? "reject-wali-kamar" : "reject-wali-kelas", note.trim());
      }
      setDecision(null);
      setNote("");
      await refresh();
      toast.success(decision.action === "confirm-return" ? "Izin berhasil diselesaikan." : decision.action === "approve" ? "Izin berhasil disetujui." : "Izin berhasil ditolak.");
    } catch (err) {
      const text = apiErrorMessage(err, decision.action === "confirm-return" ? "Gagal menyelesaikan izin." : decision.action === "approve" ? "Gagal menyetujui izin." : "Gagal menolak izin.");
      setError(text);
      toast.error(text);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink">Persetujuan Izin</h1>
      {error && <p className="mt-4 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200 bg-white">
        {!items ? <div className="p-4"><Spinner /></div> : (
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <tbody className="divide-y divide-slate-100">
              {pending.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3 font-medium">{item.studentName}</td>
                  <td className="px-4 py-3">{item.destination}</td>
                  <td className="px-4 py-3 flex gap-2">
                    {item.status === "CHECKED_IN" ? (
                      <Button onClick={() => openDecision(item, "confirm-return")}>Konfirmasi Selesai</Button>
                    ) : (
                      <>
                        <Button onClick={() => openDecision(item, "approve")}>Setujui</Button>
                        <Button variant="danger" onClick={() => openDecision(item, "reject")}>Tolak</Button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {items && pending.length === 0 && <div className="mt-4"><PermissionTable permissions={[]} /></div>}
      {decision && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-bold text-ink">{dialogTitle(decision.action)}</h2>
            <p className="mt-1 text-sm text-slate-500">{decision.item.studentName} - {decision.item.destination}</p>
            <label className="mt-4 block text-sm font-medium text-slate-700">
              {decision.action === "reject" ? "Alasan Penolakan" : "Catatan"}
              <textarea
                className="mt-1 h-28 w-full rounded-md border border-slate-300 px-3 py-2"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder={dialogPlaceholder(decision.action)}
              />
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => { setDecision(null); setNote(""); }} disabled={submitting}>Batal</Button>
              <Button type="button" variant={decision.action === "reject" ? "danger" : "primary"} onClick={submitDecision} disabled={submitting}>
                {submitting ? "Memproses..." : dialogSubmitLabel(decision.action)}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function dialogTitle(action: DecisionAction) {
  if (action === "confirm-return") return "Konfirmasi Izin Selesai";
  return action === "approve" ? "Setujui Izin" : "Tolak Izin";
}

function dialogPlaceholder(action: DecisionAction) {
  if (action === "confirm-return") return "Contoh: Santri sudah bertemu Wali Kamar dan kembali ke kamar.";
  return action === "approve" ? "Contoh: Disetujui, harap kembali tepat waktu." : "Tuliskan alasan penolakan izin.";
}

function dialogSubmitLabel(action: DecisionAction) {
  if (action === "confirm-return") return "Selesaikan Izin";
  return action === "approve" ? "Setujui" : "Tolak";
}
