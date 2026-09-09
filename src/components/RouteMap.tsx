"use client";

import dynamic from "next/dynamic";
import type { RouteInfo, MapLocation } from "./RouteMapClient";

const RouteMapClient = dynamic(() => import("./RouteMapClient"), {
  ssr: false,
  loading: () => <div className="h-full min-h-[256px] w-full bg-muted flex items-center justify-center text-sm text-muted-foreground rounded-lg border">Loading map...</div>
});

export type { RouteInfo, MapLocation };

interface RouteMapProps {
  origin: string | MapLocation;
  destination: string | MapLocation;
  passengerOrigin?: string | MapLocation;
  passengerDestination?: string | MapLocation;
  liveLocation?: { lat: number; lon: number } | null;
  onRouteCalculated?: (info: RouteInfo | null) => void;
}

export default function RouteMap({ 
  origin, 
  destination, 
  passengerOrigin,
  passengerDestination,
  liveLocation,
  onRouteCalculated 
}: RouteMapProps) {
  return (
    <RouteMapClient 
      origin={origin} 
      destination={destination} 
      passengerOrigin={passengerOrigin}
      passengerDestination={passengerDestination}
      liveLocation={liveLocation}
      onRouteCalculated={onRouteCalculated} 
    />
  );
}
