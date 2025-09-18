
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
import { placeHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';


export default function Home() {
  const { toast } = useToast();
  const heroImage = placeHolderImages.find(p => p.id === 'hero');

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
       <div className="absolute top-4 right-4 z-20">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="bg-white/80 hover:bg-white text-destructive shadow-lg">
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

      <section className="relative w-full h-[60vh] flex items-center justify-center text-center text-white">
        {heroImage && (
             <Image 
                src={heroImage.imageUrl} 
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                priority
             />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4 max-w-4xl">
            <div className="flex justify-center items-center mb-4 bg-white/10 p-4 rounded-full w-24 h-24 mx-auto backdrop-blur-sm">
                <Leaf className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-bold">
            AgriChain Trace
            </h1>
            <p className="mt-4 text-lg md:text-xl text-white/90">
            Bringing transparency to the agricultural supply chain, from farm to fork.
            </p>
        </div>
      </section>

      <section className="flex-grow w-full max-w-5xl mx-auto p-8">
        <h2 className="text-3xl font-headline font-bold text-center mb-2">Select Your Role</h2>
        <p className="text-center text-muted-foreground mb-12">Choose your role in the supply chain to get started.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {roles.map((role) => (
            <RoleCard key={role.title} {...role} />
            ))}
        </div>
      </section>
    </div>
  );
}
