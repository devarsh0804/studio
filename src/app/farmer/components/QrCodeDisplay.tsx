"use client";

import { useRef } from "react";
import QRCode from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, ChevronsRight } from "lucide-react";
import type { Lot } from "@/lib/types";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface QrCodeDialogProps {
  lot: Lot | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QrCodeDialog({ lot, isOpen, onClose }: QrCodeDialogProps) {
  const qrRef = useRef<HTMLDivElement>(null);

  if (!lot) return null;

  const downloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector("canvas");
      if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${lot.lotId}.png`;
        a.click();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl text-center">
            <DialogHeader>
                <DialogTitle className="text-2xl text-primary">Lot Registered Successfully!</DialogTitle>
                <DialogDescription>
                    This QR code is now ready for the next stage in the supply chain.
                </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col md:flex-row items-center gap-6 py-4">
                <div className="flex-1 space-y-4">
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
                </div>

                <div className="flex-1 w-full max-w-sm">
                    <LotDetailsCard lot={lot} />
                </div>
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
                 <Button onClick={downloadQR} className="w-full" variant="secondary">
                    <Download className="mr-2 h-4 w-4" /> Download / Print QR
                </Button>
                <Button onClick={onClose} className="w-full">
                    Done <ChevronsRight className="ml-2 h-4 w-4" />
                </Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
  );
}
