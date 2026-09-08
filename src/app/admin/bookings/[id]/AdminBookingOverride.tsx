"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminBookingOverride({ bookingId, currentStatus }: { bookingId: string; currentStatus: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (status: string) => {
    setIsLoading(true);
    try {
      await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <span className="text-xs font-semibold text-muted-foreground block">Override Booking Status</span>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={currentStatus === "CONFIRMED" ? "default" : "outline"}
          disabled={isLoading}
          onClick={() => handleUpdate("CONFIRMED")}
        >
          Set CONFIRMED
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "PENDING" ? "default" : "outline"}
          disabled={isLoading}
          onClick={() => handleUpdate("PENDING")}
        >
          Set PENDING
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "REJECTED" ? "default" : "outline"}
          disabled={isLoading}
          onClick={() => handleUpdate("REJECTED")}
        >
          Set REJECTED
        </Button>
        <Button
          size="sm"
          variant={currentStatus === "CANCELLED" ? "default" : "outline"}
          disabled={isLoading}
          onClick={() => handleUpdate("CANCELLED")}
        >
          Set CANCELLED
        </Button>
      </div>
    </div>
  );
}
