import { MapPin, Box, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Facility } from "@/hooks/useFacilities";

interface FacilityCardProps {
  facility: Facility;
  isSelected: boolean;
  onClick: () => void;
}

const FacilityCard = ({ facility, isSelected, onClick }: FacilityCardProps) => {
  const occupancy = facility.occupancy_pct ?? 0;

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-heading text-base font-bold text-secondary truncate">
              {facility.name}
            </h3>
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">
                {[facility.city, facility.state].filter(Boolean).join(", ")}
              </span>
            </p>
          </div>
          <Badge
            variant={facility.status === "active" ? "default" : "secondary"}
            className="shrink-0 text-[10px]"
          >
            {facility.status}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <Box className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {facility.total_units ?? 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Units</p>
          </div>
          <div>
            <TrendingUp className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {occupancy.toFixed(0)}%
            </p>
            <p className="text-[10px] text-muted-foreground">Occupancy</p>
          </div>
          <div>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              {facility.net_lettable_area
                ? `${facility.net_lettable_area.toLocaleString()}m²`
                : "—"}
            </p>
            <p className="text-[10px] text-muted-foreground">NLA</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FacilityCard;
