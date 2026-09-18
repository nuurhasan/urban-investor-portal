import { useState, useCallback } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus, Loader2 } from "lucide-react";
import { useFacilities, useAddFacility } from "@/hooks/useFacilities";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import FacilityCard from "@/components/FacilityCard";
import FacilityDetail from "@/components/FacilityDetail";
import FacilityMap from "@/components/FacilityMap";

const Portfolio = () => {
  const { isAdmin } = useAuth();
  const { data: facilities, isLoading } = useFacilities();
  const addFacility = useAddFacility();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const handleMapSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const resetForm = () => {
    setName("");
    setCity("");
    setState("");
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    addFacility.mutate(
      { name: name.trim(), city: city.trim() || null, state: state.trim() || null },
      {
        onSuccess: () => {
          toast({ title: "Asset added", description: "Open the new card to fill in details." });
          setAddOpen(false);
          resetForm();
        },
        onError: (err: Error) =>
          toast({ title: "Add failed", description: err.message, variant: "destructive" }),
      }
    );
  };

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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl text-secondary">Asset Portfolio</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Interactive map and facility details across the portfolio.
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setAddOpen(true)} className="rounded-md">
            <Plus className="mr-2 h-4 w-4" />
            Add Asset
          </Button>
        )}
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
            No facilities added yet.{isAdmin && " Use the Add Asset button above."}
          </p>
        </div>
      )}

      {/* Add Asset Dialog */}
      <Dialog
        open={addOpen}
        onOpenChange={(o) => {
          setAddOpen(o);
          if (!o) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">Add a new asset</DialogTitle>
            <DialogDescription>
              Create a portfolio entry. You can add full details (location, units, photos,
              financials) by opening the card after it's created.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="add-asset-name">Name</Label>
              <Input
                id="add-asset-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={120}
                placeholder="e.g. Urban Self Storage Newcastle"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="add-asset-city">City</Label>
                <Input
                  id="add-asset-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  maxLength={80}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-asset-state">State</Label>
                <Input
                  id="add-asset-state"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  maxLength={40}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={addFacility.isPending}>
                {addFacility.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Add asset
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Portfolio;
