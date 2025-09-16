"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import RolesLayout from "../(roles)/layout";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  mandiName: "apmc",
  officerName: "officer1",
  code: "7890"
};

export default function FarmerPage() {
  const [farmerUser, setFarmerUser] = useState<FarmerLoginCredentials | null>(null);
  const { toast } = useToast();
  
  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.mandiName === VALID_CREDENTIALS.mandiName &&
      credentials.officerName === VALID_CREDENTIALS.officerName &&
      credentials.code === VALID_CREDENTIALS.code
    ) {
      setFarmerUser(credentials);
      toast({
        title: "Login Successful",
        description: `Welcome back, ${credentials.officerName}!`,
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
    setFarmerUser(null);
     toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
  };

  return (
    <RolesLayout>
      <PageHeader 
        title="Farmer / Sahayak"
        description={farmerUser ? "Register your new crop lot and generate a unique tracking QR code." : "Please log in to continue."}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!farmerUser ? (
          <FarmerLogin onLogin={handleLogin} />
        ) : (
          <FarmerView onLogout={handleLogout} />
        )}
      </main>
    </RolesLayout>
  );
}
