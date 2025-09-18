
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
import { Award, Droplets, History, Loader2, LogOut, Microscope, Palette, Ruler, ScanLine, Search, Store, XCircle, BadgeIndianRupee, QrCode, Landmark, CreditCard, Rocket } from "lucide-react";
import { format, isValid } from 'date-fns';
import { Timeline } from "@/components/Timeline";
import { Separator } from "@/components/ui/separator";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "qrcode.react";

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
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { getLotHistory, addRetailEvent, updateLot, findLot, getAllLots } = useAgriChainStore();
  const { toast } = useToast();

  const scanForm = useForm<ScanFormValues>({ 
    resolver: zodResolver(scanSchema),
    defaultValues: { lotId: "" } 
  });
  const retailerForm = useForm<RetailerFormValues>({ resolver: zodResolver(retailerSchema), defaultValues: { shelfDate: "" } });

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
          if (freshHistory?.lot.paymentStatus !== 'Paid') {
            setLotToPay(freshHistory!.lot); // Trigger payment
          }
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

  const handlePayment = () => {
    if (!lotToPay) return;

    setPaymentStatus('processing');

    setTimeout(() => {
      updateLot(lotToPay.lotId, { paymentStatus: 'Paid' });
      setPaymentStatus('success');
      toast({
        title: 'Payment Successful!',
        description: `Payment for Lot ${lotToPay.lotId} has been sent.`,
      });

      setTimeout(() => {
        setLotToPay(null);
        setPaymentStatus('idle'); 
      }, 1000);
    }, 1500);
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
    const gradingDate = parentLot.gradingDate ? new Date(parentLot.gradingDate) : null;


    // Farmer event (from parent lot)
    events.push({
        type: 'FARM',
        title: 'Harvested & Registered',
        timestamp: format(new Date(parentLot.harvestDate), 'PP'),
        details: (
            <div className="space-y-2 text-sm">
                <p><strong>Farmer:</strong> {parentLot.farmer}</p>
                <p><strong>Location:</strong> {parentLot.location}</p>
                <p><strong>Crop:</strong> {parentLot.cropName}</p>
                <p><strong>Total Harvested Weight:</strong> {parentLot.weight} quintals</p>
                <p><strong>Original Lot ID:</strong> {parentLot.lotId}</p>
                <Separator className="my-3"/>
                <h4 className="font-semibold">Digital Certificate</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Grade:</strong> <span className="ml-1 font-mono">{parentLot.quality}</span></p>
                    <p className="flex items-center"><Droplets className="w-4 h-4 mr-2 text-primary"/><strong>Moisture:</strong> <span className="ml-1 font-mono">{parentLot.moisture}</span></p>
                    <p className="flex items-center"><Microscope className="w-4 h-4 mr-2 text-primary"/><strong>Impurities:</strong> <span className="ml-1 font-mono">{parentLot.impurities}</span></p>
                    <p className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-primary"/><strong>Size:</strong> <span className="ml-1 font-mono">{parentLot.size}</span></p>
                    <p className="flex items-center"><Palette className="w-4 h-4 mr-2 text-primary"/><strong>Color:</strong> <span className="ml-1 font-mono">{parentLot.color}</span></p>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                    Graded on {gradingDate && isValid(gradingDate) ? format(gradingDate, 'PPp') : 'N/A'}
                </p>
            </div>
        )
    });

    // Distributor events (from the hierarchy)
    lotHierarchy.forEach(lot => {
        if (lot.logisticsInfo) {
            events.push({
                type: 'TRANSPORT',
                title: 'Dispatched to Retailer',
                timestamp: format(new Date(lot.logisticsInfo.dispatchDate), 'PP'),
                details: (
                     <div className="space-y-2 text-sm">
                        <p><strong>Lot ID:</strong> {lot.lotId}</p>
                        <p><strong>Assigned To:</strong> {lot.owner}</p>
                        <p><strong>Vehicle:</strong> {lot.logisticsInfo.vehicleNumber}</p>
                        <Separator className="my-3"/>
                        <p><strong>Weight in this Lot:</strong> {lot.weight} quintals</p>
                        <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Quality:</strong> <span className="ml-1 font-mono">{lot.quality}</span></p>
                    </div>
                )
            });
        }
    });

    // Retail events (from history object)
    history.retailEvents.forEach(e => {
        const shelfDate = new Date(e.shelfDate);
        // Add a day to the date to fix the off-by-one issue
        shelfDate.setDate(shelfDate.getDate() + 1);

        events.push({
            type: 'RETAIL',
            title: 'Stocked at Retailer',
            timestamp: isValid(shelfDate) ? format(shelfDate, 'PP') : 'Invalid Date',
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
    const retailerLots = getAllLots().filter(lot => lot.owner === retailerId);

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
        
        <Card>
            <CardHeader>
                <CardTitle>Your Inventory</CardTitle>
                <CardDescription>These are the lots that have been assigned to your store, <span className="font-bold">{retailerId}</span>.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto">
                {retailerLots.length > 0 ? (
                    retailerLots.map((lot, index) => (
                        <div key={lot.lotId}>
                             {index > 0 && <Separator className="my-6" />}
                             <LotDetailsCard lot={lot} />
                             <div className="mt-4 flex justify-end">
                                <Button onClick={() => handleScan({ lotId: lot.lotId })}>
                                    <History className="mr-2 h-4 w-4" /> View Full History
                                </Button>
                             </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted-foreground text-center py-8">No lots have been assigned to you yet.</p>
                )}
            </CardContent>
        </Card>

         <Dialog open={!!lotToPay} onOpenChange={(open) => !open && paymentStatus !== 'processing' && setLotToPay(null)}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Finalize Payment to Distributor</DialogTitle>
                <DialogDescription>
                  Proceed to pay for Lot {lotToPay?.lotId}. <br /> Total amount: <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />
                  <span className="font-bold">{lotToPay ? lotToPay.price * lotToPay.weight : 0}</span>
                </DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="upi" className="w-full pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi"><QrCode className="mr-2"/> UPI</TabsTrigger>
                    <TabsTrigger value="bank"><Landmark className="mr-2"/> Bank Transfer</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upi">
                    <Card>
                      <CardHeader><CardTitle>Pay with UPI</CardTitle><CardDescription>Scan the QR code with your UPI app.</CardDescription></CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white rounded-lg">
                           <QRCode value={`upi://pay?pa=distro@agrichain&pn=Distributor&am=${lotToPay ? lotToPay.price * lotToPay.weight : 0}&cu=INR&tn=Lot%20${lotToPay?.lotId}`} size={180} />
                        </div>
                        <p className="text-sm text-muted-foreground">Or pay to UPI ID: <span className="font-mono">distro@agrichain</span></p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="bank">
                    <Card>
                      <CardHeader><CardTitle>Bank Transfer Details</CardTitle><CardDescription>Use these details to make a bank transfer.</CardDescription></CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Beneficiary:</span> <span className="font-medium">AgriChain Distributors</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span> <span className="font-mono">9876543210</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">IFSC Code:</span> <span className="font-mono">AGDI0005678</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span className="font-medium">AgriChain Bank</span></div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              <DialogFooter className="!mt-6">
                 <Button variant="outline" disabled={paymentStatus === 'processing'} onClick={() => setLotToPay(null)}>Cancel</Button>
                <Button onClick={handlePayment} disabled={paymentStatus === 'processing' || paymentStatus === 'success'} className="w-40">
                  {paymentStatus === 'processing' && <Loader2 className="animate-spin" />}
                  {paymentStatus === 'idle' && <><CreditCard className="mr-2" />Confirm Payment</>}
                  {paymentStatus === 'success' && <><Rocket className="mr-2 animate-bounce" />Payment Sent!</>}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

      </div>
    );
  }

  return (
    <div className="space-y-8">
        <div className="flex justify-end">
            <Button variant="outline" onClick={resetView}>Back to Dashboard</Button>
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
                      <Button type="submit" disabled={isSubmitting || isStocked || history.lot.paymentStatus !== 'Paid'} className="w-full">
                        {isSubmitting && <Loader2 className="animate-spin mr-2"/>} 
                        {isStocked ? 'Lot Stocked' : (history.lot.paymentStatus !== 'Paid' ? 'Payment Pending' : 'Add to Ledger')}
                      </Button>
                  </form>
              </Form>
          </CardContent>
      </Card>
    </div>
  );
}
