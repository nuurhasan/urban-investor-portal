import { useFinancialMetrics } from "@/hooks/useFinancials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const fmtAxis = (v: number) =>
  v >= 1_000_000 ? `$${(v / 1_000_000).toFixed(1)}M` : `$${(v / 1_000).toFixed(0)}K`;

const RevenueChart = () => {
  const { data: metrics, isLoading } = useFinancialMetrics();

  // Build chart data: group by period, show Revenue vs NOI
  const revenueMetrics = metrics?.filter((m) => m.category === "revenue") ?? [];
  const periods = [...new Set(revenueMetrics.map((m) => m.period))].sort();

  const chartData = periods.map((period) => {
    const row: Record<string, string | number> = { period };
    revenueMetrics
      .filter((m) => m.period === period)
      .forEach((m) => {
        row[m.label] = m.value;
      });
    return row;
  });

  const labels = [...new Set(revenueMetrics.map((m) => m.label))];
  const colors = ["hsl(var(--primary))", "hsl(var(--secondary))"];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-heading text-secondary flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Revenue Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-[300px] w-full rounded-md" />
        ) : !chartData.length ? (
          <p className="text-sm text-muted-foreground">No revenue data to chart.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="period" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={fmtAxis} tick={{ fontSize: 12 }} />
              <Tooltip
                formatter={(value: number) => fmtAxis(value)}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              {labels.map((label, i) => (
                <Bar key={label} dataKey={label} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default RevenueChart;
