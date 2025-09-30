
import { cn } from "@/lib/utils";
import { Tractor, Truck, Store, ShoppingCart, ShieldCheck, Spline } from "lucide-react";
import type { ReactNode } from "react";

const iconMap: { [key: string]: ReactNode } = {
  FARM: <Tractor className="h-5 w-5" />,
  DISTRIBUTOR_BUY: <ShoppingCart className="h-5 w-5" />,
  DISTRIBUTOR_SPLIT: <Spline className="h-5 w-5" />,
  TRANSPORT: <Truck className="h-5 w-5" />,
  RETAIL: <Store className="h-5 w-5" />,
  CUSTOMER: <ShoppingCart className="h-5 w-5" />,
};

interface TimelineEvent {
  type: keyof typeof iconMap;
  title: string;
  timestamp?: string;
  details: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-border -translate-x-1/2" aria-hidden="true"></div>
      <div className="space-y-12">
        {events.map((event, index) => (
          <div key={index} className="relative flex items-start">
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center ring-4 ring-background">
              {iconMap[event.type]}
            </div>
            <div className="ml-6 flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold font-headline text-foreground">{event.title}</h3>
                {event.timestamp && <p className="text-sm text-muted-foreground">{event.timestamp}</p>}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{event.details}</div>
            </div>
          </div>
        ))}
      </div>
       <div className="mt-8 flex items-center justify-center text-primary font-semibold">
          <ShieldCheck className="h-5 w-5 mr-2" />
          Verified by AgriChain Trace
      </div>
    </div>
  );
}

    