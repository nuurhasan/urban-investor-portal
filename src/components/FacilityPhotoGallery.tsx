import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Upload, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAddFacilityPhoto, useDeleteFacilityPhoto, type FacilityPhoto } from "@/hooks/useFacilities";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface Props {
  photos: FacilityPhoto[];
  facilityId: string;
}

const FacilityPhotoGallery = ({ photos, facilityId }: Props) => {
  const { isAdmin } = useAuth();
  const [selected, setSelected] = useState<FacilityPhoto | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const addPhoto = useAddFacilityPhoto();
  const deletePhoto = useDeleteFacilityPhoto();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${facilityId}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("facility-photos")
        .upload(path, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("facility-photos")
        .getPublicUrl(path);

      addPhoto.mutate(
        { facility_id: facilityId, url: publicUrl },
        {
          onSuccess: () => toast({ title: "Photo uploaded" }),
          onError: () => toast({ title: "Failed to save photo", variant: "destructive" }),
        }
      );
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleDelete = (photo: FacilityPhoto) => {
    deletePhoto.mutate(
      { id: photo.id, facility_id: facilityId, url: photo.url },
      {
        onSuccess: () => toast({ title: "Photo deleted" }),
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  };

  return (
    <>
      {isAdmin && (
        <div className="mb-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
            <Upload className="h-4 w-4 mr-1" /> {uploading ? "Uploading…" : "Upload Photo"}
          </Button>
        </div>
      )}

      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((p) => (
            <div key={p.id} className="group relative aspect-video overflow-hidden rounded-md border border-border">
              <button onClick={() => setSelected(p)} className="h-full w-full">
                <img
                  src={p.url}
                  alt={p.caption || "Facility photo"}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              </button>
              {p.caption && (
                <span className="absolute bottom-0 left-0 right-0 bg-secondary/70 px-2 py-1 text-[10px] text-secondary-foreground truncate">
                  {p.caption}
                </span>
              )}
              {isAdmin && (
                <button
                  onClick={() => handleDelete(p)}
                  className="absolute top-1 right-1 rounded bg-destructive/80 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-destructive-foreground"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No photos available.</p>
      )}

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
