

"use client";

import { RoleCard } from '@/components/RoleCard';
import { Tractor, Truck, Store, ScanLine, RotateCw } from 'lucide-react';
import Image from 'next/image';
import { placeHolderImages } from '@/lib/placeholder-images';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useLocale } from '@/hooks/use-locale';
import { Button } from '@/components/ui/button';
import { resetData } from './actions';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

export default function Home() {
  const { t } = useLocale();
  const { toast } = useToast();
  const [isResetting, setIsResetting] = useState(false);

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await resetData();
      toast({
        title: "Data Reset Successful",
        description: "The database has been reset to its initial state.",
      });
    } catch (error) {
      console.error("Failed to reset data:", error);
      toast({
        variant: "destructive",
        title: "Data Reset Failed",
        description: "There was an error while resetting the database.",
      });
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <div className="relative flex flex-col min-h-screen bg-background">
       <div className="absolute top-4 right-4 z-10">
          <LanguageSwitcher />
        </div>
      <main className="flex-grow flex flex-col items-center justify-center w-full container mx-auto px-4 py-12 md:py-16">
        <section className="w-full">
          <div className="text-center">
             <h1 className="text-4xl md:text-5xl font-extrabold font-headline tracking-tight mb-4">
                {t('home.title')}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                {t('home.description')}
            </p>
          </div>
         
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
            <RoleCard 
              title={t('roles.farmer.title')}
              href="/farmer"
              icon={<Tractor className="w-10 h-10" />}
              description={t('roles.farmer.description')}
            />
            <RoleCard 
              title={t('roles.distributor.title')}
              href="/distributor"
              icon={<Truck className="w-10 h-10" />}
              description={t('roles.distributor.description')}
            />
            <RoleCard 
              title={t('roles.retailer.title')}
              href="/retailer"
              icon={<Store className="w-10 h-10" />}
              description={t('roles.retailer.description')}
            />
            <RoleCard 
              title={t('roles.consumer.title')}
              href="/trace"
              icon={<ScanLine className="w-10 h-10" />}
              description={t('roles.consumer.description')}
            />
          </div>
        </section>
      </main>
      <footer className="py-6 text-center">
          <Button variant="outline" onClick={handleResetData} disabled={isResetting}>
            <RotateCw className={`mr-2 h-4 w-4 ${isResetting ? 'animate-spin' : ''}`} />
            {isResetting ? 'Resetting Data...' : 'Reset Data'}
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            For demonstration purposes only. This will reset the entire database.
          </p>
      </footer>
    </div>
  );
}
