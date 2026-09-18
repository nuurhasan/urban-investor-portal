import { useState } from "react";
import { ArrowLeft, DollarSign, Box, TrendingUp, BarChart3, Ruler, Pencil, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Facility } from "@/hooks/useFacilities";
import { useFacilityUnitMixes, useFacilityPhotos, useUpdateFacility } from "@/hooks/useFacilities";
import FacilityPhotoGallery from "@/components/FacilityPhotoGallery";
import EditableUnitMixTable from "@/components/EditableUnitMixTable";

interface Props {
  facility: Facility;
  onBack: () => void;
}

const fmt = (v: number | null, prefix = "$") =>
  v != null ? `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—";

type StatDef = {
  icon: React.ElementType;
  label: string;
  field: keyof Facility;
  format: (v: any) => string;
  parse: (s: string) => any;
};

const statDefs: StatDef[] = [
  { icon: Box, label: "Total Units", field: "total_units", format: (v) => String(v ?? 0), parse: (s) => parseInt(s) || 0 },
  { icon: Ruler, label: "NLA (m²)", field: "net_lettable_area", format: (v) => v?.toLocaleString() ?? "—", parse: (s) => parseFloat(s) || 0 },
  { icon: TrendingUp, label: "Occupancy", field: "occupancy_pct", format: (v) => `${(v ?? 0).toFixed(1)}%`, parse: (s) => parseFloat(s.replace("%", "")) || 0 },
  { icon: DollarSign, label: "Revenue", field: "annual_revenue", format: (v) => fmt(v), parse: (s) => parseFloat(s.replace(/[$,]/g, "")) || 0 },
  { icon: BarChart3, label: "NOI", field: "net_operating_income", format: (v) => fmt(v), parse: (s) => parseFloat(s.replace(/[$,]/g, "")) || 0 },
  { icon: DollarSign, label: "Est. Value", field: "estimated_value", format: (v) => fmt(v), parse: (s) => parseFloat(s.replace(/[$,]/g, "")) || 0 },
];

const EditableStatBox = ({
  def, value, isAdmin, onSave,
}: {
  def: StatDef; value: any; isAdmin: boolean; onSave: (field: keyof Facility, val: any) => void;
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const Icon = def.icon;

  const startEdit = () => {
    setDraft(String(value ?? ""));
    setEditing(true);
  };

  const save = () => {
    onSave(def.field, def.parse(draft));
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="rounded-lg border border-primary bg-card p-3 text-center space-y-1">
        <Input value={draft} onChange={(e) => setDraft(e.target.value)} className="text-center text-sm h-8" autoFocus onKeyDown={(e) => e.key === "Enter" && save()} />
        <p className="text-[11px] text-muted-foreground">{def.label}</p>
        <div className="flex justify-center gap-1">
          <button onClick={save} className="text-primary"><Check className="h-3.5 w-3.5" /></button>
          <button onClick={() => setEditing(false)} className="text-muted-foreground"><X className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center group relative">
      <Icon className="mx-auto h-4 w-4 text-primary" />
      <p className="mt-1 text-lg font-bold font-number text-secondary">{def.format(value)}</p>
      <p className="text-[11px] text-muted-foreground">{def.label}</p>
      {isAdmin && (
        <button onClick={startEdit} className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
          <Pencil className="h-3 w-3" />
        </button>
      )}
    </div>
  );
};

const FacilityDetail = ({ facility, onBack }: Props) => {
  const { isAdmin } = useAuth();
  const { data: unitMixes, isLoading: mixLoading } = useFacilityUnitMixes(facility.id);
  const { data: photos, isLoading: photosLoading } = useFacilityPhotos(facility.id);
  const updateFacility = useUpdateFacility();

  const [editingHeader, setEditingHeader] = useState(false);
  const [draftName, setDraftName] = useState(facility.name);
  const [draftAddress, setDraftAddress] = useState(facility.address ?? "");
  const [draftCity, setDraftCity] = useState(facility.city ?? "");
  const [draftState, setDraftState] = useState(facility.state ?? "");
  const [draftPostcode, setDraftPostcode] = useState(facility.postcode ?? "");
  const [draftLat, setDraftLat] = useState(facility.latitude?.toString() ?? "");
  const [draftLng, setDraftLng] = useState(facility.longitude?.toString() ?? "");

  const [editingOverview, setEditingOverview] = useState(false);
  const [draftOverview, setDraftOverview] = useState(facility.overview_text ?? "");

  const handleStatSave = (field: keyof Facility, val: any) => {
    updateFacility.mutate(
      { id: facility.id, [field]: val },
      {
        onSuccess: () => toast({ title: "Updated" }),
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const saveHeader = () => {
    const lat = draftLat.trim() === "" ? null : parseFloat(draftLat);
    const lng = draftLng.trim() === "" ? null : parseFloat(draftLng);
    if ((draftLat && Number.isNaN(lat)) || (draftLng && Number.isNaN(lng))) {
      toast({ title: "Latitude and longitude must be numbers", variant: "destructive" });
      return;
    }
    updateFacility.mutate(
      {
        id: facility.id,
        name: draftName,
        address: draftAddress,
        city: draftCity,
        state: draftState,
        postcode: draftPostcode,
        latitude: lat,
        longitude: lng,
      },
      {
        onSuccess: () => { setEditingHeader(false); toast({ title: "Updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  const saveOverview = () => {
    updateFacility.mutate(
      { id: facility.id, overview_text: draftOverview },
      {
        onSuccess: () => { setEditingOverview(false); toast({ title: "Updated" }); },
        onError: () => toast({ title: "Update failed", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Button>

      {/* Header */}
      {editingHeader ? (
        <div className="space-y-2">
          <Input value={draftName} onChange={(e) => setDraftName(e.target.value)} className="font-heading text-2xl font-bold" placeholder="Facility name" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Input value={draftAddress} onChange={(e) => setDraftAddress(e.target.value)} placeholder="Address" />
            <Input value={draftCity} onChange={(e) => setDraftCity(e.target.value)} placeholder="City" />
            <Input value={draftState} onChange={(e) => setDraftState(e.target.value)} placeholder="State" />
            <Input value={draftPostcode} onChange={(e) => setDraftPostcode(e.target.value)} placeholder="Postcode" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={draftLat} onChange={(e) => setDraftLat(e.target.value)} placeholder="Latitude (e.g. -33.366)" />
            <Input value={draftLng} onChange={(e) => setDraftLng(e.target.value)} placeholder="Longitude (e.g. 115.671)" />
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: when you change the address, also update lat/lng so the map pin moves.
            Find coordinates via Google Maps → right-click location → click the lat/lng to copy.
          </p>
          <div className="flex gap-1">
            <Button size="sm" onClick={saveHeader}><Check className="h-4 w-4 mr-1" /> Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingHeader(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
          </div>
        </div>
      ) : (
        <div className="group relative">
          <h2 className="font-heading text-2xl text-secondary">{facility.name}</h2>
          <p className="text-sm text-muted-foreground">
            {[facility.address, facility.city, facility.state, facility.postcode].filter(Boolean).join(", ")}
          </p>
          {isAdmin && (
            <button onClick={() => setEditingHeader(true)} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
              <Pencil className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {statDefs.map((def) => (
          <EditableStatBox key={def.field} def={def} value={facility[def.field]} isAdmin={isAdmin} onSave={handleStatSave} />
        ))}
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="unit-mix">Unit Mix</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader><CardTitle className="text-lg">Facility Overview</CardTitle></CardHeader>
            <CardContent>
              {editingOverview ? (
                <div className="space-y-2">
                  <Textarea value={draftOverview} onChange={(e) => setDraftOverview(e.target.value)} rows={6} />
                  <div className="flex gap-1">
                    <Button size="sm" onClick={saveOverview}><Check className="h-4 w-4 mr-1" /> Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingOverview(false)}><X className="h-4 w-4 mr-1" /> Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="group relative">
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {facility.overview_text || "No overview available yet."}
                  </p>
                  {isAdmin && (
                    <button onClick={() => { setDraftOverview(facility.overview_text ?? ""); setEditingOverview(true); }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unit-mix">
          <Card>
            <CardHeader><CardTitle className="text-lg">Unit Mix</CardTitle></CardHeader>
            <CardContent>
              {mixLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}
                </div>
              ) : (
                <EditableUnitMixTable facilityId={facility.id} unitMixes={unitMixes ?? []} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardHeader><CardTitle className="text-lg">Photo Gallery</CardTitle></CardHeader>
            <CardContent>
              {photosLoading ? (
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-video w-full rounded-md" />)}
                </div>
              ) : (
                <FacilityPhotoGallery photos={photos ?? []} facilityId={facility.id} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacilityDetail;
