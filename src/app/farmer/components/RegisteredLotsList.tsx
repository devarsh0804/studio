
"use client";

import { LotDetailsCard } from "@/components/LotDetailsCard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocale } from "@/hooks/use-locale";
import type { Lot } from "@/lib/types";

interface RegisteredLotsListProps {
    lots: Lot[];
}

export function RegisteredLotsList({ lots }: RegisteredLotsListProps) {
    const { t } = useLocale();

    return (
        <Card>
            <CardHeader>
                <CardTitle>{t('farmerView.lotList.title')}</CardTitle>
                <CardDescription>
                    {t('farmerView.lotList.description')}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {lots.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                        {t('farmerView.lotList.noLots')}
                    </p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lots.map((lot) => (
                            <LotDetailsCard key={lot.lotId} lot={lot} />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
