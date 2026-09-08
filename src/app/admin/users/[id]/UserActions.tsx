"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function UserActions({
  userId,
  currentRole,
  currentStatus,
}: {
  userId: string;
  currentRole: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (data: { role?: string; status?: string }) => {
    setIsLoading(true);
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="text-xs text-muted-foreground block mb-1">Account Status</span>
        {currentStatus === "ACTIVE" ? (
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => handleUpdate({ status: "SUSPENDED" })}
          >
            Suspend User Account
          </Button>
        ) : (
          <Button
            variant="default"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => handleUpdate({ status: "ACTIVE" })}
          >
            Reactivate Account
          </Button>
        )}
      </div>

      <div className="pt-2 border-t">
        <span className="text-xs text-muted-foreground block mb-1">Role Management</span>
        {currentRole === "USER" ? (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => handleUpdate({ role: "ADMIN" })}
          >
            Promote to Admin
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isLoading}
            onClick={() => handleUpdate({ role: "USER" })}
          >
            Demote to Normal User
          </Button>
        )}
      </div>
    </div>
  );
}
