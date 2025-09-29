
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";

interface RegisteredLotsListProps {
    farmerName: string;
}

export function RegisteredLotsList({ farmerName }: RegisteredLotsListProps) {
    const { t } = useLocale();
    const { getAllLots } = useAgriChainStore(
        (state) => ({ getAllLots: state.getAllLots })
    );
    const registeredLots = getAllLots().filter(lot => lot.farmer === farmerName);

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('farmerView.lotList.title')}</CardTitle>
                <CardDescription>
                    {t('farmerView.lotList.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {registeredLots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        {t('farmerView.lotList.noLots')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {registeredLots.map((lot) => (
                            <LotDetailsCard key={lot.lotId} lot={lot} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
