"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
            <CardContent className="space-y-6">
            {registeredLots.map((lot, index) => (
                <div key={lot.lotId}>
                    {index > 0 && <Separator className="my-6" />}
                    <LotDetailsCard lot={lot} />
                </div>
            ))}
            </CardContent>
        </Card>
    );
}
