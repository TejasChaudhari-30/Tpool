"use client";

import RatingForm from "./RatingForm";

interface PassengerItem {
  id: string; // passenger userId
  name: string;
  existingRating?: {
    rating: number;
    review?: string | null;
  } | null;
}

interface DriverPassengerRatingsProps {
  rideId: string;
  passengers: PassengerItem[];
}

export default function DriverPassengerRatings({ rideId, passengers }: DriverPassengerRatingsProps) {
  if (passengers.length === 0) {
    return (
      <div className="bg-muted/40 p-4 rounded-lg border text-xs text-muted-foreground text-center">
        No confirmed passengers participated in this completed ride.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <span>⭐ Rate Your Passengers</span>
        </h4>
        <p className="text-xs text-muted-foreground">
          Submit individual ratings for passengers who joined this completed ride.
        </p>
      </div>

      <div className="space-y-3">
        {passengers.map((passenger) => (
          <div key={passenger.id} className="space-y-2">
            <RatingForm
              rideId={rideId}
              revieweeId={passenger.id}
              revieweeName={passenger.name}
              existingRating={passenger.existingRating}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
