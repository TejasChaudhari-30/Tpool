"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RideStatusControlProps {
  rideId: string;
  status: "SCHEDULED" | "ACTIVE" | "COMPLETED" | "CANCELLED";
}

export default function RideStatusControl({ rideId, status }: RideStatusControlProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState("");

  const updateStatus = async (newStatus: "ACTIVE" | "COMPLETED" | "CANCELLED") => {
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/rides/${rideId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update ride status");
      }

      setShowConfirmModal(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to update status");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "SCHEDULED") {
    return (
      <div className="space-y-1">
        <Button
          size="sm"
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
          onClick={() => updateStatus("ACTIVE")}
          disabled={isLoading}
        >
          {isLoading ? "Starting..." : "▶ Start Ride"}
        </Button>
        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>
    );
  }

  if (status === "ACTIVE") {
    return (
      <div className="space-y-1">
        <Button
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
        >
          {isLoading ? "Ending..." : "✓ End Ride"}
        </Button>
        {error && <p className="text-[10px] text-destructive">{error}</p>}

        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 text-foreground animate-in fade-in duration-200">
            <div className="bg-background rounded-lg border shadow-xl max-w-sm w-full p-6 space-y-4 text-left relative z-[110]">
              <div className="space-y-1">
                <h3 className="text-lg font-bold">End this ride?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This will mark the ride as completed for all passengers.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  onClick={() => updateStatus("COMPLETED")}
                  disabled={isLoading}
                >
                  {isLoading ? "Ending..." : "End Ride"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}
