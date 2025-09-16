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
import { Loader2, ScanLine, Search, Sparkles, Truck, XCircle, ShoppingCart } from "lucide-react";
import { detectConflictAction } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import type { DistributorUpdateConflictDetectionOutput } from "@/ai/flows/distributor-update-conflict-detection";

const scanSchema = z.object({ lotId: z.string().min(1, "Please enter a Lot ID") });
type ScanFormValues = z.infer<typeof scanSchema>;

const distributorSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
  transportCondition: z.enum(["Cold Storage", "Normal"]),
  warehouseEntryDateTime: z.string().min(1, "Warehouse entry date/time is required"),
});
type DistributorFormValues = z.infer<typeof distributorSchema>;

export function DistributorView() {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflict, setConflict] = useState<DistributorUpdateConflictDetectionOutput | null>(null);
  const [showBuyConfirm, setShowBuyConfirm] = useState(false);
  
  const { findLot, addTransportEvent, updateLot } = useAgriChainStore();
  const { toast } = useToast();

  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema) });
  const distributorForm = useForm<DistributorFormValues>({ resolver: zodResolver(distributorSchema) });

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    const lot = findLot(data.lotId);
    setTimeout(() => {
      if (lot) {
        setScannedLot(lot);
        distributorForm.reset();
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  const handleBuyLot = () => {
    if (!scannedLot) return;
    
    // In a real app, this would be a user profile.
    const distributorId = "Distributor-XYZ"; 
    
    updateLot(scannedLot.lotId, { owner: distributorId });
    
    const updatedLot = findLot(scannedLot.lotId);
    if(updatedLot) setScannedLot(updatedLot);

    toast({
      title: "Purchase Successful!",
      description: `You now own Lot ${scannedLot.lotId}.`,
    });
    setShowBuyConfirm(false);
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
  
  const resetView = () => {
    setScannedLot(null);
    setError(null);
    scanForm.reset();
    distributorForm.reset();
  }

  const isOwnedByFarmer = scannedLot && scannedLot.owner === scannedLot.farmer;

  if (!scannedLot) {
    return (
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
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <LotDetailsCard lot={scannedLot} />

      {isOwnedByFarmer && (
        <Card>
          <CardHeader>
            <CardTitle>Purchase Lot</CardTitle>
            <CardDescription>To proceed, you must first purchase this lot from the farmer.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button size="lg" className="w-full" onClick={() => setShowBuyConfirm(true)}>
              <ShoppingCart className="mr-2" /> Buy Lot for ₹{scannedLot.price * scannedLot.weight}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isOwnedByFarmer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center"><Truck className="mr-2"/> Add Transport Details</CardTitle>
            <CardDescription>Fill in the details for this phase of the supply chain journey.</CardDescription>
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
                <div className="flex gap-4">
                  <Button type="button" variant="outline" onClick={resetView}>Scan Another Lot</Button>
                  <Button type="submit" disabled={isSubmitting} className="flex-1">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit to Ledger
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
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

      <AlertDialog open={showBuyConfirm} onOpenChange={setShowBuyConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Purchase</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to purchase Lot {scannedLot.lotId} for a total of ₹{scannedLot.price * scannedLot.weight}? This action will be recorded on the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleBuyLot}>Confirm Purchase</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
