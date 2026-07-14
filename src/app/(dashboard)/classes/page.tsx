import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function ClassesPage() {
  return <SimpleCrudPage title="Data Kelas" endpoint="/classes" columns={["name", "schoolYear"]} fields={[
    { name: "name", label: "Nama Kelas" },
    { name: "academicYearId", label: "Tahun Ajaran", source: { endpoint: "/academic-years", labelKey: "period" } }
  ]} />;
}
