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
import { CalendarIcon, Camera, User, Wheat, BadgeIndianRupee, MapPin, Sparkles, Loader2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Lot } from "@/lib/types";
import { placeHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { gradeCropAction } from "@/app/actions";
import { useState } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  farmerName: z.string().min(2, { message: "Farmer name must be at least 2 characters." }),
  cropName: z.string().min(2, { message: "Crop name must be at least 2 characters." }),
  location: z.string().min(2, { message: "Location is required." }),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  harvestDate: z.date({ required_error: "A harvest date is required." }),
  price: z.coerce.number().positive({ message: "Price must be a positive number." }),
});

interface RegisterCropFormProps {
  onRegister: (lot: Lot) => void;
}

export function RegisterCropForm({ onRegister }: RegisterCropFormProps) {
  const { toast } = useToast();
  const [isGrading, setIsGrading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      farmerName: "",
      cropName: "",
      location: "",
    },
  });

  const cropImage = placeHolderImages.find(p => p.id === 'crop1');
  const farmerImage = placeHolderImages.find(p => p.id === 'farmer1');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!cropImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Crop image not found. Cannot perform grading.",
      });
      return;
    }
    
    setIsGrading(true);
    toast({
      title: "AI Grading in Progress...",
      description: "Analyzing crop quality. This may take a moment.",
    });

    const gradingResult = await gradeCropAction({
      ...values,
      photoDataUri: cropImage.imageUrl, // In a real app, this would be an uploaded image data URI
    });
    
    setIsGrading(false);

    const formattedDate = format(values.harvestDate, "yyyy-MM-dd");
    const lotId = `LOT-${format(new Date(), "yyyyMMdd")}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newLot: Lot = {
      lotId,
      farmer: values.farmerName,
      cropName: values.cropName,
      location: values.location,
      weight: values.weight,
      harvestDate: formattedDate,
      photoUrl: cropImage?.imageUrl || "",
      price: values.price,
      owner: values.farmerName,
      quality: gradingResult.grade,
      gradingDate: new Date().toISOString(),
      moisture: gradingResult.moisture,
      impurities: gradingResult.impurities,
      size: gradingResult.size,
      color: gradingResult.color,
    };

    onRegister(newLot);
    toast({
      title: "Lot Registered & Graded!",
      description: `Lot ID ${lotId} has been created with a grade of '${gradingResult.grade}'.`,
    })
    form.reset();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Wheat className="mr-2"/> Register New Crop Lot
        </CardTitle>
        <CardDescription>
            Fill in the details below. The crop will be automatically graded using our AI-powered system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
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
                            <Input placeholder="e.g., Wheat, Rice" {...field} />
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
                          <FormLabel>Weight (in quintals)</FormLabel>
                          <FormControl>
                              <Input type="number" placeholder="e.g., 5" {...field} />
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
                        <FormItem className="flex flex-col">
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
                                    format(field.value, "PPP")
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
                <div className="space-y-4">
                    <div className="space-y-2">
                        <FormLabel>Farmer Photo</FormLabel>
                        <div className="w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40 relative overflow-hidden">
                            {farmerImage ? (
                                <Image src={farmerImage.imageUrl} alt={farmerImage.description} fill objectFit="cover" data-ai-hint={farmerImage.imageHint}/>
                            ) : (
                                <p className="text-muted-foreground text-sm">No Image</p>
                            )}
                        </div>
                        <Button type="button" variant="outline" className="w-full">
                            <Camera className="mr-2 h-4 w-4" /> Upload Photo
                        </Button>
                    </div>
                    <div className="space-y-2">
                        <FormLabel>Crop Photo for Grading</FormLabel>
                        <div className="w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40 relative overflow-hidden">
                            {cropImage ? (
                                <Image src={cropImage.imageUrl} alt={cropImage.description} fill objectFit="cover" data-ai-hint={cropImage.imageHint}/>
                            ) : (
                                <p className="text-muted-foreground text-sm">No Image</p>
                            )}
                        </div>
                        <Button type="button" variant="outline" className="w-full">
                            <Camera className="mr-2 h-4 w-4" /> Upload Photo
                        </Button>
                        <FormDescription>
                            For demo purposes, placeholder images are used for analysis.
                        </FormDescription>
                    </div>
                </div>
            </div>
            
            <Alert>
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Automated Quality Grading</AlertTitle>
                <AlertDescription>
                    Upon submission, an AI will analyze the crop photo and details to generate a digital quality certificate.
                </AlertDescription>
            </Alert>
            
            <Button type="submit" size="lg" className="w-full" disabled={isGrading}>
                {isGrading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isGrading ? 'Grading Crop...' : 'Register and Grade Lot'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
