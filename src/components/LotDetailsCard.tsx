
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import { BadgeIndianRupee, Calendar, CheckCircle, Fingerprint, MapPin, Milestone, Package, ShieldCheck, Tractor, Waypoints } from "lucide-react";
import { CertificateDialog } from "./CertificateDialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface LotDetailsCardProps {
  lot: Lot;
  children?: React.ReactNode; 
}

export function LotDetailsCard({ lot, children }: LotDetailsCardProps) {
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);

  return (
    <>
      <Card className="flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-xl justify-between">
              <span>{lot.cropName}</span>
              <Badge variant="outline" className="font-mono text-sm">{lot.lotId.split('-').pop()}</Badge>
            </CardTitle>
            <CardDescription className="flex items-center gap-2"><Tractor className="w-4 h-4"/>{lot.farmer} - {lot.location}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-3 text-sm">
            <div className="flex items-center gap-2">
                <Badge variant={lot.quality === 'Premium' ? 'default' : 'secondary'} className="text-sm">
                    <ShieldCheck className="w-4 h-4 mr-2"/>
                    {lot.quality} Grade
                </Badge>
                 <Badge variant="outline">AGMARK Digital <CheckCircle className="w-3 h-3 ml-1 text-primary"/></Badge>
            </div>
            <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                <span className="text-muted-foreground">Certified On:</span>
                <span className="font-medium ml-2">{new Date(lot.gradingDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center text-lg font-bold">
                <BadgeIndianRupee className="w-5 h-5 mr-2 text-muted-foreground" />
                <span>{lot.price}/kg</span>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 pt-4 border-t mt-auto">
          <div className="w-full flex gap-2">
            <Button variant="secondary" className="w-full" onClick={() => setIsCertificateOpen(true)}>
                <Fingerprint /> View Certificate
            </Button>
            <Button variant="outline" className="w-full">
                <Waypoints /> Track Journey
            </Button>
          </div>
           <Button className="w-full mt-2">
            <Package/> Reserve/Buy Lot
          </Button>
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
