
'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgriChainStore } from '@/hooks/use-agrichain-store';
import type { Lot, LotHistory } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Loader2, ScanLine, Search, XCircle, Award, Droplets, Microscope, Palette, Ruler, History } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Timeline } from '@/components/Timeline';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/PageHeader';

const scanSchema = z.object({ lotId: z.string().min(1, 'Please enter a Lot ID') });
type ScanFormValues = z.infer<typeof scanSchema>;

export default function TracePage() {
  const [history, setHistory] = useState<LotHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { getLotHistory, findLot } = useAgriChainStore();

  const scanForm = useForm<ScanFormValues>({
    resolver: zodResolver(scanSchema),
    defaultValues: { lotId: '' },
  });

  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    setHistory(null);

    setTimeout(() => {
      setIsLoading(false);
      const historyResult = getLotHistory(data.lotId);
      if (historyResult) {
        setHistory(historyResult);
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setHistory(null);
      }
    }, 500);
  };
  
  const getTimelineEvents = () => {
    if (!history) return [];

    let lotHierarchy: Lot[] = [];
    let tempLot = history.lot;
    
    while (tempLot) {
        lotHierarchy.unshift(tempLot);
        tempLot = tempLot.parentLotId ? findLot(tempLot.parentLotId) as Lot : null as any;
    }

    const events = [];
    const parentLot = lotHierarchy[0];
    const gradingDate = parentLot.gradingDate ? new Date(parentLot.gradingDate) : null;

    events.push({
        type: 'FARM',
        title: 'Harvested & Registered',
        timestamp: format(new Date(parentLot.harvestDate), 'PP'),
        details: (
            <div className="space-y-2 text-sm">
                <p><strong>Farmer:</strong> {parentLot.farmer}</p>
                <p><strong>Location:</strong> {parentLot.location}</p>
                <p><strong>Crop:</strong> {parentLot.cropName}</p>
                <p><strong>Total Harvested Weight:</strong> {parentLot.weight} quintals</p>
                <p><strong>Original Lot ID:</strong> {parentLot.lotId}</p>
                <Separator className="my-3"/>
                <h4 className="font-semibold">Digital Certificate</h4>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                    <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Grade:</strong> <span className="ml-1 font-mono">{parentLot.quality}</span></p>
                    <p className="flex items-center"><Droplets className="w-4 h-4 mr-2 text-primary"/><strong>Moisture:</strong> <span className="ml-1 font-mono">{parentLot.moisture}</span></p>
                    <p className="flex items-center"><Microscope className="w-4 h-4 mr-2 text-primary"/><strong>Impurities:</strong> <span className="ml-1 font-mono">{parentLot.impurities}</span></p>
                    <p className="flex items-center"><Ruler className="w-4 h-4 mr-2 text-primary"/><strong>Size:</strong> <span className="ml-1 font-mono">{parentLot.size}</span></p>
                    <p className="flex items-center"><Palette className="w-4 h-4 mr-2 text-primary"/><strong>Color:</strong> <span className="ml-1 font-mono">{parentLot.color}</span></p>
                </div>
                <p className="text-xs text-muted-foreground pt-1">
                    Graded on {gradingDate && isValid(gradingDate) ? format(gradingDate, 'PPp') : 'N/A'}
                </p>
            </div>
        )
    });

    lotHierarchy.forEach(lot => {
        if (lot.logisticsInfo) {
             const title = lot.paymentStatus === 'Advance Paid' ? 'Dispatched after Advance' : 'Dispatched to Retailer';
            events.push({
                type: 'TRANSPORT',
                title: title,
                timestamp: format(new Date(lot.logisticsInfo.dispatchDate), 'PP'),
                details: (
                     <div className="space-y-2 text-sm">
                        <p><strong>Lot ID:</strong> {lot.lotId}</p>
                        <p><strong>Assigned To:</strong> {lot.owner}</p>
                        <p><strong>Vehicle:</strong> {lot.logisticsInfo.vehicleNumber}</p>
                        <Separator className="my-3"/>
                        <p><strong>Weight in this Lot:</strong> {lot.weight} quintals</p>
                        <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Quality:</strong> <span className="ml-1 font-mono">{lot.quality}</span></p>
                    </div>
                )
            });
        }
    });

    history.retailEvents.forEach(e => {
        const shelfDate = new Date(e.shelfDate);
        shelfDate.setDate(shelfDate.getDate() + 1);

        events.push({
            type: 'RETAIL',
            title: 'Stocked at Retailer',
            timestamp: isValid(shelfDate) ? format(shelfDate, 'PP') : 'Invalid Date',
            details: <>
             <p><strong>Store ID:</strong> {e.storeId}</p>
             <p><strong>Lot ID:</strong> {history.lot.lotId}</p>
            </>
        });
    });
    
    return events;
  }

  return (
    <>
      <PageHeader 
        title="Consumer: Trace Product"
        description="Scan a product's QR code to see its complete journey."
      />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto space-y-8">
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center"><ScanLine className="mr-2" /> Scan Product QR Code</CardTitle>
                <CardDescription>Enter the Lot ID from the product's QR code to view its full history.</CardDescription>
                </CardHeader>
                <CardContent>
                <Form {...scanForm}>
                    <form onSubmit={scanForm.handleSubmit(handleScan)} className="flex gap-2">
                    <FormField control={scanForm.control} name="lotId" render={({ field }) => (
                        <FormItem className="flex-1"><FormControl><Input placeholder="e.g., LOT-20240101-001-SUB-001" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                    <Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="animate-spin" /> : <Search />}</Button>
                    </form>
                </Form>
                {error && <Alert variant="destructive" className="mt-4"><XCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
                </CardContent>
            </Card>

            {history && (
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center"><History className="mr-2"/> Full Lot History</CardTitle>
                    <CardDescription>This is the complete journey of the product from farm to store, verified by AgriChain Trace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Timeline events={getTimelineEvents()} />
                    </CardContent>
                </Card>
            )}
        </div>
      </main>
    </>
  );
}