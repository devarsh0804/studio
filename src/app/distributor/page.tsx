import { PageHeader } from "@/components/PageHeader";
import { DistributorView } from "./components/DistributorView";

export default function DistributorPage() {
  return (
    <>
      <PageHeader 
        title="Distributor"
        description="Scan a lot's QR code to add transportation and storage information."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <DistributorView />
      </main>
    </>
  );
}
