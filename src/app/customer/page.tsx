import { PageHeader } from "@/components/PageHeader";
import { CustomerView } from "./components/CustomerView";
import RolesLayout from "../(roles)/layout";

export default function CustomerPage() {
  return (
    <RolesLayout>
      <PageHeader 
        title="Customer"
        description="Scan a product's QR code to see its complete journey from the farm to you."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <CustomerView />
      </main>
    </RolesLayout>
  );
}
