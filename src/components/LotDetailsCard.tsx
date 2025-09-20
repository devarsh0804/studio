
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import { BadgeIndianRupee, Calendar, Fingerprint, MapPin, ShieldCheck, Tractor } from "lucide-react";
import { CertificateDialog } from "./CertificateDialog";
import { Button } from "./ui/button";
import Image from "next/image";

interface LotDetailsCardProps {
  lot: Lot;
  children?: React.ReactNode; 
  showImage?: boolean;
}

export function LotDetailsCard({ lot, children, showImage = true }: LotDetailsCardProps) {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        {showImage && (
          <div className="relative aspect-[5/3] w-full">
            <Image
              src={lot.photoUrl}
              alt={lot.cropName}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        )}
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl">{lot.cropName}</CardTitle>
              <CardDescription className="flex items-center gap-2 pt-1"><Tractor className="w-4 h-4"/>{lot.farmer}</CardDescription>
            </div>
             <div className="text-right">
                <p className="font-mono text-xs bg-muted text-muted-foreground rounded px-2 py-1">{lot.lotId}</p>
                <p className="text-xs text-muted-foreground mt-1 flex items-center justify-end gap-1"><MapPin className="w-3 h-3"/>{lot.location}</p>
             </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm">
           <div className="border-t pt-4">
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-muted-foreground">Price per quintal</p>
                        <p className="font-bold text-lg flex items-center"><BadgeIndianRupee className="w-4 h-4 mr-1"/>{lot.price.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-muted-foreground">Total Weight</p>
                        <p className="font-bold text-lg">{lot.weight} q</p>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                <p className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Harvested: {lot.harvestDate}</p>
                 <p className="flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-primary"/> Grade: <span className="font-semibold text-primary">{lot.quality}</span></p>
            </div>
            
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4 border-t mt-auto">
          {children || (
            <Button variant="secondary" className="w-full" onClick={() => setIsCertificateOpen(true)}>
                <Fingerprint className="mr-2" /> View Certificate
            </Button>
          )}
        </CardFooter>
      </Card>

      <CertificateDialog 
        isOpen={isCertificateOpen} 
        onOpenChange={setIsCertificateOpen} 
        lot={lot}
      />
    </>
  );
}
