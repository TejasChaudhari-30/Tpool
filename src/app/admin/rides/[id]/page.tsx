import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import RouteMap from "@/components/RouteMap";
import { AdminDeleteRideButton } from "./AdminDeleteRideButton";

export const dynamic = "force-dynamic";

export default async function AdminRideDetailPage({ params }: { params: { id: string } }) {
  const ride = await prisma.ride.findUnique({
    where: { id: params.id },
    include: {
      driver: { select: { id: true, name: true, email: true, driverVerificationStatus: true } },
      bookings: { include: { user: { select: { id: true, name: true, email: true } } } },
      messages: { include: { user: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
    },
  });

  if (!ride) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/rides" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Rides
        </Link>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{ride.origin} → {ride.destination}</h1>
            <p className="text-muted-foreground mt-1">
              Departure: {new Date(ride.departure).toLocaleString()}
            </p>
          </div>
          <AdminDeleteRideButton rideId={ride.id} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Ride Info</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Driver</span>
              <span className="font-semibold">{ride.driver.name}</span> ({ride.driver.email})
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Vehicle</span>
              <span>{ride.vehicleName || "N/A"}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Available Seats</span>
              <span className="font-semibold">{ride.seats} seats left</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Price</span>
              <span className="font-semibold text-primary">₹{ride.price.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        <Card className="md:col-span-2 p-6">
          <h3 className="font-semibold text-base border-b pb-4 mb-4">Route Map</h3>
          <RouteMap origin={ride.origin} destination={ride.destination} />
        </Card>
      </div>

      {/* Bookings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Passenger Bookings ({ride.bookings.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {ride.bookings.length === 0 ? (
            <p className="text-sm text-muted-foreground">No bookings made for this ride yet.</p>
          ) : (
            <div className="space-y-3">
              {ride.bookings.map((b) => (
                <div key={b.id} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                  <div>
                    <span className="font-semibold block">{b.user.name}</span>
                    <span className="text-xs text-muted-foreground">{b.user.email} • Fare: ₹{b.fare.toFixed(2)}</span>
                  </div>
                  <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "outline" : "secondary"}>
                    {b.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
