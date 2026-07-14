import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function ParentsPage() {
  return <SimpleCrudPage title="Data Wali Santri" endpoint="/parents" columns={["name", "phone", "address", "userName", "userEmail", "userPhone"]} fields={[
    { name: "name", label: "Nama Wali Santri" },
    { name: "phone", label: "No. WhatsApp" },
    { name: "address", label: "Alamat", required: false },
    { name: "userId", label: "Akun Login", source: { endpoint: "/users", labelKeys: ["name", "email", "role"] } }
  ]} />;
}
