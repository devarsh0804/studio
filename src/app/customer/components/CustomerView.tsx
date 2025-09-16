"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { LotHistory, RetailPack } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Loader2, ScanLine, Search, XCircle, Package, Calendar, Wheat, Weight, BadgeIndianRupee, Award } from "lucide-react";
import { Timeline } from "@/components/Timeline";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { format } from "date-fns";

const scanSchema = z.object({ id: z.string().min(1, "Please enter a Lot or Pack ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

export function CustomerView() {
  const [history, setHistory] = useState<LotHistory | null>(null);
  const [scannedPack, setScannedPack] = useState<RetailPack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getLotHistory, findPack } = useAgriChainStore();

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    setHistory(null);
    setScannedPack(null);

    setTimeout(() => {
        let lotHistory: LotHistory | null = null;
        let packInfo: RetailPack | null = null;
        
        if (data.id.startsWith('PACK-')) {
            packInfo = findPack(data.id);
            if (packInfo) {
                lotHistory = getLotHistory(packInfo.parentLotId);
            }
        } else {
            lotHistory = getLotHistory(data.id);
        }

      if (lotHistory) {
        setHistory(lotHistory);
        setScannedPack(packInfo);
      } else {
        setError(`ID "${data.id}" not found. Please verify and try again.`);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const getTimelineEvents = () => {
    if (!history) return [];
    const events = [];

    events.push({
      type: 'FARM',
      title: 'Harvested',
      timestamp: format(new Date(history.lot.harvestDate), 'PP'),
      details: <>
        <p><strong>Farmer:</strong> {history.lot.farmer}</p>
        <p><strong>Original Lot Weight:</strong> {history.lot.weight} quintals</p>
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

    events.push({
      type: 'CUSTOMER',
      title: 'In Your Hands',
      timestamp: format(new Date(), 'PP'),
      details: <p>You are now part of this product's transparent journey!</p>
    })
    
    return events;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {!history && (
        <Card className="max-w-xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center"><ScanLine className="mr-2" /> Scan Product QR Code</CardTitle>
            <CardDescription>Enter the ID from the product QR to trace its full journey.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...scanForm}>
              <form onSubmit={scanForm.handleSubmit(handleScan)} className="flex gap-2">
                <FormField control={scanForm.control} name="id" render={({ field }) => (
                    <FormItem className="flex-1"><FormControl><Input placeholder="e.g., PACK-..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}</Button>
              </form>
            </Form>
            {error && <Alert variant="destructive" className="mt-4"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
          </CardContent>
        </Card>
      )}

      {history && (
        <>
        <div className="flex justify-end">
            <Button variant="outline" onClick={() => setHistory(null)}>Scan Another Product</Button>
        </div>
        <Card>
            <CardContent className="p-6 grid md:grid-cols-2 gap-6 items-center">
                <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                    {cropImage && <Image src={cropImage.imageUrl} alt={cropImage.description} layout="fill" objectFit="cover" data-ai-hint={cropImage.imageHint}/>}
                </div>
                <div className="space-y-4">
                    <h2 className="text-3xl font-bold font-headline text-primary">{history.lot.cropName}</h2>
                    <div className="text-sm space-y-2">
                       {scannedPack && (
                         <div className="flex items-center text-lg">
                            <Package className="w-5 h-5 mr-3 text-muted-foreground" />
                            <p className="font-medium">{scannedPack.weight} kg</p>
                        </div>
                       )}
                        <div className="flex items-center">
                            <Wheat className="w-4 h-4 mr-3 text-muted-foreground" />
                            <p>From Lot: <span className="font-medium font-mono">{history.lot.lotId}</span></p>
                        </div>
                        <div className="flex items-center">
                            <Award className="w-4 h-4 mr-3 text-muted-foreground" />
                            <p>Quality: <span className="font-medium">{history.lot.quality}</span></p>
                        </div>
                        <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-3 text-muted-foreground" />
                            <p>Harvested on <span className="font-medium">{format(new Date(history.lot.harvestDate), 'MMMM do, yyyy')}</span></p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Product Journey</CardTitle>
            </CardHeader>
            <CardContent>
                <Timeline events={getTimelineEvents()} />
            </CardContent>
        </Card>
        </>
      )}
    </div>
  );
}
