import { SimpleCrudPage } from "@/components/tables/SimpleCrudPage";

export default function RoomsPage() {
  return <SimpleCrudPage title="Data Kamar" endpoint="/rooms" columns={["name", "building"]} fields={[
    { name: "name", label: "Nama Kamar" },
    { name: "building", label: "Gedung", required: false }
  ]} />;
}
