"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { QrCodeDisplay } from "./QrCodeDisplay";
import { useAgriChainStore }from "@/hooks/use-agrichain-store";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { RegisterCropForm } from "./RegisterCropForm";
import { RegisteredLotsList } from "./RegisteredLotsList";


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
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <RegisterCropForm onRegister={handleRegister} />
        <RegisteredLotsList />
      </div>
    </div>
  );
}
