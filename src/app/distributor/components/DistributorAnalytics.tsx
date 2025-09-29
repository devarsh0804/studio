
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, LineChart as LineChartIcon, PackageCheck, ShoppingBag, Spline } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Wheat } from "lucide-react";
import { format } from "date-fns";
import type { Lot } from "@/lib/types";


interface DistributorAnalyticsProps {
  distributorId: string;
  allLots: Lot[];
}

const chartConfig = {
  weight: {
    label: "Weight (q)",
    color: "hsl(var(--chart-1))",
  },
  count: {
    label: "Lots",
    color: "hsl(var(--chart-2))",
  },
  purchased: {
    label: "Purchased",
    color: "hsl(var(--chart-1))",
  },
  split: {
    label: "Split",
    color: "hsl(var(--chart-2))",
  },
  dispatched: {
    label: "Dispatched",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;


export function DistributorAnalytics({ distributorId, allLots }: DistributorAnalyticsProps) {

    const findLot = (lotId: string) => allLots.find(l => l.lotId === lotId);
    
    // A purchased lot is a primary lot that is no longer owned by the original farmer.
    // This is a permanent historical fact, regardless of who owns it now.
    const purchasedLots = allLots.filter(lot => 
        !lot.parentLotId && lot.owner !== lot.farmer
    );
    
    // Sub-lots are created from lots the distributor *currently* owns. This logic is correct.
    const subLotsCreated = allLots.filter(lot => lot.parentLotId && findLot(lot.parentLotId)?.owner === distributorId);

    // Dispatched lots are sub-lots that this distributor created and have been sent out.
    const dispatchedLots = allLots.filter(lot => 
        (lot.status === 'Dispatched' || lot.status === 'Delivered') &&
        lot.parentLotId &&
        findLot(lot.parentLotId)?.owner === distributorId
    );
    
    const valueOfPurchases = purchasedLots.reduce((acc, lot) => acc + (lot.price * lot.weight), 0);

    const cropPurchaseData = purchasedLots.reduce((acc, lot) => {
        const existing = acc.find(item => item.name === lot.cropName);
        if (existing) {
            existing.weight += lot.weight;
        } else {
            acc.push({ name: lot.cropName, weight: lot.weight });
        }
        return acc;
    }, [] as { name: string, weight: number }[]);

    const purchasesOverTime = purchasedLots.reduce((acc, lot) => {
        const month = format(new Date(lot.gradingDate), 'MMM yyyy');
        const existing = acc.find(item => item.month === month);
        if (existing) {
            existing.count += 1;
        } else {
            acc.push({ month, count: 1 });
        }
        return acc;
    }, [] as { month: string, count: number }[]).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots Purchased</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <ShoppingBag className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{purchasedLots.length}</div>
                    <p className="text-xs text-muted-foreground">Total primary lots bought</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Value of Purchases</CardTitle>
                     <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-500">
                        <BadgeIndianRupee className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{valueOfPurchases.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total value of purchased lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sub-lots Created</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Spline className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{subLotsCreated.length}</div>
                    <p className="text-xs text-muted-foreground">From lots you currently own</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dispatched Lots</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-orange-500/10 text-orange-500">
                        <PackageCheck className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{dispatchedLots.length}</div>
                    <p className="text-xs text-muted-foreground">Sub-lots sent to retailers</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Wheat className="mr-2"/> Purchased Crops by Weight</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart accessibilityLayer data={cropPurchaseData}>
                                <CartesianGrid vertical={false} />
                                <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false}/>
                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value} q`}/>
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dot" />}
                                />
                                <Bar dataKey="weight" fill="var(--color-weight)" radius={4} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><LineChartIcon className="mr-2"/> Purchases Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart accessibilityLayer data={purchasesOverTime}>
                              <CartesianGrid vertical={false} />
                               <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                               <YAxis tickLine={false} axisLine={false} allowDecimals={false}/>
                              <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                              <Line type="monotone" dataKey="count" stroke="var(--color-count)" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
