"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import type { Lot } from "@/lib/types";
import { QrCodeDisplay } from "./QrCodeDisplay";
import { useAgriChainStore }from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const RegisteredLotsList = dynamic(() => import('./RegisteredLotsList').then(mod => mod.RegisteredLotsList), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Registered Lots</CardTitle>
        <CardDescription>
            View the details of all your registered crop lots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  )
});

const RegisterCropFormWithPersistence = dynamic(() => import('./RegisterCropFormWithPersistence').then(mod => mod.RegisterCropFormWithPersistence), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
         <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
});

interface FarmerViewProps {
  onLogout: () => void;
}

export function FarmerView({ onLogout }: FarmerViewProps) {
  const [registeredLot, setRegisteredLot] = useState<Lot | null>(null);
  const { addLot } = useAgriChainStore();

  const handleRegister = (lot: Lot) => {
    addLot(lot);
    setRegisteredLot(lot);
  };

  const handleRegisterNew = () => {
    setRegisteredLot(null);
  };
  
  if (registeredLot) {
    return <QrCodeDisplay lot={registeredLot} onRegisterNew={handleRegisterNew} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      <RegisterCropFormWithPersistence onRegister={handleRegister} />
      <RegisteredLotsList />
    </div>
  );
}
