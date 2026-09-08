import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const status = searchParams.status || "";

  const where: Prisma.BookingWhereInput = {};
  if (status) where.status = status;

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      ride: { include: { driver: { select: { id: true, name: true } } } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bookings Management</h1>
        <p className="text-muted-foreground mt-1">Review and manage passenger ride reservations.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filter Bookings</CardTitle>
          <form method="GET" className="flex gap-3 pt-2">
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="REJECTED">Rejected</option>
            </select>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Filter
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-3">Passenger</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Fare</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-medium text-foreground">{b.user.name}</td>
                      <td className="p-3">{b.ride.origin} → {b.ride.destination}</td>
                      <td className="p-3 text-xs text-muted-foreground">{b.ride.driver.name}</td>
                      <td className="p-3 font-semibold text-primary">₹{b.fare.toFixed(2)}</td>
                      <td className="p-3">
                        <Badge variant={b.status === "CONFIRMED" ? "default" : b.status === "PENDING" ? "outline" : "secondary"}>
                          {b.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/bookings/${b.id}`} className="text-xs font-semibold text-primary hover:underline">
                          Manage →
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
