
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgriChainStore } from '@/hooks/use-agrichain-store';
import type { Lot } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LotDetailsCard } from '@/components/LotDetailsCard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ScanLine, Search, XCircle, ShoppingCart, BadgeIndianRupee, CreditCard, ShoppingBag, LogOut, PackagePlus, Spline, QrCode, User, Truck, PackageCheck, Download, Landmark, CheckCircle, Rocket, Percent, FileText } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';


const scanSchema = z.object({ lotId: z.string().min(1, 'Please enter a Lot ID') });
type ScanFormValues = z.infer<typeof scanSchema>;

const subLotSchema = z.object({
  subLotCount: z.coerce.number().int().min(2, 'Must create at least 2 sub-lots.').max(100),
});
type SubLotFormValues = z.infer<typeof subLotSchema>;

const transportSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required."),
  dispatchDate: z.string().min(1, "A dispatch date is required."),
});
type TransportFormValues = z.infer<typeof transportSchema>;


interface DistributorViewProps {
  distributorId: string;
  onLogout: () => void;
}

export function DistributorView({ distributorId, onLogout }: DistributorViewProps) {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [lotToBuy, setLotToBuy] = useState<Lot | null>(null);
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [lotToTransport, setLotToTransport] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [subLots, setSubLots] = useState<Lot[]>([]);
  const [activeTab, setActiveTab] = useState('available-crops');

  const { findLot, updateLot, getAllLots, addLots } = useAgriChainStore();
  const { toast } = useToast();
  const qrRef = useRef<HTMLDivElement>(null);


  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema), defaultValues: { lotId: "" } });
  const subLotForm = useForm<SubLotFormValues>({ resolver: zodResolver(subLotSchema), defaultValues: { subLotCount: 2 } });
  const transportForm = useForm<TransportFormValues>({ 
    resolver: zodResolver(transportSchema),
    defaultValues: {
      vehicleNumber: "",
      dispatchDate: new Date().toISOString().split('T')[0],
    }
  });

  const allLots = getAllLots();
  const availableLots = allLots.filter((lot) => lot.owner === lot.farmer);
  const purchasedLots = allLots.filter((lot) => lot.owner === distributorId && !lot.parentLotId);
  const dispatchedLots = allLots.filter(
    (lot) => (lot.paymentStatus === 'Advance Paid' || lot.paymentStatus === 'Fully Paid') && lot.parentLotId && findLot(lot.parentLotId!)?.owner === distributorId
  );


  useEffect(() => {
    if (scannedLot) {
      const childLots = getAllLots().filter((l) => l.parentLotId === scannedLot.lotId && l.paymentStatus === 'Unpaid');
      if (childLots.length > 0) {
        setSubLots(childLots);
      }
    }
  }, [scannedLot, getAllLots]);

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    setSubLots([]);
    const lot = findLot(data.lotId);
    setTimeout(() => {
      if (lot) {
        setScannedLot(lot);
        const childLots = getAllLots().filter((l) => l.parentLotId === lot.lotId && l.paymentStatus === 'Unpaid');
        setSubLots(childLots);
        subLotForm.reset({subLotCount: 2});
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  const handleConfirmPurchase = () => {
    if (!lotToBuy) return;
    updateLot(lotToBuy.lotId, { owner: distributorId, status: 'Purchased' });
    setLotToPay(lotToBuy);
    setLotToBuy(null);
  };

  const handlePayment = () => {
    if (!lotToPay) return;

    setPaymentStatus('processing');

    setTimeout(() => {
      updateLot(lotToPay.lotId, { status: 'Purchased' });
      setPaymentStatus('success');
    }, 1500);
  };

  const closePaymentDialog = () => {
    setLotToPay(null);
    setPaymentStatus('idle'); // Reset for next time
    setActiveTab('purchased-lots');
  };

  const handleSubLotSubmit: SubmitHandler<SubLotFormValues> = (data) => {
    if (!scannedLot) return;

    const newSubLots: Lot[] = [];
    const newWeight = parseFloat((scannedLot.weight / data.subLotCount).toFixed(2));
    const newPrice = parseFloat((scannedLot.price / data.subLotCount).toFixed(2));

    for (let i = 0; i < data.subLotCount; i++) {
      const newLot: Lot = {
        ...scannedLot,
        lotId: `${scannedLot.lotId}-SUB-${String(Math.floor(Math.random() * 1000) + i).padStart(3, '0')}`,
        parentLotId: scannedLot.lotId,
        weight: newWeight,
        price: newPrice,
        owner: distributorId, // Distributor owns the sub-lot initially
        status: 'Split',
        paymentStatus: 'Unpaid',
        logisticsInfo: undefined, // Clear logistics info
      };
      newSubLots.push(newLot);
    }

    addLots(newSubLots);
    updateLot(scannedLot.lotId, { weight: 0 }); 
    setSubLots(newSubLots);

    toast({
      title: 'Sub-lots Created!',
      description: `${data.subLotCount} new lots have been created and are available for retailers to purchase.`,
    });
  };

  const downloadQR = (lotId: string) => {
    const canvas = document.getElementById(`qr-${lotId}`) as HTMLCanvasElement;
    if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${lotId}.png`;
        a.click();
    }
  };

  const handleTransportSubmit: SubmitHandler<TransportFormValues> = (data) => {
    if (!lotToTransport) return;

    updateLot(lotToTransport.lotId, { 
      logisticsInfo: {
        vehicleNumber: data.vehicleNumber,
        dispatchDate: data.dispatchDate,
      },
      status: 'Dispatched'
    });
    
    toast({
      title: 'Transport Assigned!',
      description: `Transport details added for Lot ${lotToTransport.lotId}.`,
    });
    
    transportForm.reset({ vehicleNumber: '', dispatchDate: new Date().toISOString().split('T')[0] });
    setLotToTransport(null);
  };


  const resetView = () => {
    setScannedLot(null);
    setError(null);
    setSubLots([]);
    scanForm.reset();
    subLotForm.reset({subLotCount: 2});
  };

  if (scannedLot) {
    const isOwnedByDistributor = scannedLot.owner === distributorId;
    const canBeSplit = isOwnedByDistributor && scannedLot.weight > 0 && !scannedLot.parentLotId;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline">Lot Details</h1>
          <Button variant="outline" onClick={resetView}>
            Back to Dashboard
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LotDetailsCard lot={scannedLot} />

            {isOwnedByDistributor && (
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center">
                    <Spline className="mr-2" /> Create or Manage Sub-lots
                </CardTitle>
                <CardDescription>{canBeSplit ? 'Split this lot into smaller quantities. These will be available for retailers to purchase.' : 'This lot has already been split, or it is a sub-lot itself.'}</CardDescription>
                </CardHeader>
                <CardContent>
                {canBeSplit && (
                    <Form {...subLotForm}>
                    <form onSubmit={subLotForm.handleSubmit(handleSubLotSubmit)} className="flex gap-2">
                        <FormField
                        control={subLotForm.control}
                        name="subLotCount"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormControl>
                                <Input type="number" placeholder={`Split ${scannedLot.weight} quintal lot into...`} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit">
                        <PackagePlus className="h-4 w-4" />
                        </Button>
                    </form>
                    </Form>
                )}
                {subLots.length > 0 && (
                    <div className="mt-6">
                    <h4 className="font-semibold mb-4">Generated Sub-lots (Available to Retailers):</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        {subLots.map((lot) => (
                        <Card key={lot.lotId} className="flex flex-col">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-mono flex items-center gap-2"><QrCode className="text-muted-foreground"/> {lot.lotId}</CardTitle>
                                <CardDescription>{lot.weight} quintals</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="p-2 bg-white rounded-lg">
                                    <QRCode value={lot.lotId} size={128} id={`qr-${lot.lotId}`} />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">This lot is now available for retailers to buy.</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>
            )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold font-headline">Welcome, {distributorId}</h1>
          <p className="text-muted-foreground">Purchase lots, split them, and manage dispatch.</p>
        </div>
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

       <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <ScanLine className="mr-2" /> Scan or Manage Lot
            </CardTitle>
            <CardDescription>Enter a Lot ID to fetch its details.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...scanForm}>
              <form onSubmit={scanForm.handleSubmit(handleScan)} className="flex gap-2">
                <FormField
                  control={scanForm.control}
                  name="lotId"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input placeholder="e.g., LOT-20240101-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                </Button>
              </form>
            </Form>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 h-12">
                <TabsTrigger value="available-crops">
                  <ShoppingCart className="mr-2" />
                  Available Crops
                </TabsTrigger>
                <TabsTrigger value="purchased-lots">
                  <ShoppingBag className="mr-2" />
                  Purchased Lots
                </TabsTrigger>
                <TabsTrigger value="dispatched-lots">
                  <PackageCheck className="mr-2" />
                  Dispatched Lots
                </TabsTrigger>
              </TabsList>
              <TabsContent value="available-crops" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle>Available Crops for Purchase</CardTitle>
                    <CardDescription>Browse crops currently available directly from farmers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableLots.length > 0 ? (
                          availableLots.map((lot) => (
                          <LotDetailsCard key={lot.lotId} lot={lot}>
                              <Button className="w-full" onClick={() => setLotToBuy(lot)}>
                                  <ShoppingCart className="mr-2 h-4 w-4" /> Buy Lot for <BadgeIndianRupee className="w-4 h-4 mx-1" />
                                  {lot.price * lot.weight}
                              </Button>
                          </LotDetailsCard>
                          ))
                      ) : (
                          <p className="text-muted-foreground text-center py-4 col-span-3">There are no lots currently available for purchase.</p>
                      )}
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="purchased-lots" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="mr-2" /> Your Purchased Lots
                    </CardTitle>
                    <CardDescription>These are lots you own. Select a lot to create sub-lots for retailers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {purchasedLots.length > 0 ? (
                              purchasedLots.map((lot) => (
                              <LotDetailsCard key={lot.lotId} lot={lot}>
                                  <Button variant="secondary" className="w-full" onClick={() => handleScan({ lotId: lot.lotId })}>
                                      <Spline className="mr-2 h-4 w-4" /> Create Sub-Lots
                                  </Button>
                              </LotDetailsCard>
                              ))
                          ) : (
                              <p className="text-muted-foreground text-center py-4 col-span-3">You have not purchased any lots yet. Go to the "Available Crops" tab to buy one.</p>
                          )}
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="dispatched-lots" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PackageCheck className="mr-2" /> Your Dispatched Lots
                    </CardTitle>
                    <CardDescription>These lots have had their advance paid by a retailer and are ready for transport assignment.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dispatchedLots.length > 0 ? (
                        dispatchedLots.map((lot) => (
                          <Card key={lot.lotId} className="flex flex-col">
                              <CardHeader>
                                  <LotDetailsCard lot={lot}>
                                      <div className="mt-4 border-t pt-4 text-sm w-full">
                                          <div className="flex justify-between items-start">
                                          <div>
                                              <p className="font-semibold">Logistics Details:</p>
                                              {lot.logisticsInfo ? (
                                                  <>
                                                      <p><span className="text-muted-foreground">Vehicle:</span> {lot.logisticsInfo?.vehicleNumber}</p>
                                                      <p><span className="text-muted-foreground">Dispatch Date:</span> {lot.logisticsInfo?.dispatchDate}</p>
                                                  </>
                                              ) : (
                                                  <p className="text-muted-foreground">Pending...</p>
                                              )}
                                              <p className='mt-2'><span className="text-muted-foreground">Purchased By:</span> <span className="font-mono">{lot.owner}</span></p>
                                          </div>
                                          <div className='flex flex-col items-end gap-2'>
                                              <div>
                                                  <p className="font-semibold text-right">Status:</p>
                                                  <Badge variant={lot.status === 'Delivered' ? 'default' : (lot.status === 'Dispatched' ? 'secondary' : 'outline')}>
                                                      {lot.status}
                                                  </Badge>
                                              </div>
                                              <div>
                                                  <p className="font-semibold text-right">Payment:</p>
                                                  <Badge variant={lot.paymentStatus === 'Fully Paid' ? 'default' : (lot.paymentStatus === 'Advance Paid' ? 'outline' : 'destructive')}>
                                                  {lot.paymentStatus}
                                                  </Badge>
                                              </div>
                                          </div>
                                          </div>
                                          <div className="mt-4 flex flex-col items-center gap-4">
                                              {!lot.logisticsInfo ? (
                                              <Button className="w-full" onClick={() => setLotToTransport(lot)}>
                                                      <Truck className="mr-2 h-4 w-4"/> Add Transport
                                                  </Button>
                                              ) : (
                                                  <>
                                                      <div className="p-2 bg-white rounded-lg">
                                                          <QRCode value={lot.lotId} size={128} id={`qr-${lot.lotId}`} />
                                                      </div>
                                                      <Button variant="secondary" className="w-full" onClick={() => downloadQR(lot.lotId)}>
                                                          <Download className="mr-2 h-4 w-4"/> Download QR for Shipment
                                                      </Button>
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  </LotDetailsCard>
                              </CardHeader>
                          </Card>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 col-span-3">No lots have been dispatched yet.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

      <AlertDialog open={!!lotToBuy} onOpenChange={() => setLotToBuy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to purchase Lot {lotToBuy?.lotId} for a total of <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />
              {lotToBuy ? lotToBuy.price * lotToBuy.weight : 0}? This action will be recorded on the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>Confirm Purchase</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!lotToPay} onOpenChange={(open) => !open && paymentStatus !== 'processing' && setLotToPay(null)}>
        <DialogContent className="sm:max-w-md">
          {paymentStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                  <Rocket className="w-16 h-16 text-primary animate-bounce"/>
                  <h2 className="text-2xl font-bold font-headline">Purchase Successful!</h2>
                  <p className="text-muted-foreground">
                      You can now collect the crop from the mandi at: <br/>
                      <span className="font-semibold text-foreground">{lotToPay?.location}</span>
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
                <DialogTitle>Finalize Payment</DialogTitle>
                <DialogDescription>
                  Proceed to pay the farmer for Lot {lotToPay?.lotId}. <br /> Total amount: <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />
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
                      <CardHeader>
                        <CardTitle>Pay with UPI</CardTitle>
                        <CardDescription>Scan the QR code with your UPI app.</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white rounded-lg">
                           <QRCode value={`upi://pay?pa=farmer@agrichain&pn=Farmer&am=${lotToPay ? lotToPay.price * lotToPay.weight : 0}&cu=INR&tn=Lot%20${lotToPay?.lotId}`} size={180} />
                        </div>
                        <p className="text-sm text-muted-foreground">Or pay to UPI ID: <span className="font-mono">farmer@agrichain</span></p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="bank">
                    <Card>
                      <CardHeader>
                        <CardTitle>Bank Transfer Details</CardTitle>
                        <CardDescription>Use these details to make a bank transfer.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Beneficiary:</span> <span className="font-medium">Ramesh Kumar</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span> <span className="font-mono">1234567890</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">IFSC Code:</span> <span className="font-mono">AGRI0001234</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span className="font-medium">AgriChain Bank</span></div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

              <DialogFooter className="!mt-6">
                 <Button variant="outline" disabled={paymentStatus === 'processing'} onClick={() => setLotToPay(null)}>
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={paymentStatus === 'processing' || paymentStatus === 'success'} className="w-40">
                  {paymentStatus === 'processing' && <Loader2 className="animate-spin" />}
                  {paymentStatus === 'idle' && <><CreditCard className="mr-2" />Confirm Payment</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!lotToTransport} onOpenChange={() => setLotToTransport(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Transport for Lot {lotToTransport?.lotId}</DialogTitle>
                    <DialogDescription>
                        Fill in the dispatch details for the retailer.
                    </DialogDescription>
                </DialogHeader>
                {lotToTransport && (
                    <div className="flex flex-col items-center gap-4 py-4" >
                         <Form {...transportForm}>
                          <form onSubmit={transportForm.handleSubmit(handleTransportSubmit)} className="w-full space-y-4">
                                <FormField
                                  control={transportForm.control}
                                  name="vehicleNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Vehicle Number</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input placeholder="e.g., MH-12-AB-3456" {...field} className="pl-10" />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                             <FormField
                              control={transportForm.control}
                              name="dispatchDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Dispatch Date</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter className="!mt-4">
                                <Button variant="outline" type="button" onClick={() => setLotToTransport(null)}>Cancel</Button>
                                <Button type="submit"><Truck className="mr-2"/> Assign Transport</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                    </div>
                )}
            </DialogContent>
        </Dialog>

    </div>
  );
}
