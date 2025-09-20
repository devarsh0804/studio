"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/hooks/use-user-store";

const pageTitles: Record<string, { title: string, description: string }> = {
    '/farmer': { title: 'Farmer', description: 'Register your new crop lot and generate a unique tracking QR code.' },
    '/distributor': { title: 'Distributor Dashboard', description: 'Purchase lots, split them, and add transport details.' },
    '/retailer': { title: 'Retailer', description: 'Scan a lot to view its history and manage retail inventory.' },
    '/trace': { title: 'Scan Product', description: "Scan a product's QR code to see its complete journey." }
}

export function PageHeader() {
  const pathname = usePathname();
  const { user } = useUserStore();

  if (pathname === "/") {
      return null;
  }
  
  const currentPath = Object.keys(pageTitles).find(p => pathname.startsWith(p)) || pathname;
  let { title, description } = pageTitles[currentPath] || { title: 'AgriChain Trace', description: '' };

  if (user) {
    if (user.role === 'FARMER' && pathname.startsWith('/farmer')) {
        title = `Welcome, ${user.name}`;
    } else if (user.role === 'DISTRIBUTOR' && pathname.startsWith('/distributor')) {
        title = `Welcome, ${user.name}`;
    } else if (user.role === 'RETAILER' && pathname.startsWith('/retailer')) {
        title = `Welcome, ${user.name}`;
    }
  } else {
    if (pathname.startsWith('/farmer') || pathname.startsWith('/distributor') || pathname.startsWith('/retailer')) {
        description = "Please log in to continue.";
    }
  }


  return (
    <header className="p-4 border-b bg-card/80 backdrop-blur-sm -mt-8">
        <div className="container mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                  <Link href="/">
                      <Home className="mr-2 h-4 w-4" />
                      Back to Home
                  </Link>
              </Button>
            </div>
        </div>
    </header>
  );
}
