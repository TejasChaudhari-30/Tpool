"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

export function VerificationReviewForm({
  verificationId,
  currentStatus,
  currentReason,
}: {
  verificationId: string;
  currentStatus: string;
  currentReason?: string | null;
}) {
  const router = useRouter();
  const [rejectionReason, setRejectionReason] = useState(currentReason || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAction = async (action: "APPROVE" | "REJECT" | "REUPLOAD_REQUIRED") => {
    setError("");
    if ((action === "REJECT" || action === "REUPLOAD_REQUIRED") && !rejectionReason.trim()) {
      setError("Please provide a reason explaining why the document was rejected or needs re-upload.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/verifications/${verificationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectionReason }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update verification");
      }

      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 bg-card border p-6 rounded-xl">
      <h3 className="font-semibold text-base border-b pb-2">Admin Review &amp; Actions</h3>

      {error && <div className="text-xs text-destructive font-medium bg-destructive/10 p-3 rounded-md">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="reason" className="text-xs font-semibold text-muted-foreground">
          Rejection / Re-upload Reason (Required for Reject &amp; Re-upload)
        </Label>
        <textarea
          id="reason"
          rows={3}
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          placeholder="e.g. Image is blurry. Please upload a clear, legible copy of your student ID."
          className="w-full text-sm p-3 rounded-md border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          type="button"
          onClick={() => handleAction("APPROVE")}
          disabled={isLoading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2"
        >
          <CheckCircle className="h-4 w-4" />
          Approve Verification
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => handleAction("REUPLOAD_REQUIRED")}
          disabled={isLoading}
          className="flex-1 text-amber-600 border-amber-500/50 hover:bg-amber-500/10 font-semibold flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Request Re-upload
        </Button>

        <Button
          type="button"
          variant="destructive"
          onClick={() => handleAction("REJECT")}
          disabled={isLoading}
          className="flex-1 font-semibold flex items-center justify-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Reject Document
        </Button>
      </div>

      {currentStatus !== "PENDING" && (
        <p className="text-xs text-muted-foreground italic text-center">
          Current status is <span className="font-semibold text-foreground">{currentStatus}</span>. You may change this action anytime.
        </p>
      )}
    </div>
  );
}
