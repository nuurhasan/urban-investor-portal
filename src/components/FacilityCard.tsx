import { MapPin, Box, TrendingUp, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { useDeleteFacility, type Facility } from "@/hooks/useFacilities";
import { toast } from "@/hooks/use-toast";

interface FacilityCardProps {
  facility: Facility;
  isSelected: boolean;
  onClick: () => void;
}

const FacilityCard = ({ facility, isSelected, onClick }: FacilityCardProps) => {
  const { isAdmin } = useAuth();
  const deleteFacility = useDeleteFacility();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const occupancy = facility.occupancy_pct ?? 0;

  const handleDelete = () => {
    deleteFacility.mutate(facility.id, {
      onSuccess: () => {
        toast({ title: "Asset deleted", description: `${facility.name} has been removed.` });
        setConfirmOpen(false);
      },
      onError: (err: Error) =>
        toast({ title: "Delete failed", description: err.message, variant: "destructive" }),
    });
  };

  return (
    <>
      <Card
        className={`relative cursor-pointer transition-all hover:shadow-md ${
          isSelected ? "ring-2 ring-primary" : ""
        }`}
        onClick={onClick}
      >
        {isAdmin && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1.5 h-7 w-7 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              setConfirmOpen(true);
            }}
            aria-label={`Delete ${facility.name}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-heading text-base font-bold text-secondary truncate pr-8">
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
              className={`shrink-0 text-[10px] ${isAdmin ? "mr-8" : ""}`}
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this asset?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <strong>{facility.name}</strong> along with its
              unit mix and photos. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteFacility.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleteFacility.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFacility.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default FacilityCard;
