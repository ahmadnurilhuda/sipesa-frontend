import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function AcademicYearsPage() {
  return <SimpleCrudPage title="Tahun Ajaran" endpoint="/academic-years" columns={["period", "active"]} fields={[
    { name: "period", label: "Periode" },
    { name: "active", label: "Aktif", type: "checkbox" }
  ]} />;
}
