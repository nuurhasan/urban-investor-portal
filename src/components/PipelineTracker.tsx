import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useGrowthPipeline, useUpsertPipelineItem, useDeletePipelineItem, type PipelineItem } from "@/hooks/useGrowthPipeline";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, TrendingUp, MapPin, DollarSign, Calendar } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  prospect: "Prospect",
  due_diligence: "Due Diligence",
  under_contract: "Under Contract",
  completed: "Completed",
};

const STATUS_COLORS: Record<string, string> = {
  prospect: "bg-muted text-muted-foreground",
  due_diligence: "bg-accent text-accent-foreground",
  under_contract: "bg-primary/20 text-primary",
  completed: "bg-green-100 text-green-800",
};

const STAGES = ["prospect", "due_diligence", "under_contract", "completed"] as const;

type FormData = {
  name: string;
  location: string;
  status: string;
  estimated_value: string;
  estimated_units: string;
  target_close_date: string;
  notes: string;
};

const empty: FormData = { name: "", location: "", status: "prospect", estimated_value: "", estimated_units: "", target_close_date: "", notes: "" };

const PipelineTracker = () => {
  const { isAdmin } = useAuth();
  const { data: items, isLoading } = useGrowthPipeline();
  const upsert = useUpsertPipelineItem();
  const remove = useDeletePipelineItem();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(empty);

  const openAdd = () => { setForm(empty); setEditingId(null); setDialogOpen(true); };
  const openEdit = (item: PipelineItem) => {
    setForm({
      name: item.name,
      location: item.location ?? "",
      status: item.status,
      estimated_value: item.estimated_value?.toString() ?? "",
      estimated_units: item.estimated_units?.toString() ?? "",
      target_close_date: item.target_close_date ?? "",
      notes: item.notes ?? "",
    });
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) { toast({ title: "Name is required", variant: "destructive" }); return; }
    upsert.mutate(
      {
        ...(editingId ? { id: editingId } : {}),
        name: form.name,
        location: form.location || null,
        status: form.status as any,
        estimated_value: form.estimated_value ? parseFloat(form.estimated_value) : 0,
        estimated_units: form.estimated_units ? parseInt(form.estimated_units) : 0,
        target_close_date: form.target_close_date || null,
        notes: form.notes || null,
      },
      {
        onSuccess: () => { setDialogOpen(false); toast({ title: editingId ? "Updated" : "Added" }); },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (id: string) => {
    remove.mutate(id, {
      onSuccess: () => toast({ title: "Removed" }),
      onError: () => toast({ title: "Delete failed", variant: "destructive" }),
    });
  };

  const fmt = (v: number | null) => v ? `$${(v / 1_000_000).toFixed(1)}M` : "—";

  // Pipeline funnel summary
  const stageCounts = STAGES.map(s => ({ stage: s, count: items?.filter(i => i.status === s).length ?? 0 }));

  if (isLoading) return <Skeleton className="h-64 w-full rounded-lg" />;

  return (
    <div className="space-y-6">
      {/* Pipeline Funnel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stageCounts.map(({ stage, count }) => (
          <Card key={stage} className="text-center">
            <CardContent className="pt-4 pb-3">
              <p className="text-2xl font-heading font-bold text-secondary">{count}</p>
              <p className="text-xs text-muted-foreground mt-1">{STATUS_LABELS[stage]}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-primary" />
            Acquisition Pipeline
          </CardTitle>
          {isAdmin && (
            <Button size="sm" onClick={openAdd}><Plus className="h-4 w-4 mr-1" /> Add</Button>
          )}
        </CardHeader>
        <CardContent>
          {(!items || items.length === 0) ? (
            <p className="text-muted-foreground text-sm text-center py-8">No pipeline items yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Facility</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Est. Value</TableHead>
                    <TableHead className="text-right">Units</TableHead>
                    <TableHead>Target Close</TableHead>
                    {isAdmin && <TableHead className="w-20" />}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        {item.location && (
                          <span className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />{item.location}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={STATUS_COLORS[item.status] + " border-0"}>{STATUS_LABELS[item.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm">{fmt(item.estimated_value)}</TableCell>
                      <TableCell className="text-right">{item.estimated_units || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.target_close_date || "—"}</TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Add"} Pipeline Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-foreground">Facility Name *</label>
              <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Location</label>
              <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="City, State" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Status</label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STAGES.map(s => <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-foreground">Est. Value ($)</label>
                <Input type="number" value={form.estimated_value} onChange={e => setForm(f => ({ ...f, estimated_value: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Est. Units</label>
                <Input type="number" value={form.estimated_units} onChange={e => setForm(f => ({ ...f, estimated_units: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Target Close Date</label>
              <Input type="date" value={form.target_close_date} onChange={e => setForm(f => ({ ...f, target_close_date: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Notes</label>
              <Textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2} />
            </div>
            <Button className="w-full" onClick={handleSave} disabled={upsert.isPending}>
              {upsert.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PipelineTracker;
