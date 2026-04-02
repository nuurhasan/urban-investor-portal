import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/EditableText";
import GovernancePdfViewer from "@/components/GovernancePdfViewer";
import BoardRoster from "@/components/BoardRoster";
import { Landmark } from "lucide-react";

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

      {/* Values & Mission */}
      <section className="space-y-2">
        <EditableText
          contentKey="governance_values"
          currentValue={values.data?.title}
          field="title"
          as="h1"
          className="font-heading text-xl text-secondary"
        />
        <EditableText
          contentKey="governance_values"
          currentValue={values.data?.body}
          field="body"
          as="p"
          className="text-muted-foreground leading-relaxed max-w-3xl"
        />
      </section>

      {/* Security Holders Agreement PDF */}
      <section className="space-y-2">
        <EditableText
          contentKey="governance_sha"
          currentValue={sha.data?.title}
          field="title"
          as="h1"
          className="font-heading text-xl text-secondary"
        />
        <EditableText
          contentKey="governance_sha"
          currentValue={sha.data?.body}
          field="body"
          as="p"
          className="text-muted-foreground leading-relaxed max-w-3xl mb-4"
        />
        <GovernancePdfViewer storagePath="governance-sha.pdf" title="Security Holders Agreement" />
      </section>

      {/* Board & Leadership */}
      <BoardRoster />
    </div>
  );
};

export default Governance;
