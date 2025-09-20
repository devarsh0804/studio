
"use client";

import { RoleCard } from '@/components/RoleCard';
import { Tractor, Truck, Store } from 'lucide-react';
import Image from 'next/image';
import { placeHolderImages } from '@/lib/placeholder-images';

export default function Home() {
  const heroImage = placeHolderImages.find(p => p.id === 'hero');

  return (
    <div className="flex flex-col min-h-screen">
      <header className="relative h-[400px] md:h-[500px] flex items-center justify-center text-white text-center px-4 overflow-hidden">
        {heroImage && (
           <Image 
            src={heroImage.imageUrl} 
            alt={heroImage.description} 
            fill
            style={{ objectFit: 'cover' }}
            priority 
            data-ai-hint={heroImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold font-headline tracking-tight">
            AgriChain Trace
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl">
            Bringing transparency and trust to the agricultural supply chain, from farm to fork.
          </p>
        </div>
      </header>

      <main className="flex-grow w-full container mx-auto px-4 py-12 md:py-16">
        <section className="text-center">
          <h2 className="text-3xl font-bold font-headline">Who are you?</h2>
          <p className="mt-2 text-muted-foreground max-w-2xl mx-auto">
            Select your role in the supply chain to access your dedicated dashboard and tools.
          </p>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
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
          </div>
        </section>
      </main>
    </div>
  );
}
