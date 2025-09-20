
"use client";

import { useEffect } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useUserStore } from "@/hooks/use-user-store";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const { user, setUser, clearUser } = useUserStore();
  const { toast } = useToast();

  useEffect(() => {
    if (user && user.role !== 'DISTRIBUTOR') {
      clearUser();
    }
  }, [user, clearUser]);

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setUser({ name: credentials.name, id: credentials.code, role: 'DISTRIBUTOR' });
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

  const currentDistributor = user && user.role === 'DISTRIBUTOR' ? user : null;

  return (
    <div className="flex-grow container mx-auto p-4 md:p-8">
      {!currentDistributor ? (
        <DistributorLogin onLogin={handleLogin} />
      ) : (
        <DistributorView distributorId={currentDistributor.name} />
      )}
    </div>
  );
}
