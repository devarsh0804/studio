
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, List, LineChart as LineChartIcon, Star, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { format } from "date-fns";

interface FarmerAnalyticsProps {
  farmerName: string;
}

const chartConfig = {
  income: {
    label: "Income",
    color: "hsl(var(--chart-1))",
  },
  unsold: {
    label: "Unsold",
    color: "hsl(var(--chart-2))",
  },
  sold: {
    label: "Sold",
    color: "hsl(var(--chart-1))",
  }
} satisfies ChartConfig;

export function FarmerAnalytics({ farmerName }: FarmerAnalyticsProps) {
    const { getAllLots } = useAgriChainStore();
    const farmerLots = getAllLots().filter(lot => lot.farmer === farmerName);

    const totalIncome = farmerLots.reduce((acc, lot) => {
        if (lot.owner !== farmerName && !lot.parentLotId) {
            return acc + (lot.price * lot.weight);
        }
        return acc;
    }, 0);

    const pendingPayments = farmerLots.reduce((acc, lot) => {
        if (lot.owner === farmerName) {
            return acc + (lot.price * lot.weight);
        }
        return acc;
    }, 0);

    const totalLotsRegistered = farmerLots.filter(l => !l.parentLotId).length;

    const cropSales = farmerLots.reduce((acc, lot) => {
        if (lot.owner !== farmerName) {
            acc[lot.cropName] = (acc[lot.cropName] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);
    
    const topSellingCrop = Object.keys(cropSales).length > 0 ? Object.entries(cropSales).sort((a, b) => b[1] - a[1])[0][0] : 'N/A';

    const incomeByCrop = farmerLots.reduce((acc, lot) => {
        if(lot.owner !== farmerName && !lot.parentLotId) {
            acc[lot.cropName] = (acc[lot.cropName] || 0) + (lot.price * lot.weight);
        }
        return acc;
    }, {} as Record<string, number>);

    const incomeByCropData = Object.entries(incomeByCrop).map(([name, income]) => ({ name, income }));

    const incomeOverTime = farmerLots.reduce((acc, lot) => {
        if (lot.owner !== farmerName && !lot.parentLotId) {
            const month = format(new Date(lot.harvestDate), 'MMM yyyy');
            const income = lot.price * lot.weight;
            const existing = acc.find(item => item.month === month);
            if (existing) {
                existing.income += income;
            } else {
                acc.push({ month, income });
            }
        }
        return acc;
    }, [] as { month: string; income: number }[]).sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BadgeIndianRupee className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From all completed sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                     <div className="w-8 h-8 flex items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
                      <BadgeIndianRupee className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">₹{pendingPayments.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From unsold lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots Registered</CardTitle>
                     <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                        <List className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalLotsRegistered}</div>
                    <p className="text-xs text-muted-foreground">Total primary lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Selling Crop</CardTitle>
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                        <Star className="h-5 w-5" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{topSellingCrop}</div>
                    <p className="text-xs text-muted-foreground">Based on number of lots sold</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><Wheat className="mr-2"/> Income by Crop</CardTitle>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <BarChart accessibilityLayer data={incomeByCropData}>
                            <CartesianGrid vertical={false} />
                            <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false}/>
                             <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><LineChartIcon className="mr-2"/> Income Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                     <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
                        <LineChart accessibilityLayer data={incomeOverTime}>
                           <CartesianGrid vertical={false} />
                           <XAxis dataKey="month" tickLine={false} tickMargin={10} axisLine={false} />
                           <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/>
                           <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                           <Line dataKey="income" type="monotone" stroke="var(--color-income)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ChartContainer>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
