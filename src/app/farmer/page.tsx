import { PageHeader } from "@/components/PageHeader";
import { FarmerView } from "./components/FarmerView";

export default function FarmerPage() {
  return (
    <>
      <PageHeader 
        title="Farmer / Sahayak"
        description="Register your new crop lot and generate a unique tracking QR code."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <FarmerView />
      </main>
    </>
  );
}
