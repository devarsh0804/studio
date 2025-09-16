import { Tractor, Truck, Store, User } from 'lucide-react';
import { RoleCard } from '@/components/RoleCard';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
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

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 md:p-8">
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
