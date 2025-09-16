
"use client";

import { Tractor, Truck, Store, User, RotateCcw } from 'lucide-react';
import { RoleCard } from '@/components/RoleCard';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


export default function Home() {
  const { toast } = useToast();

  const roles = [
    {
      title: 'Farmer / Sahayak',
      icon: <Tractor className="w-12 h-12" />,
      href: '/farmer',
      description: 'Register crops and generate unique QR codes for your produce.',
    },
    {
      title: 'Distributor',
      icon: <Truck className="w-12 h-12" />,
      href: '/distributor',
      description: 'Scan lots and update transportation and storage details.',
    },
    {
      title: 'Retailer',
      icon: <Store className="w-12 h-12" />,
      href: '/retailer',
      description: 'Manage inventory, create retail packs, and track product history.',
    },
    {
      title: 'Customer',
      icon: <User className="w-12 h-12" />,
      href: '/customer',
      description: 'Scan product QR codes to trace their journey from farm to shelf.',
    },
  ];

  const handleResetData = () => {
    try {
      localStorage.removeItem('agrichain-storage');
      toast({
        title: "Application Data Cleared",
        description: "All entered data has been removed. The page will now reload.",
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (e) {
      console.error("Could not reset data:", e);
      toast({
        variant: 'destructive',
        title: "Error",
        description: "Could not clear application data.",
      });
    }
  };


  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
      <div className="absolute top-4 right-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <RotateCcw className="mr-2 h-4 w-4" /> Reset Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete all application data from your browser's local storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleResetData}>Continue</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="text-center mb-12">
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary">
          AgriChain Trace
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Bringing transparency to the agricultural supply chain, from farm to fork. Select your role to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
        {roles.map((role) => (
          <RoleCard key={role.title} {...role} />
        ))}
      </div>
    </main>
  );
}
