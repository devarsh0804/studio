"use client";

import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const [farmerUser, setFarmerUser] = useState<FarmerLoginCredentials | null>(null);
  const { toast } = useToast();
  
  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setFarmerUser(credentials);
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
    setFarmerUser(null);
     toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
  };

  return (
    <>
      <PageHeader 
        title={farmerUser ? `Welcome, ${farmerUser.farmerName}` : "Farmer"}
        description={farmerUser ? "Register your new crop lot and generate a unique tracking QR code." : "Please log in to continue."}
      >
        {farmerUser && (
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        )}
      </PageHeader>
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!farmerUser ? (
          <FarmerLogin onLogin={handleLogin} />
        ) : (
          <FarmerView onLogout={handleLogout} farmerName={farmerUser.farmerName}/>
        )}
      </main>
    </>
  );
}
