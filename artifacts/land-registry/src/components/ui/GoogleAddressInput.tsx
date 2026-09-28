import { useEffect, useRef, useState, type ReactNode } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { loadGoogleMaps } from "@/lib/google-maps";

interface GoogleAddressComponent {
  longText: string;
  shortText: string;
  types: string[];
}

export interface GoogleAddressSelection {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  addressComponents: GoogleAddressComponent[];
}

interface GoogleAddressInputProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (selection: GoogleAddressSelection) => void;
  placeholder: string;
  className?: string;
  inputClassName?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onEnter?: () => void;
}

export default function GoogleAddressInput({
  value,
  onChange,
  onSelect,
  placeholder,
  className = "",
  inputClassName = "",
  leading,
  trailing,
  onEnter,
}: GoogleAddressInputProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const sessionTokenRef = useRef<any>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    const input = value.trim();
    if (input.length < 3) {
      setSuggestions([]);
      setError("");
      setIsLoading(false);
      sessionTokenRef.current = null;
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      setError("");
      try {
        const google = await loadGoogleMaps();
        const { AutocompleteSessionToken, AutocompleteSuggestion } = await google.maps.importLibrary("places");
        if (!sessionTokenRef.current) {
          sessionTokenRef.current = new AutocompleteSessionToken();
        }
        const { suggestions: matches = [] } = await AutocompleteSuggestion.fetchAutocompleteSuggestions({
          input,
          includedRegionCodes: ["gb"],
          language: "en-GB",
          region: "GB",
          sessionToken: sessionTokenRef.current,
        });
        if (!cancelled) {
          setSuggestions(matches.filter((match: any) => match.placePrediction));
          setActiveIndex(0);
        }
      } catch (suggestionError) {
        if (!cancelled) {
          setSuggestions([]);
          setError(suggestionError instanceof Error && suggestionError.message.includes("Google Maps")
            ? suggestionError.message
            : "Google address suggestions are unavailable. Enable Places API (New), billing, and this site's HTTP referrer for the API key.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [value]);

  const selectSuggestion = async (suggestion: any) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;

    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ["formattedAddress", "location", "addressComponents"] });
      const formattedAddress = place.formattedAddress || prediction.text.toString();
      const selection: GoogleAddressSelection = {
        formattedAddress,
        lat: place.location?.lat() ?? null,
        lng: place.location?.lng() ?? null,
        addressComponents: place.addressComponents || [],
      };

      sessionTokenRef.current = null;
      setSuggestions([]);
      setError("");
      onChange(formattedAddress);
      onSelectRef.current(selection);
    } catch (selectionError) {
      setError(selectionError instanceof Error ? selectionError.message : "Could not load the selected address.");
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % suggestions.length);
    } else if (event.key === "ArrowUp" && suggestions.length > 0) {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + suggestions.length) % suggestions.length);
    } else if (event.key === "Enter") {
      if (suggestions[activeIndex]) {
        event.preventDefault();
        void selectSuggestion(suggestions[activeIndex]);
      } else {
        onEnter?.();
      }
    } else if (event.key === "Escape") {
      setSuggestions([]);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {leading}
      <Input
        className={inputClassName}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
      />
      {trailing}

      {(suggestions.length > 0 || isLoading || error) && (
        <div className="absolute left-0 right-0 top-full z-[1000] mt-1 overflow-hidden rounded-lg border border-border bg-white shadow-xl">
          {suggestions.map((suggestion, index) => {
            const prediction = suggestion.placePrediction;
            return (
              <button
                key={prediction.placeId || index}
                type="button"
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => void selectSuggestion(suggestion)}
                className={`flex w-full items-start gap-2.5 border-b border-border/40 px-4 py-2.5 text-left last:border-0 ${index === activeIndex ? "bg-primary/5" : "hover:bg-primary/5"}`}
              >
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                <span className="text-sm text-foreground">{prediction.text.toString()}</span>
              </button>
            );
          })}
          {isLoading && suggestions.length === 0 && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Searching addresses
            </div>
          )}
          {error && suggestions.length === 0 && !isLoading && (
            <div role="status" className="px-4 py-3 text-sm text-muted-foreground">{error}</div>
          )}
        </div>
      )}
    </div>
  );
}