
"use client";

import { useState } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const [retailer, setRetailer] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLocale();

  const handleLogin = (credentials: RetailerLoginCredentials) => {
    if (credentials.storeName === VALID_CREDENTIALS.storeName && credentials.storeCode === VALID_CREDENTIALS.storeCode) {
      setRetailer(credentials.storeName);
      toast({
        title: t('login.success'),
        description: t('login.welcomeBack', { name: credentials.storeName }),
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
    setRetailer(null);
    toast({
        title: t('login.logout'),
        description: t('login.logoutSuccess')
    })
  }

  return (
    <>
       <PageHeader 
        title={t('pageHeaders.retailer.title')}
        description={t('pageHeaders.retailer.description')}
        isLoggedIn={!!retailer}
        onLogout={handleLogout}
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        {!retailer ? (
          <RetailerLogin onLogin={handleLogin} />
        ) : (
          <RetailerView retailerId={retailer} />
        )}
      </main>
    </>
  );
}
