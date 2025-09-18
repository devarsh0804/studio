import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Home } from "lucide-react";
import { MainNav } from "./components/MainNav";

export default function RolesLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-col md:flex">
            <div className="border-b">
                <div className="flex h-16 items-center px-4 container mx-auto">
                    <MainNav />
                    <div className="ml-auto flex items-center space-x-4">
                        <Button asChild variant="outline" size="sm">
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" /> 
                                Back to Home
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {children}
            </div>
        </div>
    );
}
