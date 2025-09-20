
"use client";

import { useEffect } from "react";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useUserStore } from "@/hooks/use-user-store";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const { user, setUser, clearUser } = useUserStore();
  const { toast } = useToast();

  // Clear user on initial mount if they are not a farmer, just in case
  useEffect(() => {
    if (user && user.role !== 'FARMER') {
      clearUser();
    }
  }, [user, clearUser]);

  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setUser({
        name: credentials.farmerName, 
        id: credentials.farmerId, 
        role: 'FARMER'
      });
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

  const currentFarmer = user && user.role === 'FARMER' ? user : null;

  return (
    <>
      <PageHeader />
      <main className="flex-grow container mx-auto p-4 md:p-8">
      {!currentFarmer ? (
        <FarmerLogin onLogin={handleLogin} />
      ) : (
        <FarmerView farmerName={currentFarmer.name}/>
      )}
      </main>
    </>
  );
}
