import { useSiteContent } from "@/hooks/useSiteContent";
import EditableText from "@/components/EditableText";
import FinancialMetricsTable from "@/components/FinancialMetricsTable";
import RevenueChart from "@/components/RevenueChart";
import DocumentLibrary from "@/components/DocumentLibrary";
import { DollarSign, TrendingDown, Building2 } from "lucide-react";

const Financials = () => {
  const intro = useSiteContent("financials_intro");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <EditableText
          contentKey="financials_intro"
          currentValue={intro.data?.title}
          field="title"
          as="h1"
          className="font-heading text-3xl text-secondary"
        />
        <EditableText
          contentKey="financials_intro"
          currentValue={intro.data?.body}
          field="body"
          as="p"
          className="mt-1 text-muted-foreground"
        />
      </div>

      {/* Revenue Chart */}
      <RevenueChart />

      {/* Metric Tables */}
      <div className="grid gap-6 lg:grid-cols-3">
        <FinancialMetricsTable category="revenue" icon={<DollarSign className="h-5 w-5 text-primary" />} />
        <FinancialMetricsTable category="expense" icon={<TrendingDown className="h-5 w-5 text-destructive" />} />
        <FinancialMetricsTable category="valuation" icon={<Building2 className="h-5 w-5 text-secondary" />} />
      </div>

      {/* Document Library */}
      <DocumentLibrary excludeCategory="governance" />
    </div>
  );
};

export default Financials;
