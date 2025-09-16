"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { RegisterCropForm } from "./RegisterCropForm";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function FarmerView() {
  const { lots, addLot, getAllLots } = useAgriChainStore(
    (state) => ({ lots: state.lots, addLot: state.addLot, getAllLots: state.getAllLots })
  );

  const registeredLots = getAllLots();

  const handleRegister = (lot: Lot) => {
    addLot(lot);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <RegisterCropForm onRegister={handleRegister} />

      {registeredLots.length > 0 && (
          <Card>
              <CardHeader>
                  <CardTitle>Registered Lots</CardTitle>
                  <CardDescription>
                      View the details of all your registered crop lots.
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {registeredLots.map((lot, index) => (
                    <div key={lot.lotId}>
                        {index > 0 && <Separator className="my-6" />}
                        <LotDetailsCard lot={lot} />
                    </div>
                ))}
              </CardContent>
          </Card>
      )}
    </div>
  );
}
