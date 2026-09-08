"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface PassengerWindowSyncProps {
  rideId: string;
  currentStatus: string;
}

export default function PassengerWindowSync({ rideId, currentStatus }: PassengerWindowSyncProps) {
  const router = useRouter();

  useEffect(() => {
    // Only poll while ride status is SCHEDULED or ACTIVE
    if (currentStatus === "COMPLETED" || currentStatus === "CANCELLED") {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const res = await fetch(`/api/rides/${rideId}/status`);
        if (res.ok) {
          const data = await res.json();
          if (data.status && data.status !== currentStatus) {
            router.refresh();
          }
        }
      } catch {
        // Silently ignore background network errors during polling
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, [rideId, currentStatus, router]);

  return null;
}
