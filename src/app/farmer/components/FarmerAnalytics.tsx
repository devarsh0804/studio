
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, LineChart, List, PieChart, Star, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";

interface FarmerAnalyticsProps {
  farmerName: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const chartConfig = {
  value: {
    label: "Income",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;


export function FarmerAnalytics({ farmerName }: FarmerAnalyticsProps) {
    const { getAllLots } = useAgriChainStore();
    const farmerLots = getAllLots().filter(lot => lot.farmer === farmerName);

    const totalIncome = farmerLots.reduce((acc, lot) => {
        // Farmer gets paid when the original lot is purchased, not sub-lots
        if (lot.owner !== farmerName && !lot.parentLotId) {
            return acc + (lot.price * lot.weight);
        }
        return acc;
    }, 0);

    const pendingPayments = farmerLots.reduce((acc, lot) => {
        // This is a simplification. In a real app, payment status would be more robust.
        // Assuming farmer is paid once the lot owner changes.
        if (lot.owner === farmerName) { // If farmer is still the owner, payment is pending
            return acc + (lot.price * lot.weight);
        }
        return acc;
    }, 0);

    const totalLotsRegistered = farmerLots.length;

    const cropSales = farmerLots.reduce((acc, lot) => {
        if (lot.owner !== farmerName) { // Count as sold if owner has changed
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

    const lotStatusData = farmerLots.reduce((acc, lot) => {
        const status = lot.owner === farmerName ? 'Unsold' : 'Sold';
        const existing = acc.find(item => item.name === status);
        if (existing) {
            existing.value += 1;
        } else {
            acc.push({ name: status, value: 1 });
        }
        return acc;
    }, [] as { name: string, value: number }[]);


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Income</CardTitle>
                    <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalIncome.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From all completed sales</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                    <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{pendingPayments.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">From unsold lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots Registered</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{totalLotsRegistered}</div>
                    <p className="text-xs text-muted-foreground">Total crops registered on the platform</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Top Selling Crop</CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
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
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={incomeByCropData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="income" fill="hsl(var(--primary))" name="Income" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><PieChart className="mr-2"/> Lot Status</CardTitle>
                </CardHeader>
                <CardContent>
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={lotStatusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {lotStatusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>

    </div>
  );
}
