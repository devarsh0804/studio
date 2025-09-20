
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, Box, LineChart, Store, Truck, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { format } from "date-fns";

interface RetailerAnalyticsProps {
  retailerId: string;
}

const chartConfig = {
  value: {
    label: "Weight (q)",
    color: "hsl(var(--chart-1))",
  },
  inventoryValue: {
      label: "Inventory Value",
      color: "hsl(var(--chart-2))",
  },
  inTransit: {
    label: "In Transit",
    color: "hsl(var(--chart-2))",
  },
  delivered: {
    label: "Delivered",
    color: "hsl(var(--chart-3))",
  },
  stocked: {
    label: "Stocked",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function RetailerAnalytics({ retailerId }: RetailerAnalyticsProps) {
    const { getAllLots, findLot } = useAgriChainStore();
    const inventoryLots = getAllLots().filter(lot => lot.owner === retailerId);

    const inventoryValue = inventoryLots.reduce((acc, lot) => acc + (lot.price * lot.weight), 0);
    const lotsInTransit = inventoryLots.filter(lot => lot.status === 'Dispatched').length;
    const lotsOnShelf = inventoryLots.filter(lot => lot.status === 'Stocked').length;

    const inventoryByCrop = inventoryLots.reduce((acc, lot) => {
        const existing = acc.find(item => item.name === lot.cropName);
        if (existing) {
            existing.value += lot.weight;
        } else {
            acc.push({ name: lot.cropName, value: lot.weight });
        }
        return acc;
    }, [] as { name: string, value: number }[]);

    const inventoryValueOverTime = inventoryLots.reduce((acc, lot) => {
        const parentLot = findLot(lot.parentLotId ?? "");
        if (!parentLot) return acc;

        const month = format(new Date(parentLot.gradingDate), 'MMM yyyy');
        const value = lot.price * lot.weight;
        const existing = acc.find(item => item.month === month);
        if (existing) {
            existing.inventoryValue += value;
        } else {
            acc.push({ month, inventoryValue: value });
        }
        return acc;
    }, [] as { month: string, inventoryValue: number }[]).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots in Inventory</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Box className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inventoryLots.length}</div>
                    <p className="text-xs text-muted-foreground">Total lots assigned to you</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Value of Inventory</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500/10 text-green-500">
                        <BadgeIndianRupee className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{inventoryValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Based on purchase price</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots In Transit</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                        <Truck className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{lotsInTransit}</div>
                    <p className="text-xs text-muted-foreground">On their way to your store</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots on Shelf</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <Store className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{lotsOnShelf}</div>
                    <p className="text-xs text-muted-foreground">Currently available for sale</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Wheat className="mr-2"/> Inventory by Crop</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={inventoryByCrop}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false}/>
                            <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value} q`}/>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><LineChart className="mr-2"/> Inventory Value Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart accessibilityLayer data={inventoryValueOverTime}>
                           <CartesianGrid vertical={false} />
                           <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                           <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/>
                          <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                          <Line type="monotone" dataKey="inventoryValue" stroke="var(--color-inventoryValue)" strokeWidth={2} dot={false} />
                        </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
