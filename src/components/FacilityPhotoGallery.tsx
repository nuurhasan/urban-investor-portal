import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { FacilityPhoto } from "@/hooks/useFacilities";

const FacilityPhotoGallery = ({ photos }: { photos: FacilityPhoto[] }) => {
  const [selected, setSelected] = useState<FacilityPhoto | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photos.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelected(p)}
            className="group relative aspect-video overflow-hidden rounded-md border border-border"
          >
            <img
              src={p.url}
              alt={p.caption || "Facility photo"}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
            {p.caption && (
              <span className="absolute bottom-0 left-0 right-0 bg-secondary/70 px-2 py-1 text-[10px] text-secondary-foreground truncate">
                {p.caption}
              </span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-3xl p-2">
          {selected && (
            <img
              src={selected.url}
              alt={selected.caption || "Facility photo"}
              className="w-full rounded-md"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FacilityPhotoGallery;
