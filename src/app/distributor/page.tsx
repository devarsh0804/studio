
"use client";

import { useEffect } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/use-user-store";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const { user, setUser, clearUser } = useUserStore();

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setUser({name: credentials.name, id: credentials.code, role: 'DISTRIBUTOR'});
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
    clearUser();
    toast({
        title: "Logged Out",
        description: "You have been successfully logged out."
    })
  }

  useEffect(() => {
    if (user && user.role !== 'DISTRIBUTOR') {
      clearUser();
    }
  }, [user, clearUser]);

  const distributorUser = user && user.role === 'DISTRIBUTOR' ? user : null;

  return (
    <>
      {!distributorUser ? (
        <DistributorLogin onLogin={handleLogin} />
      ) : (
        <DistributorView distributorId={distributorUser.name} onLogout={handleLogout} />
      )}
    </>
  );
}
