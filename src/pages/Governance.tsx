import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/EditableText";
import GovernancePdfViewer from "@/components/GovernancePdfViewer";
import BoardRoster from "@/components/BoardRoster";
import { Card, CardContent } from "@/components/ui/card";
import { Landmark, Heart, Shield } from "lucide-react";

const Governance = () => {
  const values = useSiteContent("governance_values");
  const sha = useSiteContent("governance_sha");

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <Landmark className="h-7 w-7 text-primary" />
        <h1 className="font-heading text-3xl text-secondary">Corporate Governance</h1>
      </div>

      {/* Values & Mission + SHA side by side */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-5 w-5 text-primary shrink-0" />
              <EditableText
                contentKey="governance_values"
                currentValue={values.data?.title}
                field="title"
                as="h1"
                className="font-heading text-lg text-secondary"
              />
            </div>
            <EditableText
              contentKey="governance_values"
              currentValue={values.data?.body}
              field="body"
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-secondary">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-5 w-5 text-secondary shrink-0" />
              <EditableText
                contentKey="governance_sha"
                currentValue={sha.data?.title}
                field="title"
                as="h1"
                className="font-heading text-lg text-secondary"
              />
            </div>
            <EditableText
              contentKey="governance_sha"
              currentValue={sha.data?.body}
              field="body"
              as="p"
              className="text-sm text-muted-foreground leading-relaxed"
            />
          </CardContent>
        </Card>
      </div>

      {/* Security Holders Agreement PDF */}
      <GovernancePdfViewer storagePath="governance-sha.pdf" title="Security Holders Agreement" />

      {/* Board & Leadership */}
      <BoardRoster />
    </div>
  );
};

export default Governance;
