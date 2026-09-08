"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface SosButtonProps {
  rideId: string;
}

const getLocationCoordinates = async (): Promise<{ latitude: number | null; longitude: number | null }> => {
  if (typeof window === "undefined" || !("geolocation" in navigator)) {
    return { latitude: null, longitude: null };
  }

  return new Promise((resolve) => {
    let isSettled = false;

    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        console.warn("Could not obtain current location for SOS. Continuing without location.");
        resolve({ latitude: null, longitude: null });
      }
    }, 15000);

    try {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            });
          }
        },
        () => {
          if (!isSettled) {
            isSettled = true;
            clearTimeout(timer);
            console.warn("Could not obtain current location for SOS. Continuing without location.");
            resolve({ latitude: null, longitude: null });
          }
        },
        {
          enableHighAccuracy: false,
          timeout: 15000,
          maximumAge: 60000,
        }
      );
    } catch {
      if (!isSettled) {
        isSettled = true;
        clearTimeout(timer);
        console.warn("Could not obtain current location for SOS. Continuing without location.");
        resolve({ latitude: null, longitude: null });
      }
    }
  });
};

export default function SosButton({ rideId }: SosButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "warning" | "error"; text: string } | null>(null);

  const handleSendSos = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setStatusMessage(null);

    const { latitude, longitude } = await getLocationCoordinates();
    const locationUnavailable = (latitude === null || longitude === null);

    try {
      const res = await fetch("/api/emergency/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rideId, latitude, longitude }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to activate emergency SOS");
      }

      if (data.alertCreated && data.contactNotified) {
        let text = "🚨 Emergency SOS Activated! Your emergency contact has been notified.";
        if (data.locationUnavailable || locationUnavailable) {
          text += " (Current location could not be obtained)";
        }
        setStatusMessage({
          type: "success",
          text,
        });
      } else if (data.alertCreated && !data.contactNotified) {
        const errorDetail = data.notificationError ? `: ${data.notificationError}` : "";
        setStatusMessage({
          type: "warning",
          text: `🚨 SOS activated, but we could not notify your emergency contact${errorDetail}. Please contact emergency services or your contact directly.`,
        });
      } else {
        setStatusMessage({
          type: "success",
          text: "🚨 Emergency SOS Alert Created.",
        });
      }
      setIsOpen(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatusMessage({ type: "error", text: err.message });
      } else {
        setStatusMessage({ type: "error", text: "Failed to trigger SOS" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {statusMessage && (
        <div
          className={`p-4 rounded-lg font-medium text-sm border ${
            statusMessage.type === "success"
              ? "bg-red-50 dark:bg-red-950/60 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200"
              : statusMessage.type === "warning"
              ? "bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200"
              : "bg-destructive/15 text-destructive border-destructive/30"
          }`}
        >
          {statusMessage.text}
        </div>
      )}

      <Button
        variant="destructive"
        size="lg"
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-base shadow-md flex items-center justify-center gap-2"
        onClick={() => setIsOpen(true)}
      >
        🚨 SOS / Emergency
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-background rounded-lg border shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-destructive flex items-center gap-2">
                <span>🚨 Emergency Assistance</span>
              </h2>
              <p className="text-sm text-foreground leading-relaxed">
                Are you sure you want to send an SOS?
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your emergency contact will be notified about this emergency.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
                onClick={handleSendSos}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending SOS..." : "SEND SOS"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
