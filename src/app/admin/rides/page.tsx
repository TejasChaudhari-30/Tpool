import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminRidesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const search = searchParams.search || "";

  const where: Prisma.RideWhereInput = {};
  if (search) {
    where.OR = [
      { origin: { contains: search } },
      { destination: { contains: search } },
      { driver: { name: { contains: search } } },
    ];
  }

  const rides = await prisma.ride.findMany({
    where,
    orderBy: { departure: "desc" },
    include: {
      driver: { select: { name: true, email: true } },
      _count: { select: { bookings: true, messages: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rides Management</h1>
        <p className="text-muted-foreground mt-1">Monitor all published rides on the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Search Rides</CardTitle>
          <form method="GET" className="flex gap-3 pt-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by origin, destination, or driver name..."
              className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            />
            <button
              type="submit"
              className="px-4 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-md hover:bg-primary/90 transition-colors"
            >
              Search
            </button>
          </form>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
                  <th className="p-3">Route</th>
                  <th className="p-3">Driver</th>
                  <th className="p-3">Departure Date</th>
                  <th className="p-3">Seats Left</th>
                  <th className="p-3">Bookings</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rides.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-muted-foreground">
                      No rides found matching search criteria.
                    </td>
                  </tr>
                ) : (
                  rides.map((r) => (
                    <tr key={r.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">
                        {r.origin} → {r.destination}
                      </td>
                      <td className="p-3">
                        <div className="font-medium text-foreground">{r.driver.name}</div>
                        <div className="text-xs text-muted-foreground">{r.driver.email}</div>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {new Date(r.departure).toLocaleString()}
                      </td>
                      <td className="p-3 font-medium">{r.seats} seats</td>
                      <td className="p-3 text-xs text-muted-foreground">{r._count.bookings} bookings</td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/rides/${r.id}`} className="text-xs font-semibold text-primary hover:underline">
                          View &amp; Manage →
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
