"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { QrCodeDialog } from "./QrCodeDisplay";
import { useAgriChainStore }from "@/hooks/use-agrichain-store";
import { Button } from "@/components/ui/button";
import { LogOut, FileCheck2, List } from "lucide-react";
import { RegisterCropForm } from "./RegisterCropForm";
import { RegisteredLotsList } from "./RegisteredLotsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";


interface FarmerViewProps {
  onLogout: () => void;
  farmerName: string;
}

export function FarmerView({ onLogout, farmerName }: FarmerViewProps) {
  const [registeredLot, setRegisteredLot] = useState<Lot | null>(null);
  const { addLot } = useAgriChainStore();
  const [activeTab, setActiveTab] = useState("register");

  const handleRegister = (lot: Lot) => {
    addLot(lot);
    setRegisteredLot(lot);
  };

  const handleDialogClose = () => {
    setRegisteredLot(null);
    setActiveTab("lots");
  };
  

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Farmer Dashboard</h1>
        <Button onClick={onLogout} variant="outline">
          <LogOut className="mr-2" /> Logout
        </Button>
      </div>

       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-12">
                <TabsTrigger value="register">
                    <FileCheck2 className="mr-2"/> Register New Lot
                </TabsTrigger>
                <TabsTrigger value="lots">
                    <List className="mr-2"/> Your Registered Lots
                </TabsTrigger>
            </TabsList>
            <TabsContent value="register">
                 <RegisterCropForm onRegister={handleRegister} farmerName={farmerName} />
            </TabsContent>
            <TabsContent value="lots">
                <RegisteredLotsList />
            </TabsContent>
        </Tabs>
      
      <QrCodeDialog 
        lot={registeredLot} 
        isOpen={!!registeredLot}
        onClose={handleDialogClose}
      />
    </div>
  );
}
