import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { Box, Calendar, Wheat, Weight, BadgeIndianRupee, Award, User, Milestone, MapPin, Droplets, Microscope, Ruler, Palette, FileText } from "lucide-react";
import { format } from "date-fns";

interface LotDetailsCardProps {
  lot: Lot;
}

export function LotDetailsCard({ lot }: LotDetailsCardProps) {
  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center">
            <Box className="mr-2" /> Lot Details
          </CardTitle>
          <CardDescription className="font-mono text-primary pt-1">{lot.lotId}</CardDescription>
        </div>
        <div className="text-right">
            <p className="text-sm text-muted-foreground">Current Owner</p>
            <p className="font-medium flex items-center justify-end gap-2"><Milestone className="w-4 h-4" /> {lot.owner}</p>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4 text-sm">
           <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Farmer</p>
            <p className="font-medium">{lot.farmer}</p>
          </div>
           <div className="flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Location</p>
            <p className="font-medium">{lot.location}</p>
          </div>
          <div className="flex items-center">
            <Wheat className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Crop</p>
            <p className="font-medium">{lot.cropName}</p>
          </div>
          <div className="flex items-center">
            <Weight className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Weight</p>
            <p className="font-medium">{lot.weight} quintals</p>
          </div>
          <div className="flex items-center">
            <BadgeIndianRupee className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Price</p>
            <p className="font-medium">
              <span className="inline-flex items-center">
                {lot.price} / quintal
              </span>
            </p>
          </div>
          <div className="flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Harvest Date</p>
            <p className="font-medium">{lot.harvestDate}</p>
          </div>
        </div>
        <div>
          {cropImage && (
            <Image
              src={cropImage.imageUrl}
              alt={cropImage.description}
              width={300}
              height={200}
              className="rounded-lg object-cover w-full aspect-[3/2]"
              data-ai-hint={cropImage.imageHint}
            />
          )}
        </div>
        <div className="md:col-span-2 pt-4 border-t">
             <h4 className="text-base font-semibold flex items-center mb-4"><FileText className="mr-2 w-5 h-5 text-primary" /> Digital Quality Certificate</h4>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start">
                    <Award className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Final Grade</p>
                        <p className="font-bold text-base text-primary">{lot.quality}</p>
                    </div>
                </div>
                <div className="flex items-start">
                    <Droplets className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Moisture</p>
                        <p className="font-medium">{lot.moisture || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Microscope className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Impurities</p>
                        <p className="font-medium">{lot.impurities || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Ruler className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">{lot.size || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Palette className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Color</p>
                        <p className="font-medium">{lot.color || 'N/A'}</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <Calendar className="w-4 h-4 mr-2 mt-0.5 text-muted-foreground" />
                    <div>
                        <p className="text-muted-foreground">Grading Date</p>
                        <p className="font-medium">{format(new Date(lot.gradingDate), 'PPp')}</p>
                    </div>
                </div>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}
