"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function DriverRequestSync() {
  const router = useRouter();
  const lastStateRef = useRef<{ count: number; latestBookingTime: number } | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const checkNewRequests = async () => {
      if (isFetchingRef.current || !isMounted) return;
      isFetchingRef.current = true;

      try {
        const res = await fetch("/api/bookings", { cache: "no-store" });
        if (res.ok && isMounted) {
          const data = await res.json();
          if (lastStateRef.current !== null) {
            if (
              data.count !== lastStateRef.current.count ||
              data.latestBookingTime !== lastStateRef.current.latestBookingTime
            ) {
              router.refresh();
            }
          }
          lastStateRef.current = {
            count: data.count,
            latestBookingTime: data.latestBookingTime,
          };
        }
      } catch {
        // Silently catch network errors during polling
      } finally {
        isFetchingRef.current = false;
      }
    };

    // Initial check
    checkNewRequests();

    // Poll every 4 seconds for new incoming ride requests
    const intervalId = setInterval(checkNewRequests, 4000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [router]);

  return null;
}
