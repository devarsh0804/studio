
"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot, LotHistory, RetailEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { History, Loader2, LogOut, ScanLine, Search, Store, XCircle } from "lucide-react";
import { format } from 'date-fns';
import { Timeline } from "@/components/Timeline";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const retailerSchema = z.object({
  shelfDate: z.string().min(1, "Shelf date is required"),
});
type RetailerFormValues = z.infer<typeof retailerSchema>;

interface RetailerViewProps {
    retailerId: string;
    onLogout: () => void;
}

export function RetailerView({ retailerId, onLogout }: RetailerViewProps) {
  const [history, setHistory] = useState<LotHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getLotHistory, addRetailEvent, updateLot, findLot } = useAgriChainStore();
  const { toast } = useToast();

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const retailerForm = useForm<RetailerFormValues>({ resolver: zodResolver(retailerSchema) });

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    const historyData = getLotHistory(data.lotId);
    setTimeout(() => {
      if (historyData) {
        if (historyData.lot.status === 'Dispatched') {
          updateLot(historyData.lot.lotId, { status: 'Delivered' });
           toast({
            title: "Lot Received!",
            description: `Lot ${historyData.lot.lotId} has been marked as 'Delivered'.`,
          });
          const freshHistory = getLotHistory(data.lotId);
          setHistory(freshHistory);
        } else {
            setHistory(historyData);
        }
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setHistory(null);
      }
      setIsLoading(false);
    }, 500);
  };
  
  const handleRetailerSubmit: SubmitHandler<RetailerFormValues> = (data) => {
    if (!history) return;
    setIsSubmitting(true);
    
    const newEvent: RetailEvent = { ...data, storeId: retailerId, timestamp: new Date().toISOString() };
    addRetailEvent(history.lot.lotId, newEvent);
    updateLot(history.lot.lotId, { status: 'Stocked' });

    toast({ title: "Success!", description: "Retailer details updated and lot marked as Stocked." });
    
    const updatedHistory = getLotHistory(history.lot.lotId);
    if(updatedHistory) {
      setHistory(updatedHistory);
    }

    setIsSubmitting(false);
    retailerForm.reset();
  };
  

  const resetView = () => {
    setHistory(null);
    setError(null);
    scanForm.reset();
    retailerForm.reset();
  }
  
  const getTimelineEvents = () => {
    if (!history) return [];

    let lotHierarchy: Lot[] = [];
    let tempLot = history.lot;
    
    // Build hierarchy from current lot up to the parent
    while (tempLot) {
        lotHierarchy.unshift(tempLot);
        tempLot = tempLot.parentLotId ? findLot(tempLot.parentLotId) as Lot : null as any;
    }

    const events = [];

    const parentLot = lotHierarchy[0];

    // Farmer event (from parent lot)
    events.push({
        type: 'FARM',
        title: 'Harvested & Registered',
        timestamp: format(new Date(parentLot.harvestDate), 'PP'),
        details: <>
            <p><strong>Crop:</strong> {parentLot.cropName}</p>
            <p><strong>Weight:</strong> {parentLot.weight} quintals</p>
            <p><strong>Farmer:</strong> {parentLot.farmer}</p>
            <p><strong>Original Lot ID:</strong> {parentLot.lotId}</p>
        </>
    });

    // Distributor events (from the hierarchy)
    lotHierarchy.forEach(lot => {
        if (lot.logisticsInfo) {
            events.push({
                type: 'TRANSPORT',
                title: 'Dispatched to Retailer',
                timestamp: format(new Date(lot.logisticsInfo.dispatchDate), 'PP'),
                details: <>
                    <p><strong>Lot ID:</strong> {lot.lotId}</p>
                    <p><strong>Vehicle:</strong> {lot.logisticsInfo.vehicleNumber}</p>
                    <p><strong>Assigned To:</strong> {lot.owner}</p>
                </>
            });
        }
    });

    // Retail events (from history object)
    history.retailEvents.forEach(e => {
        events.push({
            type: 'RETAIL',
            title: 'Stocked at Retailer',
            timestamp: format(new Date(e.shelfDate), 'PP'),
            details: <>
             <p><strong>Store ID:</strong> {e.storeId}</p>
             <p><strong>Lot ID:</strong> {history.lot.lotId}</p>
            </>
        });
    });
    
    return events;
  }
  
  const isStocked = history?.lot?.status === 'Stocked';


  if (!history) {
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
            <CardDescription>Enter the Lot ID to view its full history. This can be a sub-lot or a final retail pack.</CardDescription>
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
          <CardTitle className="flex items-center"><History className="mr-2"/> Full Lot History</CardTitle>
          <CardDescription>This is the complete journey of the product from farm to store.</CardDescription>
        </CardHeader>
        <CardContent>
            <Timeline events={getTimelineEvents()} />
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
              <CardTitle className="flex items-center"><Store className="mr-2"/> Add to Shelf</CardTitle>
              <CardDescription>
                  Your store ID is <span className="font-bold font-mono">{retailerId}</span>. {isStocked ? "This lot has already been added to the shelf." : "Add the date this lot was placed on the shelf."}
              </CardDescription>
          </CardHeader>
          <CardContent>
              <Form {...retailerForm}>
                  <form onSubmit={retailerForm.handleSubmit(handleRetailerSubmit)} className="space-y-4">
                      <FormField control={retailerForm.control} name="shelfDate" render={({field}) => (
                          <FormItem><FormLabel>Shelf Date</FormLabel><FormControl><Input type="date" {...field} disabled={isStocked}/></FormControl><FormMessage/></FormItem>
                      )}/>
                      <Button type="submit" disabled={isSubmitting || isStocked} className="w-full">{isSubmitting && <Loader2 className="animate-spin mr-2"/>} {isStocked ? 'Lot Stocked' : 'Add to Ledger'}</Button>
                  </form>
              </Form>
          </CardContent>
      </Card>

    </div>
  );
}
