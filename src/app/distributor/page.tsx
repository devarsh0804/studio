"use client";

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
  const { toast } = useToast();

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setUser({ name: credentials.name, id: credentials.name, role: 'DISTRIBUTOR' });
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
        description: "You have been successfully logged out.",
    });
  };
  
  const distributor = user && user.role === 'DISTRIBUTOR' ? { name: user.name, code: ''} : null;

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
