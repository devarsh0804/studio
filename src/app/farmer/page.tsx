
"use client";

import { useState } from "react";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const [farmer, setFarmer] = useState<string | null>(null);
  const { toast } = useToast();

  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setFarmer(credentials.farmerName);
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
  
  const handleLogout = () => {
    setFarmer(null);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
  }

  return (
    <>
      <PageHeader 
        title="Farmer Portal"
        description="Register crops, generate digital certificates, and track your sales."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!farmer ? (
          <FarmerLogin onLogin={handleLogin} />
        ) : (
          <FarmerView farmerName={farmer} onLogout={handleLogout}/>
        )}
      </main>
    </>
  );
}
