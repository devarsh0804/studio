
"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Lot } from "@/lib/types";
import { Award, Droplets, Microscope, Palette, Ruler, Calendar, FileText } from "lucide-react";
import { format, isValid } from "date-fns";
import type { ChartConfig } from "@/components/ui/chart"

interface CertificateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  lot: Lot;
}

const chartConfig = {
  value: {
    label: "Value",
    color: "hsl(var(--primary))",
  },
  premium: {
    label: "Premium Standard",
    color: "hsl(var(--muted-foreground))",
  },
} satisfies ChartConfig

export function CertificateDialog({ isOpen, onOpenChange, lot }: CertificateDialogProps) {
  const gradingDate = lot.gradingDate ? new Date(lot.gradingDate) : null;
  const moistureValue = parseFloat(lot.moisture || "0");
  const impuritiesValue = parseFloat(lot.impurities || "0");

  const chartData = [
    { name: "Moisture (%)", value: moistureValue, premium: 14 },
    { name: "Impurities (%)", value: impuritiesValue, premium: 0.5 },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center text-2xl">
            <FileText className="mr-3 w-7 h-7 text-primary"/> Digital Quality Certificate
          </DialogTitle>
          <DialogDescription className="font-mono text-primary pt-1">{lot.lotId}</DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quality Analysis</h3>
                 <div className="flex items-start">
                    <Award className="w-5 h-5 mr-3 mt-1 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Final Grade</p>
                        <p className="font-bold text-2xl text-primary">{lot.quality}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Droplets className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Moisture Content</p>
                        <p className="font-medium">{lot.moisture || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Microscope className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Impurities</p>
                        <p className="font-medium">{lot.impurities || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Ruler className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{lot.size || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Palette className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Color</p>
                        <p className="font-medium">{lot.color || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Calendar className="w-5 h-5 mr-3 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Grading Date</p>
                        <p className="font-medium">{gradingDate && isValid(gradingDate) ? format(gradingDate, 'PPp') : 'N/A'}</p>
                    </div>
                </div>
            </div>
             <div className="space-y-4">
                <h3 className="font-semibold text-lg">Quality Score</h3>
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: "hsl(var(--background))",
                                    borderColor: "hsl(var(--border))",
                                }}
                            />
                            <Legend />
                            <Bar dataKey="value" fill={chartConfig.value.color} name="This Lot" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="premium" fill={chartConfig.premium.color} name="Premium Standard" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                    A comparison of this lot's metrics against the benchmark for a 'Premium' grade. Lower is better.
                </p>
             </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
