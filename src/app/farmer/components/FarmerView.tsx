"use client";

import { RegisterCropForm } from "./RegisterCropForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import dynamic from 'next/dynamic';
import { Skeleton } from "@/components/ui/skeleton";
import type { Lot } from "@/lib/types";

const RegisteredLotsList = dynamic(() => import('./RegisteredLotsList').then(mod => mod.RegisteredLotsList), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Registered Lots</CardTitle>
        <CardDescription>
            View the details of all your registered crop lots.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-24 w-full" />
        </div>
      </CardContent>
    </Card>
  )
});

const RegisterCropFormWithPersistence = dynamic(() => import('./RegisterCropFormWithPersistence').then(mod => mod.RegisterCropFormWithPersistence), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
         <Skeleton className="h-8 w-1/2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
            <Skeleton className="h-96 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  )
});


export function FarmerView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <RegisterCropFormWithPersistence />
      <RegisteredLotsList />
    </div>
  );
}
