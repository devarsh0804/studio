
"use client";

import { useState } from "react";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/use-user-store";
import { PageHeader } from "@/components/PageHeader";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const { user, setUser } = useUserStore();
  const { toast } = useToast();

  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setUser({name: credentials.farmerName, id: credentials.farmerId, role: 'FARMER'});
      toast({
        title: "Login Successful",
        description: `Welcome back, ${credentials.farmerName}!`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
      });
    }
  };

  return (
    <>
      <PageHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
      {!user || user.role !== 'FARMER' ? (
        <FarmerLogin onLogin={handleLogin} />
      ) : (
        <FarmerView farmerName={user.name} />
      )}
      </main>
    </>
  );
}
