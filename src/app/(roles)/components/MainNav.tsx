"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tractor, Truck, Store, ScanLine, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { useUserStore } from "@/hooks/use-user-store";

const links = [
    { name: "Farmer", href: "/farmer", icon: Tractor },
    { name: "Distributor", href: "/distributor", icon: Truck },
    { name: "Retailer", href: "/retailer", icon: Store },
    { name: "Scan Product", href: "/trace", icon: ScanLine },
];

export function MainNav() {
    const pathname = usePathname();
    const { user, clearUser } = useUserStore();

    return (
        <>
            <nav className="flex items-center space-x-4 lg:space-x-6">
                {links.map((link) => {
                    const isActive = pathname.startsWith(link.href);
                    
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            className={cn(
                                "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <link.icon className="h-4 w-4" />
                            {link.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="flex items-center gap-4">
                {user && (
                     <h1 className="text-lg font-bold font-headline text-primary hidden md:block">
                        {user.role.charAt(0) + user.role.slice(1).toLowerCase()} Dashboard
                    </h1>
                )}
                 <Button onClick={clearUser} variant="outline" size="sm">
                    <LogOut className="mr-2" /> Logout
                </Button>
            </div>
        </>
    );
}
