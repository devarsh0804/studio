"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot, LotHistory, RetailEvent, RetailPack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { History, Loader2, LogOut, PackagePlus, ScanLine, Search, ShoppingBag, Store, XCircle } from "lucide-react";
import QRCode from "qrcode.react";
import { format } from 'date-fns';
import { Timeline } from "@/components/Timeline";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const retailerSchema = z.object({
  shelfDate: z.string().min(1, "Shelf date is required"),
});
type RetailerFormValues = z.infer<typeof retailerSchema>;

const packSchema = z.object({
    packCount: z.coerce.number().int().min(1, "Must create at least 1 pack.").max(100),
});
type PackFormValues = z.infer<typeof packSchema>;

interface RetailerViewProps {
    retailerId: string;
    onLogout: () => void;
}

export function RetailerView({ retailerId, onLogout }: RetailerViewProps) {
  const [history, setHistory] = useState<LotHistory | null>(null);
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [retailPacks, setRetailPacks] = useState<RetailPack[]>([]);

  const { getLotHistory, addRetailEvent, addRetailPacks: savePacks, updateLot, findLot } = useAgriChainStore();
  const { toast } = useToast();

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const retailerForm = useForm<RetailerFormValues>({ resolver: zodResolver(retailerSchema) });
  const packForm = useForm<PackFormValues>({ resolver: zodResolver(packSchema) });

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    
    // The history is based on the original parent lot.
    const historyData = getLotHistory(data.lotId);
    
    // The scanned lot is the actual sub-lot.
    const actualLot = findLot(data.lotId, true);

    setTimeout(() => {
      if (historyData && actualLot) {
        setHistory(historyData);
        setScannedLot(actualLot);
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setHistory(null);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const handleRetailerSubmit: SubmitHandler<RetailerFormValues> = (data) => {
    if (!history || !scannedLot) return;
    setIsSubmitting(true);
    
    // The event is logged against the parent lot for the full timeline
    const newEvent: RetailEvent = { ...data, storeId: retailerId, timestamp: new Date().toISOString() };
    addRetailEvent(history.lot.lotId, newEvent);

    // The sub-lot itself is marked as Delivered
    updateLot(scannedLot.lotId, { status: 'Delivered' });

    toast({ title: "Success!", description: "Retailer details updated." });
    
    // Refresh history
    const updatedHistory = getLotHistory(history.lot.lotId);
    setHistory(updatedHistory);

    setIsSubmitting(false);
    retailerForm.reset();
  };
  
  const handlePackSubmit: SubmitHandler<PackFormValues> = (data) => {
    if (!scannedLot) return;

    const lotWeightInKg = scannedLot.weight * 100; // Convert quintals to kg
    const packs: RetailPack[] = [];
    const packWeight = Number((lotWeightInKg / data.packCount).toFixed(2));

    for (let i = 0; i < data.packCount; i++) {
        packs.push({
            packId: `PACK-${scannedLot.lotId}-${String(i + 1).padStart(3, '0')}`,
            parentLotId: scannedLot.lotId,
            weight: packWeight,
        });
    }
    savePacks(packs);
    setRetailPacks(packs);
    toast({ title: `${data.packCount} retail packs created!` });
  }

  const resetView = () => {
    setHistory(null);
    setError(null);
    setRetailPacks([]);
    scanForm.reset();
    retailerForm.reset();
    packForm.reset();
  }
  
  const getTimelineEvents = () => {
    if (!history) return [];
    const events = [];

    // The timeline is for the original parent lot.
    const parentLot = history.parentLot || history.lot;

    events.push({
      type: 'FARM',
      title: 'Harvested',
      timestamp: format(new Date(parentLot.harvestDate), 'PP'),
      details: <>
        <p><strong>Crop:</strong> {parentLot.cropName}</p>
        <p><strong>Weight:</strong> {parentLot.weight} quintals</p>
        <p><strong>Farmer:</strong> {parentLot.farmer}</p>
      </>
    });

    history.transportEvents.forEach(e => {
      events.push({
        type: 'TRANSPORT',
        title: 'Transport & Storage',
        timestamp: format(new Date(e.warehouseEntryDateTime), 'PPp'),
        details: <>
          <p><strong>Vehicle:</strong> {e.vehicleNumber}</p>
          <p><strong>Condition:</strong> {e.transportCondition}</p>
        </>
      });
    });

    history.retailEvents.forEach(e => {
        events.push({
          type: 'RETAIL',
          title: 'Stocked at Retailer',
          timestamp: format(new Date(e.shelfDate), 'PP'),
          details: <p><strong>Store ID:</strong> {e.storeId}</p>
        });
    });
    
    return events;
  }

  if (!history || !scannedLot) {
    return (
      <div className="space-y-8">
        <div className="flex justify-end">
            <Button variant="ghost" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
        </div>
        <Card className="max-w-xl mx-auto">
            <CardHeader>
            <CardTitle className="flex items-center"><ScanLine className="mr-2" /> Scan Lot QR Code</CardTitle>
            <CardDescription>Enter the Lot ID to view its full history.</CardDescription>
            </CardHeader>
            <CardContent>
            <Form {...scanForm}>
                <form onSubmit={scanForm.handleSubmit(handleScan)} className="flex gap-2">
                <FormField control={scanForm.control} name="lotId" render={({ field }) => (
                    <FormItem className="flex-1"><FormControl><Input placeholder="e.g., LOT-20240101-001-SUB-001" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}</Button>
                </form>
            </Form>
            {error && <Alert variant="destructive" className="mt-4"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
            </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex justify-end">
            <Button variant="outline" onClick={resetView}>Scan Another Lot</Button>
        </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><History className="mr-2"/> Full Lot History: <span className="font-mono ml-2 text-primary">{history.lot.lotId}</span></CardTitle>
          <CardDescription>This is the complete journey of the parent lot from farm to store.</CardDescription>
        </CardHeader>
        <CardContent>
            <Timeline events={getTimelineEvents()} />
        </CardContent>
      </Card>
      
      <Alert>
        <AlertTitle>You have scanned Sub-Lot: <span className="font-mono">{scannedLot.lotId}</span></AlertTitle>
        <AlertDescription>
          The actions below will apply to this specific sub-lot. Its status is currently: <strong>{scannedLot.status}</strong>
        </AlertDescription>
      </Alert>


      <div className="grid md:grid-cols-2 gap-8 items-start">
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><Store className="mr-2"/> Add to Shelf</CardTitle>
                <CardDescription>
                    Your store ID is <span className="font-bold font-mono">{retailerId}</span>. Add the date this lot was placed on the shelf. This will mark it as 'Delivered'.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...retailerForm}>
                    <form onSubmit={retailerForm.handleSubmit(handleRetailerSubmit)} className="space-y-4">
                        <FormField control={retailerForm.control} name="shelfDate" render={({field}) => (
                            <FormItem><FormLabel>Shelf Date</FormLabel><FormControl><Input type="date" {...field}/></FormControl><FormMessage/></FormItem>
                        )}/>
                        <Button type="submit" disabled={isSubmitting || scannedLot.status === 'Delivered'} className="w-full">
                            {isSubmitting && <Loader2 className="animate-spin mr-2"/>} 
                            {scannedLot.status === 'Delivered' ? 'Lot Delivered' : 'Confirm Delivery'}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="flex items-center"><PackagePlus className="mr-2"/> Create Retail Packs</CardTitle>
                <CardDescription>Split the sub-lot into smaller retail packs with unique QR codes.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...packForm}>
                    <form onSubmit={packForm.handleSubmit(handlePackSubmit)} className="flex gap-2">
                        <FormField control={packForm.control} name="packCount" render={({field}) => (
                            <FormItem className="flex-1"><FormControl><Input type="number" placeholder={`Split ${scannedLot.weight * 100}kg lot into...`} {...field}/></FormControl><FormMessage/></FormItem>
                        )}/>
                        <Button type="submit"><ShoppingBag className="h-4 w-4"/></Button>
                    </form>
                </Form>
                {retailPacks.length > 0 && (
                    <div className="mt-6">
                        <h4 className="font-semibold mb-4">Generated Pack QRs:</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1">
                            {retailPacks.map(pack => (
                                <div key={pack.packId} className="text-center">
                                    <div className="p-2 bg-white rounded-md inline-block">
                                        <QRCode value={pack.packId} size={80} level={"H"} />
                                    </div>
                                    <p className="text-xs font-mono mt-1 truncate">{pack.packId}</p>
                                    <p className="text-xs text-muted-foreground">{pack.weight} kg</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>

    </div>
  );
}

    