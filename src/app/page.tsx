
"use client";

import { useState } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Box, CheckCircle, CircleDollarSign, Fingerprint, Tractor, Wheat } from "lucide-react";
import { useAgriChainStore } from '@/hooks/use-agrichain-store';
import { LotDetailsCard } from '@/components/LotDetailsCard';
import { Bar, BarChart as RechartsBarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Progress } from '@/components/ui/progress';

export default function Home() {
  const { getAllLots } = useAgriChainStore();
  const allLots = getAllLots();

  const analyticsData = [
    { name: 'Jan', quality: 88, payments: 95, farmers: 10 },
    { name: 'Feb', quality: 92, payments: 98, farmers: 12 },
    { name: 'Mar', quality: 95, payments: 97, farmers: 15 },
    { name: 'Apr', quality: 91, payments: 99, farmers: 18 },
    { name: 'May', quality: 94, payments: 96, farmers: 22 },
    { name: 'Jun', quality: 97, payments: 99, farmers: 27 },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-card text-card-foreground dark:bg-primary/10 py-12 px-4 md:px-8">
        <div className="container mx-auto text-center">
          <h1 className="font-headline text-4xl md:text-5xl font-bold">
            Practical Blockchain Supply Chain for Indian Farmers
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            From mandi to retailer with trust, grading, and fair payments.
          </p>
          <div className="mt-6 flex flex-wrap justify-center items-center gap-4">
            <Badge variant="secondary" className="text-base py-1 px-3"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Secure</Badge>
            <Badge variant="secondary" className="text-base py-1 px-3"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Verified</Badge>
            <Badge variant="secondary" className="text-base py-1 px-3"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Fair Pricing</Badge>
            <Badge variant="secondary" className="text-base py-1 px-3"><CheckCircle className="w-4 h-4 mr-2 text-primary" /> Grading Certificate</Badge>
          </div>
        </div>
      </header>

      <main className="flex-grow w-full container mx-auto px-4 py-8">
        {/* Top Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Crop Lots</CardTitle>
              <Box className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">58</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Verified Farmers (via Mandi)</CardTitle>
              <Tractor className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">27</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certified Lots with Grading</CardTitle>
              <Fingerprint className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">44</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-time Payments to Farmers</CardTitle>
              <CircleDollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="crops" className="w-full">
          <TabsList className="grid w-full grid-cols-5 h-12 mb-6">
            <TabsTrigger value="crops"><Wheat className="mr-2"/>Crops</TabsTrigger>
            <TabsTrigger value="track">Track</TabsTrigger>
            <TabsTrigger value="certificates">Certificates</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="analytics"><BarChart className="mr-2"/>Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="crops">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allLots.map((lot) => (
                <LotDetailsCard key={lot.lotId} lot={lot} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="track">
             <Card>
              <CardHeader>
                <CardTitle>Track Journey</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Functionality to track a lot's journey will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">A registry of all issued certificates will be available here.</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Escrow-Based 2-Step Payment Flow</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Step 1: Distributor Advance</h4>
                        <p className="text-sm text-muted-foreground">Distributor pays a 30% advance for a lot, which is locked in a secure escrow smart contract.</p>
                        <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm font-medium">Status:</span>
                            <Progress value={30} className="w-1/2" />
                            <span className="text-sm font-bold">30% In Escrow</span>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold">Step 2: Retailer Acceptance & Final Release</h4>
                        <p className="text-sm text-muted-foreground">The remaining 70% is automatically released to the farmer after the retailer accepts the delivery.</p>
                         <div className="mt-2 flex items-center gap-4">
                            <span className="text-sm font-medium">Status:</span>
                            <Progress value={100} className="w-1/2" />
                            <span className="text-sm font-bold text-primary">100% Released</span>
                        </div>
                    </div>
                    <div className="text-center pt-4">
                        <p className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Fingerprint className="w-4 h-4 text-primary" />
                            All payments are recorded on the blockchain as an immutable ledger.
                        </p>
                    </div>
                </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Average Grading Quality & Farmer Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <RechartsBarChart data={analyticsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Quality (%)', angle: -90, position: 'insideLeft' }} />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Farmers', angle: -90, position: 'insideRight' }} />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="quality" fill="#8884d8" name="Avg. Quality" />
                      <Bar yAxisId="right" dataKey="farmers" fill="#82ca9d" name="Farmers Onboarded" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Payment Release Efficiency</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-full">
                   <div className="text-5xl font-bold text-primary">99.8%</div>
                   <p className="text-muted-foreground mt-2">Payments released on time.</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
