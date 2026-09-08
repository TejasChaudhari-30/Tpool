"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function AdminReportActions({ reportId }: { reportId: string }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (status: "RESOLVED" | "DISMISSED") => {
    setIsLoading(true);
    try {
      await fetch(`/api/admin/reports/${reportId}`, {
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
    <div className="flex gap-3">
      <Button
        className="bg-green-600 hover:bg-green-700 text-white font-semibold"
        size="sm"
        disabled={isLoading}
        onClick={() => handleUpdate("RESOLVED")}
      >
        Mark Resolved
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={isLoading}
        onClick={() => handleUpdate("DISMISSED")}
      >
        Dismiss Report
      </Button>
    </div>
  );
}
