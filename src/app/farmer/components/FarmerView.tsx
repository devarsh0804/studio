
"use client";

import { useState } from "react";
import type { Lot } from "@/lib/types";
import { QrCodeDialog } from "./QrCodeDisplay";
import { RegisterCropForm } from "./RegisterCropForm";
import { RegisteredLotsList } from "./RegisteredLotsList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileCheck2, List, User, LineChart as LineChartIcon } from "lucide-react";
import { FarmerAnalytics } from "./FarmerAnalytics";
import { useLocale } from "@/hooks/use-locale";


interface FarmerViewProps {
  farmerName: string;
  registeredLots: Lot[];
  onLotRegistered: (lot: Lot) => void;
}

export function FarmerView({ farmerName, registeredLots, onLotRegistered }: FarmerViewProps) {
  const [registeredLot, setRegisteredLot] = useState<Lot | null>(null);
  const [activeTab, setActiveTab] = useState("register");
  const { t } = useLocale();

  const handleRegister = (lot: Lot) => {
    onLotRegistered(lot);
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
                    <FileCheck2 className="mr-2"/> {t('farmerView.tabs.register')}
                </TabsTrigger>
                <TabsTrigger value="lots">
                    <List className="mr-2"/> {t('farmerView.tabs.lots')}
                </TabsTrigger>
                <TabsTrigger value="analytics">
                    <LineChartIcon className="mr-2"/> {t('farmerView.tabs.analytics')}
                </TabsTrigger>
            </TabsList>
            <TabsContent value="register">
                 <RegisterCropForm onRegister={handleRegister} farmerName={farmerName} />
            </TabsContent>
            <TabsContent value="lots">
                <RegisteredLotsList lots={registeredLots} />
            </TabsContent>
            <TabsContent value="analytics">
                <FarmerAnalytics farmerName={farmerName} lots={registeredLots} />
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
