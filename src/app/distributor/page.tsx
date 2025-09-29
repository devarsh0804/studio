
"use client";

import { useState, useEffect } from "react";
import { DistributorView } from "./components/DistributorView";
import { DistributorLogin, type DistributorRegisterCredentials } from "./components/DistributorLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";
import { getAllLots, loginUser, registerUser } from "../actions";
import type { Lot, User } from "@/lib/types";
import { Loader2 } from "lucide-react";

export default function DistributorPage() {
  const [distributor, setDistributor] = useState<User | null>(null);
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

  const handleLogin = async (credentials: Omit<DistributorRegisterCredentials, 'email' | 'mobile'>) => {
    const result = await loginUser({
      role: 'distributor',
      name: credentials.name,
      accessCode: credentials.code
    });

    if (result.success && result.user) {
      setDistributor(result.user);
      toast({
        title: t('login.success'),
        description: t('login.welcomeBack', { name: result.user.name }),
      });
    } else {
      toast({
        variant: "destructive",
        title: t('login.failed'),
        description: result.message,
      });
    }
  };

  const handleRegister = async (credentials: DistributorRegisterCredentials) => {
      const result = await registerUser({
          role: 'distributor',
          name: credentials.name,
          accessCode: credentials.code,
          email: credentials.email,
          mobile: credentials.mobile,
      });

      toast({
          title: result.success ? "Registration Successful" : "Registration Failed",
          description: result.message,
          variant: result.success ? "default" : "destructive",
      });

      return result.success;
  }

  const handleLogout = () => {
    setDistributor(null);
    toast({
        title: t('login.logout'),
        description: t('login.logoutSuccess')
    })
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
          <DistributorLogin onLogin={handleLogin} onRegister={handleRegister} />
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="animate-spin w-12 h-12" />
          </div>
        ) : (
          <DistributorView 
            distributorId={distributor.name}
            allLots={lots}
            onLotUpdate={refreshAllLots}
           />
        )}
      </main>
    </>
  );
}
