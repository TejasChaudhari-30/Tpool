"use client";

import { useEffect, useRef } from "react";

interface LiveLocationSubscriberProps {
  rideId: string;
  isActive: boolean;
  onLocationReceived: (location: { lat: number; lon: number } | null) => void;
}

export default function LiveLocationSubscriber({
  rideId,
  isActive,
  onLocationReceived,
}: LiveLocationSubscriberProps) {
  const onLocationReceivedRef = useRef(onLocationReceived);
  onLocationReceivedRef.current = onLocationReceived;

  useEffect(() => {
    if (!isActive) {
      onLocationReceivedRef.current(null);
      return;
    }

    let isMounted = true;

    const fetchLiveLocation = async () => {
      try {
        const res = await fetch(`/api/rides/${rideId}/location`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (
            data.isLiveSharing &&
            data.currentLat !== null &&
            data.currentLon !== null &&
            !isNaN(data.currentLat) &&
            !isNaN(data.currentLon)
          ) {
            onLocationReceivedRef.current({ lat: data.currentLat, lon: data.currentLon });
          } else {
            onLocationReceivedRef.current(null);
          }
        }
      } catch {
        // Silently ignore background polling errors
      }
    };

    // Immediate initial fetch
    fetchLiveLocation();

    // Poll every 3 seconds for real-time recipient map updates
    const intervalId = setInterval(fetchLiveLocation, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [rideId, isActive]);

  return null;
}
