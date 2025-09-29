
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAgriChainStore } from '@/hooks/use-agrichain-store';
import type { Lot } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LotDetailsCard } from '@/components/LotDetailsCard';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Loader2, ScanLine, Search, XCircle, ShoppingCart, BadgeIndianRupee, CreditCard, ShoppingBag, LogOut, PackagePlus, Spline, QrCode, User, Truck, PackageCheck, Download, Landmark, CheckCircle, Rocket, Percent, FileText, LineChart as LineChartIcon, Fingerprint, Camera } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { DistributorAnalytics } from './DistributorAnalytics';
import { CertificateDialog } from '@/components/CertificateDialog';
import { useLocale } from '@/hooks/use-locale';


const scanSchema = z.object({ lotId: z.string().min(1, 'Please enter a Lot ID') });
type ScanFormValues = z.infer<typeof scanSchema>;

const subLotSchema = z.object({
  subLotCount: z.coerce.number().int().min(2, 'Must create at least 2 sub-lots.').max(100),
});
type SubLotFormValues = z.infer<typeof subLotSchema>;

const transportSchema = z.object({
  vehicleNumber: z.string().min(1, "Vehicle number is required."),
  dispatchDate: z.string().min(1, "A dispatch date is required."),
});
type TransportFormValues = z.infer<typeof transportSchema>;


interface DistributorViewProps {
  distributorId: string;
}

export function DistributorView({ distributorId }: DistributorViewProps) {
  const [scannedLot, setScannedLot] = useState<Lot | null>(null);
  const [lotToBuy, setLotToBuy] = useState<Lot | null>(null);
  const [lotToPay, setLotToPay] = useState<Lot | null>(null);
  const [lotToTransport, setLotToTransport] = useState<Lot | null>(null);
  const [lotToShowCertificate, setLotToShowCertificate] = useState<Lot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [subLots, setSubLots] = useState<Lot[]>([]);
  const [activeTab, setActiveTab] = useState('scan-lot');

  const { findLot, updateLot, getAllLots, addLots } = useAgriChainStore();
  const { toast } = useToast();
  const { t } = useLocale();
  const qrRef = useRef<HTMLDivElement>(null);

  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | undefined>(undefined);
  const videoRef = useRef<HTMLVideoElement>(null);
  let barcodeDetector: any;
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
      barcodeDetector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
  }


  const scanForm = useForm<ScanFormValues>({ resolver: zodResolver(scanSchema), defaultValues: { lotId: "" } });
  const subLotForm = useForm<SubLotFormValues>({ resolver: zodResolver(subLotSchema), defaultValues: { subLotCount: 2 } });
  const transportForm = useForm<TransportFormValues>({ 
    resolver: zodResolver(transportSchema),
    defaultValues: {
      vehicleNumber: "",
      dispatchDate: new Date().toISOString().split('T')[0],
    }
  });

  const allLots = getAllLots();
  const availableLots = allLots.filter((lot) => lot.owner === lot.farmer);
  const purchasedLots = allLots.filter((lot) => !lot.parentLotId && lot.owner !== lot.farmer);
  const dispatchedLots = allLots.filter(
    (lot) => (lot.paymentStatus === 'Advance Paid' || lot.paymentStatus === 'Fully Paid') && lot.parentLotId && findLot(lot.parentLotId!)?.owner === distributorId
  );


  useEffect(() => {
    if (scannedLot) {
      const childLots = getAllLots().filter((l) => l.parentLotId === scannedLot.lotId && l.paymentStatus === 'Unpaid');
      if (childLots.length > 0) {
        setSubLots(childLots);
      }
    }
  }, [scannedLot, getAllLots]);
  
  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startScan = async () => {
        try {
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                 setHasCameraPermission(false);
                 return;
            }
            stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            setHasCameraPermission(true);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }

            const detectBarcode = async () => {
                if (videoRef.current && barcodeDetector && videoRef.current.readyState === 4) {
                    const barcodes = await barcodeDetector.detect(videoRef.current);
                    if (barcodes.length > 0) {
                        const scannedValue = barcodes[0].rawValue;
                        scanForm.setValue('lotId', scannedValue);
                        handleScan({ lotId: scannedValue });
                        stopScan();
                    }
                }
            };
            intervalId = setInterval(detectBarcode, 500);

        } catch (err) {
            console.error("Error accessing camera:", err);
            setHasCameraPermission(false);
            toast({
                variant: 'destructive',
                title: 'Camera Access Denied',
                description: 'Please enable camera permissions in your browser settings.',
            });
        }
    };

    const stopScan = () => {
        if (intervalId) clearInterval(intervalId);
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
        setShowCamera(false);
    };
    
    if (showCamera) {
        startScan();
    }

    return () => {
        stopScan();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCamera, barcodeDetector, scanForm]);


  const handleScan: SubmitHandler<ScanFormValues> = (data) => {
    setIsLoading(true);
    setError(null);
    setSubLots([]);
    setShowCamera(false);
    
    const lot = findLot(data.lotId);
    setTimeout(() => {
      if (lot) {
        setScannedLot(lot);
        const childLots = getAllLots().filter((l) => l.parentLotId === lot.lotId && l.paymentStatus === 'Unpaid');
        setSubLots(childLots);
        subLotForm.reset({subLotCount: 2});
      } else {
        setError(`Lot ID "${data.lotId}" not found. Please check the ID and try again.`);
        setScannedLot(null);
      }
      setIsLoading(false);
    }, 500); // Simulate network delay
  };

  const handleConfirmPurchase = () => {
    if (!lotToBuy) return;
    updateLot(lotToBuy.lotId, { owner: distributorId, status: 'Purchased' });
    setLotToPay(lotToBuy);
    setLotToBuy(null);
  };

  const handlePayment = () => {
    if (!lotToPay) return;

    setPaymentStatus('processing');

    setTimeout(() => {
      updateLot(lotToPay.lotId, { status: 'Purchased' });
      setPaymentStatus('success');
    }, 1500);
  };

  const closePaymentDialog = () => {
    setLotToPay(null);
    setPaymentStatus('idle'); // Reset for next time
    setActiveTab('purchased-lots');
  };

  const handleSubLotSubmit: SubmitHandler<SubLotFormValues> = (data) => {
    if (!scannedLot) return;

    const newSubLots: Lot[] = [];
    const newWeight = parseFloat((scannedLot.weight / data.subLotCount).toFixed(2));
    const newPrice = parseFloat((scannedLot.price / data.subLotCount).toFixed(2));

    for (let i = 0; i < data.subLotCount; i++) {
      const newLot: Lot = {
        ...scannedLot,
        lotId: `${scannedLot.lotId}-SUB-${String(Math.floor(Math.random() * 1000) + i).padStart(3, '0')}`,
        parentLotId: scannedLot.lotId,
        weight: newWeight,
        price: newPrice,
        owner: distributorId, // Distributor owns the sub-lot initially
        status: 'Split',
        paymentStatus: 'Unpaid',
        logisticsInfo: undefined, // Clear logistics info
      };
      newSubLots.push(newLot);
    }

    addLots(newSubLots);
    updateLot(scannedLot.lotId, { weight: 0 }); 
    setSubLots(newSubLots);

    toast({
      title: t('distributorView.toasts.subLotsCreatedTitle'),
      description: t('distributorView.toasts.subLotsCreatedDescription', {count: data.subLotCount}),
    });
  };

  const downloadQR = (lotId: string) => {
    const canvas = document.getElementById(`qr-${lotId}`) as HTMLCanvasElement;
    if (canvas) {
        const image = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = image;
        a.download = `${lotId}.png`;
        a.click();
    }
  };

  const handleTransportSubmit: SubmitHandler<TransportFormValues> = (data) => {
    if (!lotToTransport) return;

    updateLot(lotToTransport.lotId, { 
      logisticsInfo: {
        vehicleNumber: data.vehicleNumber,
        dispatchDate: data.dispatchDate,
      },
      status: 'Dispatched'
    });
    
    toast({
      title: t('distributorView.toasts.transportAssignedTitle'),
      description: t('distributorView.toasts.transportAssignedDescription', {lotId: lotToTransport.lotId}),
    });
    
    transportForm.reset({ vehicleNumber: '', dispatchDate: new Date().toISOString().split('T')[0] });
    setLotToTransport(null);
  };


  const resetView = () => {
    setScannedLot(null);
    setError(null);
    setSubLots([]);
    scanForm.reset();
    subLotForm.reset({subLotCount: 2});
    setActiveTab('scan-lot');
  };

  if (scannedLot) {
    const isOwnedByDistributor = scannedLot.owner === distributorId;
    const canBeSplit = isOwnedByDistributor && scannedLot.weight > 0 && !scannedLot.parentLotId;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold font-headline">{t('distributorView.lotDetails.title')}</h1>
          <Button variant="outline" onClick={resetView}>
            {t('general.backToDashboard')}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LotDetailsCard lot={scannedLot} />

            {isOwnedByDistributor && (
            <Card>
                <CardHeader>
                <CardTitle className="flex items-center">
                    <Spline className="mr-2" /> {t('distributorView.lotDetails.createSubLotsTitle')}
                </CardTitle>
                <CardDescription>{canBeSplit ? t('distributorView.lotDetails.createSubLotsDescription') : t('distributorView.lotDetails.splitDoneDescription')}</CardDescription>
                </CardHeader>
                <CardContent>
                {canBeSplit && (
                    <Form {...subLotForm}>
                    <form onSubmit={subLotForm.handleSubmit(handleSubLotSubmit)} className="flex gap-2">
                        <FormField
                        control={subLotForm.control}
                        name="subLotCount"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormControl>
                                <Input type="number" placeholder={t('distributorView.lotDetails.splitPlaceholder', {weight: scannedLot.weight})} {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit">
                        <PackagePlus className="h-4 w-4" />
                        </Button>
                    </form>
                    </Form>
                )}
                {subLots.length > 0 && (
                    <div className="mt-6">
                    <h4 className="font-semibold mb-4">{t('distributorView.lotDetails.generatedSubLotsTitle')}</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                        {subLots.map((lot) => (
                        <Card key={lot.lotId} className="flex flex-col">
                            <CardHeader className="pb-4">
                                <CardTitle className="text-base font-mono flex items-center gap-2"><QrCode className="text-muted-foreground"/> {lot.lotId}</CardTitle>
                                <CardDescription>{lot.weight} quintals</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col items-center justify-center gap-4">
                                <div className="p-2 bg-white rounded-lg">
                                    <QRCode value={lot.lotId} size={128} id={`qr-${lot.lotId}`} />
                                </div>
                                <p className="text-sm text-muted-foreground text-center">{t('distributorView.lotDetails.subLotAvailability')}</p>
                            </CardContent>
                        </Card>
                        ))}
                    </div>
                    </div>
                )}
                </CardContent>
            </Card>
            )}
        </div>

      </div>
    );
  }

  return (
    <div className="space-y-6">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-5 h-12">
                <TabsTrigger value="scan-lot">
                  <ScanLine className="mr-2" />
                  {t('distributorView.tabs.scan')}
                </TabsTrigger>
                <TabsTrigger value="available-crops">
                  <ShoppingCart className="mr-2" />
                  {t('distributorView.tabs.available')}
                </TabsTrigger>
                <TabsTrigger value="purchased-lots">
                  <ShoppingBag className="mr-2" />
                  {t('distributorView.tabs.purchased')}
                </TabsTrigger>
                <TabsTrigger value="dispatched-lots">
                  <PackageCheck className="mr-2" />
                  {t('distributorView.tabs.dispatched')}
                </TabsTrigger>
                <TabsTrigger value="analytics">
                    <LineChartIcon className="mr-2"/> {t('distributorView.tabs.analytics')}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="scan-lot" className="mt-0">
                <Card className="rounded-t-none">
                    <CardHeader>
                        <CardTitle>{t('distributorView.scanTab.title')}</CardTitle>
                        <CardDescription>{t('distributorView.scanTab.description')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...scanForm}>
                        <form onSubmit={scanForm.handleSubmit(handleScan)} className="flex gap-2">
                            <FormField
                            control={scanForm.control}
                            name="lotId"
                            render={({ field }) => (
                                <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder={t('distributorView.scanTab.placeholder')} {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => setShowCamera(true)}><Camera/></Button>
                            <Button type="submit" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                            </Button>
                        </form>
                        </Form>
                        {error && (
                        <Alert variant="destructive" className="mt-4">
                            <XCircle className="h-4 w-4" />
                            <AlertTitle>{t('general.error')}</AlertTitle>
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                        )}
                    </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="available-crops" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle>{t('distributorView.availableTab.title')}</CardTitle>
                    <CardDescription>{t('distributorView.availableTab.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableLots.length > 0 ? (
                          availableLots.map((lot) => (
                          <LotDetailsCard key={lot.lotId} lot={lot}>
                              <div className='flex flex-col md:flex-row gap-2 w-full'>
                                <Button variant="secondary" className="w-full" onClick={() => setLotToShowCertificate(lot)}>
                                    <Fingerprint /> {t('distributorView.buttons.viewCertificate')}
                                </Button>
                                <Button className="w-full" onClick={() => setLotToBuy(lot)}>
                                    <ShoppingCart /> {t('distributorView.buttons.buyLot')}
                                </Button>
                              </div>
                          </LotDetailsCard>
                          ))
                      ) : (
                          <p className="text-muted-foreground text-center py-4 col-span-3">{t('distributorView.availableTab.noLots')}</p>
                      )}
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="purchased-lots" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <ShoppingBag className="mr-2" /> {t('distributorView.purchasedTab.title')}
                    </CardTitle>
                    <CardDescription>{t('distributorView.purchasedTab.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {purchasedLots.length > 0 ? (
                              purchasedLots.map((lot) => (
                              <LotDetailsCard key={lot.lotId} lot={lot}>
                                  <Button variant="secondary" className="w-full" onClick={() => handleScan({ lotId: lot.lotId })}>
                                      <Spline className="mr-2 h-4 w-4" /> {t('distributorView.buttons.createSubLots')}
                                  </Button>
                              </LotDetailsCard>
                              ))
                          ) : (
                              <p className="text-muted-foreground text-center py-4 col-span-3">{t('distributorView.purchasedTab.noLots')}</p>
                          )}
                      </div>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="dispatched-lots" className="mt-0">
                <Card className="rounded-t-none">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <PackageCheck className="mr-2" /> {t('distributorView.dispatchedTab.title')}
                    </CardTitle>
                    <CardDescription>{t('distributorView.dispatchedTab.description')}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dispatchedLots.length > 0 ? (
                        dispatchedLots.map((lot) => (
                          <Card key={lot.lotId} className="flex flex-col">
                              <CardHeader>
                                  <LotDetailsCard lot={lot} showImage={false}>
                                      <div className="mt-4 border-t pt-4 text-sm w-full">
                                          <div className="flex justify-between items-start">
                                          <div>
                                              <p className="font-semibold">Logistics Details:</p>
                                              {lot.logisticsInfo ? (
                                                  <>
                                                      <p><span className="text-muted-foreground">Vehicle:</span> {lot.logisticsInfo?.vehicleNumber}</p>
                                                      <p><span className="text-muted-foreground">Dispatch Date:</span> {lot.logisticsInfo?.dispatchDate}</p>
                                                  </>
                                              ) : (
                                                  <p className="text-muted-foreground">Pending...</p>
                                              )}
                                              <p className='mt-2'><span className="text-muted-foreground">Purchased By:</span> <span className="font-mono">{lot.owner}</span></p>
                                          </div>
                                          <div className='flex flex-col items-end gap-2'>
                                              <div>
                                                  <p className="font-semibold text-right">Status:</p>
                                                  <Badge variant={lot.status === 'Delivered' ? 'default' : (lot.status === 'Dispatched' ? 'secondary' : 'outline')}>
                                                      {lot.status}
                                                  </Badge>
                                              </div>
                                              <div>
                                                  <p className="font-semibold text-right">Payment:</p>
                                                  <Badge variant={lot.paymentStatus === 'Fully Paid' ? 'default' : (lot.paymentStatus === 'Advance Paid' ? 'outline' : 'destructive')}>
                                                  {lot.paymentStatus}
                                                  </Badge>
                                              </div>
                                          </div>
                                          </div>
                                          <div className="mt-4 flex flex-col items-center gap-4">
                                              {!lot.logisticsInfo ? (
                                              <Button className="w-full" onClick={() => setLotToTransport(lot)}>
                                                      <Truck className="mr-2 h-4 w-4"/> {t('distributorView.buttons.addTransport')}
                                                  </Button>
                                              ) : (
                                                  <>
                                                      <div className="p-2 bg-white rounded-lg">
                                                          <QRCode value={lot.lotId} size={128} id={`qr-${lot.lotId}`} />
                                                      </div>
                                                      <Button variant="secondary" className="w-full" onClick={() => downloadQR(lot.lotId)}>
                                                          <Download className="mr-2 h-4 w-4"/> {t('distributorView.buttons.downloadQR')}
                                                      </Button>
                                                  </>
                                              )}
                                          </div>
                                      </div>
                                  </LotDetailsCard>
                              </CardHeader>
                          </Card>
                        ))
                      ) : (
                        <p className="text-muted-foreground text-center py-4 col-span-3">{t('distributorView.dispatchedTab.noLots')}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
               <TabsContent value="analytics" className="mt-0">
                    <DistributorAnalytics distributorId={distributorId} />
              </TabsContent>
            </Tabs>

      <AlertDialog open={!!lotToBuy} onOpenChange={() => setLotToBuy(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('distributorView.dialogs.confirmPurchaseTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('distributorView.dialogs.confirmPurchaseDescription', {lotId: lotToBuy?.lotId, totalPrice: (lotToBuy ? lotToBuy.price * lotToBuy.weight : 0).toLocaleString()})}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('general.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmPurchase}>{t('distributorView.dialogs.confirmPurchaseAction')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!lotToPay} onOpenChange={(open) => !open && paymentStatus !== 'processing' && setLotToPay(null)}>
        <DialogContent className="sm:max-w-md">
          {paymentStatus === 'success' ? (
              <div className="flex flex-col items-center justify-center text-center p-8 gap-4">
                  <Rocket className="w-16 h-16 text-primary animate-bounce"/>
                  <h2 className="text-2xl font-bold font-headline">{t('distributorView.dialogs.paymentSuccessTitle')}</h2>
                  <p className="text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('distributorView.dialogs.paymentSuccessDescription', {location: lotToPay?.location}) }} />
                  <div className='flex items-center gap-2 mt-4 w-full'>
                    <Button variant="outline" className="w-full">
                        <FileText className="mr-2" /> {t('distributorView.dialogs.downloadReceipt')}
                    </Button>
                    <Button onClick={closePaymentDialog} className="w-full">{t('distributorView.dialogs.done')}</Button>
                  </div>
              </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{t('distributorView.dialogs.finalizePaymentTitle')}</DialogTitle>
                <DialogDescription dangerouslySetInnerHTML={{ __html: t('distributorView.dialogs.finalizePaymentDescription', { lotId: lotToPay?.lotId, totalPrice: (lotToPay ? lotToPay.price * lotToPay.weight : 0).toLocaleString() })}} />
              </DialogHeader>
              
              <Tabs defaultValue="upi" className="w-full pt-4">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upi"><QrCode className="mr-2"/> {t('distributorView.dialogs.payWithUPI')}</TabsTrigger>
                    <TabsTrigger value="bank"><Landmark className="mr-2"/> {t('distributorView.dialogs.bankTransfer')}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upi">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('distributorView.dialogs.payWithUPI')}</CardTitle>
                        <CardDescription>{t('distributorView.dialogs.upiDescription')}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col items-center justify-center space-y-4">
                        <div className="p-4 bg-white rounded-lg">
                           <QRCode value={`upi://pay?pa=farmer@agrichain&pn=Farmer&am=${lotToPay ? lotToPay.price * lotToPay.weight : 0}&cu=INR&tn=Lot%20${lotToPay?.lotId}`} size={180} />
                        </div>
                        <p className="text-sm text-muted-foreground">{t('distributorView.dialogs.upiId', {id: 'farmer@agrichain'})}</p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="bank">
                    <Card>
                      <CardHeader>
                        <CardTitle>{t('distributorView.dialogs.bankTransferDetailsTitle')}</CardTitle>
                        <CardDescription>{t('distributorView.dialogs.bankTransferDetailsDescription')}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Beneficiary:</span> <span className="font-medium">Ramesh Kumar</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Account No:</span> <span className="font-mono">1234567890</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">IFSC Code:</span> <span className="font-mono">AGRI0001234</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Bank:</span> <span className="font-medium">AgriChain Bank</span></div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

              <DialogFooter className="!mt-6">
                 <Button variant="outline" disabled={paymentStatus === 'processing'} onClick={() => setLotToPay(null)}>
                  {t('general.cancel')}
                </Button>
                <Button onClick={handlePayment} disabled={paymentStatus === 'processing' || paymentStatus === 'success'} className="w-40">
                  {paymentStatus === 'processing' && <Loader2 className="animate-spin" />}
                  {paymentStatus === 'idle' && <><CreditCard className="mr-2" />Confirm Payment</>}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={!!lotToTransport} onOpenChange={() => setLotToTransport(null)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t('distributorView.dialogs.assignTransportTitle', {lotId: lotToTransport?.lotId})}</DialogTitle>
                    <DialogDescription>
                        {t('distributorView.dialogs.assignTransportDescription')}
                    </DialogDescription>
                </DialogHeader>
                {lotToTransport && (
                    <div className="flex flex-col items-center gap-4 py-4" >
                         <Form {...transportForm}>
                          <form onSubmit={transportForm.handleSubmit(handleTransportSubmit)} className="w-full space-y-4">
                                <FormField
                                  control={transportForm.control}
                                  name="vehicleNumber"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>{t('distributorView.dialogs.vehicleNumberLabel')}</FormLabel>
                                      <FormControl>
                                        <div className="relative">
                                          <Truck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                          <Input placeholder={t('distributorView.dialogs.vehicleNumberPlaceholder')} {...field} className="pl-10" />
                                        </div>
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                             <FormField
                              control={transportForm.control}
                              name="dispatchDate"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>{t('distributorView.dialogs.dispatchDateLabel')}</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <DialogFooter className="!mt-4">
                                <Button variant="outline" type="button" onClick={() => setLotToTransport(null)}>{t('general.cancel')}</Button>
                                <Button type="submit"><Truck className="mr-2"/> {t('distributorView.dialogs.assignTransportAction')}</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
        
        {lotToShowCertificate && (
            <CertificateDialog
                isOpen={!!lotToShowCertificate}
                onOpenChange={() => setLotToShowCertificate(null)}
                lot={lotToShowCertificate}
            />
        )}
        <Dialog open={showCamera} onOpenChange={setShowCamera}>
            <DialogContent size="lg">
                <DialogHeader>
                    <DialogTitle>Scan Lot QR Code</DialogTitle>
                    <DialogDescription>
                        Point your camera at the QR code on the lot.
                    </DialogDescription>
                </DialogHeader>
                <div className="relative w-full aspect-video rounded-md overflow-hidden bg-black flex items-center justify-center">
                    <video ref={videoRef} className="w-full aspect-video" autoPlay muted playsInline />
                    {hasCameraPermission === false && (
                        <Alert variant="destructive" className="w-auto">
                            <Camera className="h-4 w-4"/>
                            <AlertTitle>Camera Access Denied</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                    )}
                    {hasCameraPermission === undefined && <Loader2 className="h-8 w-8 animate-spin text-white"/>}
                </div>
            </DialogContent>
        </Dialog>
    </div>
  );
}
