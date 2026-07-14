import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function StudentsPage() {
  return <SimpleCrudPage title="Data Santri" endpoint="/students" columns={["nis", "name", "gender", "active", "className", "roomName", "parentGuardianName"]} fields={[
    { name: "nis", label: "NIS" },
    { name: "name", label: "Nama" },
    { name: "gender", label: "Jenis Kelamin", type: "select", options: [
      { label: "Laki-laki", value: "L" },
      { label: "Perempuan", value: "P" }
    ] },
    { name: "active", label: "Aktif", type: "checkbox" },
    { name: "classId", label: "Kelas", source: { endpoint: "/classes", labelKeys: ["name", "schoolYear"] } },
    { name: "roomId", label: "Kamar", source: { endpoint: "/rooms", labelKeys: ["name", "building"] } },
    { name: "parentGuardianId", label: "Wali Santri", source: { endpoint: "/parents", labelKeys: ["name", "phone"] } }
  ]} />;
}
