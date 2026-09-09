"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet marker icons in Next.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface Location {
  lat: number;
  lon: number;
  name: string;
}

export interface RouteInfo {
  distance: number; // in meters
  duration: number; // in seconds
}

export interface MapLocation {
  name: string;
  lat?: number;
  lon?: number;
}

export interface RouteMapClientProps {
  origin: string | MapLocation;
  destination: string | MapLocation;
  passengerOrigin?: string | MapLocation;
  passengerDestination?: string | MapLocation;
  liveLocation?: { lat: number; lon: number } | null;
  onRouteCalculated?: (info: RouteInfo | null) => void;
}

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const goldIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to auto-fit map bounds
function FitBounds({ start, end, routePositions }: { start: Location; end: Location; routePositions: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    map.invalidateSize();
    if (routePositions.length > 0) {
      map.fitBounds(routePositions, { padding: [50, 50] });
    } else {
      const bounds = L.latLngBounds([[start.lat, start.lon], [end.lat, end.lon]]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, start, end, routePositions]);
  return null;
}

// Polyline decoder for Valhalla (Precision 6)
function decodePolyline6(str: string): [number, number][] {
  let index = 0, lat = 0, lng = 0;
  const coordinates: [number, number][] = [];
  const factor = 1e6;
  while (index < str.length) {
    let byte, shift = 0, result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    const latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    shift = result = 0;
    do { byte = str.charCodeAt(index++) - 63; result |= (byte & 0x1f) << shift; shift += 5; } while (byte >= 0x20);
    const longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
    lat += latitude_change; lng += longitude_change;
    coordinates.push([lat / factor, lng / factor]);
  }
  return coordinates;
}

export default function RouteMapClient({ 
  origin, 
  destination, 
  passengerOrigin,
  passengerDestination,
  liveLocation,
  onRouteCalculated 
}: RouteMapClientProps) {
  const [startLoc, setStartLoc] = useState<Location | null>(null);
  const [endLoc, setEndLoc] = useState<Location | null>(null);
  const [passStartLoc, setPassStartLoc] = useState<Location | null>(null);
  const [passEndLoc, setPassEndLoc] = useState<Location | null>(null);
  const [routePositions, setRoutePositions] = useState<[number, number][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    const resolveLocation = async (locInput: string | MapLocation): Promise<Location | null> => {
      if (typeof locInput === "object" && locInput.lat !== undefined && locInput.lon !== undefined) {
        return { name: locInput.name, lat: locInput.lat, lon: locInput.lon };
      }
      
      const query = typeof locInput === "string" ? locInput : locInput.name;
      if (!query || query.length < 3) return null;
      
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&email=contact@tpool.com`);
        const data = await res.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon), name: query };
        }
        return null;
      } catch { return null; }
    };

    const fetchRoute = async (s: Location, e: Location) => {
      try {
        const payloadFastest = {
          locations: [{ lat: s.lat, lon: s.lon }, { lat: e.lat, lon: e.lon }],
          costing: "auto",
          costing_options: { auto: { shortest: false } }
        };
        const payloadShortest = {
          locations: [{ lat: s.lat, lon: s.lon }, { lat: e.lat, lon: e.lon }],
          costing: "auto",
          costing_options: { auto: { shortest: true } }
        };

        const [resFastest, resShortest] = await Promise.all([
          fetch("https://valhalla1.openstreetmap.de/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadFastest) }),
          fetch("https://valhalla1.openstreetmap.de/route", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payloadShortest) })
        ]);

        const dataFastest = await resFastest.json();
        const dataShortest = await resShortest.json();

        if (dataFastest.trip && dataShortest.trip) {
          const routeFastest = {
            name: "Route 0 (Fastest Profile)",
            distance: dataFastest.trip.summary.length * 1000, 
            duration: dataFastest.trip.summary.time,
            shape: dataFastest.trip.legs[0].shape
          };
          
          const routeShortest = {
            name: "Route 1 (Shortest Profile)",
            distance: dataShortest.trip.summary.length * 1000,
            duration: dataShortest.trip.summary.time,
            shape: dataShortest.trip.legs[0].shape
          };

          const validRoutes = [routeFastest, routeShortest];
          
          console.log("\n==================================================");
          console.log("ROUTING DEBUG\n");
          console.log("Start:");
          console.log(`${s.name} => ${s.lat}, ${s.lon}\n`);
          console.log("Destination:");
          console.log(`${e.name} => ${e.lat}, ${e.lon}\n`);
          console.log("Routing Provider: Valhalla (valhalla1.openstreetmap.de)\n");
          console.log("Routes returned:");
          validRoutes.forEach((r, idx) => {
            console.log(`Route ${idx}: ${(r.distance / 1000).toFixed(2)} km -> ${(r.duration / 60).toFixed(1)} min`);
          });

          const sortedRoutes = validRoutes.sort((a, b) => a.distance - b.distance);
          const selectedRoute = sortedRoutes[0];

          console.log("\nSelected route:");
          console.log(selectedRoute.name);
          console.log("Selected distance:");
          console.log(`${(selectedRoute.distance / 1000).toFixed(2)} km`);
          console.log("Selected duration:");
          console.log(`${(selectedRoute.duration / 60).toFixed(1)} min`);
          console.log("==================================================\n");

          const positions = decodePolyline6(selectedRoute.shape);

          if (isMounted) {
            setRoutePositions(positions);
            if (onRouteCalculated) {
              onRouteCalculated({ 
                distance: selectedRoute.distance, 
                duration: selectedRoute.duration 
              });
            }
          }
        } else {
          if (isMounted && onRouteCalculated) onRouteCalculated(null);
        }
      } catch {
        if (isMounted && onRouteCalculated) onRouteCalculated(null);
      }
    };

    const fetchData = async () => {
      if (!origin || !destination) {
        setIsLoading(false);
        setError(true);
        if (onRouteCalculated) onRouteCalculated(null);
        return;
      }

      setIsLoading(true);
      setError(false);
      setRoutePositions([]);

      try {
        const [s, e, ps, pe] = await Promise.all([
          resolveLocation(origin), 
          resolveLocation(destination),
          passengerOrigin ? resolveLocation(passengerOrigin) : Promise.resolve(null),
          passengerDestination ? resolveLocation(passengerDestination) : Promise.resolve(null)
        ]);
        if (!isMounted) return;
        
        if (s && e) {
          setStartLoc(s);
          setEndLoc(e);
          if (ps) setPassStartLoc(ps);
          if (pe) setPassEndLoc(pe);
          await fetchRoute(s, e);
        } else {
          setError(true);
          if (onRouteCalculated) onRouteCalculated(null);
        }
      } catch {
        if (isMounted) {
          setError(true);
          if (onRouteCalculated) onRouteCalculated(null);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    const timeoutId = setTimeout(fetchData, 800);

    return () => { 
      isMounted = false; 
      clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [origin, destination, passengerOrigin, passengerDestination]);

  if (isLoading) {
    return <div className="h-full min-h-[256px] w-full bg-muted flex items-center justify-center text-sm text-muted-foreground rounded-lg border">Loading map & route data...</div>;
  }

  const originName = typeof origin === "string" ? origin : origin?.name;
  const destName = typeof destination === "string" ? destination : destination?.name;

  if (error || !startLoc || !endLoc) {
    return <div className="h-full min-h-[256px] w-full bg-muted flex flex-col items-center justify-center text-sm text-muted-foreground rounded-lg border">
      <p>Map view unavailable for this route.</p>
      {originName && destName && (
        <p className="text-xs opacity-70">Could not find exact coordinates for &quot;{originName}&quot; or &quot;{destName}&quot;.</p>
      )}
    </div>;
  }

  return (
    <div className="h-full w-full rounded-lg overflow-hidden border relative z-0 isolate">
      <MapContainer 
        center={[(startLoc.lat + endLoc.lat) / 2, (startLoc.lon + endLoc.lon) / 2]} 
        zoom={13} 
        scrollWheelZoom={false} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {routePositions.length > 0 && (
          <Polyline positions={routePositions} pathOptions={{ color: '#3b82f6', weight: 4, opacity: 0.8 }} />
        )}

        <Marker position={[startLoc.lat, startLoc.lon]}>
          <Popup>Driver Start: {startLoc.name}</Popup>
        </Marker>
        
        <Marker position={[endLoc.lat, endLoc.lon]}>
          <Popup>Driver End: {endLoc.name}</Popup>
        </Marker>
        
        {passStartLoc && (
          <Marker position={[passStartLoc.lat, passStartLoc.lon]} icon={greenIcon}>
            <Popup>Your Pickup: {passStartLoc.name}</Popup>
          </Marker>
        )}
        
        {passEndLoc && (
          <Marker position={[passEndLoc.lat, passEndLoc.lon]} icon={redIcon}>
            <Popup>Your Destination: {passEndLoc.name}</Popup>
          </Marker>
        )}

        {liveLocation && !isNaN(liveLocation.lat) && !isNaN(liveLocation.lon) && (
          <Marker position={[liveLocation.lat, liveLocation.lon]} icon={goldIcon}>
            <Popup>📍 Live Shared Position</Popup>
          </Marker>
        )}

        <FitBounds start={startLoc} end={endLoc} routePositions={routePositions} />
      </MapContainer>
    </div>
  );
}
