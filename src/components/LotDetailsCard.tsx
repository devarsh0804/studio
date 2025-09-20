
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { Box, Calendar, Wheat, Weight, BadgeIndianRupee, User, Milestone, MapPin, FileText } from "lucide-react";
import { CertificateDialog } from "./CertificateDialog";
import { Button } from "./ui/button";

interface LotDetailsCardProps {
  lot: Lot;
  children?: React.ReactNode; // For action buttons
}

export function LotDetailsCard({ lot, children }: LotDetailsCardProps) {
  const cropImage = placeHolderImages.find(p => p.id === 'crop1');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center text-xl">
                <Box className="mr-2" /> {lot.cropName}
              </CardTitle>
              <CardDescription className="font-mono text-primary pt-1">{lot.lotId}</CardDescription>
            </div>
             <div className="text-right">
                <p className="text-xs text-muted-foreground">Owner</p>
                <p className="font-medium text-sm flex items-center justify-end gap-2"><Milestone className="w-3 h-3" /> {lot.owner}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm">
          {cropImage && (
              <div className="relative aspect-[16/9] w-full rounded-md overflow-hidden mb-4">
                <Image
                src={cropImage.imageUrl}
                alt={cropImage.description}
                fill
                className="object-cover"
                data-ai-hint={cropImage.imageHint}
                />
             </div>
          )}
          <div className="flex items-center">
            <User className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="text-muted-foreground">Farmer:</span>
            <span className="font-medium ml-2">{lot.farmer}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium ml-2">{lot.location}</span>
          </div>
          <div className="flex items-center">
            <Weight className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="text-muted-foreground">Weight:</span>
            <span className="font-medium ml-2">{lot.weight} q</span>
          </div>
          <div className="flex items-center">
            <BadgeIndianRupee className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium ml-2">{lot.price}/q</span>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
            <span className="text-muted-foreground">Harvested:</span>
            <span className="font-medium ml-2">{lot.harvestDate}</span>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4">
          <Button variant="secondary" className="w-full" onClick={() => setIsCertificateOpen(true)}>
            <FileText className="mr-2" /> View Certificate
          </Button>
          {children && <div className="w-full">{children}</div>}
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
