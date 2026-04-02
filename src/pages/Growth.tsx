import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/EditableText";
import PipelineTracker from "@/components/PipelineTracker";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Target } from "lucide-react";

const Growth = () => {
  const header = useSiteContent("growth_header");
  const strategy = useSiteContent("growth_strategy");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <EditableText
          contentKey="growth_header"
          currentValue={header.data?.title}
          field="title"
          as="h1"
          className="font-heading text-3xl text-secondary"
        />
        <EditableText
          contentKey="growth_header"
          currentValue={header.data?.body}
          field="body"
          as="p"
          className="mt-1 text-muted-foreground"
        />
      </div>

      {/* Strategic Initiatives */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6 space-y-3">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary shrink-0" />
            <EditableText
              contentKey="growth_strategy"
              currentValue={strategy.data?.title}
              field="title"
              as="h1"
              className="font-heading text-lg text-secondary"
            />
          </div>
          <EditableText
            contentKey="growth_strategy"
            currentValue={strategy.data?.body}
            field="body"
            as="p"
            className="text-sm text-muted-foreground leading-relaxed"
          />
        </CardContent>
      </Card>

      {/* Pipeline Tracker */}
      <PipelineTracker />
    </div>
  );
};

export default Growth;
