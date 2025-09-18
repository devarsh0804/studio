
"use client";

import { Leaf, RotateCcw, Store, Tractor, Truck } from 'lucide-react';
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
      description: 'Register lots, get them graded, and generate unique QR codes.',
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
  ];

  const handleResetData = () => {
    try {
      localStorage.removeItem('agrichain-storage');
      localStorage.removeItem('graded-lots-storage');
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
    <div className="flex flex-col min-h-screen">
      <header className="py-12">
        <div className="container mx-auto text-center">
            <div className="flex justify-center items-center mb-4 bg-primary/10 p-4 rounded-full w-24 h-24 mx-auto animate-in fade-in duration-500">
                <Leaf className="w-12 h-12 text-primary" />
            </div>
          <h1 className="font-headline text-5xl md:text-6xl font-bold animate-in fade-in slide-in-from-top-4 duration-700">
            AgriChain Trace
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-in fade-in slide-in-from-top-6 duration-900">
            Bringing transparency to the agricultural supply chain, from farm to fork.
          </p>
        </div>
      </header>

      <main className="flex-grow w-full max-w-5xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <RoleCard key={role.title} {...role} />
          ))}
        </div>
      </main>

      <div className="absolute top-4 right-4 z-20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm">
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
    </div>
  );
}
