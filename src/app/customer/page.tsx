
import { PageHeader } from "@/components/PageHeader";
import { CustomerView } from "./components/CustomerView";

export default function CustomerPage() {
  return (
    <>
      <PageHeader 
        title="Customer"
        description="Scan a product's QR code to see its complete journey from the farm to you."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <CustomerView />
      </main>
    </>
  );
}
