
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function RegisteredLotsList() {
    const { getAllLots } = useAgriChainStore(
        (state) => ({ getAllLots: state.getAllLots })
    );
    const registeredLots = getAllLots();


    if (registeredLots.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Registered Lots</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-center py-4">
                        No lots have been registered yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Registered Lots</CardTitle>
                <CardDescription>
                    View the details of all your registered crop lots.
                </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registeredLots.map((lot) => (
                <LotDetailsCard key={lot.lotId} lot={lot} />
            ))}
            </CardContent>
        </Card>
    );
}

    
