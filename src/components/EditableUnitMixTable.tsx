import { useState } from "react";
import { Plus, Pencil, Trash2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useUpsertUnitMix, useDeleteUnitMix, type FacilityUnitMix } from "@/hooks/useFacilities";
import { toast } from "@/hooks/use-toast";

interface Props {
  facilityId: string;
  unitMixes: FacilityUnitMix[];
}

interface Draft {
  id?: string;
  unit_type: string;
  unit_count: string;
  unit_size_sqm: string;
  monthly_rate: string;
}

const emptyDraft: Draft = { unit_type: "", unit_count: "", unit_size_sqm: "", monthly_rate: "" };

const EditableUnitMixTable = ({ facilityId, unitMixes }: Props) => {
  const { isAdmin } = useAuth();
  const upsert = useUpsertUnitMix();
  const remove = useDeleteUnitMix();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [adding, setAdding] = useState(false);

  const startEdit = (u: FacilityUnitMix) => {
    setEditingId(u.id);
    setDraft({
      id: u.id,
      unit_type: u.unit_type,
      unit_count: String(u.unit_count),
      unit_size_sqm: u.unit_size_sqm != null ? String(u.unit_size_sqm) : "",
      monthly_rate: u.monthly_rate != null ? String(u.monthly_rate) : "",
    });
    setAdding(false);
  };

  const startAdd = () => {
    setDraft(emptyDraft);
    setAdding(true);
    setEditingId(null);
  };

  const cancel = () => {
    setEditingId(null);
    setAdding(false);
  };

  const save = () => {
    if (!draft.unit_type.trim()) return;
    upsert.mutate(
      {
        ...(draft.id ? { id: draft.id } : {}),
        facility_id: facilityId,
        unit_type: draft.unit_type,
        unit_count: parseInt(draft.unit_count) || 0,
        unit_size_sqm: draft.unit_size_sqm ? parseFloat(draft.unit_size_sqm) : null,
        monthly_rate: draft.monthly_rate ? parseFloat(draft.monthly_rate) : null,
        sort_order: unitMixes.length,
      },
      {
        onSuccess: () => { cancel(); toast({ title: "Saved" }); },
        onError: () => toast({ title: "Save failed", variant: "destructive" }),
      }
    );
  };

  const handleDelete = (u: FacilityUnitMix) => {
    remove.mutate(
      { id: u.id, facility_id: facilityId },
      {
        onSuccess: () => toast({ title: "Deleted" }),
        onError: () => toast({ title: "Delete failed", variant: "destructive" }),
      }
    );
  };

  const renderRow = (isEditing: boolean) => (
    <TableRow>
      <TableCell><Input value={draft.unit_type} onChange={(e) => setDraft({ ...draft, unit_type: e.target.value })} placeholder="Type" className="h-8" /></TableCell>
      <TableCell><Input value={draft.unit_count} onChange={(e) => setDraft({ ...draft, unit_count: e.target.value })} className="h-8 text-right" /></TableCell>
      <TableCell><Input value={draft.unit_size_sqm} onChange={(e) => setDraft({ ...draft, unit_size_sqm: e.target.value })} className="h-8 text-right" /></TableCell>
      <TableCell><Input value={draft.monthly_rate} onChange={(e) => setDraft({ ...draft, monthly_rate: e.target.value })} className="h-8 text-right" /></TableCell>
      {isAdmin && (
        <TableCell className="text-right">
          <button onClick={save} className="text-primary mr-1"><Check className="h-4 w-4" /></button>
          <button onClick={cancel} className="text-muted-foreground"><X className="h-4 w-4" /></button>
        </TableCell>
      )}
    </TableRow>
  );

  if (unitMixes.length === 0 && !adding) {
    return (
      <div>
        <p className="text-sm text-muted-foreground">No unit mix data available.</p>
        {isAdmin && (
          <Button size="sm" variant="outline" className="mt-2" onClick={startAdd}>
            <Plus className="h-4 w-4 mr-1" /> Add Row
          </Button>
        )}
        {adding && renderRow(false)}
      </div>
    );
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Count</TableHead>
            <TableHead className="text-right">Size (m²)</TableHead>
            <TableHead className="text-right">Monthly Rate</TableHead>
            {isAdmin && <TableHead className="text-right w-20"></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {unitMixes.map((u) =>
            editingId === u.id ? (
              <TableRow key={u.id}>{renderRow(true).props.children}</TableRow>
            ) : (
              <TableRow key={u.id}>
                <TableCell className="font-medium">{u.unit_type}</TableCell>
                <TableCell className="text-right">{u.unit_count}</TableCell>
                <TableCell className="text-right">{u.unit_size_sqm != null ? u.unit_size_sqm.toFixed(1) : "—"}</TableCell>
                <TableCell className="text-right">{u.monthly_rate != null ? `$${u.monthly_rate.toFixed(0)}` : "—"}</TableCell>
                {isAdmin && (
                  <TableCell className="text-right">
                    <button onClick={() => startEdit(u)} className="text-muted-foreground hover:text-foreground mr-1"><Pencil className="h-3.5 w-3.5" /></button>
                    <button onClick={() => handleDelete(u)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                  </TableCell>
                )}
              </TableRow>
            )
          )}
          {adding && renderRow(false)}
        </TableBody>
      </Table>
      {isAdmin && !adding && !editingId && (
        <Button size="sm" variant="outline" className="mt-2" onClick={startAdd}>
          <Plus className="h-4 w-4 mr-1" /> Add Row
        </Button>
      )}
    </div>
  );
};

export default EditableUnitMixTable;
