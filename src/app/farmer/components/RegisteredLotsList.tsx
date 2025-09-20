
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

export function RegisteredLotsList() {
    const { getAllLots } = useAgriChainStore(
        (state) => ({ getAllLots: state.getAllLots })
    );
    const registeredLots = getAllLots();

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle>Registered Lots</CardTitle>
                <CardDescription>
                    View the details of all your registered crop lots.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 {registeredLots.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                         <p className="text-muted-foreground text-center py-4">
                            No lots have been registered yet.
                        </p>
                    </div>
                ) : (
                    <ScrollArea className="h-[75vh] pr-4">
                        <div className="space-y-6">
                            {registeredLots.map((lot) => (
                                <LotDetailsCard key={lot.lotId} lot={lot} />
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}

    
