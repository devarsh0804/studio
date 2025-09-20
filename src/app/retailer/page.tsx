"use client";

import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { PageHeader } from "@/components/PageHeader";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/use-user-store";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const { user, setUser, clearUser } = useUserStore();
  const { toast } = useToast();

  const handleLogin = (credentials: RetailerLoginCredentials) => {
    if (credentials.storeName === VALID_CREDENTIALS.storeName && credentials.storeCode === VALID_CREDENTIALS.storeCode) {
      setUser({ name: credentials.storeName, id: credentials.storeName, role: 'RETAILER' });
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
    clearUser();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
    });
  };
  
  const retailer = user && user.role === 'RETAILER' ? { storeName: user.name, storeCode: ''} : null;

  return (
    <>
      <PageHeader 
        title={retailer ? `Welcome, ${retailer.storeName}` : "Retailer"}
        description={retailer ? "Scan a lot to view its history and manage retail inventory." : "Please log in to continue."}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!retailer ? (
          <RetailerLogin onLogin={handleLogin} />
        ) : (
          <RetailerView retailerId={retailer.storeName} onLogout={handleLogout} />
        )}
      </main>
    </>
  );
}
