
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, Box, PackageCheck, PieChart, ShoppingBag, Spline, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartConfig } from "@/components/ui/chart";


interface DistributorAnalyticsProps {
  distributorId: string;
}

const chartConfig = {
  weight: {
    label: "Weight (q)",
    color: "hsl(var(--chart-1))",
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


export function DistributorAnalytics({ distributorId }: DistributorAnalyticsProps) {
    const { getAllLots, findLot } = useAgriChainStore();
    const allLots = getAllLots();

    const purchasedLots = allLots.filter(lot => lot.owner === distributorId && !lot.parentLotId);
    const subLotsCreated = allLots.filter(lot => lot.parentLotId && findLot(lot.parentLotId)?.owner === distributorId);
    const dispatchedLots = subLotsCreated.filter(lot => lot.status === 'Dispatched' || lot.status === 'Delivered');
    
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

    const lotStatusData = [
        { name: 'Purchased', value: purchasedLots.filter(lot => lot.weight > 0).length, fill: "var(--color-purchased)"},
        { name: 'Split', value: subLotsCreated.length > 0 ? purchasedLots.filter(lot => lot.weight === 0).length : 0, fill: "var(--color-split)" },
        { name: 'Dispatched', value: dispatchedLots.length, fill: "var(--color-dispatched)" }
    ].filter(item => item.value > 0);


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
                    <p className="text-xs text-muted-foreground">From splitting primary lots</p>
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
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><PieChart className="mr-2"/> Lot Status Overview</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
                        <PieChart>
                          <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                          <Pie data={lotStatusData} dataKey="value" nameKey="name" innerRadius={50}>
                             {lotStatusData.map((entry) => (
                                <Cell key={entry.name} fill={entry.fill} />
                             ))}
                          </Pie>
                          <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

    