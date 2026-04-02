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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
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

const InlineEditRow = ({
  metric,
  onSave,
  onCancel,
  saving,
}: {
  metric: FinancialMetric;
  onSave: (m: FinancialMetric) => void;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [label, setLabel] = useState(metric.label);
  const [period, setPeriod] = useState(metric.period);
  const [value, setValue] = useState(metric.value);

  return (
    <TableRow>
      <TableCell>
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 text-sm" />
      </TableCell>
      <TableCell>
        <Input value={period} onChange={(e) => setPeriod(e.target.value)} className="h-8 text-sm w-24" />
      </TableCell>
      <TableCell>
        <Input
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          className="h-8 text-sm w-28 text-right"
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex gap-1 justify-end">
          <button
            onClick={() => onSave({ ...metric, label, period, value })}
            disabled={saving}
            className="text-primary hover:text-primary/80"
          >
            <Check className="h-4 w-4" />
          </button>
          <button onClick={onCancel} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
};

const FinancialMetricsTable = ({ category, icon }: Props) => {
  const { isAdmin } = useAuth();
  const { data: allMetrics, isLoading } = useFinancialMetrics();
  const upsert = useUpsertFinancialMetric();
  const remove = useDeleteFinancialMetric();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<FinancialMetric>>(emptyMetric);
  const [editingId, setEditingId] = useState<string | null>(null);

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

  const handleInlineSave = (m: FinancialMetric) => {
    upsert.mutate(m, {
      onSuccess: () => {
        setEditingId(null);
        toast({ title: "Metric updated" });
      },
      onError: () => toast({ title: "Save failed", variant: "destructive" }),
    });
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
              {metrics.map((m) =>
                isAdmin && editingId === m.id ? (
                  <InlineEditRow
                    key={m.id}
                    metric={m}
                    onSave={handleInlineSave}
                    onCancel={() => setEditingId(null)}
                    saving={upsert.isPending}
                  />
                ) : (
                  <TableRow key={m.id} className="group">
                    <TableCell className="font-medium">{m.label}</TableCell>
                    <TableCell className="text-muted-foreground">{m.period}</TableCell>
                    <TableCell className="text-right font-semibold tabular-nums">{fmt(m.value)}</TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingId(m.id)} className="text-muted-foreground hover:text-foreground">
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(m.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                )
              )}
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
