export interface AddressParts {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  postcode?: string | null;
}

/** Looks up coordinates for an Australian address via OpenStreetMap. Returns null if not found. */
export async function geocodeAddress(parts: AddressParts): Promise<{ latitude: number; longitude: number } | null> {
  const pieces = [parts.address, parts.city, parts.state, parts.postcode]
    .map((p) => (p ?? "").trim())
    .filter(Boolean);
  if (pieces.length === 0) return null;

  const tryQuery = async (q: string) => {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=au&q=${encodeURIComponent(q)}`;
    const res = await fetch(url, { headers: { Accept: "application/json" } });
    if (!res.ok) return null;
    const data = (await res.json()) as { lat: string; lon: string }[];
    if (!data.length) return null;
    const latitude = parseFloat(data[0].lat);
    const longitude = parseFloat(data[0].lon);
    return Number.isFinite(latitude) && Number.isFinite(longitude) ? { latitude, longitude } : null;
  };

  try {
    const full = await tryQuery([...pieces, "Australia"].join(", "));
    if (full) return full;
    // Fallback: city/state/postcode only
    const loose = [parts.city, parts.state, parts.postcode].map((p) => (p ?? "").trim()).filter(Boolean);
    if (parts.address && loose.length) return await tryQuery([...loose, "Australia"].join(", "));
    return null;
  } catch {
    return null;
  }
}
