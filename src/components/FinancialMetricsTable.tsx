import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  useFinancialMetrics,
  useUpsertFinancialMetric,
  useDeleteFinancialMetric,
  type FinancialMetric,
} from "@/hooks/useFinancials";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const fmt = (v: number) =>
  v >= 1_000_000
    ? `$${(v / 1_000_000).toFixed(2)}M`
    : v >= 1_000
    ? `$${(v / 1_000).toFixed(0)}K`
    : `$${v.toLocaleString()}`;

const categoryLabels: Record<string, string> = {
  revenue: "Revenue",
  expense: "Expenses",
  valuation: "Valuation",
};

const emptyMetric: Partial<FinancialMetric> = {
  label: "",
  value: 0,
  period: "FY2025",
  category: "revenue",
};

interface Props {
  category: string;
  icon: React.ReactNode;
}

const FinancialMetricsTable = ({ category, icon }: Props) => {
  const { isAdmin } = useAuth();
  const { data: allMetrics, isLoading } = useFinancialMetrics();
  const upsert = useUpsertFinancialMetric();
  const remove = useDeleteFinancialMetric();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<FinancialMetric>>(emptyMetric);

  const metrics = allMetrics?.filter((m) => m.category === category) ?? [];

  const handleSave = () => {
    if (!draft.label) {
      toast({ title: "Label is required", variant: "destructive" });
      return;
    }
    upsert.mutate(
      { ...draft, category } as FinancialMetric,
      {
        onSuccess: () => {
          setOpen(false);
          setDraft(emptyMetric);
          toast({ title: "Metric saved" });
        },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
  };

  const handleEdit = (m: FinancialMetric) => {
    setDraft(m);
    setOpen(true);
  };

  const handleDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Metric removed" }),
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-heading text-secondary flex items-center gap-2">
          {icon}
          {categoryLabels[category] ?? category}
        </CardTitle>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDraft({ ...emptyMetric, category });
              setOpen(true);
            }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            Add
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-32 w-full rounded-md" />
        ) : !metrics.length ? (
          <p className="text-sm text-muted-foreground">
            No {categoryLabels[category]?.toLowerCase()} data yet.
            {isAdmin && " Use the Add button."}
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Metric</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Value</TableHead>
                {isAdmin && <TableHead className="w-20" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((m) => (
                <TableRow key={m.id} className="group">
                  <TableCell className="font-medium">{m.label}</TableCell>
                  <TableCell className="text-muted-foreground">{m.period}</TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">{fmt(m.value)}</TableCell>
                  {isAdmin && (
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleEdit(m)} className="text-muted-foreground hover:text-foreground">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{draft.id ? "Edit" : "Add"} {categoryLabels[category]} Metric</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Input
              placeholder="Label (e.g. Total Revenue)"
              value={draft.label ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, label: e.target.value }))}
            />
            <Input
              type="number"
              placeholder="Value"
              value={draft.value ?? 0}
              onChange={(e) => setDraft((d) => ({ ...d, value: parseFloat(e.target.value) || 0 }))}
            />
            <Input
              placeholder="Period (e.g. FY2025)"
              value={draft.period ?? ""}
              onChange={(e) => setDraft((d) => ({ ...d, period: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FinancialMetricsTable;
