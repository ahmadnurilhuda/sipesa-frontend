import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function SemestersPage() {
  return <SimpleCrudPage title="Semester" endpoint="/semesters" columns={["academicYear", "name", "startDate", "endDate", "maxPermissionDays", "active"]} fields={[
    { name: "academicYearId", label: "Tahun Ajaran", source: { endpoint: "/academic-years", labelKey: "period" } },
    { name: "name", label: "Semester", type: "select", options: [
      { label: "Ganjil", value: "GANJIL" },
      { label: "Genap", value: "GENAP" }
    ] },
    { name: "startDate", label: "Tanggal Mulai", type: "date" },
    { name: "endDate", label: "Tanggal Selesai", type: "date" },
    { name: "maxPermissionDays", label: "Batas Izin per Semester (hari)", type: "number" },
    { name: "active", label: "Aktif", type: "checkbox" }
  ]} />;
}
