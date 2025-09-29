
"use client";

import { useState, useEffect } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";
import type { Lot } from "@/lib/types";
import { getAllLots, getLot } from "../actions";
import { Loader2 } from "lucide-react";


// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  storeName: "retail",
  storeCode: "5678"
};

export default function RetailerPage() {
  const [retailer, setRetailer] = useState<string | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLocale();

  useEffect(() => {
    async function fetchLots() {
        setLoading(true);
        const allLots = await getAllLots();
        setLots(allLots);
        setLoading(false);
    }
    fetchLots();
  }, []);

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

  const refreshLots = async () => {
      const allLots = await getAllLots();
      setLots(allLots);
  };

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
        ) : loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        ) : (
          <RetailerView 
            retailerId={retailer} 
            allLots={lots}
            onLotUpdate={refreshLots}
            />
        )}
      </main>
    </>
  );
}
