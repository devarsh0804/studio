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
import { CalendarIcon, Camera, User, Wheat, MapPin, Sparkles, Loader2, BadgeIndianRupee, FileCheck2, Scan, Droplets, Microscope, Ruler, Palette, Award, ChevronsRight, RotateCcw } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format, isValid } from "date-fns";
import type { Lot } from "@/lib/types";
import { placeHolderImages } from "@/lib/placeholder-images";
import Image from "next/image";
import { useToast } from "@/hooks/use-toast";
import { gradeCropAction, type GradeCropOutput } from "@/app/actions";
import { useState, useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

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
}

type FormStep = "form" | "grading" | "certificate" | "registering";

export function RegisterCropForm({ onRegister }: RegisterCropFormProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<FormStep>("form");
  const [gradingResult, setGradingResult] = useState<GradeCropOutput | null>(null);
  const [progress, setProgress] = useState(0);

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
  
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "grading") {
      setProgress(0);
      const startTime = Date.now();
      // Shorten duration for better UX, but keep it noticeable
      const duration = 5000; // 5 seconds
      
      const interval = setInterval(() => {
        const elapsedTime = Date.now() - startTime;
        const newProgress = Math.min((elapsedTime / duration) * 100, 100);
        setProgress(newProgress);
        if (newProgress >= 100) {
            clearInterval(interval);
        }
      }, 100);

      return () => clearInterval(interval);
    }
    return () => clearTimeout(timer);
  }, [step]);


  async function handleStartGrading() {
    // Trigger validation
    const isValid = await form.trigger();
    if (!isValid) {
      toast({
        variant: "destructive",
        title: "Incomplete Form",
        description: "Please fill out all the required fields before starting the grading process.",
      });
      return;
    }

    if (!cropImage) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Crop image not found. Cannot perform grading.",
      });
      return;
    }
    
    setStep("grading");
    toast({
      title: "Automated Grading Initiated...",
      description: "Analyzing crop with simulated IoT sensors. This will take a moment.",
    });

    try {
        const values = form.getValues();
        const resultPromise = gradeCropAction({
          ...values,
          photoDataUri: cropImage.imageUrl, 
        });
        
        // Wait for both animation and AI call to complete
        await new Promise(resolve => setTimeout(resolve, 5000));
        const result = await resultPromise;
        
        setGradingResult(result);
        setStep("certificate");
        toast({
          title: "Grading Complete!",
          description: `A digital certificate has been generated with a grade of '${result.grade}'.`,
        });

    } catch (error) {
        console.error("Error during grading:", error);
        toast({
            variant: "destructive",
            title: "Grading Failed",
            description: "An unexpected error occurred during the AI grading process. Please try again."
        });
        setStep("form");
    }
  }

  function handleRegister() {
    setStep("registering");
    const values = form.getValues();

    if (!gradingResult) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Grading results are missing. Cannot register lot.",
      });
      setStep("certificate");
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
      photoUrl: cropImage?.imageUrl || "",
      quality: gradingResult.grade,
      gradingDate: new Date().toISOString(),
      moisture: gradingResult.moisture,
      impurities: gradingResult.impurities,
      size: gradingResult.size,
      color: gradingResult.color,
    };

    setTimeout(() => {
        onRegister(newLot);
        toast({
          title: "Lot Registered Successfully!",
          description: `The QR code for Lot ID ${lotId} is now ready.`,
        });
        // Do not reset form here, let the parent component handle the view change.
    }, 500); // simulate network delay
  }

  const resetProcess = () => {
    setStep("form");
    setGradingResult(null);
    setProgress(0);
    // Don't reset form fields, user might want to edit
  }

  if (step === "grading") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Scan className="mr-2"/> IoT Grading in Progress</CardTitle>
          <CardDescription>Our AI is analyzing your crop using simulated real-time sensor data.</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-6 py-12">
            <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-dashed border-primary/50 rounded-full animate-spin"></div>
                <div className="absolute inset-2 flex items-center justify-center bg-primary/10 rounded-full">
                    <Wheat className="w-16 h-16 text-primary" />
                </div>
            </div>
            <p className="text-lg font-semibold text-primary">Analyzing... Please wait.</p>
            <Progress value={progress} className="w-full max-w-sm mx-auto" />
            <p className="text-sm text-muted-foreground">This simulates a hardware analysis process.</p>
        </CardContent>
      </Card>
    );
  }

  if (step === "certificate" && gradingResult) {
    const values = form.getValues();
    const gradingDate = new Date();
    return (
        <Card>
            <CardHeader>
                 <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center"><FileCheck2 className="mr-2 text-primary"/> Digital Quality Certificate</span>
                    <Button variant="outline" size="sm" onClick={resetProcess}><RotateCcw className="mr-2"/> Start Over</Button>
                </CardTitle>
                <CardDescription>This certificate has been generated by our AI grading system. Review the details and proceed to register.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                    <div className="space-y-3">
                        <div className="flex"><p className="w-28 text-muted-foreground">Farmer</p><p className="font-medium">{values.farmerName}</p></div>
                        <div className="flex"><p className="w-28 text-muted-foreground">Crop</p><p className="font-medium">{values.cropName}</p></div>
                        <div className="flex"><p className="w-28 text-muted-foreground">Weight</p><p className="font-medium">{values.weight} quintals</p></div>
                    </div>
                     <div className="space-y-3">
                        <div className="flex"><p className="w-28 text-muted-foreground">Location</p><p className="font-medium">{values.location}</p></div>
                        <div className="flex"><p className="w-28 text-muted-foreground">Harvest Date</p><p className="font-medium">{format(values.harvestDate, 'PP')}</p></div>
                        <div className="flex"><p className="w-28 text-muted-foreground">Price Set</p><p className="font-medium"><BadgeIndianRupee className="w-4 h-4 inline-block -mt-1"/> {values.price} / quintal</p></div>
                    </div>
                </div>
                 <div className="pt-4 border-t">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-start">
                            <Award className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Final Grade</p>
                                <p className="font-bold text-base text-primary">{gradingResult.grade}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Droplets className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Moisture</p>
                                <p className="font-medium">{gradingResult.moisture || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Microscope className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Impurities</p>
                                <p className="font-medium">{gradingResult.impurities || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Ruler className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Size</p>
                                <p className="font-medium">{gradingResult.size || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <Palette className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Color</p>
                                <p className="font-medium">{gradingResult.color || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start">
                            <CalendarIcon className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                            <div>
                                <p className="text-muted-foreground">Grading Date</p>
                                <p className="font-medium">{gradingDate && isValid(gradingDate) ? format(gradingDate, 'PPp') : 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <Button size="lg" className="w-full" onClick={handleRegister} disabled={step === "registering"}>
                     {step === "registering" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronsRight className="mr-2"/>}
                    {step === "registering" ? "Registering..." : "Register Lot & Generate QR"}
                </Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
            <FileCheck2 className="mr-2"/> Register New Lot
        </CardTitle>
        <CardDescription>
            Fill in the details below to start the automated AI-powered grading process.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleStartGrading)} className="space-y-8">
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
                     <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                          <FormItem>
                          <FormLabel>Set Your Price (per quintal)</FormLabel>
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
            
            <Button type="submit" size="lg" className="w-full" disabled={step !== 'form'}>
                {step === 'grading' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Start Grading
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
