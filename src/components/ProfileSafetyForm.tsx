"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProfileSafetyFormProps {
  initialGender?: string | null;
  initialEmergencyContactName?: string | null;
  initialEmergencyContactEmail?: string | null;
  initialEmergencyContactPhone?: string | null;
}

export default function ProfileSafetyForm({
  initialGender,
  initialEmergencyContactName,
  initialEmergencyContactEmail,
  initialEmergencyContactPhone,
}: ProfileSafetyFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [gender, setGender] = useState(initialGender || "PREFER_NOT_TO_SAY");
  const [emergencyContactName, setEmergencyContactName] = useState(initialEmergencyContactName || "");
  const [emergencyContactEmail, setEmergencyContactEmail] = useState(initialEmergencyContactEmail || "");
  const [emergencyContactPhone, setEmergencyContactPhone] = useState(initialEmergencyContactPhone || "");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (emergencyContactEmail.trim() !== "") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emergencyContactEmail.trim())) {
        setError("Please enter a valid emergency contact email address.");
        return;
      }
    }

    if (emergencyContactPhone.trim() !== "") {
      const phoneRegex = /^[0-9+\s\-()]{7,20}$/;
      if (!phoneRegex.test(emergencyContactPhone.trim())) {
        setError("Please enter a valid emergency contact phone number.");
        return;
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gender,
          emergencyContactName,
          emergencyContactEmail,
          emergencyContactPhone,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update profile");
      }

      setSuccess("Safety & emergency contact information updated successfully.");
      setIsEditing(false);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing) {
    return (
      <div className="space-y-4">
        {success && <div className="text-sm text-emerald-600 font-medium bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-md border border-emerald-200 dark:border-emerald-900">{success}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-semibold text-xs text-muted-foreground block uppercase tracking-wider">Gender</span>
            <span className="text-base font-medium">
              {gender === "FEMALE" ? "Female" : gender === "MALE" ? "Male" : gender === "OTHER" ? "Other" : "Prefer not to say"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-xs text-muted-foreground block uppercase tracking-wider">Emergency Contact Name</span>
            <span className="text-base font-medium">{emergencyContactName || "Not set"}</span>
          </div>
          <div>
            <span className="font-semibold text-xs text-muted-foreground block uppercase tracking-wider">Emergency Contact Email</span>
            <span className="text-base font-medium">{emergencyContactEmail || "Not set"}</span>
          </div>
          <div>
            <span className="font-semibold text-xs text-muted-foreground block uppercase tracking-wider">Emergency Contact Phone</span>
            <span className="text-base font-medium">{emergencyContactPhone || "Not set"}</span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
          Edit Safety &amp; Emergency Details
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-sm text-red-500 font-medium bg-red-50 dark:bg-red-950/40 p-2.5 rounded-md border border-red-200 dark:border-red-900">{error}</div>}

      <div className="space-y-2">
        <Label htmlFor="editGender">Gender</Label>
        <select
          id="editGender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="w-full h-10 px-3 text-sm rounded-md border bg-background"
        >
          <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
          <option value="FEMALE">Female</option>
          <option value="MALE">Male</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="editEmergencyContactName">Emergency Contact Name</Label>
        <Input
          id="editEmergencyContactName"
          type="text"
          placeholder="Parent / Guardian / Friend Name"
          value={emergencyContactName}
          onChange={(e) => setEmergencyContactName(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="editEmergencyContactEmail">Emergency Contact Email</Label>
          <Input
            id="editEmergencyContactEmail"
            type="email"
            placeholder="contact@example.com"
            value={emergencyContactEmail}
            onChange={(e) => setEmergencyContactEmail(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="editEmergencyContactPhone">Emergency Contact Phone</Label>
          <Input
            id="editEmergencyContactPhone"
            type="tel"
            placeholder="+1 555-0199"
            value={emergencyContactPhone}
            onChange={(e) => setEmergencyContactPhone(e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="submit" disabled={isLoading} size="sm">
          {isLoading ? "Saving..." : "Save Safety Info"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
