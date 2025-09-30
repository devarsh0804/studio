
"use client";

import { useState } from "react";
import { FarmerView } from "./components/FarmerView";
import { FarmerLogin, type FarmerLoginCredentials, type FarmerRegisterCredentials } from "./components/FarmerLogin";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/PageHeader";
import { useLocale } from "@/hooks/use-locale";
import { getLotsByFarmer, loginUser, registerUser } from "../actions";
import type { Lot, User } from "@/lib/types";

export default function FarmerPage() {
  const [farmer, setFarmer] = useState<User | null>(null);
  const [lots, setLots] = useState<Lot[]>([]);
  const { toast } = useToast();
  const { t } = useLocale();

  const handleLogin = async (credentials: FarmerLoginCredentials) => {
    const result = await loginUser({
      role: 'farmer',
      mobile: credentials.mobile,
      accessCode: credentials.farmerCode
    });
    
    if (result.success && result.user) {
      setFarmer(result.user);
      const farmerLots = await getLotsByFarmer(result.user.name);
      setLots(farmerLots);
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

  const handleRegister = async (credentials: FarmerRegisterCredentials) => {
    const result = await registerUser({
      role: 'farmer',
      name: credentials.farmerName,
      identifier: credentials.farmerId,
      accessCode: credentials.farmerCode,
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
    setFarmer(null);
    setLots([]);
    toast({
        title: t('login.logout'),
        description: t('login.logoutSuccess')
    })
  }

  const onLotRegistered = (newLot: Lot) => {
    setLots(prevLots => [newLot, ...prevLots]);
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
          <FarmerLogin onLogin={handleLogin} onRegister={handleRegister} />
        ) : (
          <FarmerView farmerName={farmer.name} registeredLots={lots} onLotRegistered={onLotRegistered}/>
        )}
      </main>
    </>
  );
}
