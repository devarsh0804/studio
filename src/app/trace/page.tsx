
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
import { Loader2, ScanLine, Search, XCircle, Award, Droplets, Microscope, Palette, Ruler, History, Spline, Truck } from 'lucide-react';
import { format, isValid } from 'date-fns';
import { Timeline } from '@/components/Timeline';
import { Separator } from '@/components/ui/separator';

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
    if (!history || !history.parentLot) return [];
    
    const events = [];
    const {lot: currentLot, parentLot, childLots} = history;

    // 1. Farmer Event
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

    // 2. Distributor Purchase Event
    if(gradingDate) {
        events.push({
            type: 'DISTRIBUTOR_BUY',
            title: 'Purchased by Distributor',
            timestamp: format(gradingDate, 'PP'),
            details: (
                 <div className="space-y-2 text-sm">
                    <p><strong>Distributor:</strong> {parentLot.owner}</p>
                    <p><strong>Lot ID:</strong> {parentLot.lotId}</p>
                    <p>Acquired full lot of {parentLot.weight} quintals.</p>
                </div>
            )
        });
    }

    // 3. Distributor Split Event
    if (childLots && childLots.length > 0) {
        const splitDate = childLots[0].gradingDate ? new Date(childLots[0].gradingDate) : gradingDate;
        events.push({
            type: 'DISTRIBUTOR_SPLIT',
            title: 'Split into Sub-lots',
            timestamp: splitDate ? format(splitDate, 'PP') : 'N/A',
            details: (
                 <div className="space-y-2 text-sm">
                    <p>Original lot was split into {childLots.length} sub-lots.</p>
                    <p><strong>This product is from Sub-lot:</strong> {currentLot.lotId}</p>
                </div>
            )
        });
    }

    // 4. Transport Event for the current lot
    if (currentLot.logisticsInfo) {
        events.push({
            type: 'TRANSPORT',
            title: 'Dispatched to Retailer',
            timestamp: format(new Date(currentLot.logisticsInfo.dispatchDate), 'PP'),
            details: (
                 <div className="space-y-2 text-sm">
                    <p><strong>Lot ID:</strong> {currentLot.lotId}</p>
                    <p><strong>Assigned To:</strong> {currentLot.owner}</p>
                    <p><strong>Vehicle:</strong> {currentLot.logisticsInfo.vehicleNumber}</p>
                    <Separator className="my-3"/>
                    <p><strong>Weight in this Lot:</strong> {currentLot.weight} quintals</p>
                    <p className="flex items-center"><Award className="w-4 h-4 mr-2 text-primary"/><strong>Quality:</strong> <span className="ml-1 font-mono">{currentLot.quality}</span></p>
                </div>
            )
        });
    }

    // 5. Retailer Stocking Event
    history.retailEvents.forEach(e => {
        if (e.lotId === currentLot.lotId) {
            const shelfDate = new Date(e.shelfDate);
            shelfDate.setDate(shelfDate.getDate() + 1);

            events.push({
                type: 'RETAIL',
                title: 'Stocked at Retailer',
                timestamp: isValid(shelfDate) ? format(shelfDate, 'PP') : 'Invalid Date',
                details: <>
                 <p><strong>Store ID:</strong> {e.storeId}</p>
                 <p><strong>Lot ID:</strong> {currentLot.lotId}</p>
                </>
            });
        }
    });
    
    return events;
  }

  return (
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
  );
}
