"use client";

import { useState } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const [distributor, setDistributor] = useState<{ name: string; code: string} | null>(null);
  const { toast } = useToast();

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setDistributor({ name: credentials.name, code: credentials.code });
      toast({
        title: "Login Successful",
        description: `Welcome back, ${credentials.name}!`,
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
    setDistributor(null);
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
  };

  return (
    <>
      {!distributor ? (
        <DistributorLogin onLogin={handleLogin} />
      ) : (
        <DistributorView distributorId={distributor.name} onLogout={handleLogout} />
      )}
    </>
  );
}
