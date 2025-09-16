"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Camera, Wheat } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Lot } from "@/lib/types";
import { placeHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";

const formSchema = z.object({
  cropName: z.string().min(2, { message: "Crop name must be at least 2 characters." }),
  weight: z.coerce.number().positive({ message: "Weight must be a positive number." }),
  harvestDate: z.date({ required_error: "A harvest date is required." }),
});

interface RegisterCropFormProps {
  onRegister: (lot: Lot) => void;
}

export function RegisterCropForm({ onRegister }: RegisterCropFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      cropName: "",
    },
  });

  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  function onSubmit(values: z.infer<typeof formSchema>) {
    const formattedDate = format(values.harvestDate, "yyyy-MM-dd");
    const lotId = `LOT-${format(new Date(), "yyyyMMdd")}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
    
    const newLot: Lot = {
      lotId,
      farmer: "Farmer123", // Mock data
      cropName: values.cropName,
      weight: values.weight,
      harvestDate: formattedDate,
      photoUrl: cropImage?.imageUrl || "",
    };

    onRegister(newLot);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <Wheat className="mr-2"/> Register New Crop Lot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-8">
                    <FormField
                    control={form.control}
                    name="cropName"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Crop Name</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Tomato, Onion" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Weight (in kg)</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="e.g., 50" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
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
                    <FormLabel>Crop Photo</FormLabel>
                    <div className="w-full aspect-video rounded-lg border border-dashed flex items-center justify-center bg-muted/40 relative overflow-hidden">
                        {cropImage ? (
                            <Image src={cropImage.imageUrl} alt={cropImage.description} layout="fill" objectFit="cover" data-ai-hint={cropImage.imageHint}/>
                        ) : (
                            <p className="text-muted-foreground text-sm">No Image</p>
                        )}
                    </div>
                    <Button type="button" variant="outline" className="w-full">
                        <Camera className="mr-2 h-4 w-4" /> Upload Photo
                    </Button>
                    <FormDescription>
                        For demo purposes, a placeholder image is used.
                    </FormDescription>
                </div>
            </div>
            
            <Button type="submit" size="lg" className="w-full">Generate QR Code</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
