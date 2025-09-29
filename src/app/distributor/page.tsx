
"use client";

import { useState, useEffect } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorLoginCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";
import { getAllLots, getLot } from "../actions";
import type { Lot } from "@/lib/types";
import { Loader2 } from "lucide-react";

// In a real app, this would come from a secure source
const VALID_CREDENTIALS = {
  name: "distro",
  code: "1234"
};

export default function DistributorPage() {
  const [distributor, setDistributor] = useState<string | null>(null);
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

  const refreshLot = async (lotId: string) => {
      const freshLot = await getLot(lotId);
      if (freshLot) {
          setLots(prev => prev.map(l => l.lotId === lotId ? freshLot : l));
      }
  }
  
  const refreshAllLots = async () => {
      const allLots = await getAllLots();
      setLots(allLots);
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
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        ) : (
          <DistributorView 
            distributorId={distributor}
            allLots={lots}
            onLotUpdate={refreshAllLots}
           />
        )}
      </main>
    </>
  );
}
