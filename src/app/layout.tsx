import type { Metadata } from "next";
import { ToastProvider } from "@/components/ui/ToastProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "SIPESA SMP POMOSDA",
  description: "Sistem Informasi Perizinan Santri"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body><ToastProvider>{children}</ToastProvider></body>
    </html>
  );
}
