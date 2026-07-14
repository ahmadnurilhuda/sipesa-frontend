import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function StudentRoomHistoriesPage() {
  return <SimpleCrudPage title="Penempatan Kamar Santri" endpoint="/student-room-histories" columns={["studentName", "roomName", "academicYear", "startDate", "endDate", "active"]} fields={[
    { name: "studentId", label: "Santri", source: { endpoint: "/students", labelKeys: ["name", "nis"] } },
    { name: "roomId", label: "Kamar Baru", source: { endpoint: "/rooms", labelKeys: ["name", "building"] } },
    { name: "academicYearId", label: "Tahun Ajaran Awal", source: { endpoint: "/academic-years", labelKey: "period" }, required: false },
    { name: "startDate", label: "Tanggal Mulai", type: "date" },
    { name: "endDate", label: "Tanggal Selesai", type: "date", required: false },
    { name: "active", label: "Aktif", type: "checkbox" }
  ]} />;
}
