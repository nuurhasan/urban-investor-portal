import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Facility } from "@/hooks/useFacilities";

// Fix default marker icon
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  facilities: Facility[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

const FacilityMap = ({ facilities, selectedId, onSelect }: Props) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<L.Map | null>(null);
  const markersRef = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;

    leafletMap.current = L.map(mapRef.current).setView([-33.3, 115.6], 6);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(leafletMap.current);

    return () => {
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  useEffect(() => {
    if (!leafletMap.current) return;

    // Clear old markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    const validFacilities = facilities.filter((f) => f.latitude != null && f.longitude != null);

    validFacilities.forEach((f) => {
      const marker = L.marker([f.latitude!, f.longitude!])
        .addTo(leafletMap.current!)
        .bindPopup(`<strong>${f.name}</strong><br/>${f.city ?? ""}, ${f.state ?? ""}`);
      marker.on("click", () => onSelect(f.id));
      markersRef.current[f.id] = marker;
    });

    if (validFacilities.length > 0) {
      const bounds = L.latLngBounds(
        validFacilities.map((f) => [f.latitude!, f.longitude!] as [number, number])
      );
      leafletMap.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 10 });
    }
  }, [facilities, onSelect]);

  useEffect(() => {
    if (selectedId && markersRef.current[selectedId]) {
      markersRef.current[selectedId].openPopup();
    }
  }, [selectedId]);

  return (
    <div
      ref={mapRef}
      className="h-[300px] w-full rounded-lg border border-border lg:h-[400px]"
    />
  );
};

export default FacilityMap;
