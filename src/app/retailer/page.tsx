"use client";

import { useState } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { useToast } from "@/hooks/use-toast";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const [retailer, setRetailer] = useState<{ storeName: string; storeCode: string } | null>(null);
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
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
  };

  return (
    <>
      {!retailer ? (
        <RetailerLogin onLogin={handleLogin} />
      ) : (
        <RetailerView retailerId={retailer.storeName} onLogout={handleLogout} />
      )}
    </>
  );
}
