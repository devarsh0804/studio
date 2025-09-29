
"use client";

import { useState, useEffect } from "react";
import { RetailerView } from "./components/RetailerView";
import { RetailerLogin, type RetailerLoginCredentials } from "./components/RetailerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";
import type { Lot, User } from "@/lib/types";
import { getAllLots, loginUser, registerUser } from "../actions";
import { Loader2 } from "lucide-react";


export default function RetailerPage() {
  const [retailer, setRetailer] = useState<User | null>(null);
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

  const handleLogin = async (credentials: RetailerLoginCredentials) => {
    const result = await loginUser({
      role: 'retailer',
      name: credentials.storeName,
      accessCode: credentials.storeCode,
    });

    if (result.success && result.user) {
      setRetailer(result.user);
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

  const handleRegister = async (credentials: RetailerLoginCredentials) => {
    const result = await registerUser({
      role: 'retailer',
      name: credentials.storeName,
      accessCode: credentials.storeCode,
    });

    toast({
        title: result.success ? "Registration Successful" : "Registration Failed",
        description: result.message,
        variant: result.success ? "default" : "destructive",
    });

    return result.success;
  }

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
          <RetailerLogin onLogin={handleLogin} onRegister={handleRegister} />
        ) : loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin w-12 h-12" />
            </div>
        ) : (
          <RetailerView 
            retailerId={retailer.name} 
            allLots={lots}
            onLotUpdate={refreshLots}
            />
        )}
      </main>
    </>
  );
}
