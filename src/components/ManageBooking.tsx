"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export default function ManageBooking({ bookingId, status }: { bookingId: string, status: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (status !== "PENDING") return null;

  const handleAction = async (action: "CONFIRM" | "REJECT") => {
    setIsLoading(true);
    try {
      await fetch(`/api/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex gap-2">
      <Button size="icon" variant="outline" className="h-6 w-6 text-green-600" onClick={() => handleAction("CONFIRM")} disabled={isLoading}>
        <Check className="h-3 w-3" />
      </Button>
      <Button size="icon" variant="outline" className="h-6 w-6 text-red-600" onClick={() => handleAction("REJECT")} disabled={isLoading}>
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
