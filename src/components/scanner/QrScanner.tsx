"use client";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useToast } from "@/components/ui/ToastProvider";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/datetime";
import { apiErrorMessage } from "@/lib/errors";
import { Permission } from "@/types";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

export function QrScanner() {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [ticket, setTicket] = useState<Permission | null>(null);
  const [cameraRunning, setCameraRunning] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const lastPreviewTokenRef = useRef("");
  const toast = useToast();

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      safeStopScanner(scanner).finally(() => safeClearScanner(scanner));
    };
  }, []);

  useEffect(() => {
    const trimmedToken = token.trim();
    if (trimmedToken.length < 16 || trimmedToken === lastPreviewTokenRef.current) return;
    const timeoutId = window.setTimeout(async () => {
      try {
        lastPreviewTokenRef.current = trimmedToken;
        const { data } = await api.post<Permission>("/security/scan/preview", { token: trimmedToken });
        setTicket(data);
        setError("");
      } catch (err) {
        lastPreviewTokenRef.current = "";
        setTicket(null);
        setError(apiErrorMessage(err, "Token QR tidak valid."));
      }
    }, 400);
    return () => window.clearTimeout(timeoutId);
  }, [token]);

  function scanner() {
    if (!scannerRef.current) {
      const container = document.getElementById("qr-reader");
      if (container) container.innerHTML = "";
      scannerRef.current = new Html5Qrcode("qr-reader");
    }
    return scannerRef.current;
  }

  async function startCamera() {
    setError("");
    try {
      await scanner().start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        (decoded) => setToken(decoded),
        () => undefined
      );
      setCameraRunning(true);
      toast.info("Kamera scanner aktif.");
    } catch (err) {
      const text = apiErrorMessage(err, "Kamera tidak dapat dibuka. Periksa izin kamera browser.");
      setError(text);
      toast.error(text);
    }
  }

  async function stopCamera() {
    await safeStopScanner(scannerRef.current);
    setCameraRunning(false);
  }

  async function scanFile(file?: File) {
    if (!file) return;
    setError("");
    try {
      if (cameraRunning) await stopCamera();
      const decoded = await scanner().scanFile(file, true);
      setToken(decoded);
      toast.success("QR dari gambar berhasil dibaca.");
    } catch (err) {
      const text = apiErrorMessage(err, "Gambar tidak berisi QR yang valid.");
      setError(text);
      toast.error(text);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function scan(action: "check-out" | "check-in") {
    setMessage("");
    setError("");
    try {
      const { data } = await api.post<Permission>(`/security/scan/${action}`, { token });
      const text = `${data.studentName} berhasil diproses.`;
      setTicket(data);
      setMessage(text);
      toast.success(text);
    } catch (err) {
      const text = apiErrorMessage(err, "Scan QR gagal diproses.");
      setError(text);
      toast.error(text);
    }
  }

  const canCheckOut = Boolean(token) && (!ticket || ticket.status === "APPROVED");
  const canCheckIn = Boolean(token) && ticket?.status === "CHECKED_OUT";
  const actionHint = ticket ? scanActionHint(ticket.status) : "Scan QR untuk melihat detail tiket.";

  return (
    <section className="grid gap-4 lg:grid-cols-[360px_1fr]">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <div className="relative min-h-72 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
          <div id="qr-reader" className="min-h-72" />
          {!cameraRunning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50 p-4 text-center">
              <p className="text-sm font-semibold text-slate-700">Kamera belum aktif</p>
              <p className="max-w-64 text-xs text-slate-500">Mulai kamera untuk scan langsung, atau unggah gambar QR dari perangkat.</p>
              <Button type="button" onClick={startCamera}>Mulai Kamera</Button>
            </div>
          )}
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <Button type="button" variant="secondary" onClick={startCamera} disabled={cameraRunning}>Mulai Kamera</Button>
          <Button type="button" variant="secondary" onClick={stopCamera} disabled={!cameraRunning}>Hentikan</Button>
        </div>
        <label className="mt-3 block text-sm font-medium text-slate-700">
          Upload Gambar QR
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            onChange={(event) => scanFile(event.target.files?.[0])}
          />
        </label>
      </div>
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        <label className="text-sm font-medium">Token QR
          <textarea className="mt-1 h-32 w-full rounded-md border border-slate-300 px-3 py-2" value={token} onChange={(e) => setToken(e.target.value)} />
        </label>
        <div className="mt-4 flex gap-2">
          <Button disabled={!canCheckOut} onClick={() => scan("check-out")}>Check-out</Button>
          <Button variant="secondary" disabled={!canCheckIn} onClick={() => scan("check-in")}>Check-in</Button>
        </div>
        {token && <p className="mt-2 text-xs text-slate-500">{actionHint}</p>}
        {error && <p className="mt-3 rounded-md bg-rose-50 p-2 text-sm text-rose-700">{error}</p>}
        {message && <p className="mt-3 rounded-md bg-emerald-50 p-2 text-sm text-emerald-700">{message}</p>}
        {ticket && (
          <section className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-emerald-950">{ticket.studentName}</h2>
                <p className="text-sm text-emerald-800">{ticket.permissionType}</p>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <div><dt className="text-xs font-medium text-emerald-700">Tujuan</dt><dd className="font-semibold text-emerald-950">{ticket.destination}</dd></div>
              <div><dt className="text-xs font-medium text-emerald-700">Mulai Izin</dt><dd className="text-emerald-950">{formatDateTime(ticket.startAt)}</dd></div>
              <div><dt className="text-xs font-medium text-emerald-700">Estimasi Kembali</dt><dd className="text-emerald-950">{formatDateTime(ticket.expectedReturnAt)}</dd></div>
              <div><dt className="text-xs font-medium text-emerald-700">Check-out</dt><dd className="text-emerald-950">{formatDateTime(ticket.checkedOutAt)}</dd></div>
              <div><dt className="text-xs font-medium text-emerald-700">Check-in</dt><dd className="text-emerald-950">{formatDateTime(ticket.checkedInAt)}</dd></div>
              <div className="sm:col-span-2"><dt className="text-xs font-medium text-emerald-700">Alasan Izin</dt><dd className="text-emerald-950">{ticket.reason}</dd></div>
            </dl>
          </section>
        )}
      </div>
    </section>
  );
}

async function safeStopScanner(scanner: Html5Qrcode | null) {
  if (!scanner || !isScannerRunning(scanner)) return;
  try {
    await scanner.stop();
  } catch {
    // The scanner can already be stopped during route changes or hot reload.
  }
}

function safeClearScanner(scanner: Html5Qrcode | null) {
  try {
    scanner?.clear();
  } catch {
    // Ignore cleanup errors from an already disposed scanner.
  }
}

function isScannerRunning(scanner: Html5Qrcode) {
  try {
    const state = scanner.getState();
    return state === Html5QrcodeScannerState.SCANNING || state === Html5QrcodeScannerState.PAUSED;
  } catch {
    return false;
  }
}

function scanActionHint(status: Permission["status"]) {
  if (status === "APPROVED") return "Tiket siap untuk check-out.";
  if (status === "CHECKED_OUT") return "Santri sudah keluar. Check-in dapat dilakukan saat santri kembali.";
  if (status === "CHECKED_IN") return "Santri sudah check-in. Tidak ada aksi scan lanjutan.";
  if (status === "COMPLETED") return "Izin sudah selesai. Tidak ada aksi scan lanjutan.";
  if (status === "CANCELLED") return "Izin dibatalkan. Tidak ada aksi scan lanjutan.";
  if (status.startsWith("REJECTED")) return "Izin ditolak. Tidak ada aksi scan.";
  return "Status izin belum siap untuk proses scan keamanan.";
}
