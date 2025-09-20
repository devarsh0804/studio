
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, Box, PackageCheck, PieChart, ShoppingBag, Spline, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface DistributorAnalyticsProps {
  distributorId: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

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
        { name: 'Purchased (Not Split)', value: purchasedLots.filter(lot => lot.weight > 0).length },
        { name: 'Split', value: subLotsCreated.length > 0 ? purchasedLots.filter(lot => lot.weight === 0).length : 0 },
        { name: 'Dispatched', value: dispatchedLots.length }
    ].filter(item => item.value > 0);


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots Purchased</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{purchasedLots.length}</div>
                    <p className="text-xs text-muted-foreground">Total primary lots bought</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Value of Purchases</CardTitle>
                    <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{valueOfPurchases.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total value of purchased lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sub-lots Created</CardTitle>
                    <Spline className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{subLotsCreated.length}</div>
                    <p className="text-xs text-muted-foreground">From splitting primary lots</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Dispatched Lots</CardTitle>
                    <PackageCheck className="h-4 w-4 text-muted-foreground" />
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
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={cropPurchaseData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false}/>
                            <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} q`}/>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="weight" fill="hsl(var(--primary))" name="Weight (quintals)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><PieChart className="mr-2"/> Lot Status Overview</CardTitle>
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
