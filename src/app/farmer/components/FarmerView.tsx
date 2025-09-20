
"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { QrCodeDialog } from "./QrCodeDisplay";
import { useAgriChainStore }from "@/hooks/use-agrichain-store";
import { RegisterCropForm } from "./RegisterCropForm";
import { RegisteredLotsList } from "./RegisteredLotsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck2, List, LineChart } from "lucide-react";
import { FarmerAnalytics } from "./FarmerAnalytics";


interface FarmerViewProps {
  farmerName: string;
}

export function FarmerView({ farmerName }: FarmerViewProps) {
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
    <div className="space-y-6">
       <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="register">
                    <FileCheck2 className="mr-2"/> Register New Lot
                </TabsTrigger>
                <TabsTrigger value="lots">
                    <List className="mr-2"/> Your Registered Lots
                </TabsTrigger>
                <TabsTrigger value="analytics">
                    <LineChart className="mr-2"/> Analytics
                </TabsTrigger>
            </TabsList>
            <TabsContent value="register">
                 <RegisterCropForm onRegister={handleRegister} farmerName={farmerName} />
            </TabsContent>
            <TabsContent value="lots">
                <RegisteredLotsList />
            </TabsContent>
            <TabsContent value="analytics">
                <FarmerAnalytics farmerName={farmerName} />
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
