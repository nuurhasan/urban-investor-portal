import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const BUCKET = "documents";
const BROCHURE_PATH = "brochure.pdf";

const BrochureViewer = () => {
  const { isAdmin } = useAuth();
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUrl = async () => {
    setLoading(true);
    const { data } = await supabase.storage.from(BUCKET).createSignedUrl(BROCHURE_PATH, 3600);
    setUrl(data?.signedUrl ?? null);
    setLoading(false);
  };

  useEffect(() => { fetchUrl(); }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const { error } = await supabase.storage.from(BUCKET).upload(BROCHURE_PATH, file, { upsert: true });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Brochure uploaded" });
      fetchUrl();
    }
    e.target.value = "";
  };

  const handleDelete = async () => {
    const { error } = await supabase.storage.from(BUCKET).remove([BROCHURE_PATH]);
    if (error) {
      toast({ title: "Delete failed", variant: "destructive" });
    } else {
      setUrl(null);
      toast({ title: "Brochure removed" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading text-secondary flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Investor Information
        </CardTitle>
        {isAdmin && (
          <div className="flex gap-2">
            <label>
              <input type="file" accept=".pdf" className="hidden" onChange={handleUpload} />
              <Button variant="outline" size="sm" asChild>
                <span className="cursor-pointer"><Upload className="h-3.5 w-3.5 mr-1" />Upload</span>
              </Button>
            </label>
            {url && (
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1" />Remove
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="w-full h-[400px] rounded-md" />
        ) : url ? (
          <iframe src={url} className="w-full h-[400px] rounded-md border border-border" title="Brochure" />
        ) : (
          <div className="flex items-center justify-center h-[200px] rounded-md border border-dashed border-border text-muted-foreground text-sm">
            No brochure uploaded yet.{isAdmin && " Use the Upload button above."}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BrochureViewer;
