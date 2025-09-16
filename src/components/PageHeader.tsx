"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { usePathname } from "next/navigation";


interface PageHeaderProps {
  title: string;
  description: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  const pathname = usePathname();

  // Do not show the header on the homepage
  if (pathname === "/") {
      return null;
  }

  return (
    <header className="p-4 border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
            <div>
                <h1 className="text-2xl font-bold font-headline text-primary">{title}</h1>
                <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <Button asChild variant="outline" size="sm">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
        </div>
    </header>
  );
}
