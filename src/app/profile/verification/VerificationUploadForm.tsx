"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Upload, CheckCircle2, Clock, AlertCircle, RefreshCw } from "lucide-react";

export function VerificationUploadForm({
  documentType,
  currentStatus,
  label,
}: {
  documentType: "STUDENT_ID" | "DRIVING_LICENCE" | "VEHICLE_RC";
  currentStatus: string;
  label: string;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setError("");
    setSuccess(false);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);

      const res = await fetch("/api/verifications/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to upload file");
      }

      setSuccess(true);
      setFile(null);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const isUploadDisabled = currentStatus === "APPROVED" || currentStatus === "PENDING";

  return (
    <form onSubmit={handleUpload} className="space-y-3">
      <div className="flex justify-between items-center">
        <Label htmlFor={documentType} className="text-xs font-semibold">
          {label}
        </Label>
        {currentStatus === "APPROVED" && (
          <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Approved
          </span>
        )}
        {currentStatus === "PENDING" && (
          <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Under Review
          </span>
        )}
        {currentStatus === "REJECTED" && (
          <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
            <AlertCircle className="h-3.5 w-3.5" /> Rejected
          </span>
        )}
        {currentStatus === "REUPLOAD_REQUIRED" && (
          <span className="text-xs text-amber-700 dark:text-amber-400 font-semibold flex items-center gap-1">
            <RefreshCw className="h-3.5 w-3.5" /> Re-upload Requested
          </span>
        )}
      </div>

      {error && <div className="text-xs text-destructive font-medium">{error}</div>}
      {success && <div className="text-xs text-green-600 font-medium">Document submitted successfully!</div>}

      {!isUploadDisabled && (
        <div className="flex gap-2">
          <input
            id={documentType}
            type="file"
            accept="image/jpeg,image/png,application/pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-xs flex-1 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 border rounded-md p-1"
          />
          <Button
            type="submit"
            size="sm"
            disabled={!file || isUploading}
            className="flex items-center gap-1.5 shrink-0"
          >
            <Upload className="h-3.5 w-3.5" />
            {isUploading ? "Uploading..." : (currentStatus === "REUPLOAD_REQUIRED" || currentStatus === "REJECTED") ? "Re-upload" : "Upload"}
          </Button>
        </div>
      )}
    </form>
  );
}
