import { PageHeader } from "@/components/PageHeader";
import RolesLayout from "@/app/(roles)/layout";
import { TransportView } from "../components/TransportView";

export default function DistributorTransportPage() {
  return (
    <RolesLayout>
      <PageHeader 
        title="Distributor Transport"
        description="Scan a lot and add transport & storage information."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <TransportView />
      </main>
    </RolesLayout>
  );
}
