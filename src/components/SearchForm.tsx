"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { LocationInput, LocationSuggestion } from "@/components/LocationInput";

export default function SearchForm() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originLoc, setOriginLoc] = useState<LocationSuggestion | null>(null);
  const [destLoc, setDestLoc] = useState<LocationSuggestion | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    const params = new URLSearchParams({ origin: origin.trim(), destination: destination.trim() });
    if (originLoc) {
      params.set("originLat", originLoc.lat.toString());
      params.set("originLon", originLoc.lon.toString());
    }
    if (destLoc) {
      params.set("destLat", destLoc.lat.toString());
      params.set("destLon", destLoc.lon.toString());
    }
    router.push(`/search?${params.toString()}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
      <div className="flex-1">
        <LocationInput
          placeholder="Leaving from (e.g. IIIT Pune)"
          value={origin}
          onChange={(val) => { setOrigin(val); setOriginLoc(null); }}
          onSelect={(loc) => { setOrigin(loc.name); setOriginLoc(loc); }}
          className="w-full"
        />
      </div>
      <div className="flex-1">
        <LocationInput
          placeholder="Going to (e.g. Talegaon Station)"
          value={destination}
          onChange={(val) => { setDestination(val); setDestLoc(null); }}
          onSelect={(loc) => { setDestination(loc.name); setDestLoc(loc); }}
          className="w-full"
        />
      </div>
      <Button type="submit" size="lg" className="w-full md:w-auto">
        <Search className="w-4 h-4 mr-2" />
        Search
      </Button>
    </form>
  );
}
