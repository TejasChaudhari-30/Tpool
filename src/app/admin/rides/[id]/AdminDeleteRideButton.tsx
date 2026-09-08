"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminDeleteRideButton({ rideId }: { rideId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this ride? All associated bookings will be deleted.")) return;
    setIsLoading(true);
    try {
      await fetch(`/api/admin/rides/${rideId}`, { method: "DELETE" });
      router.push("/admin/rides");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isLoading}>
      {isLoading ? "Deleting..." : "Delete Ride"}
    </Button>
  );
}
