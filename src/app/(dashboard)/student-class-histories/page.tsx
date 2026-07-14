import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function StudentClassHistoriesPage() {
  return <SimpleCrudPage title="Penempatan Kelas Santri" endpoint="/student-class-histories" columns={["studentName", "className", "academicYear", "startDate", "endDate", "active"]} fields={[
    { name: "studentId", label: "Santri", source: { endpoint: "/students", labelKeys: ["name", "nis"] } },
    { name: "classId", label: "Kelas Baru", source: { endpoint: "/classes", labelKeys: ["name", "schoolYear"] } },
    { name: "academicYearId", label: "Tahun Ajaran", source: { endpoint: "/academic-years", labelKey: "period" } },
    { name: "startDate", label: "Tanggal Mulai", type: "date" },
    { name: "endDate", label: "Tanggal Selesai", type: "date", required: false },
    { name: "active", label: "Aktif", type: "checkbox" }
  ]} />;
}
