import { QrScanner } from "@/components/scanner/QrScanner";

export default function SecurityScanPage() {
  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-ink">Scan QR Keamanan</h1>
      <QrScanner />
    </div>
  );
}
