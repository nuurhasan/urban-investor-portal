import EditableKpiCard from "@/components/EditableKpiCard";
import EditableText from "@/components/EditableText";
import BrochureViewer from "@/components/BrochureViewer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Download, Mail } from "lucide-react";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useKpiValues } from "@/hooks/useKpiValues";

const Index = () => {
  const { data: welcomeTitle, isLoading: titleLoading } = useSiteContent("welcome_title");
  const { data: welcomeBody, isLoading: bodyLoading } = useSiteContent("welcome_body");
  const { data: kpis, isLoading: kpisLoading } = useKpiValues();

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
        <Button className="rounded-md">
          <FileText className="mr-2 h-4 w-4" />
          View Latest Report
        </Button>
        <Button variant="secondary" className="rounded-md">
          <Download className="mr-2 h-4 w-4" />
          Download Brochure
        </Button>
        <Button variant="outline" className="rounded-md">
          <Mail className="mr-2 h-4 w-4" />
          Contact Us
        </Button>
      </section>
    </div>
  );
};

export default Index;
