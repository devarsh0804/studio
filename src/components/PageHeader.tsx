
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
    title: string;
    description: string;
    isLoggedIn?: boolean;
    onLogout?: () => void;
}

export function PageHeader({ title, description, isLoggedIn, onLogout }: PageHeaderProps) {
    const pathname = usePathname();
    // Don't show header on the main homepage
    if (pathname === "/") {
        return null;
    }

    return (
        <div className="border-b py-4">
            <div className="container mx-auto px-4 md:px-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold font-headline">{title}</h1>
                    <p className="text-muted-foreground mt-1">{description}</p>
                </div>
                <div className="flex items-center gap-2">
                    {isLoggedIn && onLogout && (
                         <Button onClick={onLogout} variant="outline">
                            <LogOut className="mr-2" /> Logout
                        </Button>
                    )}
                    <Button asChild variant="outline">
                        <Link href="/">
                            <Home className="mr-2" /> Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
