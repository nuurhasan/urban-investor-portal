import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateKpi, type KpiValue } from "@/hooks/useKpiValues";
import { Pencil, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Props {
  kpi: KpiValue;
  className?: string;
}

const EditableKpiCard = ({ kpi, className }: Props) => {
  const { isAdmin } = useAuth();
  const updateKpi = useUpdateKpi();
  const [editing, setEditing] = useState(false);
  const [label, setLabel] = useState(kpi.label);
  const [value, setValue] = useState(kpi.value);

  const handleSave = () => {
    updateKpi.mutate(
      { id: kpi.id, label, value },
      {
        onSuccess: () => {
          setEditing(false);
          toast({ title: "KPI updated" });
        },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const handleCancel = () => {
    setLabel(kpi.label);
    setValue(kpi.value);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className={cn("rounded-lg bg-card p-5 shadow-sm border-t-4 border-t-primary space-y-2", className)}>
        <Input value={value} onChange={(e) => setValue(e.target.value)} className="font-number text-lg font-bold" />
        <Input value={label} onChange={(e) => setLabel(e.target.value)} className="text-sm" />
        <div className="flex gap-1 pt-1">
          <button onClick={handleSave} className="text-primary hover:text-primary/80"><Check className="h-4 w-4" /></button>
          <button onClick={handleCancel} className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg bg-card p-5 shadow-sm border-t-4 border-t-primary group relative", className)}>
      <p className="font-heading text-2xl font-bold text-primary">{kpi.value}</p>
      <p className="mt-1 text-sm text-muted-foreground font-body">{kpi.label}</p>
      {isAdmin && (
        <button
          onClick={() => setEditing(true)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default EditableKpiCard;
