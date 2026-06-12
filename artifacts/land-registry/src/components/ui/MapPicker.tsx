import { useEffect, useRef, useState, useCallback } from "react";
import { Search, MapPin, LocateFixed, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Dynamically load leaflet CSS
const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address?: {
    road?: string;
    house_number?: string;
    suburb?: string;
    city?: string;
    county?: string;
    postcode?: string;
    country?: string;
  };
}

export default function MapPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress = "",
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [showResults, setShowResults] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [locating, setLocating] = useState(false);

  // Inject Leaflet CSS once
  useEffect(() => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }
  }, []);

  const placeMarker = useCallback((lat: number, lng: number, L: any) => {
    if (!leafletMapRef.current) return;

    const customIcon = L.divIcon({
      className: "",
      html: `
        <div style="
          position:relative;
          display:flex;
          flex-direction:column;
          align-items:center;
        ">
          <div style="
            width:36px;height:36px;
            background:#C8861A;
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid #fff;
            box-shadow:0 2px 8px rgba(0,0,0,0.35);
          "></div>
          <div style="
            width:8px;height:8px;
            background:#C8861A;
            border-radius:50%;
            margin-top:2px;
            box-shadow:0 1px 4px rgba(0,0,0,0.25);
          "></div>
        </div>
      `,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -52],
    });

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], {
        icon: customIcon,
        draggable: true,
      }).addTo(leafletMapRef.current);

      markerRef.current.on("dragend", async () => {
        const pos = markerRef.current.getLatLng();
        const addr = await reverseGeocode(pos.lat, pos.lng);
        setSelectedAddress(addr);
        onLocationSelect(pos.lat, pos.lng, addr);
      });
    }
  }, [onLocationSelect]);

  // Initialise map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !mapRef.current || leafletMapRef.current) return;

      const startLat = initialLat ?? 51.505;
      const startLng = initialLng ?? -0.09;
      const startZoom = initialLat ? 15 : 6;

      const map = L.map(mapRef.current, {
        center: [startLat, startLng],
        zoom: startZoom,
        zoomControl: false,
      });

      leafletMapRef.current = map;

      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "bottomright" }).addTo(map);

      if (initialLat && initialLng) {
        placeMarker(initialLat, initialLng, L);
      }

      map.on("click", async (e: any) => {
        const { lat, lng } = e.latlng;
        placeMarker(lat, lng, L);
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        setSearchQuery(addr);
        onLocationSelect(lat, lng, addr);
      });

      setMapReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=gb&format=json&addressdetails=1&limit=6`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const flyTo = async (result: NominatimResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setShowResults(false);
    setSearchQuery(result.display_name);
    setSelectedAddress(result.display_name);

    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
      const L = await import("leaflet");
      placeMarker(lat, lng, L);
    }

    onLocationSelect(lat, lng, result.display_name);
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (leafletMapRef.current) {
          leafletMapRef.current.flyTo([lat, lng], 17, { duration: 1.2 });
          const L = await import("leaflet");
          placeMarker(lat, lng, L);
        }
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        setSearchQuery(addr);
        onLocationSelect(lat, lng, addr);
        setLocating(false);
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Search bar */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 h-11 pr-8"
              placeholder="Search an address or postcode in Great Britain…"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setShowResults(false);
              }}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            {searchQuery && (
              <button
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchQuery(""); setShowResults(false); }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <Button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="h-11 px-4 bg-primary hover:bg-primary/90 text-white"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleLocateMe}
            disabled={locating}
            className="h-11 px-3 border-primary/20 hover:bg-primary/5"
            title="Use my location"
          >
            {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4 text-primary" />}
          </Button>
        </div>

        {/* Dropdown results */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute z-[1000] top-full mt-1 w-full bg-white rounded-xl border border-border shadow-xl overflow-hidden">
            {searchResults.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => flyTo(r)}
                className="w-full text-left px-4 py-2.5 hover:bg-primary/5 flex items-start gap-2.5 border-b border-border/40 last:border-0 transition-colors"
              >
                <MapPin className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                <span className="text-sm text-foreground line-clamp-2">{r.display_name}</span>
              </button>
            ))}
          </div>
        )}
        {showResults && searchResults.length === 0 && !isSearching && (
          <div className="absolute z-[1000] top-full mt-1 w-full bg-white rounded-xl border border-border shadow-xl px-4 py-3 text-sm text-muted-foreground">
            No results found for "{searchQuery}". Try a different address or postcode.
          </div>
        )}
      </div>

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm" style={{ height: 400 }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Hint overlay — only before any pin is placed */}
        {mapReady && !selectedAddress && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-xs font-medium text-primary shadow-md pointer-events-none z-[500] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-accent" />
            Click anywhere on the map to pin your property
          </div>
        )}
      </div>

      {/* Selected location pill */}
      {selectedAddress && (
        <div className="flex items-start gap-2 bg-accent/8 border border-accent/20 rounded-lg px-3.5 py-2.5">
          <MapPin className="w-4 h-4 text-accent mt-0.5 shrink-0" />
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-wide text-accent/70 mb-0.5">Selected location</p>
            <p className="text-sm text-foreground leading-snug">{selectedAddress}</p>
          </div>
        </div>
      )}
    </div>
  );
}
