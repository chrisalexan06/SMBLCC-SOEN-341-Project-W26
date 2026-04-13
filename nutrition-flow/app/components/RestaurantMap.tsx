"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  APIProvider,
  Map,
  Marker,
  useMap,
} from "@vis.gl/react-google-maps";
import { MapPin, Navigation, Sparkles, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";

const DEFAULT_CENTER = { lat: 45.5017, lng: -73.5673 };

const SOFT_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
];

export type RecipeMapFocus = {
  name: string;
  dietaryTags: string[];
};

function normalizeDietHint(tag: string): string {
  if (!tag || tag === "NONE") return "";
  return tag.replace(/_/g, " ").toLowerCase();
}

export function buildPlacesSearchQuery(
  recipeFocus: RecipeMapFocus | null,
  userDietaryTypes: string[]
): string {
  const userHints = userDietaryTypes
    .filter((t) => t && t !== "NONE")
    .map(normalizeDietHint)
    .filter(Boolean)
    .join(" ");

  const recipeHints = (recipeFocus?.dietaryTags ?? [])
    .map(normalizeDietHint)
    .filter(Boolean)
    .join(" ");

  const hints = [userHints, recipeHints].filter(Boolean).join(" ");

  if (recipeFocus?.name?.trim()) {
    return `${recipeFocus.name.trim()} ${hints} restaurant`.replace(/\s+/g, " ").trim();
  }

  if (hints) {
    return `${hints} restaurant`.replace(/\s+/g, " ").trim();
  }

  return "healthy restaurants";
}

/** Plain shape for React state — avoids holding `PlaceResult` (accessing deprecated fields like `open_now` logs in dev). */
export type MapPlace = {
  key: string;
  placeId: string | null;
  name: string;
  lat: number;
  lng: number;
  vicinity?: string;
  rating?: number;
};

function mapPlaceFromResult(
  p: google.maps.places.PlaceResult,
  index: number
): MapPlace | null {
  const loc = p.geometry?.location;
  if (!loc) return null;
  return {
    key: p.place_id ?? `place-${index}`,
    placeId: p.place_id ?? null,
    name: p.name ?? "Unknown",
    lat: loc.lat(),
    lng: loc.lng(),
    vicinity: p.vicinity,
    rating: p.rating,
  };
}

function normalizePlaceResults(
  results: google.maps.places.PlaceResult[]
): MapPlace[] {
  return results
    .map((p, i) => mapPlaceFromResult(p, i))
    .filter((x): x is MapPlace => x != null)
    .slice(0, 12);
}

type MapSearchProps = {
  /** Location bias for Places search only (user geolocation), not map pan */
  searchBias: google.maps.LatLngLiteral;
  searchQuery: string;
  onResults: (places: MapPlace[]) => void;
  onSearching: (v: boolean) => void;
};

function PlacesSearchController({
  searchBias,
  searchQuery,
  onResults,
  onSearching,
}: MapSearchProps) {
  const map = useMap();

  useEffect(() => {
    if (!map || !searchQuery) {
      onResults([]);
      return;
    }

    onSearching(true);

    const service = new google.maps.places.PlacesService(map);

    const request: google.maps.places.TextSearchRequest = {
      query: searchQuery,
      location: searchBias,
      radius: 12000,
    };

    service.textSearch(request, (results, status) => {
      onSearching(false);
      if (
        status === google.maps.places.PlacesServiceStatus.OK &&
        results &&
        results.length > 0
      ) {
        onResults(normalizePlaceResults(results));
      } else {
        onResults([]);
      }
    });
  }, [map, searchBias.lat, searchBias.lng, searchQuery, onResults, onSearching]);

  return null;
}

type MarkersLayerProps = {
  places: MapPlace[];
  activeKey: string | null;
  onSelect: (place: MapPlace) => void;
};

function MarkersLayer({ places, activeKey, onSelect }: MarkersLayerProps) {
  return (
    <>
      {places.map((place) => (
        <Marker
          key={place.key}
          position={{ lat: place.lat, lng: place.lng }}
          title={place.name}
          onClick={() => onSelect(place)}
          opacity={activeKey === place.key ? 1 : 0.85}
        />
      ))}
    </>
  );
}

/** Imperative camera updates so the map stays user-draggable (controlled center/zoom breaks gestures). */
type CameraIntent = { lat: number; lng: number; zoom: number; id: number };

function CameraMover({ intent }: { intent: CameraIntent | null }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !intent) return;
    map.setCenter({ lat: intent.lat, lng: intent.lng });
    map.setZoom(intent.zoom);
  }, [map, intent?.id]);

  return null;
}

type NearbyRestaurantsMapProps = {
  recipeFocus: RecipeMapFocus | null;
  onClearRecipeFocusAction?: () => void;
};

export function NearbyRestaurantsMap({
  recipeFocus,
  onClearRecipeFocusAction,
}: NearbyRestaurantsMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

  /** Bias for Places API only — updated when geolocation resolves */
  const [searchBias, setSearchBias] =
    useState<google.maps.LatLngLiteral>(DEFAULT_CENTER);
  const [cameraIntent, setCameraIntent] = useState<CameraIntent | null>(null);
  const [userDietaryTypes, setUserDietaryTypes] = useState<string[]>([]);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [searching, setSearching] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"pending" | "ok" | "denied">(
    "pending"
  );
  const [activePlaceKey, setActivePlaceKey] = useState<string | null>(null);

  const searchQuery = useMemo(
    () => buildPlacesSearchQuery(recipeFocus, userDietaryTypes),
    [recipeFocus, userDietaryTypes]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/user/sync");
        if (!res.ok || cancelled) return;
        const data = await res.json();
        const types = data?.dietaryType;
        if (Array.isArray(types) && !cancelled) {
          setUserDietaryTypes(types);
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoStatus("denied");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setSearchBias(next);
        setCameraIntent({
          lat: next.lat,
          lng: next.lng,
          zoom: 14,
          id: Date.now(),
        });
        setGeoStatus("ok");
      },
      () => setGeoStatus("denied"),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60_000 }
    );
  }, []);

  const handleResults = useCallback((next: MapPlace[]) => {
    setPlaces(next);
    if (next.length > 0) setActivePlaceKey(next[0].key);
  }, []);

  const selectPlace = useCallback((place: MapPlace) => {
    setActivePlaceKey(place.key);
    setCameraIntent({
      lat: place.lat,
      lng: place.lng,
      zoom: 16,
      id: Date.now(),
    });
  }, []);

  const stableOnSearching = useCallback((v: boolean) => {
    setSearching(v);
  }, []);

  if (!apiKey) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/80 p-6 text-center"
        style={{ minHeight: 220 }}
      >
        <MapPin className="h-8 w-8 text-amber-700/70" />
        <p className="text-xs font-medium text-amber-900">
          Add{" "}
          <code className="rounded bg-white/80 px-1 py-0.5 text-[10px]">
            NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
          </code>{" "}
          to your environment.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {recipeFocus && (
        <div
          className="flex items-start justify-between gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: "var(--sage-green-light)",
            backgroundColor: "rgba(168, 181, 160, 0.12)",
          }}
        >
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
              Searching from recipe
            </p>
            <p className="truncate text-sm font-medium text-gray-800">
              {recipeFocus.name}
            </p>
          </div>
          {onClearRecipeFocusAction && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full"
              onClick={onClearRecipeFocusAction}
              aria-label="Clear recipe search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}

      <div className="relative w-full overflow-hidden rounded-2xl border border-gray-100 shadow-inner">
        <APIProvider
          apiKey={apiKey}
          libraries={["places"]}
          language="en"
          region="CA"
        >
          <Map
            defaultCenter={DEFAULT_CENTER}
            defaultZoom={13}
            gestureHandling="greedy"
            mapTypeControl={false}
            streetViewControl={false}
            zoomControl
            fullscreenControl
            styles={SOFT_MAP_STYLES}
            className="h-[min(42vh,300px)] w-full"
            colorScheme="LIGHT"
          >
            <CameraMover intent={cameraIntent} />
            <PlacesSearchController
              searchBias={searchBias}
              searchQuery={searchQuery}
              onResults={handleResults}
              onSearching={stableOnSearching}
            />
            <MarkersLayer
              places={places}
              activeKey={activePlaceKey}
              onSelect={selectPlace}
            />
          </Map>
        </APIProvider>

        {searching && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[1px]">
            <div
              className="rounded-full px-3 py-1.5 text-xs font-medium shadow-md"
              style={{
                backgroundColor: "var(--sage-green)",
                color: "white",
              }}
            >
              Finding places…
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <Navigation className="h-3 w-3" />
          {geoStatus === "ok" && "Using your location"}
          {geoStatus === "pending" && "Locating you…"}
          {geoStatus === "denied" && "Default: Montréal area — allow location for accuracy"}
        </span>
        <span className="flex items-center gap-1 text-[10px]">
          <Sparkles className="h-3 w-3" />
          {searchQuery.length > 48
            ? `${searchQuery.slice(0, 48)}…`
            : searchQuery}
        </span>
      </div>

      <ScrollArea className="h-[140px] rounded-xl border border-gray-100 bg-white/90 pr-2">
        <div className="space-y-1 p-1">
          {places.length === 0 && !searching && (
            <p className="px-2 py-6 text-center text-xs text-muted-foreground">
              No restaurants found for this search. Try another recipe or
              adjust your dietary preferences in Profile.
            </p>
          )}
          {places.map((place) => {
            const active = activePlaceKey === place.key;
            return (
              <button
                key={place.key}
                type="button"
                onClick={() => selectPlace(place)}
                className={`flex w-full flex-col gap-0.5 rounded-lg px-2 py-2 text-left transition-colors ${
                  active ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-medium text-gray-800">
                    {place.name}
                  </span>
                  {place.rating != null && (
                    <span
                      className="shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-semibold text-white"
                      style={{ backgroundColor: "var(--lilac-purple)" }}
                    >
                      {place.rating.toFixed(1)} ★
                    </span>
                  )}
                </div>
                {place.vicinity && (
                  <span className="line-clamp-2 text-[11px] text-muted-foreground">
                    {place.vicinity}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
