
"use client";

import { useEffect } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useUserStore } from "@/hooks/use-user-store";


// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const { user, setUser, clearUser } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role !== 'RETAILER') {
      clearUser();
    }
  }, [user, clearUser]);

  const handleLogin = (credentials: RetailerLoginCredentials) => {
    if (credentials.storeName === VALID_CREDENTIALS.storeName && credentials.storeCode === VALID_CREDENTIALS.storeCode) {
      setUser({name: credentials.storeName, id: credentials.storeCode, role: 'RETAILER'});
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

  const currentRetailer = user && user.role === 'RETAILER' ? user : null;

  return (
    <div className="flex-grow container mx-auto p-4 md:p-8">
      {!currentRetailer ? (
        <RetailerLogin onLogin={handleLogin} />
      ) : (
        <RetailerView retailerId={currentRetailer.name} />
      )}
    </div>
  );
}
