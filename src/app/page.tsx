
"use client";

import { RoleCard } from '@/components/RoleCard';
import { Tractor, Truck, Store, ScanLine } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen home-bg-pattern">
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
