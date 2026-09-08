import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, Car, MapPin, DollarSign, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  const [
    totalUsers,
    totalRides,
    totalBookings,
    confirmedBookings,
    totalFaresResult,
    verifiedStudents,
    popularOrigins,
    popularDestinations,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.ride.count(),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "CONFIRMED" } }),
    prisma.booking.aggregate({
      where: { status: "CONFIRMED" },
      _sum: { fare: true },
    }),
    prisma.user.count({ where: { studentVerificationStatus: "APPROVED" } }),
    prisma.ride.groupBy({
      by: ["origin"],
      _count: { origin: true },
      orderBy: { _count: { origin: "desc" } },
      take: 5,
    }),
    prisma.ride.groupBy({
      by: ["destination"],
      _count: { destination: true },
      orderBy: { _count: { destination: "desc" } },
      take: 5,
    }),
  ]);

  const totalFareVolume = totalFaresResult._sum.fare || 0;
  const bookingConversionRate = totalBookings > 0 ? ((confirmedBookings / totalBookings) * 100).toFixed(1) : "0.0";
  const studentVerificationRate = totalUsers > 0 ? ((verifiedStudents / totalUsers) * 100).toFixed(1) : "0.0";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Platform Analytics</h1>
        <p className="text-muted-foreground mt-1">Growth metrics, route popularities, and ride completion insights.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Fare Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">₹{totalFareVolume.toFixed(2)}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Confirmed passenger fares</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Booking Approval Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bookingConversionRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{confirmedBookings} of {totalBookings} confirmed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Student Verification Rate</CardTitle>
            <ShieldCheck className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentVerificationRate}%</div>
            <p className="text-[11px] text-muted-foreground mt-1">{verifiedStudents} verified students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold text-muted-foreground">Total Platform Rides</CardTitle>
            <Car className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRides}</div>
            <p className="text-[11px] text-muted-foreground mt-1">Total published rides</p>
          </CardContent>
        </Card>
      </div>

      {/* Popular Routes Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Top Pickup Locations
            </CardTitle>
            <CardDescription>Most frequently published departure points</CardDescription>
          </CardHeader>
          <CardContent>
            {popularOrigins.length === 0 ? (
              <p className="text-sm text-muted-foreground">No route data available.</p>
            ) : (
              <div className="space-y-3">
                {popularOrigins.map((o, idx) => (
                  <div key={o.origin} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                    <span className="font-semibold">{idx + 1}. {o.origin}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {o._count.origin} rides
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" /> Top Destination Locations
            </CardTitle>
            <CardDescription>Most frequently published drop-off points</CardDescription>
          </CardHeader>
          <CardContent>
            {popularDestinations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No route data available.</p>
            ) : (
              <div className="space-y-3">
                {popularDestinations.map((d, idx) => (
                  <div key={d.destination} className="flex justify-between items-center p-3 border rounded-lg text-sm">
                    <span className="font-semibold">{idx + 1}. {d.destination}</span>
                    <span className="text-xs font-semibold px-2 py-1 rounded bg-primary/10 text-primary">
                      {d._count.destination} rides
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
