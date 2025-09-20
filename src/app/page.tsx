
"use client";

import { useState } from "react";
import { RoleCard } from '@/components/RoleCard';
import { Tractor, Truck, Store, ScanLine, Trash2 } from 'lucide-react';
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function Home() {
  const { clearStore } = useAgriChainStore();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const handleResetData = () => {
    clearStore();
    setIsResetDialogOpen(false);
    toast({
      title: "Data Cleared",
      description: "All application data has been reset.",
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow flex flex-col items-center justify-center w-full container mx-auto px-4 py-12 md:py-16">
        <section className="w-full">
          <div className="text-center">
             <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight">
                AgriChain Trace
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Bringing transparency and trust to the agricultural supply chain, from farm to fork.
            </p>
          </div>
         
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <RoleCard 
              title="Farmer"
              href="/farmer"
              icon={<Tractor className="w-10 h-10" />}
              description="Register your crop, get a digital certificate, and sell your produce."
            />
            <RoleCard 
              title="Distributor"
              href="/distributor"
              icon={<Truck className="w-10 h-10" />}
              description="Purchase from farmers, manage logistics, and distribute to retailers."
            />
            <RoleCard 
              title="Retailer"
              href="/retailer"
              icon={<Store className="w-10 h-10" />}
              description="Track your inventory, verify authenticity, and manage stock."
            />
            <RoleCard 
              title="Scan Product"
              href="/trace"
              icon={<ScanLine className="w-10 h-10" />}
              description="Scan a product's QR code to view its entire journey from farm to shelf."
            />
          </div>
        </section>
      </main>

      <footer className="w-full py-8">
        <div className="container mx-auto px-4">
            <div className="border-t pt-8">
              <h3 className="text-lg font-semibold text-muted-foreground text-center">Developer Options</h3>
              <div className="mt-4 text-center">
                <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Reset All Data
                </Button>
              </div>
            </div>
        </div>
      </footer>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to reset all data?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all lots, transactions, and other data you have created.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetData} className="bg-destructive hover:bg-destructive/90">
              Yes, Reset Data
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
