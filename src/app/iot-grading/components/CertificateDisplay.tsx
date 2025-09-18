"use client";

import { useRef } from "react";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Download, ChevronsRight } from "lucide-react";
import type { GradedLot } from "@/lib/types";
import { LotDetailsCard } from "@/components/LotDetailsCard";

interface CertificateDisplayProps {
  lot: GradedLot;
  onGradeNew: () => void;
}

export function CertificateDisplay({ lot, onGradeNew }: CertificateDisplayProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  const downloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${lot.lotId}-CERTIFICATE.png`;
        a.click();
      }
    }
  };
  
  // Cast GradedLot to Lot for the details card, as it expects a price.
  const lotForDisplay = { ...lot, price: 0, owner: 'N/A' };

  return (
    <div className="space-y-8">
      <Card className="text-center">
        <CardHeader>
          <CardTitle className="text-2xl text-primary">Digital Certificate Generated!</CardTitle>
          <CardDescription>
            Provide this Lot ID and QR code to the farmer for them to register on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div ref={qrRef} className="p-4 bg-white rounded-lg inline-block">
            <QRCode
              value={lot.lotId}
              size={256}
              level={"H"}
              includeMargin={true}
            />
          </div>
          <div>
              <p className="text-sm text-muted-foreground">Lot ID</p>
              <p className="font-mono text-lg font-bold">{lot.lotId}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
            <Button onClick={downloadQR} className="w-full" variant="secondary">
              <Download className="mr-2 h-4 w-4" /> Download / Print
            </Button>
            <Button onClick={onGradeNew} className="w-full">
              Start New Grading Session <ChevronsRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <LotDetailsCard lot={lotForDisplay} />

    </div>
  );
}
