
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
import { Award, Droplets, History, Loader2, LogOut, Microscope, Palette, Ruler, ScanLine, Search, Store, XCircle, BadgeIndianRupee, QrCode, Landmark, CreditCard, Rocket, Percent, ShoppingBag, ShoppingCart, FileText, Spline, Truck, LineChart as LineChartIcon, Fingerprint } from "lucide-react";
import { format, isValid } from 'date-fns';
import { Timeline } from "@/components/Timeline";
import { Separator } from "@/components/ui/separator";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCode from "qrcode.react";
import { Badge } from "@/components/ui/badge";
import { RetailerAnalytics } from "./RetailerAnalytics";
import { CertificateDialog } from "@/components/CertificateDialog";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const retailerSchema = z.object({
  shelfDate: z.string().min(1, "Shelf date is required"),
});
type RetailerFormValues = z.infer<typeof retailerSchema>;

interface RetailerViewProps {
    retailerId: string;
}

export function RetailerView({ retailerId }: RetailerViewProps) {
  const [history, setHistory] = useState<LotHistory | null>(null);
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [lotToShowCertificate, setLotToShowCertificate] = useState<Lot | null>(null);
  const [paymentType, setPaymentType] = useState<'advance' | 'balance'>('advance');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('marketplace');


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
    setHistory(null);
    const scannedLot = findLot(data.lotId);

    setTimeout(() => {
        setIsLoading(false);
        if (!scannedLot) {
            setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
            setHistory(null);
            return;
        }

        if (scannedLot.owner !== retailerId) {
            setError(`This lot is not assigned to your store (${retailerId}). Current owner: ${scannedLot.owner}`);
            return;
        }
        
        let lotToProcess = scannedLot;

        if (lotToProcess.paymentStatus === 'Advance Paid' && lotToProcess.status !== 'Fully Paid') {
            if(lotToProcess.status !== 'Delivered') {
                updateLot(lotToProcess.lotId, { status: 'Delivered' });
                toast({
                    title: "Lot Received!",
                    description: `Lot ${lotToProcess.lotId} has been marked as 'Delivered'. Please complete the final payment.`,
                });
            }
            setLotToPay(lotToProcess); 
            setPaymentType('balance');
        } else {
            setHistory(getLotHistory(data.lotId));
        }

    }, 500);
  };
  
  const handleRetailerSubmit: SubmitHandler<RetailerFormValues> = (data) => {
    if (!history) return;
    setIsSubmitting(true);
    
    const newEvent: RetailEvent = { ...data, storeId: retailerId, timestamp: new Date().toISOString(), lotId: history.lot.lotId };
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
      if (paymentType === 'advance') {
        updateLot(lotToPay.lotId, { 
            paymentStatus: 'Advance Paid',
            owner: retailerId,
         });
      } else {
        updateLot(lotToPay.lotId, { paymentStatus: 'Fully Paid' });
      }
      
      setPaymentStatus('success');
      toast({
        title: 'Payment Successful!',
        description: `Payment for Lot ${lotToPay.lotId} has been sent.`,
      });

    }, 1500);
  };
  
  const closePaymentDialog = () => {
    const paidLotId = lotToPay?.lotId;
    setLotToPay(null);
    setPaymentStatus('idle'); 
    if (paymentType === 'balance' && paidLotId) {
        setHistory(getLotHistory(paidLotId));
    } else {
        setActiveTab('inventory');
    }
  }

  const resetView = () => {
    setHistory(null);
    setError(null);
    scanForm.reset();
    retailerForm.reset();
  }
  
  const getTimelineEvents = () => {
    if (!history) return [];
    
    const events = [];
    const {lot: currentLot, parentLot, childLots} = history;

    // 1. Farmer Event
    if (parentLot) {
        const gradingDate = parentLot.gradingDate ? new Date(parentLot.gradingDate) : null;
        events.push({
            type: 'FARM',
            title: 'Harvested & Registered',
            timestamp: format(new Date(parentLot.harvestDate), 'PP'),
            details: (
                <div className="space-y-2 text-sm">
                    <p><strong>Farmer:</strong> {parentLot.farmer}</p>
                    <p><strong>Location:</strong> {parentLot.location}</p>
                    <p><strong>Crop:</strong> {parentLot.cropName}</p>
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

        // 2. Distributor Purchase Event
        const purchaseDate = gradingDate ? new Date(gradingDate) : new Date(parentLot.harvestDate);
        purchaseDate.setHours(purchaseDate.getHours() + 1); // Assume purchase happens after grading/harvest
        events.push({
            type: 'DISTRIBUTOR_BUY',
            title: 'Purchased by Distributor',
            timestamp: format(purchaseDate, 'PP'),
            details: (
                 <div className="space-y-2 text-sm">
                    <p><strong>Distributor:</strong> {parentLot.owner}</p>
                    <p><strong>Lot ID:</strong> {parentLot.lotId}</p>
                    <p>Acquired full lot of {parentLot.weight} quintals.</p>
                </div>
            )
        });
    }

    // 3. Distributor Split Event
    if (childLots && childLots.length > 0 && parentLot) {
        const splitDate = childLots[0].gradingDate ? new Date(childLots[0].gradingDate) : new Date(parentLot.gradingDate);
        splitDate.setHours(splitDate.getHours() + 2); // Assume split happens after purchase
        events.push({
            type: 'DISTRIBUTOR_SPLIT',
            title: 'Split into Sub-lots',
            timestamp: splitDate ? format(splitDate, 'PP') : 'N/A',
            details: (
                 <div className="space-y-2 text-sm">
                    <p>Original lot was split into {childLots.length} sub-lots.</p>
                    <p><strong>This product is from Sub-lot:</strong> {currentLot.lotId}</p>
                </div>
            )
        });
    }

    // 4. Transport Event for the current lot
    if (currentLot.logisticsInfo) {
        events.push({
            type: 'TRANSPORT',
            title: 'Dispatched to Retailer',
            timestamp: format(new Date(currentLot.logisticsInfo.dispatchDate), 'PP'),
            details: (
                 <div className="space-y-2 text-sm">
                    <p><strong>Lot ID:</strong> {currentLot.lotId}</p>
                    <p><strong>Assigned To:</strong> {currentLot.owner}</p>
                    <p><strong>Vehicle:</strong> {currentLot.logisticsInfo.vehicleNumber}</p>
                    <Separator className="my-3"/>
                    <p><strong>Weight in this Lot:</strong> {currentLot.weight} quintals</p>
                    <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Quality:</strong> <span className="ml-1 font-mono">{currentLot.quality}</span></p>
                </div>
            )
        });
    }

    // 5. Retailer Stocking Event
    history.retailEvents.forEach(e => {
        if (e.lotId === currentLot.lotId) {
            const shelfDate = new Date(e.shelfDate);
            shelfDate.setDate(shelfDate.getDate() + 1);

            events.push({
                type: 'RETAIL',
                title: 'Stocked at Retailer',
                timestamp: isValid(shelfDate) ? format(shelfDate, 'PP') : 'Invalid Date',
                details: <>
                 <p><strong>Store ID:</strong> {e.storeId}</p>
                 <p><strong>Lot ID:</strong> {currentLot.lotId}</p>
                </>
            });
        }
    });
    
    return events;
  }
  
  const isStocked = history?.lot?.status === 'Stocked';

  const allLots = getAllLots();
  const marketplaceLots = allLots.filter(lot => lot.parentLotId && lot.paymentStatus === 'Unpaid');
  const inventoryLots = allLots.filter(lot => lot.owner === retailerId);


  if (!history) {
    return (
      <div className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="marketplace">
                    <ShoppingCart className="mr-2"/> Marketplace
                </TabsTrigger>
                <TabsTrigger value="inventory">
                    <ShoppingBag className="mr-2"/> Your Inventory
                </TabsTrigger>
                 <TabsTrigger value="analytics">
                    <LineChartIcon className="mr-2"/> Analytics
                </TabsTrigger>
            </TabsList>
            <TabsContent value="marketplace" className="mt-0">
                <Card className="rounded-t-none">
                    <CardHeader>
                        <CardTitle>Available Lots for Purchase</CardTitle>
                        <CardDescription>Browse sub-lots currently available from distributors.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {marketplaceLots.length > 0 ? (
                                marketplaceLots.map((lot) => (
                                    <LotDetailsCard key={lot.lotId} lot={lot}>
                                        <div className='flex flex-col md:flex-row gap-2 w-full'>
                                            <Button variant="secondary" className="w-full" onClick={() => setLotToShowCertificate(lot)}>
                                                <Fingerprint /> View Certificate
                                            </Button>
                                            <Button className="w-full" onClick={() => { setLotToPay(lot); setPaymentType('advance'); }}>
                                                <ShoppingCart /> Buy Lot
                                            </Button>
                                        </div>
                                    </LotDetailsCard>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8 col-span-3">No lots are available in the marketplace right now.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="inventory" className="mt-0">
                <Card className="rounded-t-none">
                    <CardHeader>
                        <CardTitle>Your Inventory</CardTitle>
                        <CardDescription>These are the lots assigned to your store, <span className="font-bold">{retailerId}</span>.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {inventoryLots.length > 0 ? (
                                inventoryLots.map((lot) => (
                                    <LotDetailsCard key={lot.lotId} lot={lot}>
                                        <Button 
                                            className="w-full" 
                                            onClick={() => handleScan({ lotId: lot.lotId })} 
                                            disabled={
                                                (lot.status === 'Dispatched' && !lot.logisticsInfo) || 
                                                !['Dispatched', 'Delivered', 'Stocked'].includes(lot.status ?? '')
                                            }
                                        >
                                            <History className="mr-2 h-4 w-4" /> 
                                            {lot.status === 'Dispatched' ? 'Confirm Delivery' : 'View Full History'}
                                        </Button>
                                    </LotDetailsCard>
                                ))
                            ) : (
                                <p className="text-muted-foreground text-center py-8 col-span-3">You have no lots in your inventory yet. Visit the marketplace to buy one.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
            <TabsContent value="analytics" className="mt-0">
                <RetailerAnalytics retailerId={retailerId} />
            </TabsContent>
        </Tabs>

         <Dialog open={!!lotToPay} onOpenChange={(open) => !open && paymentStatus !== 'processing' && setLotToPay(null)}>
            <DialogContent className="sm:max-w-md">
            {paymentStatus === 'success' ? (
                <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                    <Rocket className="w-16 h-16 text-primary animate-bounce"/>
                    <h2 className="text-2xl font-bold font-headline">Payment Sent!</h2>
                    <p className="text-muted-foreground">
                        {paymentType === 'advance' 
                            ? "The distributor has been notified to dispatch the lot." 
                            : "The transaction is complete. You can now stock this item."
                        }
                    </p>
                    <div className='flex items-center gap-2 mt-4 w-full'>
                        <Button variant="outline" className="w-full">
                            <FileText className="mr-2" /> Download Receipt
                        </Button>
                        <Button onClick={closePaymentDialog} className="w-full">Done</Button>
                    </div>
                </div>
            ) : (
              <>
              <DialogHeader>
                <DialogTitle>
                    {paymentType === 'advance' ? 'Pay 30% Advance to Distributor' : 'Finalize Payment to Distributor'}
                </DialogTitle>
                <DialogDescription>
                  {paymentType === 'advance' ? (
                      <>
                        Total value: <BadgeIndianRupee className="w-3 h-3 inline-block" /> {(lotToPay?.price ?? 0) * (lotToPay?.weight ?? 0)}.
                        <br/>
                        Advance amount (30%): <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />
                        <span className="font-bold">{lotToPay ? ((lotToPay.price * lotToPay.weight) * 0.3).toFixed(2) : 0}</span>
                      </>
                  ) : (
                      <>
                        This lot requires payment of the remaining 70% balance. <br/>
                        Total value: <BadgeIndianRupee className="w-3 h-3 inline-block" /> {lotToPay ? (lotToPay.price * lotToPay.weight).toFixed(2) : 0}.
                        <br /> 
                        Balance amount (70%): <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />
                        <span className="font-bold">{lotToPay ? ((lotToPay.price * lotToPay.weight) * 0.7).toFixed(2) : 0}</span>
                      </>
                  )}
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
                           <QRCode value={`upi://pay?pa=distro@agrichain&pn=Distributor&am=${lotToPay ? ((lotToPay.price * lotToPay.weight) * (paymentType === 'advance' ? 0.3 : 0.7)).toFixed(2) : 0}&cu=INR&tn=Lot%20${lotToPay?.lotId}`} size={180} />
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
            </>
            )}
            </DialogContent>
          </Dialog>

          {lotToShowCertificate && (
            <CertificateDialog
                isOpen={!!lotToShowCertificate}
                onOpenChange={() => setLotToShowCertificate(null)}
                lot={lotToShowCertificate}
            />
          )}

      </div>
    );
  }

  return (
    <div className="space-y-6">
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
                      <Button type="submit" disabled={isSubmitting || isStocked || history.lot.paymentStatus !== 'Fully Paid'} className="w-full">
                        {isSubmitting && <Loader2 className="animate-spin mr-2"/>} 
                        {isStocked ? 'Lot Stocked' : (history.lot.paymentStatus !== 'Fully Paid' ? 'Final Payment Pending' : 'Add to Ledger')}
                      </Button>
                  </form>
              </Form>
          </CardContent>
      </Card>
    </div>
  );
}

    