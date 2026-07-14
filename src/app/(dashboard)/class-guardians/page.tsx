import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function ClassGuardiansPage() {
  return <SimpleCrudPage title="Data Wali Kelas" endpoint="/class-guardians" columns={["pengurusName", "className", "academicYear"]} fields={[
    { name: "pengurusId", label: "Pengurus", source: { endpoint: "/pengurus", labelKeys: ["name", "position"] } },
    { name: "classId", label: "Kelas", source: { endpoint: "/classes", labelKeys: ["name", "schoolYear"] } },
    { name: "academicYearId", label: "Tahun Ajaran", source: { endpoint: "/academic-years", labelKey: "period" } }
  ]} />;
}
