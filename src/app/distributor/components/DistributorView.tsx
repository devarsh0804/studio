
"use client";

import { useState, useRef } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ScanLine, Search, Truck, XCircle, ShoppingCart, BadgeIndianRupee, CreditCard, ShoppingBag, LogOut, PackagePlus, Spline, Sparkles, Download } from "lucide-react";
import QRCode from "qrcode.react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { detectConflictAction } from "@/app/actions";
import type { DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";


const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;


const subLotSchema = z.object({
    subLotCount: z.coerce.number().int().min(2, "Must create at least 2 sub-lots.").max(100),
});
type SubLotFormValues = z.infer<typeof subLotSchema>;

const transportSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  transportCondition: z.enum(["Cold Storage", "Normal"]),
  warehouseEntryDateTime: z.string().min(1, "Warehouse entry date/time is required"),
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
  const [lotForTransport, setLotForTransport] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [isSubmittingTransport, setIsSubmittingTransport] = useState(false);
  const [subLots, setSubLots] = useState<Lot[]>([]);
  const [conflict, setConflict] = useState<DistributorUpdateConflictDetectionOutput | null>(null);
  
  const { findLot, updateLot, getAllLots, addLots, addTransportEvent } = useAgriChainStore();
  const { toast } = useToast();
  const qrCodeRef = useRef<HTMLDivElement>(null);

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const subLotForm = useForm<SubLotFormValues>({ resolver: zodResolver(subLotSchema) });
  const transportForm = useForm<TransportFormValues>({ resolver: zodResolver(transportSchema), defaultValues: { vehicleNumber: '', transportCondition: 'Normal', warehouseEntryDateTime: '' } });
  
  const allLots = getAllLots();
  const availableLots = allLots.filter(lot => lot.owner === lot.farmer);
  const purchasedLots = allLots.filter(lot => lot.owner === distributorId && !lot.parentLotId);

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    const lot = findLot(data.lotId, true);
    setTimeout(() => {
      if (lot) {
        setScannedLot(lot);
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
      
      setLotToPay(null);
      setIsPaying(false);
    }, 1500);
  }
  
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
            owner: distributorId
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
  
  const handleTransportSubmit: SubmitHandler<TransportFormValues> = async (data) => {
    if (!lotForTransport) return;

    setIsSubmittingTransport(true);
    setConflict(null);
    const result = await detectConflictAction(lotForTransport, data);

    if (result.conflictDetected) {
      setConflict(result);
    } else {
      addTransportEvent(lotForTransport.lotId, { ...data, timestamp: new Date().toISOString() });
      toast({
        title: "Success!",
        description: `Transport details for Lot ID ${lotForTransport.lotId} have been added.`,
      });
      setLotForTransport(null);
      transportForm.reset();
    }
    setIsSubmittingTransport(false);
  }
  
  const downloadQR = () => {
    if (qrCodeRef.current) {
      const canvas = qrCodeRef.current.querySelector("canvas");
      if (canvas && lotForTransport) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${lotForTransport.lotId}.png`;
        a.click();
      }
    }
  };


  const resetView = () => {
    setScannedLot(null);
    setError(null);
    setSubLots([]);
    scanForm.reset();
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
                                            <Button
                                                key={lot.lotId}
                                                variant="outline"
                                                className="h-auto flex-col p-2"
                                                onClick={() => {
                                                  transportForm.reset();
                                                  setLotForTransport(lot);
                                                }}
                                            >
                                                <div className="p-2 bg-white rounded-md">
                                                    <QRCode value={lot.lotId} size={80} level={"H"} />
                                                </div>
                                                <p className="text-xs font-mono mt-1 truncate">{lot.lotId}</p>
                                                <p className="text-xs text-muted-foreground">{lot.weight} quintals</p>
                                            </Button>
                                        ))}
                                    </div>
                                    <Alert className="mt-4">
                                        <AlertDescription>Click a QR code to add transport details for that specific sub-lot. The parent lot's weight is now 0.</AlertDescription>
                                    </Alert>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
                </>
            )}
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

        <div className="grid grid-cols-1 gap-8">
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
        
        <Dialog open={!!lotForTransport} onOpenChange={(open) => !open && setLotForTransport(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center"><Truck className="mr-2"/> Add Transport for Sub-Lot</DialogTitle>
                    <DialogDescription>
                        Lot ID: <span className="font-mono text-primary">{lotForTransport?.lotId}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex justify-center" ref={qrCodeRef}>
                        <div className="p-2 bg-white rounded-md inline-block">
                            <QRCode value={lotForTransport?.lotId || ''} size={128} level={"H"} />
                        </div>
                    </div>
                    <Form {...transportForm}>
                        <form onSubmit={transportForm.handleSubmit(handleTransportSubmit)} className="space-y-4">
                                <FormField control={transportForm.control} name="vehicleNumber" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Vehicle Number</FormLabel>
                                    <FormControl><Input placeholder="e.g., OD-01-AB-1234" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            <FormField control={transportForm.control} name="transportCondition" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Transport Condition</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select a condition" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                                            <SelectItem value="Normal">Normal</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                                )} />
                            <FormField control={transportForm.control} name="warehouseEntryDateTime" render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Warehouse Entry Date/Time</FormLabel>
                                    <FormControl><Input type="datetime-local" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <Alert>
                                <Sparkles className="h-4 w-4" />
                                <AlertTitle>AI-Powered Conflict Detection</AlertTitle>
                                <AlertDescription>Our AI will check for potential conflicts with existing lot data.</AlertDescription>
                            </Alert>
                            <div className="flex justify-between gap-2">
                                <Button type="button" variant="outline" onClick={downloadQR}><Download className="mr-2"/>Print QR</Button>
                                <Button type="submit" disabled={isSubmittingTransport}>
                                    {isSubmittingTransport && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </DialogContent>
        </Dialog>

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
    </div>
    );
  }

    