"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface RatingFormProps {
  rideId: string;
  revieweeId: string;
  revieweeName: string;
  existingRating?: {
    rating: number;
    review?: string | null;
  } | null;
}

export default function RatingForm({ rideId, revieweeId, revieweeName, existingRating }: RatingFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState<number>(existingRating?.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [review, setReview] = useState<string>(existingRating?.review || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(!!existingRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Please select a rating from 1 to 5 stars.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rideId,
          revieweeId,
          rating,
          review: review.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit rating");
      }

      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to submit rating");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success || existingRating) {
    const currentRating = existingRating?.rating || rating;
    const currentReview = existingRating?.review || review;

    return (
      <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 rounded-lg space-y-1">
        <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 dark:text-emerald-300">
          <span>Your Rating for {revieweeName}:</span>
          <span className="text-amber-500 font-bold text-sm">
            {"★".repeat(currentRating)}{"☆".repeat(5 - currentRating)} ({currentRating}/5)
          </span>
        </div>
        {currentReview && (
          <p className="text-xs text-emerald-700 dark:text-emerald-400 italic">
            &quot;{currentReview}&quot;
          </p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-muted/40 p-4 rounded-lg border space-y-3 text-left">
      <div className="space-y-1">
        <label className="text-xs font-semibold text-foreground">
          Rate {revieweeName}
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="text-2xl transition-colors focus:outline-none"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              <span
                className={
                  star <= (hoverRating || rating)
                    ? "text-amber-500"
                    : "text-muted-foreground/40"
                }
              >
                ★
              </span>
            </button>
          ))}
          <span className="text-xs font-medium text-muted-foreground ml-2">
            {rating > 0 ? `${rating}/5 Stars` : "Select stars"}
          </span>
        </div>
      </div>

      <div className="space-y-1">
        <textarea
          className="w-full text-xs p-2.5 rounded-md border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
          rows={2}
          placeholder="Optional written review (max 500 characters)..."
          maxLength={500}
          value={review}
          onChange={(e) => setReview(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      {error && <p className="text-xs text-destructive font-medium">{error}</p>}

      <Button
        type="submit"
        size="sm"
        disabled={isSubmitting || rating === 0}
        className="w-full bg-primary text-primary-foreground font-semibold text-xs"
      >
        {isSubmitting ? "Submitting..." : "Submit Rating"}
      </Button>
    </form>
  );
}
