"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function CancelBooking({ bookingId, status }: { bookingId: string, status: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (status === "CANCELLED" || status === "REJECTED") return null;

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setIsLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "CANCEL" })
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleCancel} disabled={isLoading} className="w-full mt-4">
      {isLoading ? "Cancelling..." : "Cancel Booking"}
    </Button>
  );
}
