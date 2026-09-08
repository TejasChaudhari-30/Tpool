import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Prisma, VerificationStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function AdminDriversPage({
  searchParams,
}: {
  searchParams: { search?: string; status?: string };
}) {
  const search = searchParams.search || "";
  const status = searchParams.status || "";

  const where: Prisma.UserWhereInput = {
    rides: { some: {} },
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
    ];
  }
  if (status) {
    where.driverVerificationStatus = status as VerificationStatus;
  }

  const drivers = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      rides: { orderBy: { departure: "desc" } },
      _count: { select: { rides: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Driver Directory</h1>
        <p className="text-muted-foreground mt-1">Manage users who have published rides on the platform.</p>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Filters &amp; Search</CardTitle>
          <form method="GET" className="flex flex-col sm:flex-row gap-3 pt-2">
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search driver by name or email..."
              className="flex-1 px-3 py-2 text-sm rounded-md border bg-background"
            />
            <select
              name="status"
              defaultValue={status}
              className="px-3 py-2 text-sm rounded-md border bg-background"
            >
              <option value="">All Verification Statuses</option>
              <option value="APPROVED">Verified Driver</option>
              <option value="PENDING">Pending Approval</option>
              <option value="REJECTED">Rejected</option>
              <option value="NOT_SUBMITTED">Not Submitted</option>
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
                  <th className="p-3">Driver</th>
                  <th className="p-3">Verification Status</th>
                  <th className="p-3">Rides Published</th>
                  <th className="p-3">Latest Vehicle</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-muted-foreground">
                      No drivers found matching criteria.
                    </td>
                  </tr>
                ) : (
                  drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{d.name}</div>
                        <div className="text-xs text-muted-foreground">{d.email}</div>
                      </td>
                      <td className="p-3">
                        <Badge variant={d.driverVerificationStatus === "APPROVED" ? "default" : "outline"}>
                          {d.driverVerificationStatus === "APPROVED" ? "Verified Driver" : d.driverVerificationStatus}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium">{d._count.rides}</td>
                      <td className="p-3 text-xs text-muted-foreground">
                        {d.rides[0]?.vehicleName || "N/A"}
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/drivers/${d.id}`} className="text-xs font-semibold text-primary hover:underline">
                          View Driver →
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
