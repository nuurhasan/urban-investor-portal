import { ArrowLeft, DollarSign, Box, TrendingUp, BarChart3, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import type { Facility } from "@/hooks/useFacilities";
import { useFacilityUnitMixes, useFacilityPhotos } from "@/hooks/useFacilities";
import FacilityPhotoGallery from "@/components/FacilityPhotoGallery";

interface Props {
  facility: Facility;
  onBack: () => void;
}

const fmt = (v: number | null, prefix = "$") =>
  v != null ? `${prefix}${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—";

const StatBox = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="rounded-lg border border-border bg-card p-3 text-center">
    <Icon className="mx-auto h-4 w-4 text-primary" />
    <p className="mt-1 text-lg font-bold font-heading text-secondary">{value}</p>
    <p className="text-[11px] text-muted-foreground">{label}</p>
  </div>
);

const FacilityDetail = ({ facility, onBack }: Props) => {
  const { data: unitMixes, isLoading: mixLoading } = useFacilityUnitMixes(facility.id);
  const { data: photos, isLoading: photosLoading } = useFacilityPhotos(facility.id);

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-1 text-muted-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to Portfolio
      </Button>

      <div>
        <h2 className="font-heading text-2xl text-secondary">{facility.name}</h2>
        <p className="text-sm text-muted-foreground">
          {[facility.address, facility.city, facility.state, facility.postcode]
            .filter(Boolean)
            .join(", ")}
        </p>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatBox icon={Box} label="Total Units" value={String(facility.total_units ?? 0)} />
        <StatBox icon={Ruler} label="NLA (m²)" value={facility.net_lettable_area?.toLocaleString() ?? "—"} />
        <StatBox icon={TrendingUp} label="Occupancy" value={`${(facility.occupancy_pct ?? 0).toFixed(1)}%`} />
        <StatBox icon={DollarSign} label="Revenue" value={fmt(facility.annual_revenue)} />
        <StatBox icon={BarChart3} label="NOI" value={fmt(facility.net_operating_income)} />
        <StatBox icon={DollarSign} label="Est. Value" value={fmt(facility.estimated_value)} />
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
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {facility.overview_text || "No overview available yet."}
              </p>
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
              ) : unitMixes && unitMixes.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead className="text-right">Count</TableHead>
                      <TableHead className="text-right">Size (m²)</TableHead>
                      <TableHead className="text-right">Monthly Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unitMixes.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.unit_type}</TableCell>
                        <TableCell className="text-right">{u.unit_count}</TableCell>
                        <TableCell className="text-right">
                          {u.unit_size_sqm != null ? u.unit_size_sqm.toFixed(1) : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          {u.monthly_rate != null ? `$${u.monthly_rate.toFixed(0)}` : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-sm text-muted-foreground">No unit mix data available.</p>
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
              ) : photos && photos.length > 0 ? (
                <FacilityPhotoGallery photos={photos} />
              ) : (
                <p className="text-sm text-muted-foreground">No photos available.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacilityDetail;
