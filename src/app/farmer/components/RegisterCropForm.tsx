'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BadgeIndianRupee, Wheat, Loader2, Search, FileCheck2 } from "lucide-react";
import type { Lot } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useGradedLotsStore } from "@/hooks/use-graded-lots-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";

const fetchSchema = z.object({
  lotId: z.string().min(1, { message: "Lot ID is required." }),
});

const registerSchema = z.object({
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
});

interface RegisterCropFormProps {
  onRegister: (lot: Lot) => void;
}

export function RegisterCropForm({ onRegister }: RegisterCropFormProps) {
  const { toast } = useToast();
  const [isFetching, setIsFetching] = useState(false);
  const [fetchedLot, setFetchedLot] = useState<Lot | null>(null);
  const { findAndRemoveLot } = useGradedLotsStore();
  
  const fetchForm = useForm<z.infer<typeof fetchSchema>>({
    resolver: zodResolver(fetchSchema),
    defaultValues: { lotId: "" },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { price: undefined },
  });

  async function handleFetch(values: z.infer<typeof fetchSchema>) {
    setIsFetching(true);
    setFetchedLot(null);
    registerForm.reset();

    // Simulate network delay
    setTimeout(() => {
        const gradedLot = findAndRemoveLot(values.lotId);
        if (gradedLot) {
            setFetchedLot(gradedLot);
            toast({
                title: "Certificate Found!",
                description: `Details for Lot ID ${values.lotId} have been loaded.`,
            });
        } else {
            toast({
                variant: "destructive",
                title: "Not Found",
                description: `No pending quality certificate found for Lot ID ${values.lotId}.`,
            });
        }
        setIsFetching(false);
    }, 500);
  }

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    if (!fetchedLot) return;

    const finalLot: Lot = {
        ...fetchedLot,
        price: values.price,
        owner: fetchedLot.farmer,
    };
    
    onRegister(finalLot);
    
    toast({
      title: "Lot Registered!",
      description: `Lot ID ${finalLot.lotId} is now on the ledger and available for purchase.`,
    })

    setFetchedLot(null);
    fetchForm.reset();
    registerForm.reset();
  }
  
  if (fetchedLot) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Register Pre-Graded Lot</CardTitle>
           <CardDescription>
                The quality certificate has been loaded. Please set your price per quintal to finalize registration.
           </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <LotDetailsCard lot={fetchedLot} />
            <Form {...registerForm}>
                <form onSubmit={registerForm.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                    <FormField
                      control={registerForm.control}
                      name="price"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Set Your Price (per quintal)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <BadgeIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder="e.g., 2000" {...field} className="pl-10" />
                                </div>
                            </FormControl>
                          <FormMessage />
                          </FormItem>
                      )}
                    />
                    <div className="flex gap-4">
                     <Button type="button" variant="outline" onClick={() => setFetchedLot(null)} className="w-full">
                        Cancel
                    </Button>
                    <Button type="submit" size="lg" className="w-full">
                        Register Lot on Ledger
                    </Button>
                    </div>
                </form>
            </Form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Wheat className="mr-2"/> Register New Crop Lot
        </CardTitle>
        <CardDescription>
            Enter the Lot ID from the digital quality certificate provided by the IoT Grading Station.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...fetchForm}>
          <form onSubmit={fetchForm.handleSubmit(handleFetch)} className="space-y-8">
            <Alert>
                <FileCheck2 className="h-4 w-4" />
                <AlertTitle>New Workflow!</AlertTitle>
                <AlertDescription>
                    Your crop must be graded at the IoT Grading Station first. Once you receive a Lot ID, enter it here to register your crop on the supply chain.
                </AlertDescription>
            </Alert>
            <FormField
              control={fetchForm.control}
              name="lotId"
              render={({ field }) => (
                  <FormItem>
                  <FormLabel>Lot ID from Quality Certificate</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                        <Input placeholder="e.g., LOT-..." {...field} />
                        <Button type="submit" disabled={isFetching}>
                            {isFetching ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                  </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
