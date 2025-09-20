
"use client";

import { useAgriChainStore } from "@/hooks/use-agrichain-store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeIndianRupee, Box, PackageCheck, PieChart, ShoppingBag, Store, Truck, Wheat } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RetailerAnalyticsProps {
  retailerId: string;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function RetailerAnalytics({ retailerId }: RetailerAnalyticsProps) {
    const { getAllLots } = useAgriChainStore();
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

    const lotStatusData = [
        { name: 'In Transit', value: lotsInTransit },
        { name: 'Delivered', value: inventoryLots.filter(lot => lot.status === 'Delivered').length },
        { name: 'Stocked', value: lotsOnShelf },
    ].filter(item => item.value > 0);


  return (
    <div className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots in Inventory</CardTitle>
                    <Box className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inventoryLots.length}</div>
                    <p className="text-xs text-muted-foreground">Total lots assigned to your store</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Value of Inventory</CardTitle>
                    <BadgeIndianRupee className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{inventoryValue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Based on purchase price</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots In Transit</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{lotsInTransit}</div>
                    <p className="text-xs text-muted-foreground">On their way to your store</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Lots on Shelf</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
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
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={inventoryByCrop}>
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
                            <Bar dataKey="value" fill="hsl(var(--primary))" name="Weight (quintals)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center"><PieChart className="mr-2"/> Inventory Status</CardTitle>
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
