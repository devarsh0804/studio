"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot, TransportEvent } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ScanLine, Search, Sparkles, Truck, XCircle, ShoppingCart, BadgeIndianRupee, CreditCard, ShoppingBag, LogOut, PackagePlus, Spline } from "lucide-react";
import QRCode from "qrcode.react";
import { detectConflictAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";
import { Separator } from "@/components/ui/separator";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const distributorSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  transportCondition: z.enum(["Cold Storage", "Normal"]),
  warehouseEntryDateTime: z.string().min(1, "Warehouse entry date/time is required"),
});
type DistributorFormValues = z.infer<typeof distributorSchema>;

const subLotSchema = z.object({
    subLotCount: z.coerce.number().int().min(2, "Must create at least 2 sub-lots.").max(100),
});
type SubLotFormValues = z.infer<typeof subLotSchema>;


interface DistributorViewProps {
    distributorId: string;
    onLogout: () => void;
}

export function DistributorView({ distributorId, onLogout }: DistributorViewProps) {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [lotToBuy, setLotToBuy] = useState<Lot | null>(null);
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [conflict, setConflict] = useState<DistributorUpdateConflictDetectionOutput | null>(null);
  const [subLots, setSubLots] = useState<Lot[]>([]);
  
  const { findLot, addTransportEvent, updateLot, getAllLots, addLots } = useAgriChainStore();
  const { toast } = useToast();

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const distributorForm = useForm<DistributorFormValues>({ resolver: zodResolver(distributorSchema) });
  const subLotForm = useForm<SubLotFormValues>({ resolver: zodResolver(subLotSchema) });
  
  const allLots = getAllLots();
  const availableLots = allLots.filter(lot => lot.owner === lot.farmer && !lot.parentLotId);
  const purchasedLots = allLots.filter(lot => lot.owner === distributorId && !lot.parentLotId && lot.weight > 0);
  const createdSubLots = allLots.filter(lot => lot.parentLotId && findLot(lot.parentLotId)?.owner === distributorId);

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    const lot = findLot(data.lotId);
    setTimeout(() => {
      if (lot) {
        setScannedLot(lot);
        distributorForm.reset();
        subLotForm.reset();
        setSubLots([]);
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  const handleConfirmPurchase = () => {
    if (!lotToBuy) return;
    setLotToPay(lotToBuy);
    setLotToBuy(null);
  }

  const handlePayment = () => {
    if (!lotToPay) return;

    setIsPaying(true);
    
    // Simulate payment processing
    setTimeout(() => {
      updateLot(lotToPay.lotId, { owner: distributorId });
      
      toast({
        title: "Purchase Successful!",
        description: `You now own Lot ${lotToPay.lotId}.`,
      });

      resetView();
      
      setLotToPay(null);
      setIsPaying(false);
    }, 1500);
  }

  const handleFormSubmit: SubmitHandler<DistributorFormValues> = async (data) => {
    if (!scannedLot) return;

    setIsSubmitting(true);
    const result = await detectConflictAction(scannedLot, data);
    
    if (result.conflictDetected) {
      setConflict(result);
    } else {
      const newEvent: TransportEvent = {
        ...data,
        timestamp: new Date().toISOString(),
      };
      addTransportEvent(scannedLot.lotId, newEvent);
      toast({
        title: "Success!",
        description: `Transport details for Lot ID ${scannedLot.lotId} have been added to the ledger.`,
        variant: "default",
      });
      resetView();
    }
    setIsSubmitting(false);
  };
  
  const handleSubLotSubmit: SubmitHandler<SubLotFormValues> = (data) => {
    if (!scannedLot) return;

    const newSubLots: Lot[] = [];
    const newWeight = parseFloat((scannedLot.weight / data.subLotCount).toFixed(2));
    const newPrice = parseFloat((scannedLot.price / data.subLotCount).toFixed(2));

    for (let i = 0; i < data.subLotCount; i++) {
        const newLot: Lot = {
            ...scannedLot,
            lotId: `${scannedLot.lotId}-SUB-${String(i + 1).padStart(3, '0')}`,
            parentLotId: scannedLot.lotId,
            weight: newWeight,
            price: newPrice, // Adjust price proportionally
            owner: distributorId,
        };
        newSubLots.push(newLot);
    }
    
    addLots(newSubLots);
    updateLot(scannedLot.lotId, { weight: 0 }); // Mark original lot as fully distributed
    setSubLots(newSubLots);

    toast({
        title: "Sub-lots Created!",
        description: `${data.subLotCount} new lots have been created and are ready for retailers.`
    });
  }

  const resetView = () => {
    setScannedLot(null);
    setError(null);
    setSubLots([]);
    scanForm.reset();
    distributorForm.reset();
    subLotForm.reset();
  }

  const isOwnedByFarmer = scannedLot && scannedLot.owner === scannedLot.farmer;
  const isOwnedByDistributor = scannedLot && scannedLot.owner === distributorId;
  const canBeSplit = isOwnedByDistributor && scannedLot.weight > 0 && !scannedLot.parentLotId;

  if (scannedLot) {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-end">
                <Button variant="outline" onClick={resetView}>Scan Another Lot</Button>
            </div>
            <LotDetailsCard lot={scannedLot} />

            {isOwnedByFarmer && (
                <Card>
                <CardHeader>
                    <CardTitle>Purchase Lot</CardTitle>
                    <CardDescription>To proceed, you must first purchase this lot from the farmer.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button size="lg" className="w-full" onClick={() => setLotToBuy(scannedLot)}>
                        <ShoppingCart className="mr-2" /> Buy Lot for <BadgeIndianRupee className="w-5 h-5 mx-1" />{scannedLot.price * scannedLot.weight}
                    </Button>
                </CardContent>
                </Card>
            )}

            {isOwnedByDistributor && (
                <>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center"><Truck className="mr-2"/> Add Transport Details</CardTitle>
                        <CardDescription>You own this lot. Fill in the details for this phase of the supply chain journey.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...distributorForm}>
                        <form onSubmit={distributorForm.handleSubmit(handleFormSubmit)} className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                            <FormField control={distributorForm.control} name="vehicleNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Number</FormLabel>
                                    <FormControl><Input placeholder="e.g., OD-01-AB-1234" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            <FormField control={distributorForm.control} name="transportCondition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transport Condition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger><SelectValue placeholder="Select a condition" /></SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                                        <SelectItem value="Normal">Normal</SelectItem>
                                    </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            </div>
                            <FormField control={distributorForm.control} name="warehouseEntryDateTime" render={({ field }) => (
                                <FormItem>
                                <FormLabel>Warehouse Entry Date/Time</FormLabel>
                                <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                <FormMessage />
                                </FormItem>
                            )} />
                            <Alert>
                            <Sparkles className="h-4 w-4" />
                            <AlertTitle>AI-Powered Conflict Detection</AlertTitle>
                            <AlertDescription>Upon submission, our AI will check for potential conflicts with existing lot data (e.g., transport conditions vs. crop type).</AlertDescription>
                            </Alert>
                            <div className="flex justify-end">
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit to Ledger
                            </Button>
                            </div>
                        </form>
                        </Form>
                    </CardContent>
                </Card>

                {canBeSplit && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center"><Spline className="mr-2"/> Create Sub-lots for Retailers</CardTitle>
                            <CardDescription>Split this lot into smaller quantities for different retailers. The total weight will be divided equally.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...subLotForm}>
                                <form onSubmit={subLotForm.handleSubmit(handleSubLotSubmit)} className="flex gap-2">
                                    <FormField control={subLotForm.control} name="subLotCount" render={({field}) => (
                                        <FormItem className="flex-1">
                                            <FormControl><Input type="number" placeholder={`Split ${scannedLot.weight} quintal lot into...`} {...field}/></FormControl>
                                            <FormMessage/>
                                        </FormItem>
                                    )}/>
                                    <Button type="submit"><PackagePlus className="h-4 w-4"/></Button>
                                </form>
                            </Form>
                            {subLots.length > 0 && (
                                <div className="mt-6">
                                    <h4 className="font-semibold mb-4">Generated Sub-lot QRs:</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-h-80 overflow-y-auto p-1">
                                        {subLots.map(lot => (
                                            <div key={lot.lotId} className="text-center p-2 rounded-lg border">
                                                <div className="p-2 bg-white rounded-md inline-block">
                                                    <QRCode value={lot.lotId} size={80} level={"H"} />
                                                </div>
                                                <p className="text-xs font-mono mt-1 truncate">{lot.lotId}</p>
                                                <p className="text-xs text-muted-foreground">{lot.weight} quintals</p>
                                            </div>
                                        ))}
                                    </div>
                                    <Alert className="mt-4">
                                        <AlertDescription>The parent lot's weight has been set to 0. These new sub-lots are now available for retailers to scan and purchase.</AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                </>
            )}
            
            <AlertDialog open={!!conflict} onOpenChange={() => setConflict(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center text-destructive"><XCircle className="mr-2" /> AI Conflict Detected!</AlertDialogTitle>
                    <AlertDialogDescription className="text-left pt-4 space-y-2">
                        <p className="font-bold">Details:</p>
                        <p>{conflict?.conflictDetails}</p>
                        {conflict?.resolutionOptions && <>
                            <p className="font-bold pt-2">Suggested Resolution:</p>
                            <p>{conflict.resolutionOptions}</p>
                        </>}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogAction onClick={() => setConflict(null)}>Acknowledge & Review</AlertDialogAction>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!lotToBuy} onOpenChange={() => setLotToBuy(null)}>
                <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                    <AlertDialogDescription>
                    Are you sure you want to purchase Lot {lotToBuy?.lotId} for a total of <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />{lotToBuy ? lotToBuy.price * lotToBuy.weight : 0}? This action will be recorded on the ledger.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleConfirmPurchase}>Confirm Purchase</AlertDialogAction>
                </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={!!lotToPay} onOpenChange={(open) => !open && !isPaying && setLotToPay(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Finalize Payment</AlertDialogTitle>
                        <AlertDialogDescription>
                            Proceed to pay the farmer for Lot {lotToPay?.lotId}. Total amount: <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />{lotToPay ? lotToPay.price * lotToPay.weight : 0}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-4 text-center text-muted-foreground">
                        (This is a simulated payment screen)
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isPaying} onClick={() => setLotToPay(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePayment} disabled={isPaying}>
                            {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2"/>}
                            {isPaying ? 'Processing...' : 'Pay Now'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
  }

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
            <CardDescription>Enter the Lot ID to fetch its details. In a real app, you could use a camera to scan.</CardDescription>
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

        <Separator />

        <div className="grid md:grid-cols-2 gap-8">
            <Card>
                <CardHeader>
                    <CardTitle>Available Lots for Purchase</CardTitle>
                    <CardDescription>
                        Browse lots currently available directly from farmers.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {availableLots.length > 0 ? (
                        availableLots.map((lot) => (
                            <div key={lot.lotId} className="border p-4 rounded-lg">
                                <LotDetailsCard lot={lot} />
                                <div className="mt-4 flex justify-end">
                                    <Button onClick={() => setLotToBuy(lot)}>
                                        <ShoppingCart className="mr-2 h-4 w-4" /> Buy Lot for <BadgeIndianRupee className="w-4 h-4 mx-1" />{lot.price * lot.weight}
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            There are no lots currently available for purchase.
                        </p>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ShoppingBag className="mr-2" /> Your Purchased Lots
                    </CardTitle>
                    <CardDescription>
                        These are lots you own. Scan or select them to add details or split them into sub-lots.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 max-h-[60vh] overflow-y-auto">
                    {purchasedLots.length > 0 ? (
                        purchasedLots.map((lot) => (
                            <div key={lot.lotId} className="border p-4 rounded-lg">
                                <LotDetailsCard lot={lot} />
                                <div className="mt-4 flex justify-end">
                                    <Button variant="secondary" onClick={() => handleScan({lotId: lot.lotId})}>
                                        <Spline className="mr-2 h-4 w-4" /> Manage Lot
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-muted-foreground text-center py-4">
                            You have not purchased any lots yet.
                        </p>
                    )}
                </CardContent>
            </Card>

            {createdSubLots.length > 0 && (
                <div className="md:col-span-2">
                    <Separator />
                    <Card className="mt-8">
                        <CardHeader>
                            <CardTitle>Your Created Sub-Lots</CardTitle>
                            <CardDescription>
                                These are the sub-lots you have created for retailers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {createdSubLots.map((lot) => (
                                <div key={lot.lotId} className="border p-4 rounded-lg space-y-2">
                                    <div className="flex justify-center">
                                      <QRCode value={lot.lotId} size={64} level={"H"} />
                                    </div>
                                    <p className="font-mono text-xs text-center">{lot.lotId}</p>
                                    <p className="text-xs text-center text-muted-foreground">
                                        {lot.weight} quintals from Lot {lot.parentLotId}
                                    </p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>


        <AlertDialog open={!!lotToBuy} onOpenChange={() => setLotToBuy(null)}>
            <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
                <AlertDialogDescription>
                Are you sure you want to purchase Lot {lotToBuy?.lotId} for a total of <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />{lotToBuy ? lotToBuy.price * lotToBuy.weight : 0}? This action will be recorded on the ledger.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmPurchase}>Confirm Purchase</AlertDialogAction>
            </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={!!lotToPay} onOpenChange={(open) => !open && !isPaying && setLotToPay(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Finalize Payment</AlertDialogTitle>
                    <AlertDialogDescription>
                        Proceed to pay the farmer for Lot {lotToPay?.lotId}. Total amount: <BadgeIndianRupee className="w-4 h-4 inline-block mx-1" />{lotToPay ? lotToPay.price * lotToPay.weight : 0}.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4 text-center text-muted-foreground">
                    (This is a simulated payment screen)
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPaying} onClick={() => setLotToPay(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePayment} disabled={isPaying}>
                        {isPaying ? <Loader2 className="animate-spin" /> : <CreditCard className="mr-2"/>}
                        {isPaying ? 'Processing...' : 'Pay Now'}
                    </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
  }
