"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Tractor, Truck, Store } from "lucide-react";

const links = [
    { name: "Farmer", href: "/farmer", icon: Tractor },
    { name: "Distributor", href: "/distributor", icon: Truck },
    { name: "Retailer", href: "/retailer", icon: Store },
];

export function MainNav() {
    const pathname = usePathname();
    return (
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
    );
}
