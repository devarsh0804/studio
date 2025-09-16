import { PageHeader } from "@/components/PageHeader";
import { RetailerView } from "./components/RetailerView";

export default function RetailerPage() {
  return (
    <>
      <PageHeader 
        title="Retailer"
        description="Scan a lot to view its history and manage retail inventory."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <RetailerView />
      </main>
    </>
  );
}
