"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tractor, Truck, Store } from "lucide-react";

const links = [
    { name: "Farmer", href: "/farmer", icon: Tractor },
    { name: "Distributor", href: "/distributor", icon: Truck },
    { name: "Transport", href: "/distributor/transport", icon: Truck },
    { name: "Retailer", href: "/retailer", icon: Store },
];

export function MainNav() {
    const pathname = usePathname();
    return (
        <nav className="flex items-center space-x-4 lg:space-x-6">
            {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                // A bit of a hack to not show active for distributor when transport is active
                const isExactlyDistributor = link.href === "/distributor" && pathname !== "/distributor/transport";
                const distributorIsActive = link.href === "/distributor" && pathname.startsWith(link.href) && pathname !== '/distributor/transport';
                const transportIsActive = link.href === "/distributor/transport" && pathname === "/distributor/transport";


                let finalIsActive = isActive;
                if (link.name === 'Distributor') {
                    finalIsActive = pathname.startsWith('/distributor') && !pathname.startsWith('/distributor/transport');
                } else if (link.name === 'Transport') {
                    finalIsActive = pathname.startsWith('/distributor/transport');
                }


                return (
                    <Link
                        key={link.name}
                        href={link.href}
                        className={cn(
                            "text-sm font-medium transition-colors hover:text-primary flex items-center gap-2",
                            finalIsActive ? "text-primary" : "text-muted-foreground"
                        )}
                    >
                        <link.icon className="h-4 w-4" />
                        {link.name}
                    </Link>
                )
            })}
        </nav>
    );
}
