import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { FileText, Download, Mail } from "lucide-react";

const kpiData = [
  { label: "Total Company Value", value: "$42.5M" },
  { label: "Facilities", value: "2" },
  { label: "Total Units", value: "385" },
  { label: "Avg Occupancy", value: "87%" },
  { label: "Dividend Yield", value: "6.2%" },
  { label: "Annual Revenue", value: "$3.8M" },
  { label: "NOI", value: "$1.2M" },
  { label: "YoY Revenue Growth", value: "12.4%" },
];

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <section>
        <h1 className="font-heading text-3xl text-secondary">
          Welcome to Urban Self Storage
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Your secure portal for investment performance, asset data, and
          corporate documents. Explore the latest metrics and reports below.
        </p>
      </section>

      {/* KPI Grid */}
      <section>
        <h2 className="font-heading text-xl text-secondary mb-4">
          Key Performance Indicators
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {kpiData.map((kpi) => (
            <StatCard key={kpi.label} label={kpi.label} value={kpi.value} />
          ))}
        </div>
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
