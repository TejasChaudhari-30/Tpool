"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, MapPin } from "lucide-react";
import { LocationInput, LocationSuggestion } from "@/components/LocationInput";
import RouteMap from "@/components/RouteMap";

export default function HomeHeroClient() {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [originLoc, setOriginLoc] = useState<LocationSuggestion | null>(null);
  const [destLoc, setDestLoc] = useState<LocationSuggestion | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin.trim() || !destination.trim()) return;

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

  const handleOriginChange = (val: string) => {
    setOrigin(val);
    setOriginLoc(null);
  };

  const handleDestChange = (val: string) => {
    setDestination(val);
    setDestLoc(null);
  };

  const handleOriginSelect = (loc: LocationSuggestion) => {
    setOrigin(loc.name);
    setOriginLoc(loc);
  };

  const handleDestSelect = (loc: LocationSuggestion) => {
    setDestination(loc.name);
    setDestLoc(loc);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
      {/* LEFT COLUMN: HERO TEXT & FIND A RIDE CARD */}
      <div className="lg:col-span-6 space-y-4 sm:space-y-5 text-left flex flex-col justify-between">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span>🌱 Students • Shared Rides • Cleaner Tomorrow</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold tracking-tight text-foreground leading-[1.15]">
            Ride Together.
            <span className="text-emerald-600 dark:text-emerald-400 block mt-0.5">Go Further.</span>
          </h1>

          <p className="text-sm sm:text-base text-muted-foreground max-w-md leading-relaxed">
            Find shared rides, save money, and reduce your carbon footprint.
          </p>
        </div>

        {/* FIND A RIDE CARD */}
        <Card className="p-4 sm:p-5 rounded-2xl shadow-xs border bg-card space-y-3">
          <h2 className="text-base font-bold text-foreground">Find a Ride</h2>
          
          <form onSubmit={handleSearch} className="space-y-2.5">
            <div className="relative">
              <div className="absolute left-3 top-3 z-10 text-emerald-600">
                <MapPin className="h-4 w-4" />
              </div>
              <LocationInput
                placeholder="Source"
                value={origin}
                onChange={handleOriginChange}
                onSelect={handleOriginSelect}
                className="pl-9 h-10 text-sm bg-background rounded-xl border-input"
              />
            </div>

            <div className="relative">
              <div className="absolute left-3 top-3 z-10 text-rose-500">
                <MapPin className="h-4 w-4" />
              </div>
              <LocationInput
                placeholder="Destination"
                value={destination}
                onChange={handleDestChange}
                onSelect={handleDestSelect}
                className="pl-9 h-10 text-sm bg-background rounded-xl border-input"
              />
            </div>

            <Button 
              type="submit" 
              size="default" 
              className="w-full h-10 font-semibold text-sm rounded-xl gap-2 shadow-xs bg-[#0a192f] hover:bg-[#0f2748] text-white dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90 mt-1"
            >
              <Search className="w-4 h-4" />
              <span>Search Rides</span>
            </Button>
          </form>
        </Card>
      </div>

      {/* RIGHT COLUMN: REAL INTERACTIVE MAP */}
      <div className="lg:col-span-6 w-full flex">
        <div className="rounded-2xl overflow-hidden border shadow-xs bg-muted/20 w-full min-h-[300px] h-[320px] sm:h-[360px] lg:h-[385px] relative">
          <RouteMap 
            origin={originLoc ?? (origin.trim() || "Pune")} 
            destination={destLoc ?? (destination.trim() || "Talegaon")} 
          />
        </div>
      </div>
    </div>
  );
}
