"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function DeleteRide({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ride? All bookings will be cancelled.")) return;
    setIsLoading(true);
    try {
      await fetch(`/api/rides/${rideId}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading} className="w-full mt-4">
      {isLoading ? "Deleting..." : "Delete Ride"}
    </Button>
  );
}
