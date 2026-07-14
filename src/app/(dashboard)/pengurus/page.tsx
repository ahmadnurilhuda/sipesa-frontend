import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function PengurusPage() {
  return <SimpleCrudPage title="Data Pengurus" endpoint="/pengurus" columns={["name", "nip", "phone", "position", "userName", "userPhone"]} fields={[
    { name: "name", label: "Nama" },
    { name: "nip", label: "NIP" },
    { name: "phone", label: "No. Telepon" },
    { name: "position", label: "Jabatan" },
    { name: "userId", label: "Akun Login", source: { endpoint: "/users", labelKeys: ["name", "email", "role"] } }
  ]} />;
}
