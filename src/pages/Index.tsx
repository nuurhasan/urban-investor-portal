import EditableKpiCard from "@/components/EditableKpiCard";
import EditableText from "@/components/EditableText";
import BrochureViewer from "@/components/BrochureViewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Download } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useKpiValues } from "@/hooks/useKpiValues";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const { data: welcomeTitle, isLoading: titleLoading } = useSiteContent("welcome_title");
  const { data: welcomeBody, isLoading: bodyLoading } = useSiteContent("welcome_body");
  const { data: kpis, isLoading: kpisLoading } = useKpiValues();

  const handleDownloadBrochure = async () => {
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl("brochure.pdf", 3600, { download: "urban-self-storage-brochure.pdf" });
    if (error || !data?.signedUrl) {
      toast({
        title: "Brochure not available",
        description: "No brochure has been uploaded yet.",
        variant: "destructive",
      });
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        {titleLoading ? (
          <Skeleton className="h-9 w-80" />
        ) : (
          <EditableText
            contentKey="welcome_title"
            currentValue={welcomeTitle?.title}
            field="title"
            as="h1"
            className="font-heading text-3xl text-secondary"
          />
        )}
        <div className="mt-2 max-w-2xl">
          {bodyLoading ? (
            <Skeleton className="h-12 w-full" />
          ) : (
            <EditableText
              contentKey="welcome_body"
              currentValue={welcomeBody?.body}
              field="body"
              as="p"
              className="text-muted-foreground"
            />
          )}
        </div>
      </section>

      {/* KPI Grid */}
      <section>
        <h2 className="font-heading text-xl text-secondary mb-4">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpisLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-lg" />
              ))
            : kpis?.map((kpi) => (
                <EditableKpiCard key={kpi.id} kpi={kpi} />
              ))}
        </div>
      </section>

      {/* Brochure */}
      <section>
        <BrochureViewer />
      </section>

      {/* Quick Actions */}
      <section className="flex flex-wrap gap-3">
        <Button onClick={handleDownloadBrochure} className="rounded-md">
          <Download className="mr-2 h-4 w-4" />
          Download Brochure
        </Button>
      </section>
    </div>
  );
};

export default Index;
