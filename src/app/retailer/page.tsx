"use client";

import { useState } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import RolesLayout from "../(roles)/layout";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const [retailer, setRetailer] = useState<RetailerLoginCredentials | null>(null);
  const { toast } = useToast();

  const handleLogin = (credentials: RetailerLoginCredentials) => {
    if (credentials.storeName === VALID_CREDENTIALS.storeName && credentials.storeCode === VALID_CREDENTIALS.storeCode) {
      setRetailer(credentials);
      toast({
        title: "Login Successful",
        description: `Welcome to ${credentials.storeName}!`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  const handleLogout = () => {
    setRetailer(null);
  };

  return (
    <RolesLayout>
      <PageHeader 
        title="Retailer"
        description={retailer ? "Scan a lot to view its history and manage retail inventory." : "Please log in to continue."}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!retailer ? (
          <RetailerLogin onLogin={handleLogin} />
        ) : (
          <RetailerView retailerId={retailer.storeName} onLogout={handleLogout} />
        )}
      </main>
    </RolesLayout>
  );
}
