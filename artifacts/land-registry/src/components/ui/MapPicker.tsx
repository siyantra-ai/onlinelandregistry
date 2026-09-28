import { useEffect, useRef, useState } from "react";
import { Search, MapPin, LocateFixed, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import GoogleAddressInput, { type GoogleAddressSelection } from "@/components/ui/GoogleAddressInput";
import { loadGoogleMaps } from "@/lib/google-maps";

interface GoogleGeocodeResult {
  formatted_address: string;
  geometry: {
    location: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  initialLat?: number | null;
  initialLng?: number | null;
  initialAddress?: string;
}

export default function MapPicker({
  onLocationSelect,
  initialLat,
  initialLng,
  initialAddress = "",
}: MapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapsRef = useRef<any>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onLocationSelectRef = useRef(onLocationSelect);
  onLocationSelectRef.current = onLocationSelect;
  const [searchQuery, setSearchQuery] = useState(initialAddress);
  const [searchResults, setSearchResults] = useState<GoogleGeocodeResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);
  const [showResults, setShowResults] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState("");
  const [locating, setLocating] = useState(false);

  const reverseGeocode = async (lat: number, lng: number): Promise<string> => {
    try {
      const google = googleMapsRef.current ?? await loadGoogleMaps();
      const { results } = await new google.maps.Geocoder().geocode({ location: { lat, lng } });
      return results[0]?.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  };

  const placeMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !googleMapsRef.current) return;

    const position = { lat, lng };
    if (markerRef.current) {
      markerRef.current.setPosition(position);
      return;
    }

    markerRef.current = new googleMapsRef.current.maps.Marker({
      position,
      map: mapInstanceRef.current,
      draggable: true,
    });
    markerRef.current.addListener("dragend", async () => {
      const draggedPosition = markerRef.current.getPosition();
      if (!draggedPosition) return;
      const nextLat = draggedPosition.lat();
      const nextLng = draggedPosition.lng();
      const address = await reverseGeocode(nextLat, nextLng);
      setSelectedAddress(address);
      setSearchQuery(address);
      onLocationSelectRef.current(nextLat, nextLng, address);
    });
  };

  useEffect(() => {
    let cancelled = false;

    loadGoogleMaps().then((google) => {
      if (cancelled || !mapRef.current) return;

      googleMapsRef.current = google;
      const hasInitialLocation = initialLat != null && initialLng != null;
      const map = new google.maps.Map(mapRef.current, {
        center: {
          lat: hasInitialLocation ? initialLat : 51.505,
          lng: hasInitialLocation ? initialLng : -0.09,
        },
        zoom: hasInitialLocation ? 15 : 6,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });

      mapInstanceRef.current = map;
      if (hasInitialLocation) placeMarker(initialLat!, initialLng!);

      map.addListener("click", async (event: any) => {
        if (!event.latLng) return;
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        placeMarker(lat, lng);
        const address = await reverseGeocode(lat, lng);
        setSelectedAddress(address);
        setSearchQuery(address);
        onLocationSelectRef.current(lat, lng, address);
      });

      setMapReady(true);
    }).catch((error: Error) => {
      if (!cancelled) setMapError(error.message);
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current && googleMapsRef.current) {
        googleMapsRef.current.maps.event.clearInstanceListeners(mapInstanceRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      mapInstanceRef.current = null;
    };
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowResults(false);
    try {
      const google = googleMapsRef.current ?? await loadGoogleMaps();
      const { results } = await new google.maps.Geocoder().geocode({
        address: searchQuery,
        componentRestrictions: { country: "GB" },
      });
      setSearchResults(results.slice(0, 6));
      setShowResults(true);
    } catch {
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const flyTo = (result: GoogleGeocodeResult) => {
    const lat = result.geometry.location.lat();
    const lng = result.geometry.location.lng();
    setShowResults(false);
    setSearchQuery(result.formatted_address);
    setSelectedAddress(result.formatted_address);

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat, lng });
      mapInstanceRef.current.setZoom(17);
      placeMarker(lat, lng);
    }

    onLocationSelectRef.current(lat, lng, result.formatted_address);
  };

  const handlePlaceSelect = (selection: GoogleAddressSelection) => {
    const { formattedAddress, lat, lng } = selection;
    setSearchQuery(formattedAddress);
    setSelectedAddress(formattedAddress);
    setShowResults(false);
    if (lat != null && lng != null) {
      mapInstanceRef.current?.panTo({ lat, lng });
      mapInstanceRef.current?.setZoom(17);
      placeMarker(lat, lng);
      onLocationSelectRef.current(lat, lng, formattedAddress);
    }
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(17);
          placeMarker(lat, lng);
        }
        const addr = await reverseGeocode(lat, lng);
        setSelectedAddress(addr);
        setSearchQuery(addr);
        onLocationSelectRef.current(lat, lng, addr);
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
          <GoogleAddressInput
            className="flex-1"
            inputClassName="pl-9 h-11 pr-8"
            placeholder="Search an address or postcode in Great Britain…"
            value={searchQuery}
            onChange={(value) => {
              setSearchQuery(value);
              if (!value) setShowResults(false);
            }}
            onSelect={handlePlaceSelect}
            onEnter={handleSearch}
            leading={<Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />}
            trailing={searchQuery ? (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => { setSearchQuery(""); setShowResults(false); }}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : null}
          />
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
                <span className="text-sm text-foreground line-clamp-2">{r.formatted_address}</span>
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
      <div className="relative rounded-xl overflow-hidden border border-border/60 shadow-sm" style={{ height: "min(400px, 60vw)" }}>
        <div ref={mapRef} className="w-full h-full" />

        {mapError && (
          <div role="alert" className="absolute inset-0 flex items-center justify-center bg-slate-50 px-6 text-center text-sm text-muted-foreground">
            {mapError}
          </div>
        )}

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
