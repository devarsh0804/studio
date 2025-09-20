"use client";

import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/hooks/use-user-store";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const { user, setUser, clearUser } = useUserStore();
  const { toast } = useToast();
  
  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setUser({ name: credentials.farmerName, id: credentials.farmerId, role: 'FARMER' });
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
    clearUser();
     toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
  };

  const farmerUser = user && user.role === 'FARMER' ? { farmerName: user.name, farmerId: user.id, farmerCode: '' } : null;

  return (
    <>
      {!farmerUser ? (
        <FarmerLogin onLogin={handleLogin} />
      ) : (
        <FarmerView onLogout={handleLogout} farmerName={farmerUser.farmerName}/>
      )}
    </>
  );
}
