import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function UsersPage() {
  return <SimpleCrudPage title="Data Pengguna" endpoint="/users" columns={["name", "username", "email", "phone", "role", "active"]} fields={[
    { name: "name", label: "Nama" },
    { name: "username", label: "Username" },
    { name: "email", label: "Email", type: "email" },
    { name: "phone", label: "Nomor WhatsApp" },
    { name: "password", label: "Password", type: "password" },
    { name: "role", label: "Role", type: "select", options: [
      { label: "Admin", value: "ADMIN" },
      { label: "Wali Santri", value: "WALI_SANTRI" },
      { label: "Wali Kelas", value: "WALI_KELAS" },
      { label: "Wali Kamar", value: "WALI_KAMAR" },
      { label: "Keamanan", value: "KEAMANAN" },
      { label: "Kaur Asrama", value: "KAUR_ASRAMA" }
    ] },
    { name: "active", label: "Aktif", type: "checkbox" }
  ]} />;
}
