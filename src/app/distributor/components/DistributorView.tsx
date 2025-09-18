
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
import { Loader2, ScanLine, Search, XCircle, ShoppingCart, BadgeIndianRupee, CreditCard, ShoppingBag, LogOut, PackagePlus, Spline, QrCode, User, Truck, PackageCheck, Download, Landmark, CheckCircle, Rocket, Percent } from 'lucide-react';
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

const assignSchema = z.object({
  retailerId: z.string().min(1, "Retailer ID is required."),
  vehicleNumber: z.string().min(1, "Vehicle number is required."),
  dispatchDate: z.string().min(1, "A dispatch date is required."),
});
type AssignFormValues = z.infer<typeof assignSchema>;


interface DistributorViewProps {
  distributorId: string;
  onLogout: () => void;
}

export function DistributorView({ distributorId, onLogout }: DistributorViewProps) {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [lotToBuy, setLotToBuy] = useState<Lot | null>(null);
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [lotToAssign, setLotToAssign] = useState<Lot | null>(null);
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
  const assignForm = useForm<AssignFormValues>({ 
    resolver: zodResolver(assignSchema),
    defaultValues: {
      retailerId: "",
      vehicleNumber: "",
      dispatchDate: "",
    }
  });

  const allLots = getAllLots();
  const availableLots = allLots.filter((lot) => lot.owner === lot.farmer);
  const purchasedLots = allLots.filter((lot) => lot.owner === distributorId && !lot.parentLotId);
  const dispatchedLots = allLots.filter(
    (lot) => lot.logisticsInfo && (lot.parentLotId && findLot(lot.parentLotId)?.owner === distributorId || lot.owner !== distributorId && (lot.status === 'Dispatched' || lot.status === 'Delivered' || lot.status === 'Stocked' || lot.status === 'Awaiting Advance Payment'))
  );


  useEffect(() => {
    if (scannedLot) {
      const childLots = getAllLots().filter((l) => l.parentLotId === scannedLot.lotId && l.status !== 'Dispatched' && l.status !== 'Delivered');
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
        const childLots = getAllLots().filter((l) => l.parentLotId === lot.lotId && l.status !== 'Dispatched' && l.status !== 'Delivered');
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
      setPaymentStatus('success');
      toast({
        title: 'Purchase Successful!',
        description: `You now own Lot ${lotToPay.lotId}.`,
      });

      // Wait a moment on the success state, then close
      setTimeout(() => {
        setLotToPay(null);
        setPaymentStatus('idle'); // Reset for next time
        setActiveTab('purchased-lots');
      }, 1000);
    }, 1500);
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
        owner: distributorId,
        status: 'Split',
        paymentStatus: 'Unpaid',
      };
      newSubLots.push(newLot);
    }

    addLots(newSubLots);
    updateLot(scannedLot.lotId, { weight: 0 }); 
    setSubLots(newSubLots);

    toast({
      title: 'Sub-lots Created!',
      description: `${data.subLotCount} new lots have been created and are ready to be assigned.`,
    });
  };

  const downloadQR = (lotId: string) => {
    if (qrRef.current) {
        const canvas = qrRef.current.querySelector("canvas");
        if (canvas) {
            const image = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = image;
            a.download = `${lotId}.png`;
            a.click();
        }
    }
  };

  const handleAssignSubmit: SubmitHandler<AssignFormValues> = (data) => {
    if (!lotToAssign) return;

    updateLot(lotToAssign.lotId, { 
      owner: data.retailerId,
      logisticsInfo: {
        vehicleNumber: data.vehicleNumber,
        dispatchDate: data.dispatchDate,
      },
      status: 'Awaiting Advance Payment'
    });
    
    toast({
      title: 'Lot Assigned!',
      description: `Lot ${lotToAssign.lotId} has been assigned to ${data.retailerId}. Waiting for 30% advance payment from the retailer.`,
    });
    
    setSubLots(prev => prev.filter(lot => lot.lotId !== lotToAssign!.lotId));
    assignForm.reset({ retailerId: '', vehicleNumber: '', dispatchDate: '' });
    setLotToAssign(null);
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
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline">Lot Details</h1>
          <Button variant="outline" onClick={resetView}>
            Back to Dashboard
          </Button>
        </div>
        <LotDetailsCard lot={scannedLot} />

        {isOwnedByDistributor && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Spline className="mr-2" /> Create or Manage Sub-lots
              </CardTitle>
              <CardDescription>{canBeSplit ? 'Split this lot into smaller quantities for different retailers. The total weight will be divided equally.' : 'This lot has already been split, or it is a sub-lot itself.'}</CardDescription>
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
                  <h4 className="font-semibold mb-4">Generated Sub-lots:</h4>
                   <div className="space-y-2">
                    {subLots.map((lot) => (
                      <Button 
                        key={lot.lotId}
                        variant="secondary"
                        className="w-full justify-start"
                        onClick={() => setLotToAssign(lot)}
                      >
                        <QrCode className="mr-2" />
                        Assign <span className='font-mono mx-2'>{lot.lotId}</span> ({lot.weight} quintals)
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
         <Dialog open={!!lotToAssign} onOpenChange={() => setLotToAssign(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Assign Lot {lotToAssign?.lotId} to Retailer</DialogTitle>
                    <DialogDescription>
                        Fill in the dispatch details. The retailer will be prompted to pay a 30% advance before you can dispatch the lot.
                    </DialogDescription>
                </DialogHeader>
                {lotToAssign && (
                    <div className="flex flex-col items-center gap-4 py-4" >
                         <Form {...assignForm}>
                          <form onSubmit={assignForm.handleSubmit(handleAssignSubmit)} className="w-full space-y-4">
                            
                                <FormField
                                  control={assignForm.control}
                                  name="retailerId"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Retailer ID / Code</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input placeholder="e.g., retail" {...field} className="pl-10" />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={assignForm.control}
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
                              control={assignForm.control}
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
                                <Button variant="outline" type="button" onClick={() => setLotToAssign(null)}>Cancel</Button>
                                <Button type="submit"><PackageCheck className="mr-2"/> Assign Lot</Button>
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-headline">Welcome, {distributorId}</h1>
        <Button variant="ghost" onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ScanLine className="mr-2" /> Scan Lot QR Code
          </CardTitle>
          <CardDescription>Enter the Lot ID to fetch its details and manage it.</CardDescription>
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
        <TabsContent value="available-crops">
          <Card>
            <CardHeader>
              <CardTitle>Available Crops for Purchase</CardTitle>
              <CardDescription>Browse crops currently available directly from farmers.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {availableLots.length > 0 ? (
                availableLots.map((lot) => (
                  <div key={lot.lotId} className="border p-4 rounded-lg">
                    <LotDetailsCard lot={lot} />
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => setLotToBuy(lot)}>
                        <ShoppingCart className="mr-2 h-4 w-4" /> Buy Lot for <BadgeIndianRupee className="w-4 h-4 mx-1" />
                        {lot.price * lot.weight}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">There are no lots currently available for purchase.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="purchased-lots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingBag className="mr-2" /> Your Purchased Lots
              </CardTitle>
              <CardDescription>These are lots you own. Select a lot to add details or split it into sub-lots.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {purchasedLots.length > 0 ? (
                purchasedLots.map((lot) => (
                  <div key={lot.lotId} className="border p-4 rounded-lg">
                    <LotDetailsCard lot={lot} />
                    <div className="mt-4 flex justify-end">
                       <Button variant="secondary" onClick={() => handleScan({ lotId: lot.lotId })}>
                        <Spline className="mr-2 h-4 w-4" /> Manage Lot
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">You have not purchased any lots yet. Go to the "Available Crops" tab to buy one.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
         <TabsContent value="dispatched-lots">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PackageCheck className="mr-2" /> Your Dispatched Lots
              </CardTitle>
              <CardDescription>These lots have been assigned to retailers and are in transit or have been delivered.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
              {dispatchedLots.length > 0 ? (
                dispatchedLots.map((lot) => (
                  <div key={lot.lotId} className="border p-4 rounded-lg">
                    <LotDetailsCard lot={lot} />
                     <div className="mt-4 border-t pt-4 text-sm">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Logistics Details:</p>
                            <p><span className="text-muted-foreground">Vehicle:</span> {lot.logisticsInfo?.vehicleNumber}</p>
                            <p><span className="text-muted-foreground">Dispatch Date:</span> {lot.logisticsInfo?.dispatchDate}</p>
                            <p><span className="text-muted-foreground">Assigned To:</span> <span className="font-mono">{lot.owner}</span></p>
                          </div>
                          <div>
                              <p className="font-semibold">Status:</p>
                              <Badge variant={lot.status === 'Delivered' ? 'default' : (lot.status === 'Dispatched' ? 'secondary' : 'outline')}>
                                {lot.status}
                              </Badge>
                               <p className="font-semibold mt-2">Payment:</p>
                                <Badge variant={lot.paymentStatus === 'Fully Paid' ? 'default' : (lot.paymentStatus === 'Advance Paid' ? 'outline' : 'destructive')}>
                                  {lot.paymentStatus}
                                </Badge>
                          </div>
                        </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">You have not dispatched any lots yet.</p>
              )}
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
              {paymentStatus === 'success' && <><Rocket className="mr-2 animate-bounce" />Payment Sent!</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
