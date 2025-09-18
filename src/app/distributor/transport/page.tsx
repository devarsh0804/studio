
import { PageHeader } from "@/components/PageHeader";
import { TransportView } from "../components/TransportView";

export default function DistributorTransportPage() {
  return (
    <>
      <PageHeader 
        title="Distributor Transport"
        description="Scan a lot and add transport & storage information."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <TransportView />
      </main>
    </>
  );
}

    