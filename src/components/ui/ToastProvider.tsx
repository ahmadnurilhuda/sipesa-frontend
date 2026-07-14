"use client";

import { CheckCircle2, Info, XCircle } from "lucide-react";
import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from "react";

type ToastType = "success" | "error" | "info";
type Toast = {
  id: number;
  type: ToastType;
  message: string;
};

type ToastContextValue = {
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((type: ToastType, message: string) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current, { id, type, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const value = useMemo(() => ({
    success: (message: string) => show("success", message),
    error: (message: string) => show("error", message),
    info: (message: string) => show("info", message)
  }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div key={toast.id} className={`flex items-start gap-3 rounded-lg p-3 text-sm font-medium text-white shadow-lg ${toastStyle(toast.type)}`}>
            {toastIcon(toast.type)}
            <p className="leading-5">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast harus digunakan di dalam ToastProvider");
  }
  return context;
}

function toastStyle(type: ToastType) {
  if (type === "success") return "bg-emerald-600";
  if (type === "error") return "bg-rose-600";
  return "bg-sky-600";
}

function toastIcon(type: ToastType) {
  if (type === "success") return <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-white" />;
  if (type === "error") return <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-white" />;
  return <Info className="mt-0.5 h-4 w-4 shrink-0 text-white" />;
}
