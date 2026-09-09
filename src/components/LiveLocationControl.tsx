"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { MapPin, Square } from "lucide-react";

interface LiveLocationControlProps {
  rideId: string;
  onLocationUpdate?: (location: { lat: number; lon: number } | null) => void;
}

export default function LiveLocationControl({ rideId, onLocationUpdate }: LiveLocationControlProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: "info" | "success" | "warning" | "error";
    text: string;
  } | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const lastSentTimeRef = useRef<number>(0);

  const stopSharing = useCallback(async () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setIsSharing(false);
    setStatusMessage({ type: "info", text: "Live location sharing stopped." });

    try {
      await fetch(`/api/rides/${rideId}/location`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSharing: false }),
      });
    } catch {
      // Ignore background network errors on stop
    }

    if (onLocationUpdate) {
      onLocationUpdate(null);
    }
  }, [rideId, onLocationUpdate]);

  const sendLocationUpdate = useCallback(
    async (lat: number, lon: number) => {
      // Validate coordinates strictly
      if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
        setStatusMessage({ type: "error", text: "Received invalid GPS coordinates." });
        return;
      }

      // Throttle to at most once per 3 seconds to avoid network saturation while keeping location live
      const now = Date.now();
      if (now - lastSentTimeRef.current < 3000) {
        return;
      }
      lastSentTimeRef.current = now;

      try {
        const res = await fetch(`/api/rides/${rideId}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ latitude: lat, longitude: lon, isSharing: true }),
        });

        if (res.ok) {
          const formattedTime = new Date().toLocaleTimeString(undefined, {
            hour: "numeric",
            minute: "2-digit",
            second: "2-digit",
          });
          setLastUpdated(formattedTime);
          setStatusMessage({
            type: "success",
            text: `📍 Sharing real live location (Updated ${formattedTime})`,
          });
          if (onLocationUpdate) {
            onLocationUpdate({ lat, lon });
          }
        } else {
          const data = await res.json();
          setStatusMessage({ type: "warning", text: data.message || "Failed to transmit live location." });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setStatusMessage({ type: "error", text: err.message });
        }
      }
    },
    [rideId, onLocationUpdate]
  );

  const startSharing = useCallback(() => {
    if (typeof window === "undefined" || !("geolocation" in navigator)) {
      setStatusMessage({ type: "error", text: "Geolocation is not supported by your browser." });
      return;
    }

    // Clean up existing watcher if any
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    setStatusMessage({ type: "info", text: "Requesting browser location permission..." });

    try {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          setIsSharing(true);
          const { latitude, longitude } = position.coords;
          sendLocationUpdate(latitude, longitude);
        },
        (error) => {
          if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
          }
          setIsSharing(false);

          switch (error.code) {
            case error.PERMISSION_DENIED:
              setStatusMessage({
                type: "error",
                text: "⚠️ Location permission denied. Please allow location access in your browser to share live location.",
              });
              break;
            case error.POSITION_UNAVAILABLE:
              setStatusMessage({ type: "error", text: "⚠️ Current location unavailable from GPS/device provider." });
              break;
            case error.TIMEOUT:
              setStatusMessage({ type: "warning", text: "⚠️ Location request timed out. Retrying..." });
              break;
            default:
              setStatusMessage({ type: "error", text: "⚠️ Unable to access current live location." });
              break;
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        }
      );

      watchIdRef.current = watchId;
    } catch {
      setStatusMessage({ type: "error", text: "Failed to initialize live location tracking." });
    }
  }, [sendLocationUpdate]);

  // Clean up watcher and server state on component unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
        fetch(`/api/rides/${rideId}/location`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isSharing: false }),
        }).catch(() => {});
      }
    };
  }, [rideId]);

  return (
    <div className="space-y-3">
      {statusMessage && (
        <div
          className={`p-3 rounded-lg text-xs font-medium border ${
            statusMessage.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200"
              : statusMessage.type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              : statusMessage.type === "info"
              ? "bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200"
              : "bg-destructive/10 border-destructive/20 text-destructive"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      {isSharing ? (
        <Button
          type="button"
          variant="outline"
          size="default"
          className="w-full border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold gap-2"
          onClick={stopSharing}
        >
          <Square className="h-4 w-4 fill-rose-600" />
          <span>Stop Live Location Sharing</span>
        </Button>
      ) : (
        <Button
          type="button"
          variant="default"
          size="default"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2 shadow-xs"
          onClick={startSharing}
        >
          <MapPin className="h-4 w-4 animate-bounce" />
          <span>📍 Share Live Location</span>
        </Button>
      )}

      {isSharing && lastUpdated && (
        <p className="text-[11px] text-muted-foreground text-center">
          Real-time GPS updates active • Last sent at {lastUpdated}
        </p>
      )}
    </div>
  );
}
