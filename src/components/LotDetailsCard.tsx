import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lot } from "@/lib/types";
import Image from "next/image";
import { placeHolderImages } from "@/lib/placeholder-images";
import { Box, Calendar, Wheat, Weight, BadgeIndianRupee, Award, User, Milestone, MapPin } from "lucide-react";

interface LotDetailsCardProps {
  lot: Lot;
}

export function LotDetailsCard({ lot }: LotDetailsCardProps) {
  const cropImage = placeHolderImages.find(p => p.id === 'crop1');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Box className="mr-2" /> Lot Details
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 text-sm">
          <div className="flex items-center">
            <p className="w-32 text-muted-foreground">Lot ID</p>
            <p className="font-mono text-primary">{lot.lotId}</p>
          </div>
           <div className="flex items-center">
            <User className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Farmer</p>
            <p className="font-medium">{lot.farmer}</p>
          </div>
          <div className="flex items-center">
            <Milestone className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Current Owner</p>
            <p className="font-medium">{lot.owner}</p>
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
            <Award className="w-4 h-4 mr-2 text-muted-foreground" />
            <p className="w-28 text-muted-foreground">Quality</p>
            <p className="font-medium">{lot.quality}</p>
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
      </CardContent>
    </Card>
  );
}
