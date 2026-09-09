"use client";

import { useState, useCallback } from "react";
import RouteMap, { MapLocation } from "@/components/RouteMap";
import LiveLocationControl from "@/components/LiveLocationControl";
import LiveLocationSubscriber from "@/components/LiveLocationSubscriber";

interface ActiveRideLocationMapProps {
  rideId: string;
  origin: string | MapLocation;
  destination: string | MapLocation;
  passengerOrigin?: string | MapLocation;
  passengerDestination?: string | MapLocation;
  isActive: boolean;
  canShareLiveLocation: boolean;
}

export default function ActiveRideLocationMap({
  rideId,
  origin,
  destination,
  passengerOrigin,
  passengerDestination,
  isActive,
  canShareLiveLocation,
}: ActiveRideLocationMapProps) {
  const [liveLocation, setLiveLocation] = useState<{ lat: number; lon: number } | null>(null);

  const handleLocationReceived = useCallback((loc: { lat: number; lon: number } | null) => {
    setLiveLocation(loc);
  }, []);

  return (
    <div className="space-y-4">
      {isActive && (
        <LiveLocationSubscriber
          rideId={rideId}
          isActive={isActive}
          onLocationReceived={handleLocationReceived}
        />
      )}

      {isActive && canShareLiveLocation && (
        <div className="bg-card border rounded-xl p-4 shadow-xs">
          <LiveLocationControl
            rideId={rideId}
            onLocationUpdate={handleLocationReceived}
          />
        </div>
      )}

      <div className="rounded-lg overflow-hidden border">
        <div className="p-3 border-b bg-card flex justify-between items-center">
          <h3 className="font-semibold text-sm">Route &amp; Live Location Map</h3>
          {isActive && liveLocation && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              Live GPS Active
            </span>
          )}
        </div>
        <div className="p-3 bg-muted/30 h-64 sm:h-72">
          <RouteMap
            origin={origin}
            destination={destination}
            passengerOrigin={passengerOrigin}
            passengerDestination={passengerDestination}
            liveLocation={liveLocation}
          />
        </div>
      </div>
    </div>
  );
}
