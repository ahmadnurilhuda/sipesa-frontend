import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function RoomGuardiansPage() {
  return <SimpleCrudPage title="Data Wali Kamar" endpoint="/room-guardians" columns={["pengurusName", "roomName", "academicYear"]} fields={[
    { name: "pengurusId", label: "Pengurus", source: { endpoint: "/pengurus", labelKeys: ["name", "position"] } },
    { name: "roomId", label: "Kamar", source: { endpoint: "/rooms", labelKeys: ["name", "building"] } },
    { name: "academicYearId", label: "Tahun Ajaran", source: { endpoint: "/academic-years", labelKey: "period" } }
  ]} />;
}
