import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useFacilities } from "@/hooks/useFacilities";
import FacilityCard from "@/components/FacilityCard";
import FacilityDetail from "@/components/FacilityDetail";
import FacilityMap from "@/components/FacilityMap";

const Portfolio = () => {
  const { data: facilities, isLoading } = useFacilities();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const handleMapSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const selectedFacility = facilities?.find((f) => f.id === detailId);

  if (detailId && selectedFacility) {
    return (
      <FacilityDetail
        facility={selectedFacility}
        onBack={() => setDetailId(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl text-secondary">Asset Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Interactive map and facility details across the portfolio.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-lg" />
            ))}
          </div>
        </div>
      ) : facilities && facilities.length > 0 ? (
        <>
          <FacilityMap
            facilities={facilities}
            selectedId={selectedId}
            onSelect={handleMapSelect}
          />

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {facilities.map((f) => (
              <FacilityCard
                key={f.id}
                facility={f}
                isSelected={selectedId === f.id}
                onClick={() => setDetailId(f.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border p-12 text-center">
          <p className="text-muted-foreground">
            No facilities added yet. An admin can add facilities from the database.
          </p>
        </div>
      )}
    </div>
  );
};

export default Portfolio;
