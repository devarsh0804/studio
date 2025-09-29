
"use client";

import { useState } from "react";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  farmerName: "Ramesh",
  farmerId: "123456789012",
  farmerCode: "7890"
};

export default function FarmerPage() {
  const [farmer, setFarmer] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  const handleLogin = (credentials: FarmerLoginCredentials) => {
    if (
      credentials.farmerName === VALID_CREDENTIALS.farmerName &&
      credentials.farmerId === VALID_CREDENTIALS.farmerId &&
      credentials.farmerCode === VALID_CREDENTIALS.farmerCode
    ) {
      setFarmer(credentials.farmerName);
      toast({
        title: t('login.success'),
        description: t('login.welcomeBack', { name: credentials.farmerName }),
      });
    } else {
      toast({
        variant: "destructive",
        title: t('login.failed'),
        description: t('login.invalidCredentials'),
      });
    }
  };
  
  const handleLogout = () => {
    setFarmer(null);
    toast({
        title: t('login.logout'),
        description: t('login.logoutSuccess')
    })
  }

  return (
    <>
      <PageHeader 
        title={t('pageHeaders.farmer.title')}
        description={t('pageHeaders.farmer.description')}
        isLoggedIn={!!farmer}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!farmer ? (
          <FarmerLogin onLogin={handleLogin} />
        ) : (
          <FarmerView farmerName={farmer} />
        )}
      </main>
    </>
  );
}
