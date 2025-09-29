

'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Camera, User, Wheat, MapPin, Loader2, BadgeIndianRupee, FileCheck2, Weight, FileText, Wifi, CheckCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Lot } from "@/lib/types";
import { placeHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";
import { addLot } from "@/app/actions";

const formSchema = z.object({
  farmerName: z.string().min(2, { message: "Farmer name must be at least 2 characters." }),
  cropName: z.string().min(2, { message: "Crop name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  harvestDate: z.date({ required_error: "A harvest date is required." }),
});

interface RegisterCropFormProps {
  onRegister: (lot: Lot) => void;
  farmerName: string;
}

export function RegisterCropForm({ onRegister, farmerName }: RegisterCropFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCertificate, setIsFetchingCertificate] = useState(false);
  const [certificateFetched, setCertificateFetched] = useState(false);
  const { t } = useLocale();
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  useEffect(() => {
    if (cropImage) {
      setPhotoPreview(cropImage.imageUrl);
    }
  }, [cropImage]);

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: farmerName,
      cropName: "Wheat",
      location: "Bhubaneswar, Odisha",
      weight: 10,
      price: 2000,
      harvestDate: new Date(),
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!photoPreview) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "A crop photo is required.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const formattedDate = format(values.harvestDate, "yyyy-MM-dd");
      const lotId = `LOT-${format(new Date(), "yyyyMMdd")}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      
      const newLot: Lot = {
        lotId,
        farmer: values.farmerName,
        cropName: values.cropName,
        location: values.location,
        weight: values.weight,
        harvestDate: formattedDate,
        price: values.price,
        owner: values.farmerName,
        photoUrl: photoPreview!,
        quality: 'Standard',
        gradingDate: new Date().toISOString(),
        status: 'Registered',
        moisture: "11%",
        impurities: "0.8%",
        size: "Uniform Medium",
        color: "Light Brown",
      };

      await addLot(newLot);
      onRegister(newLot);
      toast({
        title: t('farmerView.registerForm.toast.successTitle'),
        description: t('farmerView.registerForm.toast.successDescription', { lotId }),
      });
    } catch(e) {
        console.error(e);
        toast({
            variant: "destructive",
            title: "Registration Failed",
            description: "An error occurred while registering the lot.",
        });
    } finally {
        setIsSubmitting(false);
    }
  }

  const handleFetchCertificate = () => {
    setIsFetchingCertificate(true);
    setCertificateFetched(false);
    setTimeout(() => {
        setIsFetchingCertificate(false);
        setCertificateFetched(true);
        toast({
            title: "Certificate Data Fetched",
            description: "IoT and AI camera data has been simulated.",
        });
    }, 3000); // Simulate a 3-second fetch
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
            <FileCheck2 className="mr-2"/> {t('farmerView.registerForm.title')}
        </CardTitle>
        <CardDescription>
            {t('farmerView.registerForm.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="farmerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('farmerView.registerForm.labels.farmerName')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('farmerView.registerForm.placeholders.farmerName')} {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('farmerView.registerForm.labels.location')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('farmerView.registerForm.placeholders.location')} {...field} className="pl-10" />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="cropName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>{t('farmerView.registerForm.labels.cropName')}</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder={t('farmerView.registerForm.placeholders.cropName')} {...field} className="pl-10"/>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('farmerView.registerForm.labels.weight')}</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder={t('farmerView.registerForm.placeholders.weight')} {...field} className="pl-10"/>
                                </div>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                         <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('farmerView.registerForm.labels.price')}</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <BadgeIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" placeholder={t('farmerView.registerForm.placeholders.price')} {...field} className="pl-10" />
                                    </div>
                                </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                    </div>
                     <FormField
                        control={form.control}
                        name="harvestDate"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>{t('farmerView.registerForm.labels.harvestDate')}</FormLabel>
                            <Popover>
                                <PopoverTrigger asChild>
                                <FormControl>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full pl-3 text-left font-normal",
                                        !field.value && "text-muted-foreground"
                                    )}
                                    >
                                    {field.value ? (
                                        format(field.value, "PP")
                                    ) : (
                                        <span>Pick a date</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) =>
                                    date > new Date() || date < new Date("1900-01-01")
                                    }
                                    initialFocus
                                />
                                </PopoverContent>
                            </Popover>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                </div>

                 {/* Right Column */}
                <div className="space-y-4">
                     <div className="space-y-2">
                        <FormLabel>{t('farmerView.registerForm.labels.photo')}</FormLabel>
                        <div className="w-full aspect-[4/3] rounded-lg border border-dashed flex items-center justify-center bg-muted/40 relative overflow-hidden shrink-0">
                            {photoPreview ? (
                                <Image src={photoPreview} alt={"Crop preview"} layout="fill" objectFit="cover" />
                            ) : (
                                <p className="text-muted-foreground text-xs p-2 text-center">Upload a photo for AI grading</p>
                            )}
                        </div>
                    </div>
                    <Input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
                    <Button type="button" variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()} disabled>
                        <Camera className="mr-2 h-4 w-4" /> {t('farmerView.registerForm.buttons.uploadPhoto')}
                    </Button>
                    <Button type="button" variant="outline" className="w-full" onClick={handleFetchCertificate} disabled={isFetchingCertificate}>
                        {isFetchingCertificate ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Fetching from IoT sensors...
                            </>
                        ) : certificateFetched ? (
                            <>
                                <CheckCircle className="mr-2 h-4 w-4 text-green-500"/>
                                Certificate Data Fetched
                            </>
                        ) : (
                            <>
                                <Wifi className="mr-2 h-4 w-4" /> {t('farmerView.registerForm.buttons.uploadCertificate')}
                            </>
                        )}
                    </Button>
                </div>
            </div>
            <div className="pt-6 border-t">
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !photoPreview}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('farmerView.registerForm.buttons.submit')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
