
"use client";

import { useState, useRef, useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import type { Lot } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ScanLine, Search, Sparkles, Truck, XCircle, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const transportSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  transportCondition: z.enum(["Cold Storage", "Normal"]),
  warehouseEntryDateTime: z.string().min(1, "Warehouse entry date/time is required"),
});
type TransportFormValues = z.infer<typeof transportSchema>;


export function TransportView() {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<DistributorUpdateConflictDetectionOutput | null>(null);
  
  const { findLot } = useAgriChainStore();
  const { toast } = useToast();
  
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  let barcodeDetector: any;
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
  }

  const scanForm = useForm<ScanFormValues>({ 
    resolver: zodResolver(scanSchema),
    defaultValues: { lotId: "" },
  });
  const transportForm = useForm<TransportFormValues>({ 
    resolver: zodResolver(transportSchema),
    defaultValues: {
      vehicleNumber: "",
      transportCondition: "Normal",
      warehouseEntryDateTime: "",
    }
  });

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startScan = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                 setHasCameraPermission(false);
                 return;
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const detectBarcode = async () => {
                if (videoRef.current && barcodeDetector && videoRef.current.readyState === 4) {
                    const barcodes = await barcodeDetector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        const scannedValue = barcodes[0].rawValue;
                        scanForm.setValue('lotId', scannedValue);
                        handleScan({ lotId: scannedValue });
                        stopScan();
                    }
                }
            };
            intervalId = setInterval(detectBarcode, 500);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    };

    const stopScan = () => {
        if (intervalId) clearInterval(intervalId);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };
    
    if (showCamera) {
        startScan();
    }

    return () => {
        stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera, barcodeDetector, scanForm]);

  
  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    setScannedLot(null); // Reset previous lot
    setShowCamera(false);
    
    // Simulate network delay
    setTimeout(() => {
      const lot = findLot(data.lotId);
      if (lot) {
        setScannedLot(lot);
        transportForm.reset({
            vehicleNumber: "",
            transportCondition: "Normal",
            warehouseEntryDateTime: "",
        });
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500); 
  };

  const handleFormSubmit: SubmitHandler<TransportFormValues> = async (data) => {
    if (!scannedLot) return;

    setIsSubmitting(true);
    
    // AI conflict detection logic removed for now
    
    toast({
        title: "Success!",
        description: `Transport details for Lot ID ${scannedLot.lotId} have been added to the ledger.`,
        variant: "default",
    });
    resetView();

    setIsSubmitting(false);
  };

  const resetView = () => {
    setScannedLot(null);
    setError(null);
    scanForm.reset();
    transportForm.reset();
  }

  if (scannedLot) {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex justify-end">
                <Button variant="outline" onClick={resetView}>Scan Another Lot</Button>
            </div>
            <LotDetailsCard lot={scannedLot} />
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Truck className="mr-2"/> Add Transport Details</CardTitle>
                    <CardDescription>Fill in the details for this phase of the supply chain journey.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...transportForm}>
                    <form onSubmit={transportForm.handleSubmit(handleFormSubmit)} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
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
                        <FormField control={transportForm.control} name="warehouseEntryDateTime" render={({ field }) => (
                            <FormItem>
                            <FormLabel>Warehouse Entry Date/Time</FormLabel>
                            <FormControl><Input type="datetime-local" {...field} /></FormControl>
                            <FormMessage />
                            </FormItem>
                        )} />
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

  return (
    <div className="space-y-8">
        <Card className="max-w-xl mx-auto">
            <CardHeader>
            <CardTitle className="flex items-center"><ScanLine className="mr-2" /> Scan Lot QR Code</CardTitle>
            <CardDescription>Enter the Lot ID to add transport details for it. This can be a main lot or a sub-lot.</CardDescription>
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
                <Button type="button" variant="outline" size="icon" onClick={() => setShowCamera(true)}><Camera/></Button>
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
        
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent size="lg">
                <DialogHeader>
                    <DialogTitle>Scan Lot QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at the QR code on the lot.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
                    <video ref={videoRef} className="w-full aspect-video" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <Alert variant="destructive" className="w-auto">
                            <Camera className="h-4 w-4"/>
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    {hasCameraPermission === undefined && <Loader2 className="h-8 w-8 animate-spin text-white"/>}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
