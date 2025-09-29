
"use client";

import { useState } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const [distributor, setDistributor] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  const handleLogin = (credentials: DistributorLoginCredentials) => {
    if (credentials.name === VALID_CREDENTIALS.name && credentials.code === VALID_CREDENTIALS.code) {
      setDistributor(credentials.name);
      toast({
        title: t('login.success'),
        description: t('login.welcomeBack', { name: credentials.name }),
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
    setDistributor(null);
    toast({
        title: t('login.logout'),
        description: t('login.logoutSuccess')
    })
  }

  return (
    <>
      <PageHeader 
        title={t('pageHeaders.distributor.title')}
        description={t('pageHeaders.distributor.description')}
        isLoggedIn={!!distributor}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!distributor ? (
          <DistributorLogin onLogin={handleLogin} />
        ) : (
          <DistributorView distributorId={distributor} />
        )}
      </main>
    </>
  );
}
