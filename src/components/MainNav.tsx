"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const navLinks = [
    { href: "/farmer", label: "Farmer" },
    { href: "/distributor", label: "Distributor" },
    { href: "/retailer", label: "Retailer" },
    { href: "/customer", label: "Customer" },
];

export function MainNav() {
    const pathname = usePathname();

    // Do not show the main nav on the homepage
    if (pathname === "/") {
        return null;
    }

    return (
        <header className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="container mx-auto flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <Link href="/" className="text-lg font-bold font-headline text-primary">AgriChain Trace</Link>
                    <nav className="hidden md:flex items-center gap-2">
                        {navLinks.map(link => {
                             const isActive = pathname.startsWith(link.href);
                             return (
                                <Button key={link.href} asChild variant={isActive ? "secondary" : "ghost"} size="sm">
                                    <Link href={link.href}>{link.label}</Link>
                                </Button>
                             )
                        })}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <Button asChild variant="outline">
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
