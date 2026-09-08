import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AdminBookingOverride } from "./AdminBookingOverride";

export const dynamic = "force-dynamic";

export default async function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { id: true, name: true, email: true, studentVerificationStatus: true } },
      ride: { include: { driver: { select: { id: true, name: true, email: true } } } },
    },
  });

  if (!booking) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/admin/bookings" className="text-xs text-muted-foreground hover:text-primary mb-2 inline-block">
          ← Back to Bookings
        </Link>
        <div className="flex justify-between items-start gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Booking #{booking.id.slice(-6)}</h1>
            <p className="text-muted-foreground mt-1">
              Created: {new Date(booking.createdAt).toLocaleString()}
            </p>
          </div>
          <Badge variant={booking.status === "CONFIRMED" ? "default" : booking.status === "PENDING" ? "outline" : "secondary"}>
            {booking.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Passenger Information</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Name</span>
              <span className="font-semibold">{booking.user.name}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Email</span>
              <span>{booking.user.email}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Student Verification</span>
              <Badge variant={booking.user.studentVerificationStatus === "APPROVED" ? "default" : "outline"}>
                {booking.user.studentVerificationStatus}
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h3 className="font-semibold text-base border-b pb-2">Ride &amp; Driver Details</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-xs text-muted-foreground block">Route</span>
              <span className="font-semibold">{booking.ride.origin} → {booking.ride.destination}</span>
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Driver</span>
              <span className="font-semibold">{booking.ride.driver.name}</span> ({booking.ride.driver.email})
            </div>
            <div>
              <span className="text-xs text-muted-foreground block">Fare</span>
              <span className="font-semibold text-primary">₹{booking.fare.toFixed(2)}</span>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <AdminBookingOverride bookingId={booking.id} currentStatus={booking.status} />
      </Card>
    </div>
  );
}
