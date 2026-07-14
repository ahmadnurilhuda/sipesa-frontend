"use client";

import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/ToastProvider";
import { formatDateTime } from "@/lib/datetime";
import { api } from "@/lib/api";
import { apiErrorMessage } from "@/lib/errors";
import { useEffect, useState } from "react";

type Notification = {
  id: string;
  title: string;
  message: string;
  read: boolean;
  channel: string;
  deliveryStatus: "PENDING" | "SENT" | "FAILED" | "DISABLED" | "NO_EMAIL" | "NO_PHONE";
  deliveryError?: string;
  sentAt?: string;
  createdAt: string;
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);
  const [error, setError] = useState("");
  const toast = useToast();
  useEffect(() => {
    api
      .get<Notification[]>("/notifications")
      .then((res) => setItems(res.data))
      .catch((err) => {
        const text = apiErrorMessage(err, "Gagal memuat notifikasi.");
        setError(text);
        toast.error(text);
      });
  }, []);
  if (!items) {
    return error ? <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : <Spinner />;
  }
  return (
    <div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink">Notifikasi</h1>
          <p className="text-sm text-slate-500">Pantau informasi izin dan status pengiriman notifikasi dari sistem.</p>
        </div>
        <span className="w-fit rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
          {items.length} notifikasi
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
          <p className="font-semibold text-slate-700">Belum ada notifikasi.</p>
          <p className="mt-1 text-sm text-slate-500">Informasi izin akan muncul di halaman ini.</p>
        </div>
      ) : null}

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <NotificationCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

function NotificationCard({ item }: { item: Notification }) {
  const content = parseNotificationMessage(item.message);

  return (
    <section className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm ${item.read ? "opacity-75" : ""}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-ink">{item.title}</h2>
            {!item.read ? <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[11px] font-semibold text-sky-700">Baru</span> : null}
          </div>
          <p className="mt-1 text-sm leading-6 text-slate-600">{content.intro}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-1 text-left sm:items-end sm:text-right">
          <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-semibold ${deliveryClass(item.deliveryStatus)}`}>
            {channelLabel(item.channel)} - {deliveryLabel(item.deliveryStatus)}
          </span>
          <span className="text-xs text-slate-500">{formatDateTime(item.createdAt)}</span>
        </div>
      </div>

      {content.details.length > 0 ? (
        <dl className="mt-4 grid gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {content.details.map((detail) => (
            <div key={`${item.id}-${detail.label}`}>
              <dt className="text-xs font-medium text-slate-500">{detail.label}</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">{detail.value}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item.message}</p>
      )}

      {content.note ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Catatan</p>
          <p className="mt-1 text-sm leading-6 text-amber-950">{content.note}</p>
        </div>
      ) : null}

      {content.instruction ? (
        <div className="mt-3 rounded-lg border border-teal-100 bg-teal-50 p-3 text-sm leading-6 text-teal-900">
          {content.instruction}
        </div>
      ) : null}

      {item.deliveryError ? (
        <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-xs font-medium text-rose-700">{item.deliveryError}</p>
      ) : null}
    </section>
  );
}

function parseNotificationMessage(message: string) {
  const normalized = normalizeMessage(message);
  const lines = normalized
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const detailIndex = lines.findIndex((line) => line.toLowerCase() === "detail izin:");
  const noteIndex = lines.findIndex((line) => line.toLowerCase() === "catatan:");
  const introEnd = detailIndex >= 0 ? detailIndex : noteIndex >= 0 ? noteIndex : 1;
  const intro = lines.slice(0, introEnd).join(" ") || message;

  const detailsEnd = noteIndex >= 0 ? noteIndex : lines.length;
  const details = (detailIndex >= 0 ? lines.slice(detailIndex + 1, detailsEnd) : [])
    .filter((line) => line.startsWith("- "))
    .map((line) => line.slice(2))
    .map((line) => {
      const separator = line.indexOf(":");
      if (separator < 0) return null;
      return {
        label: line.slice(0, separator).trim(),
        value: line.slice(separator + 1).trim()
      };
    })
    .filter((detail): detail is { label: string; value: string } => Boolean(detail?.label && detail?.value));

  const note = noteIndex >= 0 ? lines[noteIndex + 1] : "";
  const instructionStart = noteIndex >= 0 ? noteIndex + (note ? 2 : 1) : detailIndex >= 0 ? detailsEnd : 1;
  const instruction = lines.slice(instructionStart).filter((line) => !line.startsWith("- ")).join(" ");

  return { intro, details, note, instruction };
}

function normalizeMessage(message: string) {
  if (message.includes("\n")) return message;
  return message
    .replace(/\s+Detail izin:\s*/i, "\n\nDetail izin:\n")
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/\s+Catatan:\s*/i, "\n\nCatatan:\n");
}

function channelLabel(channel: string) {
  const labels: Record<string, string> = {
    EMAIL: "Email",
    WHATSAPP: "WhatsApp",
    IN_APP: "Sistem"
  };
  return labels[channel] ?? channel;
}

function deliveryLabel(status: Notification["deliveryStatus"]) {
  const labels = {
    PENDING: "Menunggu",
    SENT: "Terkirim",
    FAILED: "Gagal",
    DISABLED: "Nonaktif",
    NO_EMAIL: "Email belum ada",
    NO_PHONE: "Nomor WA belum ada"
  };
  return labels[status];
}

function deliveryClass(status: Notification["deliveryStatus"]) {
  const classes = {
    PENDING: "bg-amber-100 text-amber-800",
    SENT: "bg-emerald-100 text-emerald-800",
    FAILED: "bg-rose-100 text-rose-800",
    DISABLED: "bg-slate-200 text-slate-700",
    NO_EMAIL: "bg-orange-100 text-orange-800",
    NO_PHONE: "bg-orange-100 text-orange-800"
  };
  return classes[status];
}
