
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUserStore } from "@/hooks/use-user-store";
import { useToast } from "@/hooks/use-toast";

const pageTitles: Record<string, { title: string, description: string }> = {
    '/farmer': { title: 'Farmer Dashboard', description: 'Register your new crop lot and generate a unique tracking QR code.' },
    '/distributor': { title: 'Distributor Dashboard', description: 'Purchase lots, split them, and add transport details.' },
    '/retailer': { title: 'Retailer Dashboard', description: 'Scan a lot to view its history and manage retail inventory.' },
    '/trace': { title: 'Scan Product', description: "Scan a product's QR code to see its complete journey." }
}

export function PageHeader() {
  const pathname = usePathname();
  const { user, clearUser } = useUserStore();
  const { toast } = useToast();

  const handleLogout = () => {
    const userName = user?.name;
    clearUser();
    toast({
        title: "Logged Out",
        description: `User ${userName} has been successfully logged out.`,
    });
  };

  if (pathname === "/") {
      return null;
  }
  
  const currentPath = Object.keys(pageTitles).find(p => pathname.startsWith(p)) || pathname;
  const { title, description } = pageTitles[currentPath] || { title: 'AgriChain Trace', description: '' };


  return (
    <header className="p-4 border-b bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <Button onClick={handleLogout} variant="outline" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              )}
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
