
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import type { Lot } from "@/lib/types";
import { Award, Droplets, Microscope, Palette, Ruler, Calendar, Fingerprint, Tractor, Download, QrCode } from "lucide-react";
import { format, isValid } from "date-fns";
import { Button } from "./ui/button";
import QRCode from "qrcode.react";

interface CertificateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lot: Lot;
}

export function CertificateDialog({ isOpen, onOpenChange, lot }: CertificateDialogProps) {
  const gradingDate = lot.gradingDate ? new Date(lot.gradingDate) : null;
  const transactionId = `0x${[...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const downloadQR = () => {
    const canvas = document.getElementById(`cert-qr-${lot.lotId}`) as HTMLCanvasElement;
    if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `QR-${lot.lotId}.png`;
        a.click();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <Fingerprint className="mr-3 w-7 h-7 text-primary"/> Digital Grading Certificate
          </DialogTitle>
          <DialogDescription className="font-mono text-primary pt-1">{lot.lotId}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 py-4">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2"><Tractor/> Farmer & Crop Details</h3>
                <p><strong>Farmer:</strong> {lot.farmer}</p>
                <p><strong>Crop:</strong> {lot.cropName}</p>
                <p><strong>Issued By:</strong> Mandi Officer / IoT Sensor System</p>
                <p><strong>Blockchain TxID:</strong> <span className="font-mono text-xs break-all">{transactionId}</span></p>
            </div>
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quality Analysis</h3>
                 <div className="flex items-start">
                    <Award className="w-5 h-5 mr-3 mt-1 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Final Grade</p>
                        <p className="font-bold text-xl text-primary">{lot.quality}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Droplets className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Moisture Content</p>
                        <p className="font-medium">{lot.moisture || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Palette className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Color Check</p>
                        <p className="font-medium">{lot.color || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Grading Date</p>
                        <p className="font-medium">{gradingDate && isValid(gradingDate) ? format(gradingDate, 'PPp') : 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter className="border-t pt-4 flex-col md:flex-row items-center justify-between w-full">
            <div className="flex items-center gap-4">
                <div className="p-1 bg-white rounded-md">
                     <QRCode value={lot.lotId} size={64} id={`cert-qr-${lot.lotId}`} />
                </div>
                <Button variant="secondary" onClick={downloadQR}>
                    <Download className="mr-2"/> Download QR
                </Button>
            </div>
            <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
