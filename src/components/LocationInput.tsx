"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, MapPin } from "lucide-react";

export interface LocationSuggestion {
  name: string;
  lat: number;
  lon: number;
}

interface PhotonFeature {
  properties: {
    name?: string;
    city?: string;
    state?: string;
    country?: string;
    street?: string;
    osm_id: number;
  };
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
}

interface LocationInputProps {
  id?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSelect?: (loc: LocationSuggestion) => void;
  required?: boolean;
  className?: string;
}

export function LocationInput({
  id,
  placeholder,
  value,
  onChange,
  onSelect,
  required,
  className,
}: LocationInputProps) {
  const [suggestions, setSuggestions] = useState<PhotonFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [lastFetchedQuery, setLastFetchedQuery] = useState("");
  
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isSelecting = useRef(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // If the user selected an item, the parent updates the value prop.
    // We catch that update here, skip fetching, and reset the flag.
    if (isSelecting.current) {
      isSelecting.current = false;
      return;
    }
    
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setHasError(false);
      setIsLoading(false);
      setLastFetchedQuery(value);
      return;
    }

    const fetchSuggestions = async () => {
      setIsLoading(true);
      setHasError(false);
      try {
        // Location biasing for IIIT Pune / Talegaon area (approx lat 18.72, lon 73.68)
        const res = await fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(value)}&lat=18.72&lon=73.68&limit=5`);
        const data = await res.json();
        
        if (isMounted) {
          setSuggestions(data.features || []);
          setLastFetchedQuery(value);
          setIsOpen(true);
        }
      } catch (err) {
        console.error("Failed to fetch location suggestions", err);
        if (isMounted) {
          setSuggestions([]);
          setHasError(true);
          setLastFetchedQuery(value);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300); // 300ms is perfectly responsive

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
    };
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value); 
  };

  const formatPlaceName = (f: PhotonFeature) => {
    const p = f.properties;
    // Use just "Name, City" to keep names short and readable
    const parts = [p.name, p.city].filter(Boolean);
    if (parts.length === 0) {
      // fallback: use street or state
      const fallback = [p.street, p.state, p.country].filter(Boolean);
      return fallback.slice(0, 2).join(", ");
    }
    return Array.from(new Set(parts)).join(", ");
  };

  const handleSelect = (feature: PhotonFeature) => {
    isSelecting.current = true;
    const displayName = formatPlaceName(feature);
    
    onChange(displayName);
    
    if (onSelect) {
      onSelect({
        name: displayName,
        lat: feature.geometry.coordinates[1], // Photon is [lon, lat]
        lon: feature.geometry.coordinates[0],
      });
    }
    
    setIsOpen(false);
  };

  // Only show "No places found" if we have actually fetched for the CURRENT value and found nothing.
  const isSync = lastFetchedQuery === value;
  const showNoResults = isOpen && value.trim().length >= 2 && !isLoading && isSync && suggestions.length === 0;

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          if (suggestions.length > 0) setIsOpen(true);
        }}
        required={required}
        autoComplete="off"
      />
      
      {isLoading && (
        <div className="absolute right-3 top-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Show suggestions if we have any, regardless of whether we're currently syncing a new keystroke (stale-while-revalidate) */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-y-auto">
          <ul className="py-1">
            {suggestions.map((s, idx) => (
              <li
                key={`${s.properties.osm_id}-${idx}`}
                onClick={() => handleSelect(s)}
                className="px-4 py-2 hover:bg-muted cursor-pointer text-sm flex items-start gap-2"
              >
                <MapPin className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                <span className="line-clamp-2">{formatPlaceName(s)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show No Results ONLY when fully synced and not loading */}
      {showNoResults && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md">
          <div className="px-4 py-3 text-sm text-muted-foreground text-center">
            {hasError ? "Search failed. Please try again." : "No places found."}
          </div>
        </div>
      )}
    </div>
  );
}
