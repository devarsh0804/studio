"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { RegisterCropForm } from "./RegisterCropForm";
import { QrCodeDisplay } from "./QrCodeDisplay";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";

export function FarmerView() {
  const [registeredLot, setRegisteredLot] = useState<Lot | null>(null);
  const addLot = useAgriChainStore((state) => state.addLot);

  const handleRegister = (lot: Lot) => {
    addLot(lot);
    setRegisteredLot(lot);
  };

  const handleRegisterNew = () => {
    setRegisteredLot(null);
  }

  return (
    <div className="max-w-4xl mx-auto">
      {registeredLot ? (
        <QrCodeDisplay lot={registeredLot} onRegisterNew={handleRegisterNew} />
      ) : (
        <RegisterCropForm onRegister={handleRegister} />
      )}
    </div>
  );
}
