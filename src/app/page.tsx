

"use client";

import { RoleCard } from '@/components/RoleCard';
import { Tractor, Truck, Store, ScanLine } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative flex flex-col min-h-screen bg-background isolate">
      <div
        className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
        aria-hidden="true"
      >
        <div
          className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#4ade80] to-[#3b82f6] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
          style={{
            clipPath:
              'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
          }}
        />
      </div>
      <main className="flex-grow flex flex-col items-center justify-center w-full container mx-auto px-4 py-12 md:py-16">
        <section className="w-full">
          <div className="text-center">
             <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight mb-4">
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
    </div>
  );
}
