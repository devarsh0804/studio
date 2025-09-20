
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
import { CalendarIcon, Camera, User, Wheat, MapPin, Loader2, BadgeIndianRupee, FileCheck2, Weight, FileText } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Lot } from "@/lib/types";
import { placeHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const formSchema = z.object({
  farmerName: z.string().min(2, { message: "Farmer name must be at least 2 characters." }),
  cropName: z.string().min(2, { message: "Crop name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
  harvestDate: z.date({ required_error: "A harvest date is required." }),
  quality: z.enum(['Premium', 'Standard', 'Basic'], { required_error: "Please select a grade." }),
});

interface RegisterCropFormProps {
  onRegister: (lot: Lot) => void;
  farmerName: string;
}

export function RegisterCropForm({ onRegister, farmerName }: RegisterCropFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: farmerName,
      cropName: "Wheat",
      location: "Bhubaneswar, Odisha",
      weight: 10,
      price: 2000,
      harvestDate: new Date(),
      quality: "Premium",
    },
  });

  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    if (!cropImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Crop image not found. Cannot register.",
      });
      setIsSubmitting(false);
      return;
    }

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
      photoUrl: cropImage.imageUrl,
      quality: values.quality,
      gradingDate: new Date().toISOString(),
      status: 'Registered',
      moisture: `${(Math.random() * (18 - 10) + 10).toFixed(1)}%`,
      impurities: `${(Math.random() * (2 - 0.1) + 0.1).toFixed(1)}%`,
      size: ['Uniform Medium', 'Large', 'Small'][Math.floor(Math.random() * 3)],
      color: ['Golden Brown', 'Light Yellow', 'Pale White'][Math.floor(Math.random() * 3)],
    };

    setTimeout(() => {
        onRegister(newLot);
        toast({
          title: "Lot Registered Successfully!",
          description: `The QR code for Lot ID ${lotId} is now ready.`,
        });
        setIsSubmitting(false);
    }, 500);
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center">
            <FileCheck2 className="mr-2"/> Register New Lot
        </CardTitle>
        <CardDescription>
            Fill in the details below to register the crop and generate a QR code for the supply chain.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                {/* Left Column */}
                <div className="space-y-4">
                    <FormField
                    control={form.control}
                    name="farmerName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Farmer Name</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., Ramesh Kumar" {...field} className="pl-10" />
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
                        <FormLabel>Location (Mandi)</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., APMC, Punjab" {...field} className="pl-10" />
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
                        <FormLabel>Crop Name</FormLabel>
                        <FormControl>
                            <div className="relative">
                                <Wheat className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="e.g., Wheat, Rice" {...field} className="pl-10"/>
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
                            <FormLabel>Weight (quintals)</FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Weight className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input type="number" placeholder="e.g., 5" {...field} className="pl-10"/>
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
                            <FormLabel>Price (per quintal)</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <BadgeIndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input type="number" placeholder="e.g., 2000" {...field} className="pl-10" />
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
                            <FormLabel>Harvest Date</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="quality"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Quality Grade</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a quality grade for the crop" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="Premium">Premium</SelectItem>
                                        <SelectItem value="Standard">Standard</SelectItem>
                                        <SelectItem value="Basic">Basic</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                 {/* Right Column */}
                <div className="space-y-4">
                     <div className="space-y-2">
                        <FormLabel>Crop Photo</FormLabel>
                        <div className="w-full aspect-[4/3] rounded-lg border border-dashed flex items-center justify-center bg-muted/40 relative overflow-hidden shrink-0">
                            {cropImage ? (
                                <Image src={cropImage.imageUrl} alt={cropImage.description} layout="fill" objectFit="cover" data-ai-hint={cropImage.imageHint}/>
                            ) : (
                                <p className="text-muted-foreground text-xs p-2 text-center">No Image</p>
                            )}
                        </div>
                    </div>
                    <Button type="button" variant="outline" className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Upload Photo
                    </Button>
                    <Button type="button" variant="outline" className="w-full">
                        <FileText className="mr-2 h-4 w-4" /> Upload Certificate
                    </Button>
                </div>
            </div>
            <div className="pt-4 border-t">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Register Lot & Generate QR
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
